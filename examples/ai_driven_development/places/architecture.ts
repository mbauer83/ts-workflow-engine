import { definePlace } from "../../../src/domain/place.js"
import {
  type AlignedSpecification,
  type ArchitectureSpecification,
  defaultIterationLimits,
  idleEscalation,
  type EscalationState,
  type PrincipalSpecFeedback,
  type ToolIntegrationRecommendation,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const ARCHITECT_SOLUTION_SPEC = Symbol("architect_solution_spec")
export const PRINCIPAL_SPEC_COLLAB = Symbol("principal_spec_collab")

export type ArchitectSolutionSpecState = {
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  commonPerspective: string | null
  highLevelPlan: string[]
  risks: string[]
  opportunities: string[]
  optionReviewSummary: string | null
  selectedSolution: string | null
  architectureSpec: ArchitectureSpecification | null
  componentsToAdd: string[]
  componentsToMerge: string[]
  componentsToSplit: string[]
  componentsToRemove: string[]
  patterns: string[]
  architectRecommendedTools: ToolIntegrationRecommendation[]
  principalRecommendedTools: ToolIntegrationRecommendation[]
  alignedRecommendedTools: ToolIntegrationRecommendation[]
  recommendationsAligned: boolean
  pendingQuestion: string | null
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export type PrincipalSpecCollaborationState = {
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  architectSpec: ArchitectureSpecification | null
  principalFeedback: PrincipalSpecFeedback | null
  pendingQuestion: string | null
  dialecticRounds: number
  maxDialecticRounds: number
  alignedSpec: AlignedSpecification | null
  highLevelPlan: string[]
  risks: string[]
  opportunities: string[]
  architectRecommendedTools: ToolIntegrationRecommendation[]
  principalRecommendedTools: ToolIntegrationRecommendation[]
  alignedRecommendedTools: ToolIntegrationRecommendation[]
  recommendationsAligned: boolean
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export const architectSolutionSpecPlace = definePlace<AiDrivenDevelopmentRegistry>()(ARCHITECT_SOLUTION_SPEC, {
  state: {
    isActive: false,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    commonPerspective: null,
    highLevelPlan: [],
    risks: [],
    opportunities: [],
    optionReviewSummary: null,
    selectedSolution: null,
    architectureSpec: null,
    componentsToAdd: [],
    componentsToMerge: [],
    componentsToSplit: [],
    componentsToRemove: [],
    patterns: [],
    architectRecommendedTools: [],
    principalRecommendedTools: [],
    alignedRecommendedTools: [],
    recommendationsAligned: false,
    pendingQuestion: null,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})

export const principalSpecCollabPlace = definePlace<AiDrivenDevelopmentRegistry>()(PRINCIPAL_SPEC_COLLAB, {
  state: {
    isActive: false,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    architectSpec: null,
    principalFeedback: null,
    pendingQuestion: null,
    dialecticRounds: 0,
    maxDialecticRounds: defaultIterationLimits.specDialecticRounds,
    alignedSpec: null,
    highLevelPlan: [],
    risks: [],
    opportunities: [],
    architectRecommendedTools: [],
    principalRecommendedTools: [],
    alignedRecommendedTools: [],
    recommendationsAligned: false,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})
