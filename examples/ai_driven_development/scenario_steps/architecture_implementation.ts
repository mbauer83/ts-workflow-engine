import { FINAL_TRIAD_REVIEW, IMPLEMENTATION_ORCHESTRATION } from "../places/implementation.js"
import type { AiDrivenDevelopmentEngine } from "../engine_factory.js"
import type { InjectEvent } from "./shared.js"

export async function runArchitectureAndImplementation(
  engine: AiDrivenDevelopmentEngine,
  injectEvent: InjectEvent
) {
  await injectEvent(
    {
      type: "architect_option_reviewed",
      reviewSummary: "Option-a keeps shortcut ownership in dashboard shell and keeps Help panel simple.",
    },
    "architect reviews solution options"
  )

  await injectEvent(
    {
      type: "architect_tooling_recommendations_submitted",
      recommendations: [
        {
          tool: "tinykeys",
          roleInSolution: "Provide lightweight and reliable keyboard shortcut binding for '?'.",
          integrationNotes: "Register and cleanup shortcut handler in dashboard shell lifecycle.",
        },
        {
          tool: "posthog-js",
          roleInSolution: "Track usage of the Help shortcut for product analytics.",
          integrationNotes: "Emit a single help_shortcut_used event only when panel is opened.",
        },
      ],
    },
    "architect recommends tools during specification"
  )

  await injectEvent(
    {
      type: "principal_tooling_recommendations_submitted",
      recommendations: [
        {
          tool: "tinykeys",
          roleInSolution: "Standardize shortcut registration with explicit scope and cleanup.",
          integrationNotes: "Wrap registration in a small adapter shared by dashboard views.",
        },
        {
          tool: "@sentry/browser",
          roleInSolution: "Capture runtime errors around shortcut handler edge-cases.",
          integrationNotes: "Report only unexpected handler failures to avoid telemetry noise.",
        },
      ],
    },
    "principal recommends tools during specification"
  )

  await injectEvent(
    {
      type: "architect_solution_selected",
      selectedOptionId: "option-a",
      architectureSpec: {
        version: "arch-spec-v1",
        objective: "Add a safe and observable '?' shortcut that opens Help from dashboard shell.",
        scope: [
          "dashboard shell keyboard integration",
          "help panel open behavior",
          "telemetry event emission",
        ],
        decisions: [
          "Register shortcut in dashboard shell instead of Help component.",
          "Apply editable-focus guard before handling '?'.",
          "Emit telemetry only on successful panel open.",
        ],
        components: {
          add: ["dashboard shortcut registration", "help shortcut telemetry event"],
          merge: ["focus guard utility into existing shortcut handler"],
          split: ["shortcut handling from Help panel rendering"],
          remove: ["inline keydown listeners inside Help component"],
        },
        patterns: [
          "single-source shortcut registration",
          "focus-aware key guard",
        ],
        sections: [
          {
            id: "spec-shortcut-binding",
            heading: "Shortcut Binding",
            points: [
              "Bind '?' in dashboard shell lifecycle.",
              "Ensure cleanup on unmount.",
            ],
          },
          {
            id: "spec-telemetry",
            heading: "Telemetry",
            points: [
              "Emit help_shortcut_used event when Help panel opens.",
              "Avoid duplicate telemetry for repeated keydown while open.",
            ],
          },
        ],
      },
      componentsToAdd: [
        "dashboard shortcut registration",
        "help shortcut telemetry event",
      ],
      componentsToMerge: ["focus guard utility into existing shortcut handler"],
      componentsToSplit: ["shortcut handling from Help panel rendering"],
      componentsToRemove: ["inline keydown listeners inside Help component"],
      patterns: [
        "single-source shortcut registration",
        "focus-aware key guard",
      ],
    },
    "architect finalizes architecture spec"
  )

  await injectEvent(
    {
      type: "principal_spec_feedback",
      feedback: {
        verdict: "approved_with_notes",
        notes: [
          "Keep telemetry close to open action.",
          "Document focus-guard behavior in section references.",
        ],
        openQuestions: [],
      },
      question: null,
    },
    "principal reviews spec"
  )

  await injectEvent(
    {
      type: "architect_tooling_recommendations_submitted",
      recommendations: [
        {
          tool: "tinykeys",
          roleInSolution: "Keyboard shortcut binding with predictable cleanup behavior.",
          integrationNotes: "Use one subscription tied to dashboard shell mount/unmount.",
        },
        {
          tool: "posthog-js",
          roleInSolution: "Product analytics for shortcut adoption.",
          integrationNotes: "Emit help_shortcut_used once per successful panel-open action.",
        },
      ],
    },
    "architect updates tool recommendations during review"
  )

  await injectEvent(
    {
      type: "principal_tooling_recommendations_submitted",
      recommendations: [
        {
          tool: "tinykeys",
          roleInSolution: "Consistent and testable shortcut registration utility.",
          integrationNotes: "Use adapter so tests can mock and assert shortcut wiring.",
        },
        {
          tool: "posthog-js",
          roleInSolution: "Track real usage of Help shortcut in production.",
          integrationNotes: "Route event emission through existing telemetry abstraction.",
        },
      ],
    },
    "principal updates tool recommendations during review"
  )

  await injectEvent(
    {
      type: "tooling_recommendations_aligned",
      agreedRecommendations: [
        {
          tool: "tinykeys",
          roleInSolution: "Core shortcut binding mechanism for '?' with clean lifecycle handling.",
          integrationNotes: "Integrate in dashboard shell through a thin adapter.",
        },
        {
          tool: "posthog-js",
          roleInSolution: "Telemetry for help_shortcut_used to measure discoverability of Help.",
          integrationNotes: "Emit through existing telemetry service, once per open action.",
        },
      ],
    },
    "architect and principal align on tool recommendations"
  )

  await injectEvent(
    {
      type: "dialectic_spec_aligned",
      alignmentSummary: "Architect and principal align on shell-level shortcut binding, focus guard, and telemetry.",
      implementationDirectives: [
        "Implement shortcut registration only in dashboard shell.",
        "Enforce editable-focus guard before opening Help.",
        "Emit help_shortcut_used through telemetry abstraction.",
      ],
    },
    "dialectic spec is aligned"
  )

  const snapshotAfterSpecAlignment = engine.getSnapshot()
  const alignedSpec = snapshotAfterSpecAlignment[IMPLEMENTATION_ORCHESTRATION].alignedSpec
  if (!alignedSpec) {
    throw new Error("Aligned specification missing after dialectic alignment.")
  }

  await injectEvent(
    {
      type: "principal_checklists_prepared",
      sourceAlignedSpecVersion: alignedSpec.version,
      checklists: [
        {
          id: "checklist-help-shortcut",
          domain: "dashboard-ui",
          concern: "help-shortcut",
          relatedSpecSections: [
            "spec-shortcut-binding",
            "spec-telemetry",
          ],
          steps: [
            "Register '?' shortcut in dashboard shell using existing shortcut bus.",
            "Add focus guard so editable targets ignore the shortcut.",
            "Dispatch Help panel open action and emit help_shortcut_used telemetry.",
            "Add regression test covering input-focus suppression and open action.",
          ],
          requirements: [
            "Pressing '?' opens Help panel from dashboard shell.",
            "Shortcut does nothing while typing in editable controls.",
            "Emit telemetry event help_shortcut_used once per open.",
          ],
          constraints: ["Do not modify existing Escape-to-close behavior."],
          testConditions: [
            "Focused input does not trigger shortcut.",
            "Telemetry fires on successful open action.",
          ],
          preferredAgents: ["developer.agent.alpha"],
        },
      ],
    },
    "principal prepares implementation checklists"
  )

  await injectEvent(
    {
      type: "stage_escalation_requested",
      stage: "implementation",
      by: "developer",
      target: "principal",
      question: "Should repeated '?' keydown while Help is already open be ignored for telemetry?",
    },
    "developer escalates implementation edge-case"
  )

  await injectEvent(
    {
      type: "stage_escalation_answered",
      stage: "implementation",
      answer: "Yes. Keep telemetry at one help_shortcut_used event per successful open action.",
    },
    "principal answers implementation escalation"
  )

  await injectEvent(
    {
      type: "developer_submission_ready",
      agentId: "developer.agent.alpha",
      checklistId: "checklist-help-shortcut",
      summary: {
        overview: "Implemented dashboard-level '?' shortcut with focus guard and telemetry.",
        changedAreas: [
          "dashboard shell shortcut registration",
          "focus guard wiring",
          "help shortcut telemetry emission",
          "regression test for input focus suppression",
        ],
        verification: [
          "typecheck",
          "lint",
          "tests",
          "static analysis",
        ],
      },
      staticChecks: {
        typecheck: true,
        lint: true,
        tests: true,
        staticAnalysis: true,
      },
      confidence: 0.93,
      relatedSpecSections: ["spec-shortcut-binding", "spec-telemetry"],
      relatedFeature: "help-shortcut",
    },
    "developer submits implementation"
  )

  await injectEvent(
    {
      type: "architect_part_review_submitted",
      checklistId: "checklist-help-shortcut",
      decision: "approved",
      feedback: "Shortcut boundary and focus guard look correct.",
    },
    "architect approves implementation"
  )

  await injectEvent(
    {
      type: "principal_part_review_submitted",
      checklistId: "checklist-help-shortcut",
      decision: "approved",
      feedback: "Approved. Telemetry and regression test are present.",
    },
    "principal approves implementation"
  )

  const snapshotBeforeFinalReview = engine.getSnapshot()
  console.log("Final review active?", snapshotBeforeFinalReview[FINAL_TRIAD_REVIEW].isActive)
}
