import { definePlace } from "../../../src/domain/place.js"
import {
  type AlignedSpecification,
  createEmptyStaticChecks,
  defaultIterationLimits,
  type DeveloperSubmissionOutput,
  idleEscalation,
  type AgentContribution,
  type EscalationState,
  type ImplementationChecklist,
  type ReviewDecision,
  type StaticCheckStatus,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const IMPLEMENTATION_ORCHESTRATION = Symbol("implementation_orchestration")
export const DEVELOPER_WORK = Symbol("developer_work")
export const ARCHITECT_PART_REVIEW = Symbol("architect_part_review")
export const PRINCIPAL_PART_REVIEW = Symbol("principal_part_review")
export const PART_REVIEW_SYNC = Symbol("part_review_sync")
export const FINAL_TRIAD_REVIEW = Symbol("final_triad_review")

export type ImplementationOrchestrationState = {
  noteDigest: string | null
  gitProjectPath: string | null
  azureProject: string | null
  jiraProjectKey: string | null
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  alignedSpec: AlignedSpecification | null
  checklists: ImplementationChecklist[]
  currentChecklistIndex: number
  activeChecklistId: string | null
  checklistIterations: Record<string, number>
  maxDevIterationsPerChecklist: number
  completedChecklistIds: string[]
  contributions: AgentContribution[]
  highLevelPlan: string[]
  risks: string[]
  opportunities: string[]
  iterationLimits: WorkflowIterationLimits
}

export type DeveloperWorkState = {
  activeChecklistId: string | null
  agentId: string | null
  submissionSummary: DeveloperSubmissionOutput | null
  staticChecks: StaticCheckStatus
  confidence: number | null
  reviewFeedback: string[]
  awaitingReview: boolean
  escalation: EscalationState
}

export type ReviewerLaneState = {
  activeChecklistId: string | null
  submissionSummary: DeveloperSubmissionOutput | null
  decision: ReviewDecision
  feedback: string | null
}

export type PartReviewSyncState = {
  activeChecklistId: string | null
  architectDecision: ReviewDecision
  architectFeedback: string | null
  principalDecision: ReviewDecision
  principalFeedback: string | null
}

export type FinalTriadReviewState = {
  noteDigest: string | null
  gitProjectPath: string | null
  azureProject: string | null
  jiraProjectKey: string | null
  jiraTicketId: string | null
  businessStory: string | null
  requirements: string[]
  constraints: string[]
  alignedSpec: AlignedSpecification | null
  checklists: ImplementationChecklist[]
  completedChecklistIds: string[]
  contributions: AgentContribution[]
  poDecision: ReviewDecision
  architectDecision: ReviewDecision
  principalDecision: ReviewDecision
  poChangeRequest: string | null
  architectChangeRequest: string | null
  principalChangeRequest: string | null
  revisionCycles: number
  maxRevisionCycles: number
  iterationLimits: WorkflowIterationLimits
  escalation: EscalationState
}

export const implementationOrchestrationPlace = definePlace<AiDrivenDevelopmentRegistry>()(IMPLEMENTATION_ORCHESTRATION, {
  state: {
    isActive: false,
    noteDigest: null,
    gitProjectPath: null,
    azureProject: null,
    jiraProjectKey: null,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    alignedSpec: null,
    checklists: [],
    currentChecklistIndex: 0,
    activeChecklistId: null,
    checklistIterations: {},
    maxDevIterationsPerChecklist: defaultIterationLimits.devIterationsPerChecklist,
    completedChecklistIds: [],
    contributions: [],
    highLevelPlan: [],
    risks: [],
    opportunities: [],
    iterationLimits: defaultIterationLimits,
  },
})

export const developerWorkPlace = definePlace<AiDrivenDevelopmentRegistry>()(DEVELOPER_WORK, {
  state: {
    isActive: false,
    activeChecklistId: null,
    agentId: null,
    submissionSummary: null,
    staticChecks: createEmptyStaticChecks(),
    confidence: null,
    reviewFeedback: [],
    awaitingReview: false,
    escalation: idleEscalation(),
  },
})

export const architectPartReviewPlace = definePlace<AiDrivenDevelopmentRegistry>()(ARCHITECT_PART_REVIEW, {
  state: {
    isActive: false,
    activeChecklistId: null,
    submissionSummary: null,
    decision: "pending",
    feedback: null,
  },
})

export const principalPartReviewPlace = definePlace<AiDrivenDevelopmentRegistry>()(PRINCIPAL_PART_REVIEW, {
  state: {
    isActive: false,
    activeChecklistId: null,
    submissionSummary: null,
    decision: "pending",
    feedback: null,
  },
})

export const partReviewSyncPlace = definePlace<AiDrivenDevelopmentRegistry>()(PART_REVIEW_SYNC, {
  state: {
    isActive: false,
    activeChecklistId: null,
    architectDecision: "pending",
    architectFeedback: null,
    principalDecision: "pending",
    principalFeedback: null,
  },
})

export const finalTriadReviewPlace = definePlace<AiDrivenDevelopmentRegistry>()(FINAL_TRIAD_REVIEW, {
  state: {
    isActive: false,
    noteDigest: null,
    gitProjectPath: null,
    azureProject: null,
    jiraProjectKey: null,
    jiraTicketId: null,
    businessStory: null,
    requirements: [],
    constraints: [],
    alignedSpec: null,
    checklists: [],
    completedChecklistIds: [],
    contributions: [],
    poDecision: "pending",
    architectDecision: "pending",
    principalDecision: "pending",
    poChangeRequest: null,
    architectChangeRequest: null,
    principalChangeRequest: null,
    revisionCycles: 0,
    maxRevisionCycles: defaultIterationLimits.finalReviewCycles,
    iterationLimits: defaultIterationLimits,
    escalation: idleEscalation(),
  },
})
