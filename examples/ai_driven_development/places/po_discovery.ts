import { definePlace } from "../../../src/domain/place.js"
import {
  defaultIterationLimits,
  idleEscalation,
  type EscalationState,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const PO_DISCOVERY = Symbol("po_discovery")

export type PoDiscoveryState = {
  noteDigest: string | null
  gitProjectPath: string | null
  azureProject: string | null
  jiraProjectKey: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  pendingQuestion: string | null
  clarificationRounds: number
  maxClarificationRounds: number
  jiraTicketId: string | null
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export const poDiscoveryPlace = definePlace<AiDrivenDevelopmentRegistry>()(PO_DISCOVERY, {
  state: {
    isActive: false,
    noteDigest: null,
    gitProjectPath: null,
    azureProject: null,
    jiraProjectKey: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    pendingQuestion: null,
    clarificationRounds: 0,
    maxClarificationRounds: defaultIterationLimits.poClarificationRounds,
    jiraTicketId: null,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})
