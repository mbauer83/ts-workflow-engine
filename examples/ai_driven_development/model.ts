export type AgentRole = "po" | "architect" | "principal" | "developer"

export const allInitialReviewRoles = ["po", "architect", "principal", "developer"] as const

export type InitialReviewRole = (typeof allInitialReviewRoles)[number]

export type FinalReviewRole = Exclude<AgentRole, "developer">

export type ReviewDecision = "pending" | "approved" | "changes_requested"

export type BranchType = "feature" | "chore" | "bugfix"

export type WorkflowIterationLimits = {
  initialReviewPerAgent: number
  poClarificationRounds: number
  analysisPerAgent: number
  alignmentRounds: number
  specDialecticRounds: number
  devIterationsPerChecklist: number
  finalReviewCycles: number
}

export const defaultIterationLimits: WorkflowIterationLimits = {
  initialReviewPerAgent: 3,
  poClarificationRounds: 3,
  analysisPerAgent: 3,
  alignmentRounds: 4,
  specDialecticRounds: 3,
  devIterationsPerChecklist: 4,
  finalReviewCycles: 3,
}

export type SolutionOption = {
  id: string
  score: number
  summary: string
}

export type ToolIntegrationRecommendation = {
  tool: string
  roleInSolution: string
  integrationNotes: string
}

export type StructuredSpecSection = {
  id: string
  heading: string
  points: string[]
}

export type ArchitectureSpecification = {
  version: string
  objective: string
  scope: string[]
  decisions: string[]
  components: {
    add: string[]
    merge: string[]
    split: string[]
    remove: string[]
  }
  patterns: string[]
  sections: StructuredSpecSection[]
}

export type PrincipalSpecFeedback = {
  verdict: "approved_with_notes" | "changes_requested"
  notes: string[]
  openQuestions: string[]
}

export type AlignedSpecification = {
  version: string
  architectRevision: ArchitectureSpecification
  principalFeedback: PrincipalSpecFeedback | null
  alignmentSummary: string
  implementationDirectives: string[]
  agreedTooling: ToolIntegrationRecommendation[]
}

export type DeveloperSubmissionOutput = {
  overview: string
  changedAreas: string[]
  verification: string[]
}

export type PullRequestOutput = {
  title: string
  highlights: string[]
  verification: string[]
}

export type WorkflowCompletionOutput = {
  status: "completed"
  message: string
  artifacts: {
    jiraTicketId: string | null
    prUrl: string | null
    linkedInJira: boolean
  }
}

export type ImplementationChecklist = {
  id: string
  domain: string
  concern: string
  relatedSpecSections: string[]
  steps: string[]
  requirements: string[]
  constraints: string[]
  testConditions: string[]
  preferredAgents: string[]
}

export type StaticCheckStatus = {
  typecheck: boolean
  lint: boolean
  tests: boolean
  staticAnalysis: boolean
}

export type AgentContribution = {
  checklistId: string
  agentId: string
  role: AgentRole
  summary: string
  relatedSpecSections: string[]
  relatedFeature: string
  timestampIso: string
}

export type EscalationState = {
  required: boolean
  by: AgentRole | null
  question: string | null
  answer: string | null
}

export const idleEscalation = (): EscalationState => ({
  required: false,
  by: null,
  question: null,
  answer: null,
})

export const createInitialApprovals = (): Record<InitialReviewRole, boolean> => ({
  po: false,
  architect: false,
  principal: false,
  developer: false,
})

export const createInitialClarificationRounds = (): Record<InitialReviewRole, number> => ({
  po: 0,
  architect: 0,
  principal: 0,
  developer: 0,
})

export const createInitialPendingQuestions = (): Record<InitialReviewRole, string[] | null> => ({
  po: null,
  architect: null,
  principal: null,
  developer: null,
})

export const createEmptyStaticChecks = (): StaticCheckStatus => ({
  typecheck: false,
  lint: false,
  tests: false,
  staticAnalysis: false,
})

export function truncateText(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input
  }

  return `${input.slice(0, maxLength - 1)}…`
}
