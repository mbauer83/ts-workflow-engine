import { idleEscalation } from "../model.js"
import {
  ARCHITECT_ANALYSIS,
  JOINT_ALIGNMENT,
  PRINCIPAL_ANALYSIS,
} from "../places/analysis.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import { defineAiDrivenDevelopmentTransition } from "./helpers.js"

const onArchitectAnalysisQuestion = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_analysis_question"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_ANALYSIS],
    outputPlaces: [ARCHITECT_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "architect_analysis_question") {
        return false
      }

      return inputs[ARCHITECT_ANALYSIS].clarificationRounds
        < inputs[ARCHITECT_ANALYSIS].maxClarificationRounds
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_analysis_question") {
          return {}
        }

        return {
          pendingQuestion: event.question,
          clarificationRounds: inputs[ARCHITECT_ANALYSIS].clarificationRounds + 1,
        }
      },
    },
  }
)

const onArchitectAnalysisAnswer = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_analysis_answer"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_ANALYSIS],
    outputPlaces: [ARCHITECT_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_analysis_answer" && inputs[ARCHITECT_ANALYSIS].pendingQuestion !== null
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_analysis_answer") {
          return {}
        }

        return {
          pendingQuestion: null,
          escalation: {
            required: false,
            by: inputs[ARCHITECT_ANALYSIS].escalation.by,
            question: inputs[ARCHITECT_ANALYSIS].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onArchitectAnalysisCompleted = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_analysis_completed"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_ANALYSIS],
    outputPlaces: [ARCHITECT_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_analysis_completed" && inputs[ARCHITECT_ANALYSIS].pendingQuestion === null
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_analysis_completed") {
          return {}
        }

        return {
          focusedFiles: event.focusedFiles,
          solutionOptions: event.options,
          challenges: event.challenges,
          opportunities: event.opportunities,
          conclusion: event.conclusion,
          completed: true,
        }
      },
    },
  }
)

const onArchitectAnalysisEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_analysis_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_ANALYSIS],
    outputPlaces: [ARCHITECT_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "architect_analysis"
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "architect_analysis") {
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

const onArchitectAnalysisEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_analysis_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_ANALYSIS],
    outputPlaces: [ARCHITECT_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "architect_analysis"
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "architect_analysis") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[ARCHITECT_ANALYSIS].escalation.by,
            question: inputs[ARCHITECT_ANALYSIS].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onPrincipalAnalysisQuestion = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_analysis_question"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_ANALYSIS],
    outputPlaces: [PRINCIPAL_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "principal_analysis_question") {
        return false
      }

      return inputs[PRINCIPAL_ANALYSIS].clarificationRounds
        < inputs[PRINCIPAL_ANALYSIS].maxClarificationRounds
    },
    effects: {
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_analysis_question") {
          return {}
        }

        return {
          pendingQuestion: event.question,
          clarificationRounds: inputs[PRINCIPAL_ANALYSIS].clarificationRounds + 1,
        }
      },
    },
  }
)

const onPrincipalAnalysisAnswer = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_analysis_answer"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_ANALYSIS],
    outputPlaces: [PRINCIPAL_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_analysis_answer" && inputs[PRINCIPAL_ANALYSIS].pendingQuestion !== null
    },
    effects: {
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_analysis_answer") {
          return {}
        }

        return {
          pendingQuestion: null,
          escalation: {
            required: false,
            by: inputs[PRINCIPAL_ANALYSIS].escalation.by,
            question: inputs[PRINCIPAL_ANALYSIS].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onPrincipalAnalysisCompleted = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_analysis_completed"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_ANALYSIS],
    outputPlaces: [PRINCIPAL_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_analysis_completed" && inputs[PRINCIPAL_ANALYSIS].pendingQuestion === null
    },
    effects: {
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_analysis_completed") {
          return {}
        }

        return {
          focusedFiles: event.focusedFiles,
          solutionOptions: event.options,
          challenges: event.challenges,
          opportunities: event.opportunities,
          conclusion: event.conclusion,
          completed: true,
        }
      },
    },
  }
)

const onPrincipalAnalysisEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_analysis_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_ANALYSIS],
    outputPlaces: [PRINCIPAL_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "principal_analysis"
    },
    effects: {
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "principal_analysis") {
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

const onPrincipalAnalysisEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_analysis_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_ANALYSIS],
    outputPlaces: [PRINCIPAL_ANALYSIS],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "principal_analysis"
    },
    effects: {
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "principal_analysis") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[PRINCIPAL_ANALYSIS].escalation.by,
            question: inputs[PRINCIPAL_ANALYSIS].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onAnalysesCompletedStartAlignment = defineAiDrivenDevelopmentTransition(
  Symbol("on_analyses_completed_start_alignment"),
  {
    inputPlaces: [ARCHITECT_ANALYSIS, PRINCIPAL_ANALYSIS],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => inputs[ARCHITECT_ANALYSIS].completed && inputs[PRINCIPAL_ANALYSIS].completed,
    effects: {
      [JOINT_ALIGNMENT]: inputs => ({
        jiraTicketId: inputs[ARCHITECT_ANALYSIS].jiraTicketId,
        businessStory: inputs[ARCHITECT_ANALYSIS].businessStory,
        requirements: inputs[ARCHITECT_ANALYSIS].requirements,
        constraints: inputs[ARCHITECT_ANALYSIS].constraints,
        architectConclusion: inputs[ARCHITECT_ANALYSIS].conclusion,
        principalConclusion: inputs[PRINCIPAL_ANALYSIS].conclusion,
        commonPerspective: null,
        highLevelPlan: [],
        risks: [],
        opportunities: [],
        pendingQuestion: null,
        exchangeRounds: 0,
        maxExchangeRounds: inputs[ARCHITECT_ANALYSIS].iterationLimits.alignmentRounds,
        aligned: false,
        iterationLimits: inputs[ARCHITECT_ANALYSIS].iterationLimits,
        escalation: idleEscalation(),
      }),
    },
  }
)

export const analysisParallelTransitions = {
  onArchitectAnalysisQuestion,
  onArchitectAnalysisAnswer,
  onArchitectAnalysisCompleted,
  onArchitectAnalysisEscalationRequested,
  onArchitectAnalysisEscalationAnswered,
  onPrincipalAnalysisQuestion,
  onPrincipalAnalysisAnswer,
  onPrincipalAnalysisCompleted,
  onPrincipalAnalysisEscalationRequested,
  onPrincipalAnalysisEscalationAnswered,
  onAnalysesCompletedStartAlignment,
} as const
