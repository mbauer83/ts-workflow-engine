import type { AiDrivenDevelopmentEvent } from "./places/environment.js"
import {
  ARCHITECT_ANALYSIS,
  JOINT_ALIGNMENT,
  PRINCIPAL_ANALYSIS,
} from "./places/analysis.js"
import {
  ARCHITECT_SOLUTION_SPEC,
  PRINCIPAL_SPEC_COLLAB,
} from "./places/architecture.js"
import {
  ARCHITECT_PART_REVIEW,
  DEVELOPER_WORK,
  FINAL_TRIAD_REVIEW,
  IMPLEMENTATION_ORCHESTRATION,
  PART_REVIEW_SYNC,
  PRINCIPAL_PART_REVIEW,
} from "./places/implementation.js"
import { PO_DISCOVERY } from "./places/po_discovery.js"
import { RELEASE_PREP, WORKFLOW_DONE } from "./places/release.js"
import { SPEC_REVIEW } from "./places/spec_review.js"

export const aiDrivenDevelopmentEventLogFields: Partial<
  Record<AiDrivenDevelopmentEvent["type"], readonly string[]>
> = {
  note_from_filepath: ["filepath", "gitProjectPath", "azureProject", "jiraProjectKey"],
  note_from_inline_content: ["sourceLabel", "gitProjectPath", "azureProject", "jiraProjectKey"],
  initial_review_questions_submitted: ["agent", "questions"],
  initial_review_clarification_answered: ["agent", "answer"],
  initial_review_approved: ["agent"],
  po_business_question: ["question"],
  po_business_answer: ["answer"],
  po_business_spec_ready: ["story", "requirements", "constraints"],
  jira_ticket_created: ["ticketId", "title"],
  architect_analysis_question: ["question"],
  architect_analysis_answer: ["answer"],
  architect_analysis_completed: ["focusedFiles", "conclusion"],
  principal_analysis_question: ["question"],
  principal_analysis_answer: ["answer"],
  principal_analysis_completed: ["focusedFiles", "conclusion"],
  alignment_question: ["askedBy", "question"],
  alignment_answer: ["answer"],
  alignment_completed: ["commonPerspective", "highLevelPlan", "risks", "opportunities"],
  architect_option_reviewed: ["reviewSummary"],
  architect_solution_selected: [
    "selectedOptionId",
    "componentsToAdd",
    "componentsToMerge",
    "componentsToSplit",
    "componentsToRemove",
    "patterns",
  ],
  architect_tooling_recommendations_submitted: [],
  principal_tooling_recommendations_submitted: [],
  tooling_recommendations_aligned: [],
  principal_spec_feedback: ["feedback", "question"],
  architect_spec_feedback_answered: ["answer", "revisedSpec"],
  dialectic_spec_aligned: ["alignmentSummary", "implementationDirectives"],
  principal_checklists_prepared: ["checklists"],
  developer_submission_ready: ["agentId", "checklistId", "summary", "confidence", "staticChecks", "relatedFeature"],
  architect_part_review_submitted: ["checklistId", "decision", "feedback"],
  principal_part_review_submitted: ["checklistId", "decision", "feedback"],
  final_review_submitted: ["agent", "decision", "changeRequest"],
  principal_branch_created: ["branchType", "branchName", "commitSha"],
  principal_pr_created: ["prUrl", "summary"],
  po_linked_pr_in_jira: ["ticketId"],
  stage_escalation_requested: ["stage", "by", "target", "question"],
  stage_escalation_answered: ["stage", "answer"],
}

type EventLogTransform = (event: AiDrivenDevelopmentEvent) => Record<string, unknown>

const summarizeAnalysisOptions: EventLogTransform = event => {
  if (event.type !== "architect_analysis_completed" && event.type !== "principal_analysis_completed") {
    return {}
  }

  return {
    optionIds: event.options.map(option => option.id),
  }
}

const summarizeArchitectSelectionSpec: EventLogTransform = event => {
  if (event.type !== "architect_solution_selected") {
    return {}
  }

  return {
    architectureSpec: {
      version: event.architectureSpec.version,
      objective: event.architectureSpec.objective,
      scope: event.architectureSpec.scope,
      decisions: event.architectureSpec.decisions,
      sectionIds: event.architectureSpec.sections.map(section => section.id),
    },
  }
}

const summarizeArchitectToolRecommendations: EventLogTransform = event => {
  if (event.type !== "architect_tooling_recommendations_submitted") {
    return {}
  }

  return {
    recommendationCount: event.recommendations.length,
    tools: event.recommendations.map(recommendation => recommendation.tool),
  }
}

const summarizePrincipalToolRecommendations: EventLogTransform = event => {
  if (event.type !== "principal_tooling_recommendations_submitted") {
    return {}
  }

  return {
    recommendationCount: event.recommendations.length,
    tools: event.recommendations.map(recommendation => recommendation.tool),
  }
}

const summarizeAlignedToolRecommendations: EventLogTransform = event => {
  if (event.type !== "tooling_recommendations_aligned") {
    return {}
  }

  return {
    agreedCount: event.agreedRecommendations.length,
    tools: event.agreedRecommendations.map(recommendation => recommendation.tool),
  }
}

const summarizeChecklists: EventLogTransform = event => {
  if (event.type !== "principal_checklists_prepared") {
    return {}
  }

  return {
    checklistCount: event.checklists.length,
    checklistIds: event.checklists.map(checklist => checklist.id),
    sourceAlignedSpecVersion: event.sourceAlignedSpecVersion,
  }
}

export const aiDrivenDevelopmentEventLogTransforms: Partial<
  Record<AiDrivenDevelopmentEvent["type"], EventLogTransform>
> = {
  architect_analysis_completed: summarizeAnalysisOptions,
  principal_analysis_completed: summarizeAnalysisOptions,
  architect_solution_selected: summarizeArchitectSelectionSpec,
  architect_tooling_recommendations_submitted: summarizeArchitectToolRecommendations,
  principal_tooling_recommendations_submitted: summarizePrincipalToolRecommendations,
  tooling_recommendations_aligned: summarizeAlignedToolRecommendations,
  principal_checklists_prepared: summarizeChecklists,
}

export const aiDrivenDevelopmentPlaceLogFields = new Map<PropertyKey, readonly string[]>([
  [SPEC_REVIEW, ["noteSource", "noteLocationOrLabel", "approvals", "pendingQuestions", "clarificationRounds"]],
  [PO_DISCOVERY, ["jiraTicketId", "businessStory", "pendingQuestion", "requirements", "constraints", "clarificationRounds"]],
  [ARCHITECT_ANALYSIS, ["jiraTicketId", "pendingQuestion", "clarificationRounds", "completed", "conclusion"]],
  [PRINCIPAL_ANALYSIS, ["jiraTicketId", "pendingQuestion", "clarificationRounds", "completed", "conclusion"]],
  [JOINT_ALIGNMENT, ["pendingQuestion", "exchangeRounds", "commonPerspective", "aligned"]],
  [ARCHITECT_SOLUTION_SPEC, [
    "requirements",
    "constraints",
    "highLevelPlan",
    "risks",
    "opportunities",
    "optionReviewSummary",
    "selectedSolution",
    "pendingQuestion",
    "architectureSpec",
    "recommendationsAligned",
  ]],
  [PRINCIPAL_SPEC_COLLAB, [
    "requirements",
    "constraints",
    "highLevelPlan",
    "risks",
    "opportunities",
    "architectSpec",
    "principalFeedback",
    "pendingQuestion",
    "dialecticRounds",
    "alignedSpec",
    "recommendationsAligned",
  ]],
  [IMPLEMENTATION_ORCHESTRATION, ["jiraTicketId", "activeChecklistId", "currentChecklistIndex", "completedChecklistIds", "checklistIterations"]],
  [DEVELOPER_WORK, ["activeChecklistId", "agentId", "confidence", "reviewFeedback", "escalation"]],
  [ARCHITECT_PART_REVIEW, ["activeChecklistId", "decision", "feedback"]],
  [PRINCIPAL_PART_REVIEW, ["activeChecklistId", "decision", "feedback"]],
  [PART_REVIEW_SYNC, ["activeChecklistId", "architectDecision", "principalDecision", "architectFeedback", "principalFeedback"]],
  [FINAL_TRIAD_REVIEW, ["poDecision", "architectDecision", "principalDecision", "poChangeRequest", "architectChangeRequest", "principalChangeRequest", "revisionCycles"]],
  [RELEASE_PREP, ["jiraTicketId", "branchType", "branchName", "commitShas", "prUrl", "jiraLinked"]],
  [WORKFLOW_DONE, ["jiraTicketId", "prUrl", "linkedInJira", "summary"]],
])