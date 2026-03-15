import { defineTransition } from "../../../src/domain/transition.js"
import {
  allInitialReviewRoles,
  defaultIterationLimits,
  type AgentContribution,
  type ImplementationChecklist,
  type InitialReviewRole,
  type ReviewDecision,
  type WorkflowIterationLimits,
} from "../model.js"
import type { AiDrivenDevelopmentRegistry } from "../workflow_registry.js"

export const defineAiDrivenDevelopmentTransition = defineTransition<AiDrivenDevelopmentRegistry>()

export const resolveIterationLimits = (
  overrides?: Partial<WorkflowIterationLimits>
): WorkflowIterationLimits => ({
  ...defaultIterationLimits,
  ...overrides,
})

export const allInitialApprovalsGranted = (
  approvals: Record<InitialReviewRole, boolean>
): boolean => allInitialReviewRoles.every(role => approvals[role])

export const allStaticChecksPassing = (checks: {
  typecheck: boolean
  lint: boolean
  tests: boolean
  staticAnalysis: boolean
}): boolean => checks.typecheck && checks.lint && checks.tests && checks.staticAnalysis

export const buildChecklistIterationMap = (
  checklists: ImplementationChecklist[]
): Record<string, number> =>
  Object.fromEntries(checklists.map(checklist => [checklist.id, 0])) as Record<string, number>

export const isDecisionComplete = (
  decision: ReviewDecision
): decision is Exclude<ReviewDecision, "pending"> => decision !== "pending"

export const buildReviewContributions = (
  checklistId: string,
  architectFeedback: string | null,
  principalFeedback: string | null
): AgentContribution[] => {
  const timestampIso = new Date().toISOString()
  const contributions: AgentContribution[] = []

  if (architectFeedback !== null) {
    contributions.push({
      checklistId,
      agentId: "architect.reviewer",
      role: "architect",
      summary: architectFeedback,
      relatedSpecSections: ["architecture-spec", "review-gate"],
      relatedFeature: "implementation-review",
      timestampIso,
    })
  }

  if (principalFeedback !== null) {
    contributions.push({
      checklistId,
      agentId: "principal.reviewer",
      role: "principal",
      summary: principalFeedback,
      relatedSpecSections: ["implementation-plan", "review-gate"],
      relatedFeature: "implementation-review",
      timestampIso,
    })
  }

  return contributions
}
