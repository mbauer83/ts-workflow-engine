import {
  type AlignedSpecification,
  type ArchitectureSpecification,
  idleEscalation,
  type PrincipalSpecFeedback,
  type ToolIntegrationRecommendation,
  truncateText,
} from "../model.js"
import { ARCHITECT_SOLUTION_SPEC, PRINCIPAL_SPEC_COLLAB } from "../places/architecture.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import { IMPLEMENTATION_ORCHESTRATION } from "../places/implementation.js"
import { defineAiDrivenDevelopmentTransition } from "./helpers.js"

const buildAlignmentResultSpec = (
  architectSpec: ArchitectureSpecification,
  principalFeedback: PrincipalSpecFeedback | null,
  alignmentSummary: string,
  implementationDirectives: string[],
  alignedRecommendedTools: ToolIntegrationRecommendation[],
  jiraTicketId: string | null,
  dialecticRounds: number
): AlignedSpecification => ({
  version: `${jiraTicketId ?? "aligned-spec"}-v${dialecticRounds + 1}`,
  architectRevision: architectSpec,
  principalFeedback,
  alignmentSummary,
  implementationDirectives,
  agreedTooling: alignedRecommendedTools,
})

const alignedSpecDigest = (spec: AlignedSpecification): string => {
  const directiveSummary =
    spec.implementationDirectives.length > 0
      ? spec.implementationDirectives.join("; ")
      : "no explicit directives"

  return `${spec.alignmentSummary} | directives: ${directiveSummary}`
}

const onArchitectOptionReview = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_option_review"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent?.type === "architect_option_reviewed",
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_option_reviewed") {
          return {}
        }

        return {
          optionReviewSummary: event.reviewSummary,
        }
      },
    },
  }
)

const onArchitectToolingRecommendationsInSpecification = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_tooling_recommendations_in_specification"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_tooling_recommendations_submitted"
        && event.recommendations.length > 0
    },
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_tooling_recommendations_submitted") {
          return {}
        }

        return {
          architectRecommendedTools: event.recommendations,
          alignedRecommendedTools: [],
          recommendationsAligned: false,
        }
      },
    },
  }
)

const onPrincipalToolingRecommendationsInSpecification = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_tooling_recommendations_in_specification"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_tooling_recommendations_submitted"
        && event.recommendations.length > 0
    },
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_tooling_recommendations_submitted") {
          return {}
        }

        return {
          principalRecommendedTools: event.recommendations,
          alignedRecommendedTools: [],
          recommendationsAligned: false,
        }
      },
    },
  }
)

const onArchitectureSpecEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_architecture_spec_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "architecture_spec"
    },
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "architecture_spec") {
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

const onArchitectureSpecEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_architecture_spec_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [ARCHITECT_SOLUTION_SPEC],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "architecture_spec"
    },
    effects: {
      [ARCHITECT_SOLUTION_SPEC]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "architecture_spec") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[ARCHITECT_SOLUTION_SPEC].escalation.by,
            question: inputs[ARCHITECT_SOLUTION_SPEC].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onArchitectSolutionSelected = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_solution_selected"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, ARCHITECT_SOLUTION_SPEC],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_solution_selected"
        && inputs[ARCHITECT_SOLUTION_SPEC].optionReviewSummary !== null
        && inputs[ARCHITECT_SOLUTION_SPEC].pendingQuestion === null
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_solution_selected") {
          return {}
        }

        return {
          jiraTicketId: inputs[ARCHITECT_SOLUTION_SPEC].jiraTicketId,
          businessStory: inputs[ARCHITECT_SOLUTION_SPEC].businessStory,
          requirements: inputs[ARCHITECT_SOLUTION_SPEC].requirements,
          constraints: inputs[ARCHITECT_SOLUTION_SPEC].constraints,
          architectSpec: event.architectureSpec,
          principalFeedback: null,
          pendingQuestion: null,
          dialecticRounds: 0,
          maxDialecticRounds: inputs[ARCHITECT_SOLUTION_SPEC].iterationLimits.specDialecticRounds,
          alignedSpec: null,
          highLevelPlan: inputs[ARCHITECT_SOLUTION_SPEC].highLevelPlan,
          risks: inputs[ARCHITECT_SOLUTION_SPEC].risks,
          opportunities: inputs[ARCHITECT_SOLUTION_SPEC].opportunities,
          architectRecommendedTools: inputs[ARCHITECT_SOLUTION_SPEC].architectRecommendedTools,
          principalRecommendedTools: inputs[ARCHITECT_SOLUTION_SPEC].principalRecommendedTools,
          alignedRecommendedTools: [],
          recommendationsAligned: false,
          iterationLimits: inputs[ARCHITECT_SOLUTION_SPEC].iterationLimits,
          escalation: idleEscalation(),
        }
      },
    },
  }
)

const onPrincipalSpecFeedback = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_spec_feedback"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "principal_spec_feedback") {
        return false
      }

      if (event.question == null) {
        return true
      }

      return inputs[PRINCIPAL_SPEC_COLLAB].dialecticRounds
        < inputs[PRINCIPAL_SPEC_COLLAB].maxDialecticRounds
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_spec_feedback") {
          return {}
        }

        return {
          principalFeedback: event.feedback,
          pendingQuestion: event.question ?? null,
          dialecticRounds:
            event.question == null
              ? inputs[PRINCIPAL_SPEC_COLLAB].dialecticRounds
              : inputs[PRINCIPAL_SPEC_COLLAB].dialecticRounds + 1,
        }
      },
    },
  }
)

const onArchitectToolingRecommendationsInReviewRound = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_tooling_recommendations_in_review_round"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_tooling_recommendations_submitted"
        && event.recommendations.length > 0
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_tooling_recommendations_submitted") {
          return {}
        }

        return {
          architectRecommendedTools: event.recommendations,
          alignedRecommendedTools: [],
          recommendationsAligned: false,
        }
      },
    },
  }
)

const onPrincipalToolingRecommendationsInReviewRound = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_tooling_recommendations_in_review_round"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_tooling_recommendations_submitted"
        && event.recommendations.length > 0
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_tooling_recommendations_submitted") {
          return {}
        }

        return {
          principalRecommendedTools: event.recommendations,
          alignedRecommendedTools: [],
          recommendationsAligned: false,
        }
      },
    },
  }
)

const onToolingRecommendationsAligned = defineAiDrivenDevelopmentTransition(
  Symbol("on_tooling_recommendations_aligned"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      if (event?.type !== "tooling_recommendations_aligned") {
        return false
      }

      return event.agreedRecommendations.length > 0
        && inputs[PRINCIPAL_SPEC_COLLAB].architectRecommendedTools.length > 0
        && inputs[PRINCIPAL_SPEC_COLLAB].principalRecommendedTools.length > 0
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "tooling_recommendations_aligned") {
          return {}
        }

        return {
          alignedRecommendedTools: event.agreedRecommendations,
          recommendationsAligned: true,
        }
      },
    },
  }
)

const onArchitectAnswerToPrincipalFeedback = defineAiDrivenDevelopmentTransition(
  Symbol("on_architect_answer_to_principal_feedback"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [PRINCIPAL_SPEC_COLLAB],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "architect_spec_feedback_answered"
        && inputs[PRINCIPAL_SPEC_COLLAB].pendingQuestion !== null
    },
    effects: {
      [PRINCIPAL_SPEC_COLLAB]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "architect_spec_feedback_answered") {
          return {}
        }

        return {
          architectSpec: event.revisedSpec,
          pendingQuestion: null,
          escalation: {
            required: false,
            by: inputs[PRINCIPAL_SPEC_COLLAB].escalation.by,
            question: inputs[PRINCIPAL_SPEC_COLLAB].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onDialecticSpecAligned = defineAiDrivenDevelopmentTransition(
  Symbol("on_dialectic_spec_aligned"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, PRINCIPAL_SPEC_COLLAB],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "dialectic_spec_aligned"
        && inputs[PRINCIPAL_SPEC_COLLAB].pendingQuestion === null
        && inputs[PRINCIPAL_SPEC_COLLAB].recommendationsAligned
        && inputs[PRINCIPAL_SPEC_COLLAB].alignedRecommendedTools.length > 0
        && inputs[PRINCIPAL_SPEC_COLLAB].architectSpec !== null
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "dialectic_spec_aligned") {
          return {}
        }

        const architectSpec = inputs[PRINCIPAL_SPEC_COLLAB].architectSpec
        if (!architectSpec) {
          return {}
        }

        const alignmentResultSpec = buildAlignmentResultSpec(
          architectSpec,
          inputs[PRINCIPAL_SPEC_COLLAB].principalFeedback,
          event.alignmentSummary,
          event.implementationDirectives,
          inputs[PRINCIPAL_SPEC_COLLAB].alignedRecommendedTools,
          inputs[PRINCIPAL_SPEC_COLLAB].jiraTicketId,
          inputs[PRINCIPAL_SPEC_COLLAB].dialecticRounds,
        )

        return {
          noteDigest: truncateText(alignedSpecDigest(alignmentResultSpec), 200),
          gitProjectPath: null,
          azureProject: null,
          jiraProjectKey: null,
          jiraTicketId: inputs[PRINCIPAL_SPEC_COLLAB].jiraTicketId,
          businessStory: inputs[PRINCIPAL_SPEC_COLLAB].businessStory,
          requirements: inputs[PRINCIPAL_SPEC_COLLAB].requirements,
          constraints: inputs[PRINCIPAL_SPEC_COLLAB].constraints,
          alignedSpec: alignmentResultSpec,
          checklists: [],
          currentChecklistIndex: 0,
          activeChecklistId: null,
          checklistIterations: {},
          maxDevIterationsPerChecklist: inputs[PRINCIPAL_SPEC_COLLAB].iterationLimits.devIterationsPerChecklist,
          completedChecklistIds: [],
          contributions: [],
          highLevelPlan: inputs[PRINCIPAL_SPEC_COLLAB].highLevelPlan,
          risks: inputs[PRINCIPAL_SPEC_COLLAB].risks,
          opportunities: inputs[PRINCIPAL_SPEC_COLLAB].opportunities,
          iterationLimits: inputs[PRINCIPAL_SPEC_COLLAB].iterationLimits,
        }
      },
    },
  }
)

export const architectureSpecTransitions = {
  onArchitectOptionReview,
  onArchitectToolingRecommendationsInSpecification,
  onPrincipalToolingRecommendationsInSpecification,
  onArchitectureSpecEscalationRequested,
  onArchitectureSpecEscalationAnswered,
  onArchitectSolutionSelected,
  onPrincipalSpecFeedback,
  onArchitectToolingRecommendationsInReviewRound,
  onPrincipalToolingRecommendationsInReviewRound,
  onToolingRecommendationsAligned,
  onArchitectAnswerToPrincipalFeedback,
  onDialecticSpecAligned,
} as const
