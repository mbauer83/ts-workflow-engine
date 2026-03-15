import type { AiDrivenDevelopmentEngine } from "./engine_factory.js"
import { runArchitectureAndImplementation } from "./scenario_steps/architecture_implementation.js"
import { runFinalization } from "./scenario_steps/finalization.js"
import { runIntakeAndInitialReview } from "./scenario_steps/intake_initial_review.js"
import { runPoAndAnalysis } from "./scenario_steps/po_analysis.js"
import { createEventInjector } from "./scenario_steps/shared.js"

export async function runAiDrivenDevelopmentScenario(engine: AiDrivenDevelopmentEngine) {
  const injectEvent = createEventInjector(engine)

  console.log("--- AI-Driven Development Workflow (Simple Dashboard Task Demo) ---")

  await runIntakeAndInitialReview(injectEvent)
  await runPoAndAnalysis(engine, injectEvent)
  await runArchitectureAndImplementation(engine, injectEvent)
  await runFinalization(engine, injectEvent)
}
