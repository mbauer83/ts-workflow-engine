import {
  createEmptyStaticChecks,
  idleEscalation,
  type AgentContribution,
} from "../model.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import {
  ARCHITECT_PART_REVIEW,
  DEVELOPER_WORK,
  FINAL_TRIAD_REVIEW,
  IMPLEMENTATION_ORCHESTRATION,
  PART_REVIEW_SYNC,
  PRINCIPAL_PART_REVIEW,
} from "../places/implementation.js"
import {
  allStaticChecksPassing,
  buildChecklistIterationMap,
  buildReviewContributions,
  defineAiDrivenDevelopmentTransition,
  isDecisionComplete,
} from "./helpers.js"

const onPrincipalPreparedChecklists = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_prepared_checklists"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, IMPLEMENTATION_ORCHESTRATION],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "principal_checklists_prepared") {
        return false
      }

      const alignedSpec = inputs[IMPLEMENTATION_ORCHESTRATION].alignedSpec
      if (
        event.checklists.length === 0
        || alignedSpec === null
        || event.sourceAlignedSpecVersion !== alignedSpec.version
      ) {
        return false
      }

      const specSectionIds = new Set(alignedSpec.architectRevision.sections.map(section => section.id))
      return event.checklists.every(checklist =>
        checklist.relatedSpecSections.length > 0
        && checklist.relatedSpecSections.every(sectionId => specSectionIds.has(sectionId))
      )
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_checklists_prepared") {
          return {}
        }

        return {
          checklists: event.checklists,
          currentChecklistIndex: 0,
          activeChecklistId: null,
          checklistIterations: buildChecklistIterationMap(event.checklists),
          completedChecklistIds: [],
        }
      },
    },
  }
)

const onSpawnDeveloperForCurrentChecklist = defineAiDrivenDevelopmentTransition(
  Symbol("on_spawn_developer_for_current_checklist"),
  {
    inputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION, DEVELOPER_WORK],
    guard: inputs => {
      const state = inputs[IMPLEMENTATION_ORCHESTRATION]
      const currentChecklist = state.checklists[state.currentChecklistIndex]

      return currentChecklist !== undefined && state.activeChecklistId === null
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const state = inputs[IMPLEMENTATION_ORCHESTRATION]
        const currentChecklist = state.checklists[state.currentChecklistIndex]

        if (!currentChecklist) {
          return {}
        }

        return {
          activeChecklistId: currentChecklist.id,
        }
      },
      [DEVELOPER_WORK]: inputs => {
        const state = inputs[IMPLEMENTATION_ORCHESTRATION]
        const currentChecklist = state.checklists[state.currentChecklistIndex]

        if (!currentChecklist) {
          return {}
        }

        return {
          activeChecklistId: currentChecklist.id,
          agentId: null,
          submissionSummary: null,
          staticChecks: createEmptyStaticChecks(),
          confidence: null,
          reviewFeedback: [],
          awaitingReview: false,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

const onDeveloperSubmissionReadyForkReviews = defineAiDrivenDevelopmentTransition(
  Symbol("on_developer_submission_ready_fork_reviews"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, IMPLEMENTATION_ORCHESTRATION, DEVELOPER_WORK],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION, ARCHITECT_PART_REVIEW, PRINCIPAL_PART_REVIEW],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "developer_submission_ready") {
        return false
      }

      if (inputs[IMPLEMENTATION_ORCHESTRATION].activeChecklistId !== event.checklistId) {
        return false
      }

      const currentChecklist = inputs[IMPLEMENTATION_ORCHESTRATION].checklists.find(
        checklist => checklist.id === event.checklistId
      )

      if (!currentChecklist) {
        return false
      }

      if (currentChecklist.relatedSpecSections.length > 0) {
        const allowedSpecSections = new Set(currentChecklist.relatedSpecSections)
        if (
          event.relatedSpecSections.length === 0
          || event.relatedSpecSections.some(sectionId => !allowedSpecSections.has(sectionId))
        ) {
          return false
        }
      }

      return allStaticChecksPassing(event.staticChecks)
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "developer_submission_ready") {
          return {}
        }

        const contribution: AgentContribution = {
          checklistId: event.checklistId,
          agentId: event.agentId,
          role: "developer",
          summary: event.summary.overview,
          relatedSpecSections: event.relatedSpecSections,
          relatedFeature: event.relatedFeature,
          timestampIso: new Date().toISOString(),
        }

        return {
          contributions: [...inputs[IMPLEMENTATION_ORCHESTRATION].contributions, contribution],
        }
      },
      [ARCHITECT_PART_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "developer_submission_ready") {
          return {}
        }

        return {
          activeChecklistId: event.checklistId,
          submissionSummary: event.summary,
          decision: "pending",
          feedback: null,
        }
      },
      [PRINCIPAL_PART_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "developer_submission_ready") {
          return {}
        }

        return {
          activeChecklistId: event.checklistId,
          submissionSummary: event.summary,
          decision: "pending",
          feedback: null,
        }
      },
    },
  }
)

const onArchitectPartReviewSubmitted = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_part_review_submitted"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_PART_REVIEW],
    outputPlaces: [ARCHITECT_PART_REVIEW],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_part_review_submitted"
        && inputs[ARCHITECT_PART_REVIEW].activeChecklistId === event.checklistId
    },
    effects: {
      [ARCHITECT_PART_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_part_review_submitted") {
          return {}
        }

        return {
          decision: event.decision,
          feedback: event.feedback,
        }
      },
    },
  }
)

const onPrincipalPartReviewSubmitted = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_part_review_submitted"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_PART_REVIEW],
    outputPlaces: [PRINCIPAL_PART_REVIEW],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_part_review_submitted"
        && inputs[PRINCIPAL_PART_REVIEW].activeChecklistId === event.checklistId
    },
    effects: {
      [PRINCIPAL_PART_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_part_review_submitted") {
          return {}
        }

        return {
          decision: event.decision,
          feedback: event.feedback,
        }
      },
    },
  }
)

const onPartReviewsJoined = defineAiDrivenDevelopmentTransition(
  Symbol("on_part_reviews_joined"),
  {
    inputPlaces: [ARCHITECT_PART_REVIEW, PRINCIPAL_PART_REVIEW],
    outputPlaces: [PART_REVIEW_SYNC],
    guard: inputs => {
      const architectChecklist = inputs[ARCHITECT_PART_REVIEW].activeChecklistId
      const principalChecklist = inputs[PRINCIPAL_PART_REVIEW].activeChecklistId

      return architectChecklist !== null
        && architectChecklist === principalChecklist
        && isDecisionComplete(inputs[ARCHITECT_PART_REVIEW].decision)
        && isDecisionComplete(inputs[PRINCIPAL_PART_REVIEW].decision)
    },
    effects: {
      [PART_REVIEW_SYNC]: inputs => ({
        activeChecklistId: inputs[ARCHITECT_PART_REVIEW].activeChecklistId,
        architectDecision: inputs[ARCHITECT_PART_REVIEW].decision,
        architectFeedback: inputs[ARCHITECT_PART_REVIEW].feedback,
        principalDecision: inputs[PRINCIPAL_PART_REVIEW].decision,
        principalFeedback: inputs[PRINCIPAL_PART_REVIEW].feedback,
      }),
    },
  }
)

const onPartRequiresChangesLoopDeveloper = defineAiDrivenDevelopmentTransition(
  Symbol("on_part_requires_changes_loop_developer"),
  {
    inputPlaces: [PART_REVIEW_SYNC, IMPLEMENTATION_ORCHESTRATION],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION, DEVELOPER_WORK],
    guard: inputs => {
      const checklistId = inputs[PART_REVIEW_SYNC].activeChecklistId
      if (!checklistId || inputs[IMPLEMENTATION_ORCHESTRATION].activeChecklistId !== checklistId) {
        return false
      }

      const needsChanges = inputs[PART_REVIEW_SYNC].architectDecision === "changes_requested"
        || inputs[PART_REVIEW_SYNC].principalDecision === "changes_requested"

      if (!needsChanges) {
        return false
      }

      const iterationCount = inputs[IMPLEMENTATION_ORCHESTRATION].checklistIterations[checklistId] ?? 0
      return iterationCount < inputs[IMPLEMENTATION_ORCHESTRATION].maxDevIterationsPerChecklist
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const checklistId = inputs[PART_REVIEW_SYNC].activeChecklistId
        if (!checklistId) {
          return {}
        }

        const nextIteration = (inputs[IMPLEMENTATION_ORCHESTRATION].checklistIterations[checklistId] ?? 0) + 1
        const reviewContributions = buildReviewContributions(
          checklistId,
          inputs[PART_REVIEW_SYNC].architectFeedback,
          inputs[PART_REVIEW_SYNC].principalFeedback
        )

        return {
          checklistIterations: {
            ...inputs[IMPLEMENTATION_ORCHESTRATION].checklistIterations,
            [checklistId]: nextIteration,
          },
          contributions: [
            ...inputs[IMPLEMENTATION_ORCHESTRATION].contributions,
            ...reviewContributions,
          ],
        }
      },
      [DEVELOPER_WORK]: inputs => {
        const checklistId = inputs[PART_REVIEW_SYNC].activeChecklistId
        if (!checklistId) {
          return {}
        }

        const reviewFeedback = [
          inputs[PART_REVIEW_SYNC].architectFeedback,
          inputs[PART_REVIEW_SYNC].principalFeedback,
        ].filter((feedback): feedback is string => feedback !== null && feedback.trim().length > 0)

        return {
          activeChecklistId: checklistId,
          agentId: null,
          submissionSummary: null,
          staticChecks: createEmptyStaticChecks(),
          confidence: null,
          reviewFeedback,
          awaitingReview: false,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

const onPartApprovedMarkComplete = defineAiDrivenDevelopmentTransition(
  Symbol("on_part_approved_mark_complete"),
  {
    inputPlaces: [PART_REVIEW_SYNC, IMPLEMENTATION_ORCHESTRATION],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    guard: inputs => {
      const checklistId = inputs[PART_REVIEW_SYNC].activeChecklistId
      if (!checklistId || inputs[IMPLEMENTATION_ORCHESTRATION].activeChecklistId !== checklistId) {
        return false
      }

      return inputs[PART_REVIEW_SYNC].architectDecision === "approved"
        && inputs[PART_REVIEW_SYNC].principalDecision === "approved"
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const checklistId = inputs[PART_REVIEW_SYNC].activeChecklistId
        if (!checklistId) {
          return {}
        }

        const alreadyCompleted = inputs[IMPLEMENTATION_ORCHESTRATION].completedChecklistIds.includes(checklistId)
        const reviewContributions = buildReviewContributions(
          checklistId,
          inputs[PART_REVIEW_SYNC].architectFeedback,
          inputs[PART_REVIEW_SYNC].principalFeedback
        )

        return {
          completedChecklistIds: alreadyCompleted
            ? inputs[IMPLEMENTATION_ORCHESTRATION].completedChecklistIds
            : [...inputs[IMPLEMENTATION_ORCHESTRATION].completedChecklistIds, checklistId],
          currentChecklistIndex: alreadyCompleted
            ? inputs[IMPLEMENTATION_ORCHESTRATION].currentChecklistIndex
            : inputs[IMPLEMENTATION_ORCHESTRATION].currentChecklistIndex + 1,
          activeChecklistId: null,
          contributions: [
            ...inputs[IMPLEMENTATION_ORCHESTRATION].contributions,
            ...reviewContributions,
          ],
        }
      },
    },
  }
)

const onImplementationEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_implementation_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, DEVELOPER_WORK],
    outputPlaces: [DEVELOPER_WORK],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "implementation"
    },
    effects: {
      [DEVELOPER_WORK]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "implementation") {
          return {}
        }

        return {
          escalation: {
            required: true,
            by: event.by,
            question: event.question,
            answer: null,
          },
        }
      },
    },
  }
)

const onImplementationEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_implementation_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, DEVELOPER_WORK],
    outputPlaces: [DEVELOPER_WORK],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "implementation"
    },
    effects: {
      [DEVELOPER_WORK]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "implementation") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[DEVELOPER_WORK].escalation.by,
            question: inputs[DEVELOPER_WORK].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onAllChecklistPartsDoneStartFinalReview = defineAiDrivenDevelopmentTransition(
  Symbol("on_all_checklist_parts_done_start_final_review"),
  {
    inputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    outputPlaces: [FINAL_TRIAD_REVIEW],
    guard: inputs => {
      const state = inputs[IMPLEMENTATION_ORCHESTRATION]
      return state.checklists.length > 0
        && state.currentChecklistIndex >= state.checklists.length
        && state.activeChecklistId === null
    },
    effects: {
      [FINAL_TRIAD_REVIEW]: inputs => ({
        noteDigest: inputs[IMPLEMENTATION_ORCHESTRATION].noteDigest,
        gitProjectPath: inputs[IMPLEMENTATION_ORCHESTRATION].gitProjectPath,
        azureProject: inputs[IMPLEMENTATION_ORCHESTRATION].azureProject,
        jiraProjectKey: inputs[IMPLEMENTATION_ORCHESTRATION].jiraProjectKey,
        jiraTicketId: inputs[IMPLEMENTATION_ORCHESTRATION].jiraTicketId,
        businessStory: inputs[IMPLEMENTATION_ORCHESTRATION].businessStory,
        requirements: inputs[IMPLEMENTATION_ORCHESTRATION].requirements,
        constraints: inputs[IMPLEMENTATION_ORCHESTRATION].constraints,
        alignedSpec: inputs[IMPLEMENTATION_ORCHESTRATION].alignedSpec,
        checklists: inputs[IMPLEMENTATION_ORCHESTRATION].checklists,
        completedChecklistIds: inputs[IMPLEMENTATION_ORCHESTRATION].completedChecklistIds,
        contributions: inputs[IMPLEMENTATION_ORCHESTRATION].contributions,
        poDecision: "pending",
        architectDecision: "pending",
        principalDecision: "pending",
        poChangeRequest: null,
        architectChangeRequest: null,
        principalChangeRequest: null,
        revisionCycles: 0,
        maxRevisionCycles: inputs[IMPLEMENTATION_ORCHESTRATION].iterationLimits.finalReviewCycles,
        iterationLimits: inputs[IMPLEMENTATION_ORCHESTRATION].iterationLimits,
        escalation: idleEscalation(),
      }),
    },
  }
)

export const implementationFlowTransitions = {
  onPrincipalPreparedChecklists,
  onSpawnDeveloperForCurrentChecklist,
  onDeveloperSubmissionReadyForkReviews,
  onArchitectPartReviewSubmitted,
  onPrincipalPartReviewSubmitted,
  onPartReviewsJoined,
  onPartRequiresChangesLoopDeveloper,
  onPartApprovedMarkComplete,
  onImplementationEscalationRequested,
  onImplementationEscalationAnswered,
  onAllChecklistPartsDoneStartFinalReview,
} as const
