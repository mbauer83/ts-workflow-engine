import { RELEASE_PREP, WORKFLOW_DONE } from "../places/release.js"
import type { AiDrivenDevelopmentEngine } from "../engine_factory.js"
import type { InjectEvent } from "./shared.js"

export async function runFinalization(engine: AiDrivenDevelopmentEngine, injectEvent: InjectEvent) {
  await injectEvent(
    {
      type: "final_review_submitted",
      agent: "principal",
      decision: "approved",
    },
    "principal final review"
  )

  await injectEvent(
    {
      type: "final_review_submitted",
      agent: "architect",
      decision: "approved",
    },
    "architect final review"
  )

  await injectEvent(
    {
      type: "final_review_submitted",
      agent: "po",
      decision: "approved",
    },
    "po final review"
  )

  await injectEvent(
    {
      type: "principal_branch_created",
      branchType: "feature",
      branchName: "feature/web-271-help-shortcut",
      commitSha: "d4e5f6a",
    },
    "principal creates branch and commit"
  )

  await injectEvent(
    {
      type: "principal_pr_created",
      prUrl: "https://dev.azure.com/acme/dashboard/_git/webapp/pullrequest/271",
      summary: {
        title: "Add Help-panel '?' shortcut with focus guard",
        highlights: [
          "Registers '?' shortcut in dashboard shell.",
          "Prevents shortcut activation in editable controls.",
          "Emits help_shortcut_used telemetry through shared abstraction.",
        ],
        verification: [
          "Typecheck, lint, and tests pass.",
          "Regression test covers focused-input suppression.",
        ],
      },
    },
    "principal creates pr"
  )

  await injectEvent(
    {
      type: "po_linked_pr_in_jira",
      ticketId: "WEB-271",
    },
    "po links pr in jira"
  )

  const finalSnapshot = engine.getSnapshot()
  console.log("Workflow complete?", finalSnapshot[WORKFLOW_DONE].isActive)
  console.log("Completion summary", finalSnapshot[WORKFLOW_DONE].summary)
  console.log("Contributions tracked", finalSnapshot[RELEASE_PREP].contributions.length)
}
