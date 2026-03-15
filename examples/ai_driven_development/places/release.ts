import { definePlace } from "../../../src/domain/place.js"
import type {
  AgentContribution,
  AgentRole,
  BranchType,
  PullRequestOutput,
  WorkflowCompletionOutput,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const RELEASE_PREP = Symbol("release_prep")
export const WORKFLOW_DONE = Symbol("workflow_done")

type CapabilityMatrix = Record<AgentRole, string[]>

const defaultCapabilitiesByRole: CapabilityMatrix = {
  po: [
    "read_note",
    "business_research",
    "jira_create_ticket",
    "jira_link_pr",
    "final_acceptance_review",
  ],
  architect: [
    "read_repo_structure",
    "inspect_code",
    "author_solution_spec",
    "architectural_review",
  ],
  principal: [
    "inspect_code",
    "co_author_architecture_spec",
    "author_checklists",
    "review_implementation",
    "create_branch_and_pr",
  ],
  developer: [
    "implement_checklist",
    "run_typecheck_lint_tests",
    "submit_changes_for_review",
  ],
}

export type ReleasePreparationState = {
  jiraTicketId: string | null
  branchType: BranchType | null
  branchName: string | null
  commitShas: string[]
  prUrl: string | null
  prSummary: PullRequestOutput | null
  jiraLinked: boolean
  contributions: AgentContribution[]
  capabilitiesByRole: CapabilityMatrix
}

export type WorkflowDoneState = {
  jiraTicketId: string | null
  prUrl: string | null
  summary: WorkflowCompletionOutput | null
  linkedInJira: boolean
}

export const releasePrepPlace = definePlace<AiDrivenDevelopmentRegistry>()(RELEASE_PREP, {
  state: {
    isActive: false,
    jiraTicketId: null,
    branchType: null,
    branchName: null,
    commitShas: [],
    prUrl: null,
    prSummary: null,
    jiraLinked: false,
    contributions: [],
    capabilitiesByRole: defaultCapabilitiesByRole,
  },
})

export const workflowDonePlace = definePlace<AiDrivenDevelopmentRegistry>()(WORKFLOW_DONE, {
  state: {
    isActive: false,
    jiraTicketId: null,
    prUrl: null,
    summary: null,
    linkedInJira: false,
  },
})
