import { Chalk } from "chalk"
import type { AiDrivenDevelopmentEvent } from "../places/environment.js"
import {
  aiDrivenDevelopmentEventLogFields,
  aiDrivenDevelopmentEventLogTransforms,
  aiDrivenDevelopmentPlaceLogFields,
} from "../logging_profile.js"

const chalk = new Chalk({ level: 3 })

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

const hasOwn = (value: object, key: string): boolean =>
  Object.hasOwn(value, key)

const formatStructuredLog = (value: unknown): string => {
  try {
    return JSON.stringify(
      value,
      (_key, currentValue) => {
        if (typeof currentValue === "bigint") {
          return currentValue.toString()
        }

        if (typeof currentValue === "symbol") {
          return String(currentValue)
        }

        return currentValue
      },
      2
    )
  } catch {
    return "{\n  \"error\": \"unserializable_log_payload\"\n}"
  }
}

const humanizeIdentifier = (value: string): string =>
  value
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/([a-z\d])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .toLowerCase()

const describeLabel = (label: PropertyKey): string => {
  if (typeof label === "symbol") {
    const description = label.description
    if (description && description.length > 0) {
      return humanizeIdentifier(description)
    }

    const fallback = String(label)
    const fromSymbolText = /^Symbol\((.*)\)$/.exec(fallback)?.[1]
    return humanizeIdentifier(fromSymbolText ?? fallback)
  }

  return humanizeIdentifier(String(label))
}

const pickFields = (value: unknown, fields: readonly string[]): Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return {}
  }

  const record = value as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const field of fields) {
    if (hasOwn(record, field)) {
      result[field] = record[field]
    }
  }

  return result
}

const projectEvent = (event: AiDrivenDevelopmentEvent): Record<string, unknown> => {
  const fields = aiDrivenDevelopmentEventLogFields[event.type] ?? []
  const transform = aiDrivenDevelopmentEventLogTransforms[event.type]
  return {
    type: event.type,
    ...pickFields(event, fields),
    ...(transform ? transform(event) : {}),
  }
}

const projectState = (label: PropertyKey, state: unknown): Record<string, unknown> => {
  const fields = aiDrivenDevelopmentPlaceLogFields.get(label) ?? ["isActive"]
  const projected = pickFields(state, fields)

  if (state && typeof state === "object" && hasOwn(state, "isActive") && !hasOwn(projected, "isActive")) {
    projected.isActive = (state as Record<string, unknown>).isActive
  }

  return projected
}

export function logCuratedEvent(label: string, event: AiDrivenDevelopmentEvent) {
  console.log(chalk.greenBright.bold(`[EVENT] ${label}`))
  console.log(chalk.green(formatStructuredLog(projectEvent(event))))
}

export function logCuratedEffects<Snapshot extends object>(before: Snapshot, after: Snapshot) {
  const changes = ownKeys(after)
    .map(label => {
      const beforeState = before[label]
      const afterState = after[label]
      const projectedBefore = projectState(label, beforeState)
      const projectedAfter = projectState(label, afterState)

      if (formatStructuredLog(projectedBefore) === formatStructuredLog(projectedAfter)) {
        return null
      }

      return {
        place: describeLabel(label),
        state: projectedAfter,
      }
    })
    .filter((value): value is { place: string, state: Record<string, unknown> } => value !== null)

  if (changes.length === 0) {
    return
  }

  console.log(chalk.greenBright.bold("[EFFECTS] state highlights"))
  console.log(chalk.green(formatStructuredLog(changes)))
}