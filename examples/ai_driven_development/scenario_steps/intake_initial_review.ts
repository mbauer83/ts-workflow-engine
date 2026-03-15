import type { InjectEvent } from "./shared.js"

export async function runIntakeAndInitialReview(injectEvent: InjectEvent) {
  await injectEvent(
    {
      type: "note_from_inline_content",
      sourceLabel: "support-ticket-2187",
      noteContents: [
        "Add a keyboard shortcut (?) to open the Help panel in the dashboard.",
        "Shortcut must not trigger while typing in form inputs.",
        "Ship with a small telemetry event and a regression test.",
      ].join(" "),
      gitProjectPath: "/repos/acme/dashboard-app",
      azureProject: "acme-dashboard",
      jiraProjectKey: "WEB",
      iterationLimits: {
        initialReviewPerAgent: 2,
        poClarificationRounds: 2,
        analysisPerAgent: 2,
        alignmentRounds: 2,
        specDialecticRounds: 2,
        devIterationsPerChecklist: 2,
        finalReviewCycles: 2,
      },
    },
    "load dashboard help-shortcut note"
  )

  await injectEvent(
    {
      type: "initial_review_questions_submitted",
      agent: "architect",
      questions: [
        "Should telemetry fire only when Help is opened successfully, and not on ignored keypresses?",
      ],
    },
    "architect asks initial clarification"
  )

  await injectEvent(
    {
      type: "stage_escalation_requested",
      stage: "initial_review",
      by: "po",
      target: "user",
      question: "Can we proceed with telemetry that captures only a non-PII help_shortcut_used event?",
    },
    "po escalates product telemetry question to user"
  )

  await injectEvent(
    {
      type: "stage_escalation_answered",
      stage: "initial_review",
      answer: "Yes. Keep the event non-PII and limited to successful Help opens.",
    },
    "user answers telemetry escalation"
  )

  await injectEvent(
    {
      type: "initial_review_clarification_answered",
      agent: "architect",
      answer: "Yes. Emit a single telemetry event per successful Help open action.",
    },
    "po answers architect clarification"
  )

  await injectEvent({ type: "initial_review_approved", agent: "architect" }, "architect approves initial review")
  await injectEvent({ type: "initial_review_approved", agent: "po" }, "po approves initial review")
  await injectEvent({ type: "initial_review_approved", agent: "principal" }, "principal approves initial review")
  await injectEvent({ type: "initial_review_approved", agent: "developer" }, "developer approves initial review")
}
