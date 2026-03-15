import { mkdir, writeFile } from "node:fs/promises"
import { basename, dirname, extname, resolve } from "node:path"
import { argv, cwd, exit } from "node:process"
import { pathToFileURL } from "node:url"
import {
  renderWorkflowNetToSvg,
  type DiagramDirection,
  type WorkflowNetDiagramSource,
} from "./render.js"

type DiagramModuleExports = Record<string, unknown>

type CliOptions = {
  source?: string
  modulePath?: string
  sourceExport: string
  placesExport: string
  transitionsExport: string
  out: string
  dotOut?: string
  title?: string
  direction: DiagramDirection
  help: boolean
}

const presetModulePathByName: Record<string, string> = {
  factory: "./sources/factory.js",
  ai: "./sources/ai_driven_development.js",
  "ai-driven-development": "./sources/ai_driven_development.js",
  "ai_driven_development": "./sources/ai_driven_development.js",
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null
}

function normalizePresetName(value: string): string {
  return value.trim().toLowerCase()
}

function sanitizePathSegment(value: string): string {
  return value.replaceAll(/[^a-zA-Z0-9._-]/g, "_")
}

function ensureDirection(value: string): DiagramDirection {
  if (value === "LR" || value === "TB") {
    return value
  }

  throw new Error(`Unsupported direction '${value}'. Use LR or TB.`)
}

function readOptionValue(
  rawArgs: readonly string[],
  currentFlag: string,
  valueFromEquals: string | undefined,
  index: number
): { value: string; consumedNext: boolean } {
  if (valueFromEquals !== undefined) {
    return { value: valueFromEquals, consumedNext: false }
  }

  const next = rawArgs[index + 1]
  if (!next || next.startsWith("--")) {
    throw new Error(`Missing value for ${currentFlag}.`)
  }

  return { value: next, consumedNext: true }
}

function assignParsedOption(parsed: CliOptions, flag: string, value: string) {
  switch (flag) {
    case "--source":
      parsed.source = value
      return
    case "--module":
      parsed.modulePath = value
      return
    case "--source-export":
      parsed.sourceExport = value
      return
    case "--places-export":
      parsed.placesExport = value
      return
    case "--transitions-export":
      parsed.transitionsExport = value
      return
    case "--out":
      parsed.out = value
      return
    case "--dot-out":
      parsed.dotOut = value
      return
    case "--title":
      parsed.title = value
      return
    case "--direction":
      parsed.direction = ensureDirection(value)
      return
    default:
      throw new Error(`Unknown option '${flag}'.`)
  }
}

function parseCliArgs(rawArgs: readonly string[]): CliOptions {
  const parsed: CliOptions = {
    sourceExport: "workflowNetDiagramSource",
    placesExport: "places",
    transitionsExport: "transitions",
    out: "",
    direction: "LR",
    help: false,
  }

  for (let index = 0; index < rawArgs.length; index += 1) {
    const current = rawArgs[index]

    if (current === "--help" || current === "-h") {
      parsed.help = true
      continue
    }

    if (!current.startsWith("--")) {
      throw new Error(`Unknown argument '${current}'.`)
    }

    const [flag, valueFromEquals] = current.split("=", 2)
    const read = readOptionValue(rawArgs, flag, valueFromEquals, index)
    assignParsedOption(parsed, flag, read.value)

    if (read.consumedNext) {
      index += 1
    }
  }

  if (!parsed.source && !parsed.modulePath) {
    parsed.source = "factory"
  }

  if (parsed.source && parsed.modulePath) {
    throw new Error("Use either --source or --module, not both.")
  }

  if (!parsed.out) {
    const defaultName = parsed.source
      ? normalizePresetName(parsed.source)
      : basename(parsed.modulePath ?? "workflow-net", extname(parsed.modulePath ?? ""))

    parsed.out = `diagrams/${sanitizePathSegment(defaultName)}.svg`
  }

  return parsed
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  pnpm run diagram -- [options]",
      "",
      "Options:",
      "  --source <factory|ai|ai-driven-development>",
      "  --module <path-to-module>",
      "  --source-export <exportName>            (default: workflowNetDiagramSource)",
      "  --places-export <exportName>            (default: places)",
      "  --transitions-export <exportName>       (default: transitions)",
      "  --out <svg-path>                        (default: diagrams/<source>.svg)",
      "  --dot-out <dot-path>",
      "  --title <diagram-title>",
      "  --direction <LR|TB>                     (default: LR)",
      "  --help",
    ].join("\n")
  )
}

async function loadModuleExports(options: CliOptions): Promise<DiagramModuleExports> {
  if (options.source) {
    const presetName = normalizePresetName(options.source)
    const presetModulePath = presetModulePathByName[presetName]

    if (!presetModulePath) {
      throw new Error(
        `Unknown source '${options.source}'. Available sources: ${Object.keys(presetModulePathByName).join(", ")}.`
      )
    }

    const presetUrl = new URL(presetModulePath, import.meta.url)
    return (await import(presetUrl.href)) as DiagramModuleExports
  }

  if (!options.modulePath) {
    throw new Error("A source module could not be resolved.")
  }

  const absoluteModulePath = resolve(cwd(), options.modulePath)
  const moduleUrl = pathToFileURL(absoluteModulePath)
  return (await import(moduleUrl.href)) as DiagramModuleExports
}

function extractSource(
  moduleExports: DiagramModuleExports,
  options: CliOptions
): WorkflowNetDiagramSource {
  const sourceFromContract = moduleExports[options.sourceExport]

  if (isObject(sourceFromContract)) {
    const candidate = sourceFromContract as Partial<WorkflowNetDiagramSource>

    if (isObject(candidate.places) && isObject(candidate.transitions)) {
      return {
        places: candidate.places,
        transitions: candidate.transitions,
        title: options.title ?? candidate.title,
      }
    }
  }

  const placesFromExports = moduleExports[options.placesExport]
  const transitionsFromExports = moduleExports[options.transitionsExport]

  if (!isObject(placesFromExports) || !isObject(transitionsFromExports)) {
    throw new Error(
      `Module does not expose a valid source. Expected export '${options.sourceExport}' with { places, transitions } or exports '${options.placesExport}' and '${options.transitionsExport}'.`
    )
  }

  return {
    places: placesFromExports,
    transitions: transitionsFromExports,
    title: options.title,
  }
}

async function writeTextFile(pathLike: string, contents: string) {
  const absolutePath = resolve(cwd(), pathLike)
  await mkdir(dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, contents, "utf8")
}

async function main() {
  const options = parseCliArgs(argv.slice(2))

  if (options.help) {
    printUsage()
    return
  }

  const moduleExports = await loadModuleExports(options)
  const source = extractSource(moduleExports, options)
  const rendered = await renderWorkflowNetToSvg(source, { direction: options.direction })

  await writeTextFile(options.out, rendered.svg)

  if (options.dotOut) {
    await writeTextFile(options.dotOut, rendered.dot)
  }

  console.log(`Rendered workflow-net diagram to ${options.out}`)
  if (options.dotOut) {
    console.log(`Wrote Graphviz DOT to ${options.dotOut}`)
  }
}

try {
  await main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Diagram rendering failed: ${message}`)
  exit(1)
}
