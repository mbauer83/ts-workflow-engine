import {
  createInitialApprovals,
  createInitialClarificationRounds,
  createInitialPendingQuestions,
  idleEscalation,
  truncateText,
} from "../model.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import { PO_DISCOVERY } from "../places/po_discovery.js"
import { SPEC_REVIEW } from "../places/spec_review.js"
import {
  allInitialApprovalsGranted,
  defineAiDrivenDevelopmentTransition,
  resolveIterationLimits,
} from "./helpers.js"

const onNoteProvidedInitializeSpecReview = defineAiDrivenDevelopmentTransition(
  Symbol("on_note_provided_initialize_spec_review"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE],
    outputPlaces: [SPEC_REVIEW],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "note_from_filepath" || event?.type === "note_from_inline_content"
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (!event || (event.type !== "note_from_filepath" && event.type !== "note_from_inline_content")) {
          return {}
        }

        const iterationLimits = resolveIterationLimits(event.iterationLimits)

        return {
          noteSource: event.type === "note_from_filepath" ? "filepath" : "inline",
          noteLocationOrLabel: event.type === "note_from_filepath" ? event.filepath : event.sourceLabel,
          noteContents: event.noteContents,
          gitProjectPath: event.gitProjectPath,
          azureProject: event.azureProject,
          jiraProjectKey: event.jiraProjectKey,
          approvals: createInitialApprovals(),
          pendingQuestions: createInitialPendingQuestions(),
          clarificationRounds: createInitialClarificationRounds(),
          maxClarificationRounds: iterationLimits.initialReviewPerAgent,
          iterationLimits,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

const onInitialReviewQuestionsSubmitted = defineAiDrivenDevelopmentTransition(
  Symbol("on_initial_review_questions_submitted"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, SPEC_REVIEW],
    outputPlaces: [SPEC_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "initial_review_questions_submitted") {
        return false
      }

      return inputs[SPEC_REVIEW].clarificationRounds[event.agent] < inputs[SPEC_REVIEW].maxClarificationRounds
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "initial_review_questions_submitted") {
          return {}
        }

        return {
          pendingQuestions: {
            ...inputs[SPEC_REVIEW].pendingQuestions,
            [event.agent]: event.questions,
          },
          clarificationRounds: {
            ...inputs[SPEC_REVIEW].clarificationRounds,
            [event.agent]: inputs[SPEC_REVIEW].clarificationRounds[event.agent] + 1,
          },
          approvals: {
            ...inputs[SPEC_REVIEW].approvals,
            [event.agent]: false,
          },
        }
      },
    },
  }
)

const onInitialReviewClarificationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_initial_review_clarification_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, SPEC_REVIEW],
    outputPlaces: [SPEC_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "initial_review_clarification_answered") {
        return false
      }

      return inputs[SPEC_REVIEW].pendingQuestions[event.agent] !== null
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "initial_review_clarification_answered") {
          return {}
        }

        return {
          pendingQuestions: {
            ...inputs[SPEC_REVIEW].pendingQuestions,
            [event.agent]: null,
          },
          escalation: {
            required: false,
            by: inputs[SPEC_REVIEW].escalation.by,
            question: inputs[SPEC_REVIEW].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onInitialReviewApproved = defineAiDrivenDevelopmentTransition(
  Symbol("on_initial_review_approved"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, SPEC_REVIEW],
    outputPlaces: [SPEC_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "initial_review_approved") {
        return false
      }

      return inputs[SPEC_REVIEW].pendingQuestions[event.agent] === null
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "initial_review_approved") {
          return {}
        }

        return {
          approvals: {
            ...inputs[SPEC_REVIEW].approvals,
            [event.agent]: true,
          },
        }
      },
    },
  }
)

const onInitialReviewEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_initial_review_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, SPEC_REVIEW],
    outputPlaces: [SPEC_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "initial_review"
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "initial_review") {
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

const onInitialReviewEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_initial_review_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, SPEC_REVIEW],
    outputPlaces: [SPEC_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "initial_review"
    },
    effects: {
      [SPEC_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "initial_review") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[SPEC_REVIEW].escalation.by,
            question: inputs[SPEC_REVIEW].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onAllInitialReviewersApprovedAdvanceToPo = defineAiDrivenDevelopmentTransition(
  Symbol("on_all_initial_reviewers_approved_advance_to_po"),
  {
    inputPlaces: [SPEC_REVIEW],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => allInitialApprovalsGranted(inputs[SPEC_REVIEW].approvals),
    effects: {
      [PO_DISCOVERY]: inputs => ({
        noteDigest: truncateText(inputs[SPEC_REVIEW].noteContents ?? "", 240),
        gitProjectPath: inputs[SPEC_REVIEW].gitProjectPath,
        azureProject: inputs[SPEC_REVIEW].azureProject,
        jiraProjectKey: inputs[SPEC_REVIEW].jiraProjectKey,
        businessStory: null,
        requirements: [],
        constraints: [],
        pendingQuestion: null,
        clarificationRounds: 0,
        maxClarificationRounds: inputs[SPEC_REVIEW].iterationLimits.poClarificationRounds,
        jiraTicketId: null,
        iterationLimits: inputs[SPEC_REVIEW].iterationLimits,
        escalation: idleEscalation(),
      }),
    },
  }
)

export const intakeReviewTransitions = {
  onNoteProvidedInitializeSpecReview,
  onInitialReviewQuestionsSubmitted,
  onInitialReviewClarificationAnswered,
  onInitialReviewApproved,
  onInitialReviewEscalationRequested,
  onInitialReviewEscalationAnswered,
  onAllInitialReviewersApprovedAdvanceToPo,
} as const
