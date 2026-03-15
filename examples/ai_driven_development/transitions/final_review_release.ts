import { idleEscalation, type ImplementationChecklist } from "../model.js"
import { JOINT_ALIGNMENT } from "../places/analysis.js"
import { AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import {
  FINAL_TRIAD_REVIEW,
  IMPLEMENTATION_ORCHESTRATION,
} from "../places/implementation.js"
import { PO_DISCOVERY } from "../places/po_discovery.js"
import { RELEASE_PREP, WORKFLOW_DONE } from "../places/release.js"
import { buildChecklistIterationMap, defineAiDrivenDevelopmentTransition } from "./helpers.js"

const onFinalReviewSubmitted = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_submitted"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, FINAL_TRIAD_REVIEW],
    outputPlaces: [FINAL_TRIAD_REVIEW],
    priority: 2,
    guard: inputs => inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent?.type === "final_review_submitted",
    effects: {
      [FINAL_TRIAD_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "final_review_submitted") {
          return {}
        }

        if (event.agent === "po") {
          return {
            poDecision: event.decision,
            poChangeRequest: event.changeRequest ?? null,
          }
        }

        if (event.agent === "architect") {
          return {
            architectDecision: event.decision,
            architectChangeRequest: event.changeRequest ?? null,
          }
        }

        return {
          principalDecision: event.decision,
          principalChangeRequest: event.changeRequest ?? null,
        }
      },
    },
  }
)

const onFinalReviewEscalationRequested = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_escalation_requested"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, FINAL_TRIAD_REVIEW],
    outputPlaces: [FINAL_TRIAD_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_requested" && event.stage === "final_review"
    },
    effects: {
      [FINAL_TRIAD_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_requested" || event.stage !== "final_review") {
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

const onFinalReviewEscalationAnswered = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_escalation_answered"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, FINAL_TRIAD_REVIEW],
    outputPlaces: [FINAL_TRIAD_REVIEW],
    priority: 2,
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "stage_escalation_answered" && event.stage === "final_review"
    },
    effects: {
      [FINAL_TRIAD_REVIEW]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "stage_escalation_answered" || event.stage !== "final_review") {
          return {}
        }

        return {
          escalation: {
            required: false,
            by: inputs[FINAL_TRIAD_REVIEW].escalation.by,
            question: inputs[FINAL_TRIAD_REVIEW].escalation.question,
            answer: event.answer,
          },
        }
      },
    },
  }
)

const onFinalReviewPoChangesLoopBack = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_po_changes_loop_back"),
  {
    inputPlaces: [FINAL_TRIAD_REVIEW],
    outputPlaces: [PO_DISCOVERY],
    guard: inputs => {
      const state = inputs[FINAL_TRIAD_REVIEW]
      return state.poDecision === "changes_requested" && state.revisionCycles < state.maxRevisionCycles
    },
    effects: {
      [PO_DISCOVERY]: inputs => ({
        noteDigest: inputs[FINAL_TRIAD_REVIEW].noteDigest,
        gitProjectPath: inputs[FINAL_TRIAD_REVIEW].gitProjectPath,
        azureProject: inputs[FINAL_TRIAD_REVIEW].azureProject,
        jiraProjectKey: inputs[FINAL_TRIAD_REVIEW].jiraProjectKey,
        businessStory: inputs[FINAL_TRIAD_REVIEW].businessStory,
        requirements: inputs[FINAL_TRIAD_REVIEW].requirements,
        constraints: inputs[FINAL_TRIAD_REVIEW].constraints,
        pendingQuestion: inputs[FINAL_TRIAD_REVIEW].poChangeRequest,
        clarificationRounds: 0,
        maxClarificationRounds: inputs[FINAL_TRIAD_REVIEW].iterationLimits.poClarificationRounds,
        jiraTicketId: inputs[FINAL_TRIAD_REVIEW].jiraTicketId,
        iterationLimits: inputs[FINAL_TRIAD_REVIEW].iterationLimits,
        escalation: idleEscalation(),
      }),
    },
  }
)

const onFinalReviewArchitectChangesLoopBack = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_architect_changes_loop_back"),
  {
    inputPlaces: [FINAL_TRIAD_REVIEW],
    outputPlaces: [JOINT_ALIGNMENT],
    guard: inputs => {
      const state = inputs[FINAL_TRIAD_REVIEW]
      return state.poDecision === "approved"
        && state.architectDecision === "changes_requested"
        && state.revisionCycles < state.maxRevisionCycles
    },
    effects: {
      [JOINT_ALIGNMENT]: inputs => ({
        jiraTicketId: inputs[FINAL_TRIAD_REVIEW].jiraTicketId,
        businessStory: inputs[FINAL_TRIAD_REVIEW].businessStory,
        requirements: inputs[FINAL_TRIAD_REVIEW].requirements,
        constraints: inputs[FINAL_TRIAD_REVIEW].constraints,
        architectConclusion: inputs[FINAL_TRIAD_REVIEW].architectChangeRequest,
        principalConclusion: "Principal re-evaluates updated architectural concerns.",
        commonPerspective: null,
        highLevelPlan: [],
        risks: [],
        opportunities: [],
        pendingQuestion: inputs[FINAL_TRIAD_REVIEW].architectChangeRequest,
        exchangeRounds: inputs[FINAL_TRIAD_REVIEW].architectChangeRequest === null ? 0 : 1,
        maxExchangeRounds: inputs[FINAL_TRIAD_REVIEW].iterationLimits.alignmentRounds,
        aligned: false,
        iterationLimits: inputs[FINAL_TRIAD_REVIEW].iterationLimits,
        escalation: idleEscalation(),
      }),
    },
  }
)

const onFinalReviewPrincipalOnlyChangesLoopBack = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_principal_only_changes_loop_back"),
  {
    inputPlaces: [FINAL_TRIAD_REVIEW],
    outputPlaces: [IMPLEMENTATION_ORCHESTRATION],
    guard: inputs => {
      const state = inputs[FINAL_TRIAD_REVIEW]
      return state.poDecision === "approved"
        && state.architectDecision === "approved"
        && state.principalDecision === "changes_requested"
        && state.revisionCycles < state.maxRevisionCycles
    },
    effects: {
      [IMPLEMENTATION_ORCHESTRATION]: inputs => {
        const followUpChecklistId = `principal-followup-${inputs[FINAL_TRIAD_REVIEW].revisionCycles + 1}`
        const principalRequest =
          inputs[FINAL_TRIAD_REVIEW].principalChangeRequest
          ?? "Address principal follow-up request without architectural drift."

        const followUpChecklist: ImplementationChecklist = {
          id: followUpChecklistId,
          domain: "cross-cutting",
          concern: "principal-follow-up",
          relatedSpecSections:
            inputs[FINAL_TRIAD_REVIEW].alignedSpec?.architectRevision.sections.map(section => section.id) ?? [],
          steps: [
            "Review principal follow-up request and map affected files.",
            "Apply targeted code updates without architecture drift.",
            "Run typecheck, static analysis, lint, and targeted tests.",
            "Submit concise change summary with verification evidence.",
          ],
          requirements: [principalRequest],
          constraints: [
            "Preserve approved architecture-spec boundaries.",
            "Keep observability and safety constraints intact.",
          ],
          testConditions: [
            "Type-check succeeds.",
            "Static analysis and lint checks succeed.",
            "Targeted and relevant tests succeed.",
          ],
          preferredAgents: ["developer.agent.with-context"],
        }

        const extendedChecklists = [...inputs[FINAL_TRIAD_REVIEW].checklists, followUpChecklist]

        return {
          noteDigest: inputs[FINAL_TRIAD_REVIEW].noteDigest,
          gitProjectPath: inputs[FINAL_TRIAD_REVIEW].gitProjectPath,
          azureProject: inputs[FINAL_TRIAD_REVIEW].azureProject,
          jiraProjectKey: inputs[FINAL_TRIAD_REVIEW].jiraProjectKey,
          jiraTicketId: inputs[FINAL_TRIAD_REVIEW].jiraTicketId,
          businessStory: inputs[FINAL_TRIAD_REVIEW].businessStory,
          requirements: inputs[FINAL_TRIAD_REVIEW].requirements,
          constraints: inputs[FINAL_TRIAD_REVIEW].constraints,
          alignedSpec: inputs[FINAL_TRIAD_REVIEW].alignedSpec,
          checklists: extendedChecklists,
          currentChecklistIndex: inputs[FINAL_TRIAD_REVIEW].checklists.length,
          activeChecklistId: null,
          checklistIterations: {
            ...buildChecklistIterationMap(extendedChecklists),
          },
          maxDevIterationsPerChecklist: inputs[FINAL_TRIAD_REVIEW].iterationLimits.devIterationsPerChecklist,
          completedChecklistIds: inputs[FINAL_TRIAD_REVIEW].completedChecklistIds,
          contributions: inputs[FINAL_TRIAD_REVIEW].contributions,
          highLevelPlan: [],
          risks: [],
          opportunities: [],
          iterationLimits: inputs[FINAL_TRIAD_REVIEW].iterationLimits,
        }
      },
    },
  }
)

const onFinalReviewApprovedMoveToRelease = defineAiDrivenDevelopmentTransition(
  Symbol("on_final_review_approved_move_to_release"),
  {
    inputPlaces: [FINAL_TRIAD_REVIEW],
    outputPlaces: [RELEASE_PREP],
    guard: inputs => {
      const state = inputs[FINAL_TRIAD_REVIEW]
      return state.poDecision === "approved"
        && state.architectDecision === "approved"
        && state.principalDecision === "approved"
    },
    effects: {
      [RELEASE_PREP]: inputs => ({
        jiraTicketId: inputs[FINAL_TRIAD_REVIEW].jiraTicketId,
        branchType: null,
        branchName: null,
        commitShas: [],
        prUrl: null,
        prSummary: null,
        jiraLinked: false,
        contributions: inputs[FINAL_TRIAD_REVIEW].contributions,
      }),
    },
  }
)

const onPrincipalBranchCreated = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_branch_created"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, RELEASE_PREP],
    outputPlaces: [RELEASE_PREP],
    guard: inputs => inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent?.type === "principal_branch_created",
    effects: {
      [RELEASE_PREP]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_branch_created") {
          return {}
        }

        return {
          branchType: event.branchType,
          branchName: event.branchName,
          commitShas: [...inputs[RELEASE_PREP].commitShas, event.commitSha],
        }
      },
    },
  }
)

const onPrincipalPrCreated = defineAiDrivenDevelopmentTransition(
  Symbol("on_principal_pr_created"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, RELEASE_PREP],
    outputPlaces: [RELEASE_PREP],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "principal_pr_created" && inputs[RELEASE_PREP].branchName !== null
    },
    effects: {
      [RELEASE_PREP]: inputs => {
        const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
        if (event?.type !== "principal_pr_created") {
          return {}
        }

        return {
          prUrl: event.prUrl,
          prSummary: event.summary,
        }
      },
    },
  }
)

const onPoLinkedPrInJiraComplete = defineAiDrivenDevelopmentTransition(
  Symbol("on_po_linked_pr_in_jira_complete"),
  {
    inputPlaces: [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, RELEASE_PREP],
    outputPlaces: [WORKFLOW_DONE],
    guard: inputs => {
      const event = inputs[AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE].pendingEvent
      return event?.type === "po_linked_pr_in_jira"
        && inputs[RELEASE_PREP].prUrl !== null
        && inputs[RELEASE_PREP].jiraTicketId === event.ticketId
    },
    effects: {
      [WORKFLOW_DONE]: inputs => {
        const jiraTicketId = inputs[RELEASE_PREP].jiraTicketId
        const prUrl = inputs[RELEASE_PREP].prUrl

        return {
          jiraTicketId,
          prUrl,
          linkedInJira: true,
          summary: {
            status: "completed",
            message: `Workflow complete. PR ${prUrl} linked in Jira ${jiraTicketId}.`,
            artifacts: {
              jiraTicketId,
              prUrl,
              linkedInJira: true,
            },
          },
        }
      },
    },
  }
)

export const finalReviewReleaseTransitions = {
  onFinalReviewSubmitted,
  onFinalReviewEscalationRequested,
  onFinalReviewEscalationAnswered,
  onFinalReviewPoChangesLoopBack,
  onFinalReviewArchitectChangesLoopBack,
  onFinalReviewPrincipalOnlyChangesLoopBack,
  onFinalReviewApprovedMoveToRelease,
  onPrincipalBranchCreated,
  onPrincipalPrCreated,
  onPoLinkedPrInJiraComplete,
} as const
