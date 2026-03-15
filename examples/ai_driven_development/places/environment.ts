import { definePlace } from "../../../src/domain/place.js"
import type {
  AgentRole,
  ArchitectureSpecification,
  BranchType,
  DeveloperSubmissionOutput,
  FinalReviewRole,
  ImplementationChecklist,
  InitialReviewRole,
  PrincipalSpecFeedback,
  PullRequestOutput,
  ReviewDecision,
  SolutionOption,
  StaticCheckStatus,
  ToolIntegrationRecommendation,
  WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE = Symbol("ai_driven_development_event_intake")

type RuntimeContext = {
  gitProjectPath: string
  azureProject: string
  jiraProjectKey: string
  iterationLimits?: Partial<WorkflowIterationLimits>
}

export type EscalationStage =
  | "initial_review"
  | "po_discovery"
  | "architect_analysis"
  | "principal_analysis"
  | "alignment"
  | "architecture_spec"
  | "implementation"
  | "final_review"

export type AiDrivenDevelopmentEvent =
  | ({
      type: "note_from_filepath"
      filepath: string
      noteContents: string
    } & RuntimeContext)
  | ({
      type: "note_from_inline_content"
      sourceLabel: string
      noteContents: string
    } & RuntimeContext)
  | {
      type: "initial_review_questions_submitted"
      agent: InitialReviewRole
      questions: string[]
    }
  | {
      type: "initial_review_clarification_answered"
      agent: InitialReviewRole
      answer: string
    }
  | {
      type: "initial_review_approved"
      agent: InitialReviewRole
    }
  | {
      type: "po_business_question"
      question: string
    }
  | {
      type: "po_business_answer"
      answer: string
    }
  | {
      type: "po_business_spec_ready"
      story: string
      requirements: string[]
      constraints: string[]
    }
  | {
      type: "jira_ticket_created"
      ticketId: string
      title: string
    }
  | {
      type: "architect_analysis_question"
      question: string
    }
  | {
      type: "architect_analysis_answer"
      answer: string
    }
  | {
      type: "architect_analysis_completed"
      focusedFiles: string[]
      options: SolutionOption[]
      challenges: string[]
      opportunities: string[]
      conclusion: string
    }
  | {
      type: "principal_analysis_question"
      question: string
    }
  | {
      type: "principal_analysis_answer"
      answer: string
    }
  | {
      type: "principal_analysis_completed"
      focusedFiles: string[]
      options: SolutionOption[]
      challenges: string[]
      opportunities: string[]
      conclusion: string
    }
  | {
      type: "alignment_question"
      askedBy: Extract<AgentRole, "architect" | "principal">
      question: string
    }
  | {
      type: "alignment_answer"
      answer: string
    }
  | {
      type: "alignment_completed"
      commonPerspective: string
      highLevelPlan: string[]
      risks: string[]
      opportunities: string[]
    }
  | {
      type: "architect_option_reviewed"
      reviewSummary: string
    }
  | {
      type: "architect_solution_selected"
      selectedOptionId: string
      architectureSpec: ArchitectureSpecification
      componentsToAdd: string[]
      componentsToMerge: string[]
      componentsToSplit: string[]
      componentsToRemove: string[]
      patterns: string[]
    }
  | {
      type: "architect_tooling_recommendations_submitted"
      recommendations: ToolIntegrationRecommendation[]
    }
  | {
      type: "principal_tooling_recommendations_submitted"
      recommendations: ToolIntegrationRecommendation[]
    }
  | {
      type: "tooling_recommendations_aligned"
      agreedRecommendations: ToolIntegrationRecommendation[]
    }
  | {
      type: "principal_spec_feedback"
      feedback: PrincipalSpecFeedback
      question: string | null
    }
  | {
      type: "architect_spec_feedback_answered"
      answer: string
      revisedSpec: ArchitectureSpecification
    }
  | {
      type: "dialectic_spec_aligned"
      alignmentSummary: string
      implementationDirectives: string[]
    }
  | {
      type: "principal_checklists_prepared"
      sourceAlignedSpecVersion: string
      checklists: ImplementationChecklist[]
    }
  | {
      type: "developer_submission_ready"
      agentId: string
      checklistId: string
      summary: DeveloperSubmissionOutput
      staticChecks: StaticCheckStatus
      confidence: number
      relatedSpecSections: string[]
      relatedFeature: string
    }
  | {
      type: "architect_part_review_submitted"
      checklistId: string
      decision: Exclude<ReviewDecision, "pending">
      feedback: string
    }
  | {
      type: "principal_part_review_submitted"
      checklistId: string
      decision: Exclude<ReviewDecision, "pending">
      feedback: string
    }
  | {
      type: "final_review_submitted"
      agent: FinalReviewRole
      decision: Exclude<ReviewDecision, "pending">
      changeRequest?: string
    }
  | {
      type: "principal_branch_created"
      branchType: BranchType
      branchName: string
      commitSha: string
    }
  | {
      type: "principal_pr_created"
      prUrl: string
      summary: PullRequestOutput
    }
  | {
      type: "po_linked_pr_in_jira"
      ticketId: string
    }
  | {
      type: "stage_escalation_requested"
      stage: EscalationStage
      by: AgentRole
      target: AgentRole | "user"
      question: string
    }
  | {
      type: "stage_escalation_answered"
      stage: EscalationStage
      answer: string
    }

export type AiDrivenDevelopmentEventIntakeState = {
  pendingEvent: AiDrivenDevelopmentEvent | null
}

export const aiDrivenDevelopmentEventIntakePlace = definePlace<AiDrivenDevelopmentRegistry>()(AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, {
  interfaceRole: "input",
  state: {
    isActive: false,
    pendingEvent: null,
  },
})
