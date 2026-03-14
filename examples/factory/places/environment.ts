import {
  definePlace,
  type TransitionEffectsOf,
  type TransitionGuardsOf,
} from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { HARDWARE } from "./hardware.js"
import { SOFTWARE } from "./software.js"

export const ENVIRONMENT = Symbol("Environment")

export type EnvironmentEvent =
  | {
      kind: "initialize"
      requestId: string
      requestedBy: string
    }
  | {
      kind: "cut"
      jobId: string
      thicknessMm: number
    }
  | {
      kind: "write"
      jobId: string
      branch: string
    }

export type EnvironmentState = {
  pending: EnvironmentEvent | null
}

const describeEvent = (event: EnvironmentEvent | null): string => {
  if (!event) return "none"

  if (event.kind === "initialize") {
    return `initialize(requestId=${event.requestId}, requestedBy=${event.requestedBy})`
  }

  if (event.kind === "cut") {
    return `cut(jobId=${event.jobId}, thicknessMm=${event.thicknessMm})`
  }

  return `write(jobId=${event.jobId}, branch=${event.branch})`
}

const transitionGuards: TransitionGuardsOf<FactoryRegistry, typeof ENVIRONMENT> = {
  [HARDWARE]: (from, _to, ctx) => {
    const allowed = from.pending?.kind === "initialize"
      || (from.pending?.kind === "cut" && ctx.allStates[HARDWARE].isActive)

    if (allowed) {
      console.log(`[ENVIRONMENT] ${describeEvent(from.pending)} enables transition -> HARDWARE`)
    }

    return allowed
  },
  [SOFTWARE]: (from, _to, ctx) => {
    const allowed = from.pending?.kind === "initialize"
      || (from.pending?.kind === "write" && ctx.allStates[SOFTWARE].isActive)

    if (allowed) {
      console.log(`[ENVIRONMENT] ${describeEvent(from.pending)} enables transition -> SOFTWARE`)
    }

    return allowed
  },
}

const transitionEffects: TransitionEffectsOf<FactoryRegistry, typeof ENVIRONMENT> = {
  [HARDWARE]: from => {
    if (from.pending?.kind !== "cut") return {}
    const delta = {
      metalCut: true,
      lastCutJobId: from.pending.jobId,
    }
    console.log("[ENVIRONMENT] effect -> HARDWARE", delta)
    return delta
  },
  [SOFTWARE]: from => {
    if (from.pending?.kind !== "write") return {}
    const delta = {
      codeWritten: true,
      lastWriteJobId: from.pending.jobId,
    }
    console.log("[ENVIRONMENT] effect -> SOFTWARE", delta)
    return delta
  },
}

export const environmentPlace = definePlace<FactoryRegistry>()(ENVIRONMENT, {
  interfaceRole: "input",
  state: { isActive: false, pending: null },
  transitionGuards,
  transitionEffects,
})
