import { idleEscalation } from "../model.js"
import {
  ARCHITECT_ANALYSIS,
  PRINCIPAL_ANALYSIS,
} from "../places/analysis.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import { PO_DISCOVERY } from "../places/po_discovery.js"
import { defineAiDrivenDevelopmentTransition } from "./helpers.js"

const onPoBusinessQuestion = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_business_question"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "po_business_question") {
        return false
      }

      return inputs[PO_DISCOVERY].clarificationRounds < inputs[PO_DISCOVERY].maxClarificationRounds
    },
    effects: {
      [PO_DISCOVERY]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "po_business_question") {
          return {}
        }

        return {
          pendingQuestion: event.question,
          clarificationRounds: inputs[PO_DISCOVERY].clarificationRounds + 1,
        }
      },
    },
  }
)

const onPoBusinessAnswer = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_business_answer"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "po_business_answer" && inputs[PO_DISCOVERY].pendingQuestion !== null
    },
    effects: {
      [PO_DISCOVERY]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "po_business_answer") {
          return {}
        }

        return {
          pendingQuestion: null,
          escalation: {
            required: false,
            by: inputs[PO_DISCOVERY].escalation.by,
            question: inputs[PO_DISCOVERY].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onPoBusinessSpecReady = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_business_spec_ready"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "po_business_spec_ready" && inputs[PO_DISCOVERY].pendingQuestion === null
    },
    effects: {
      [PO_DISCOVERY]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "po_business_spec_ready") {
          return {}
        }

        return {
          businessStory: event.story,
          requirements: event.requirements,
          constraints: event.constraints,
        }
      },
    },
  }
)

const onPoEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "po_discovery"
    },
    effects: {
      [PO_DISCOVERY]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "po_discovery") {
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

const onPoEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "po_discovery"
    },
    effects: {
      [PO_DISCOVERY]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "po_discovery") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[PO_DISCOVERY].escalation.by,
            question: inputs[PO_DISCOVERY].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onJiraTicketCreatedForkAnalyses = defineAiDrivenDevelopmentTransition(
  Symbol("on_jira_ticket_created_fork_analyses"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PO_DISCOVERY],
    outputPlaces: [ARCHITECT_ANALYSIS, PRINCIPAL_ANALYSIS],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "jira_ticket_created"
        && inputs[PO_DISCOVERY].businessStory !== null
        && inputs[PO_DISCOVERY].requirements.length > 0
    },
    effects: {
      [ARCHITECT_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "jira_ticket_created") {
          return {}
        }

        return {
          jiraTicketId: event.ticketId,
          businessStory: inputs[PO_DISCOVERY].businessStory,
          requirements: inputs[PO_DISCOVERY].requirements,
          constraints: inputs[PO_DISCOVERY].constraints,
          focusedFiles: [],
          solutionOptions: [],
          challenges: [],
          opportunities: [],
          conclusion: null,
          pendingQuestion: null,
          clarificationRounds: 0,
          maxClarificationRounds: inputs[PO_DISCOVERY].iterationLimits.analysisPerAgent,
          completed: false,
          iterationLimits: inputs[PO_DISCOVERY].iterationLimits,
          escalation: idleEscalation(),
        }
      },
      [PRINCIPAL_ANALYSIS]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "jira_ticket_created") {
          return {}
        }

        return {
          jiraTicketId: event.ticketId,
          businessStory: inputs[PO_DISCOVERY].businessStory,
          requirements: inputs[PO_DISCOVERY].requirements,
          constraints: inputs[PO_DISCOVERY].constraints,
          focusedFiles: [],
          solutionOptions: [],
          challenges: [],
          opportunities: [],
          conclusion: null,
          pendingQuestion: null,
          clarificationRounds: 0,
          maxClarificationRounds: inputs[PO_DISCOVERY].iterationLimits.analysisPerAgent,
          completed: false,
          iterationLimits: inputs[PO_DISCOVERY].iterationLimits,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

export const poDiscoveryTransitions = {
  onPoBusinessQuestion,
  onPoBusinessAnswer,
  onPoBusinessSpecReady,
  onPoEscalationRequested,
  onPoEscalationAnswered,
  onJiraTicketCreatedForkAnalyses,
} as const
