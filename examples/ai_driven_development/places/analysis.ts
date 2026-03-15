import { definePlace } from "../../../src/domain/place.js"
import {
  defaultIterationLimits,
  idleEscalation,
  type EscalationState,
  type SolutionOption,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const ARCHITECT_ANALYSIS = Symbol("architect_analysis")
export const PRINCIPAL_ANALYSIS = Symbol("principal_analysis")
export const JOINT_ALIGNMENT = Symbol("joint_alignment")

export type ArchitectAnalysisState = {
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  focusedFiles: string[]
  solutionOptions: SolutionOption[]
  challenges: string[]
  opportunities: string[]
  conclusion: string | null
  pendingQuestion: string | null
  clarificationRounds: number
  maxClarificationRounds: number
  completed: boolean
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export type PrincipalAnalysisState = {
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  focusedFiles: string[]
  solutionOptions: SolutionOption[]
  challenges: string[]
  opportunities: string[]
  conclusion: string | null
  pendingQuestion: string | null
  clarificationRounds: number
  maxClarificationRounds: number
  completed: boolean
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export type JointAlignmentState = {
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  architectConclusion: string | null
  principalConclusion: string | null
  commonPerspective: string | null
  highLevelPlan: string[]
  risks: string[]
  opportunities: string[]
  pendingQuestion: string | null
  exchangeRounds: number
  maxExchangeRounds: number
  aligned: boolean
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export const architectAnalysisPlace = definePlace<AiDrivenDevelopmentRegistry>()(ARCHITECT_ANALYSIS, {
  state: {
    isActive: false,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    focusedFiles: [],
    solutionOptions: [],
    challenges: [],
    opportunities: [],
    conclusion: null,
    pendingQuestion: null,
    clarificationRounds: 0,
    maxClarificationRounds: defaultIterationLimits.analysisPerAgent,
    completed: false,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})

export const principalAnalysisPlace = definePlace<AiDrivenDevelopmentRegistry>()(PRINCIPAL_ANALYSIS, {
  state: {
    isActive: false,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    focusedFiles: [],
    solutionOptions: [],
    challenges: [],
    opportunities: [],
    conclusion: null,
    pendingQuestion: null,
    clarificationRounds: 0,
    maxClarificationRounds: defaultIterationLimits.analysisPerAgent,
    completed: false,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})

export const jointAlignmentPlace = definePlace<AiDrivenDevelopmentRegistry>()(JOINT_ALIGNMENT, {
  state: {
    isActive: false,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    architectConclusion: null,
    principalConclusion: null,
    commonPerspective: null,
    highLevelPlan: [],
    risks: [],
    opportunities: [],
    pendingQuestion: null,
    exchangeRounds: 0,
    maxExchangeRounds: defaultIterationLimits.alignmentRounds,
    aligned: false,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})
