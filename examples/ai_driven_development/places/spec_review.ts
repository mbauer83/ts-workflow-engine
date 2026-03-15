import { definePlace } from "../../../src/domain/place.js"
import {
  createInitialApprovals,
  createInitialClarificationRounds,
  createInitialPendingQuestions,
  defaultIterationLimits,
  idleEscalation,
  type EscalationState,
  type InitialReviewRole,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const SPEC_REVIEW = Symbol("spec_review")

export type SpecReviewState = {
  noteSource: "filepath" | "inline" | null
  noteLocationOrLabel: string | null
  noteContents: string | null
  gitProjectPath: string | null
  azureProject: string | null
  jiraProjectKey: string | null
  approvals: Record<InitialReviewRole, boolean>
  pendingQuestions: Record<InitialReviewRole, string[] | null>
  clarificationRounds: Record<InitialReviewRole, number>
  maxClarificationRounds: number
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export const specReviewPlace = definePlace<AiDrivenDevelopmentRegistry>()(SPEC_REVIEW, {
  state: {
    isActive: false,
    noteSource: null,
    noteLocationOrLabel: null,
    noteContents: null,
    gitProjectPath: null,
    azureProject: null,
    jiraProjectKey: null,
    approvals: createInitialApprovals(),
    pendingQuestions: createInitialPendingQuestions(),
    clarificationRounds: createInitialClarificationRounds(),
    maxClarificationRounds: defaultIterationLimits.initialReviewPerAgent,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})
