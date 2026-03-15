import { idleEscalation } from "../model.js"
import { JOINT_ALIGNMENT } from "../places/analysis.js"
import { ARCHITECT_SOLUTION_SPEC } from "../places/architecture.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import { defineAiDrivenDevelopmentTransition } from "./helpers.js"

const onAlignmentQuestion = defineAiDrivenDevelopmentTransition(
  Symbol("on_alignment_question"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, JOINT_ALIGNMENT],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "alignment_question") {
        return false
      }

      return inputs[JOINT_ALIGNMENT].exchangeRounds < inputs[JOINT_ALIGNMENT].maxExchangeRounds
    },
    effects: {
      [JOINT_ALIGNMENT]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "alignment_question") {
          return {}
        }

        return {
          pendingQuestion: event.question,
          exchangeRounds: inputs[JOINT_ALIGNMENT].exchangeRounds + 1,
        }
      },
    },
  }
)

const onAlignmentAnswer = defineAiDrivenDevelopmentTransition(
  Symbol("on_alignment_answer"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, JOINT_ALIGNMENT],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "alignment_answer" && inputs[JOINT_ALIGNMENT].pendingQuestion !== null
    },
    effects: {
      [JOINT_ALIGNMENT]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "alignment_answer") {
          return {}
        }

        return {
          pendingQuestion: null,
          escalation: {
            required: false,
            by: inputs[JOINT_ALIGNMENT].escalation.by,
            question: inputs[JOINT_ALIGNMENT].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onAlignmentEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_alignment_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, JOINT_ALIGNMENT],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "alignment"
    },
    effects: {
      [JOINT_ALIGNMENT]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "alignment") {
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

const onAlignmentEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_alignment_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, JOINT_ALIGNMENT],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "alignment"
    },
    effects: {
      [JOINT_ALIGNMENT]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "alignment") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[JOINT_ALIGNMENT].escalation.by,
            question: inputs[JOINT_ALIGNMENT].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onAlignmentCompleted = defineAiDrivenDevelopmentTransition(
  Symbol("on_alignment_completed"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, JOINT_ALIGNMENT],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "alignment_completed" && inputs[JOINT_ALIGNMENT].pendingQuestion === null
    },
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "alignment_completed") {
          return {}
        }

        return {
          jiraTicketId: inputs[JOINT_ALIGNMENT].jiraTicketId,
          businessStory: inputs[JOINT_ALIGNMENT].businessStory,
          requirements: inputs[JOINT_ALIGNMENT].requirements,
          constraints: inputs[JOINT_ALIGNMENT].constraints,
          commonPerspective: event.commonPerspective,
          highLevelPlan: event.highLevelPlan,
          risks: event.risks,
          opportunities: event.opportunities,
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
          iterationLimits: inputs[JOINT_ALIGNMENT].iterationLimits,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

export const alignmentTransitions = {
  onAlignmentQuestion,
  onAlignmentAnswer,
  onAlignmentEscalationRequested,
  onAlignmentEscalationAnswered,
  onAlignmentCompleted,
} as const
