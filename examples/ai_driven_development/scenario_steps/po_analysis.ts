import { ARCHITECT_ANALYSIS, PRINCIPAL_ANALYSIS } from "../places/analysis.js"
import type { AiDrivenDevelopmentEngine } from "../engine_factory.js"
import type { InjectEvent } from "./shared.js"

export async function runPoAndAnalysis(engine: AiDrivenDevelopmentEngine, injectEvent: InjectEvent) {
  await injectEvent(
    {
      type: "po_business_spec_ready",
      story: "As a dashboard user, I press ? to quickly open Help without leaving the current context.",
      requirements: [
        "Shortcut opens Help panel from non-input contexts.",
        "Pressing Escape closes Help panel.",
        "Emit telemetry event help_shortcut_used.",
      ],
      constraints: ["Do not capture shortcut while an input, textarea, or editor has focus."],
    },
    "po writes short dashboard story"
  )

  await injectEvent(
    {
      type: "jira_ticket_created",
      ticketId: "WEB-271",
      title: "Dashboard Help panel keyboard shortcut",
    },
    "jira ticket created"
  )

  const snapshotAfterFork = engine.getSnapshot()
  console.log("Architect analysis active?", snapshotAfterFork[ARCHITECT_ANALYSIS].isActive)
  console.log("Principal analysis active?", snapshotAfterFork[PRINCIPAL_ANALYSIS].isActive)

  await injectEvent(
    {
      type: "architect_analysis_completed",
      focusedFiles: ["src/ui/dashboard/help_panel.ts", "src/ui/keyboard/shortcut_handler.ts"],
      options: [
        { id: "option-a", score: 0.86, summary: "Register a scoped '?' hotkey in dashboard shell." },
        { id: "option-b", score: 0.57, summary: "Attach listener directly inside Help component." },
      ],
      challenges: ["Avoid triggering shortcut while typing in rich text fields."],
      opportunities: ["Reuse shared shortcut focus-guard utility."],
      conclusion: "Prefer option-a for clearer ownership and easier test coverage.",
    },
    "architect completes analysis"
  )

  await injectEvent(
    {
      type: "principal_analysis_completed",
      focusedFiles: ["src/ui/dashboard/dashboard_shell.ts", "src/telemetry/events.ts"],
      options: [
        { id: "option-a", score: 0.83, summary: "Use existing shortcut bus with focus filter + telemetry." },
        { id: "option-c", score: 0.49, summary: "Create custom keydown layer just for Help panel." },
      ],
      challenges: ["Preventing duplicate telemetry when key repeats."],
      opportunities: ["Add one integration test that asserts focus guard behavior."],
      conclusion: "Align on option-a and gate telemetry to one event per open action.",
    },
    "principal completes analysis"
  )

  await injectEvent(
    {
      type: "alignment_completed",
      commonPerspective: "Use shared shortcut bus, strict focus-guard, and a single telemetry hook.",
      highLevelPlan: [
        "Add '?' registration in dashboard shell.",
        "Guard against focused editable targets.",
        "Emit telemetry and add regression test.",
      ],
      risks: ["Accidental key capture in embedded editors."],
      opportunities: ["Reuse same guard for future keyboard shortcuts."],
    },
    "alignment converges"
  )
}
