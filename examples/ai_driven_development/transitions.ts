import { alignmentTransitions } from "./transitions/alignment.js"
import { analysisParallelTransitions } from "./transitions/analysis_parallel.js"
import { architectureSpecTransitions } from "./transitions/architecture_spec.js"
import { finalReviewReleaseTransitions } from "./transitions/final_review_release.js"
import { implementationFlowTransitions } from "./transitions/implementation_flow.js"
import { intakeReviewTransitions } from "./transitions/intake_review.js"
import { poDiscoveryTransitions } from "./transitions/po_discovery.js"

export const aiDrivenDevelopmentTransitions = {
  ...intakeReviewTransitions,
  ...poDiscoveryTransitions,
  ...analysisParallelTransitions,
  ...alignmentTransitions,
  ...architectureSpecTransitions,
  ...implementationFlowTransitions,
  ...finalReviewReleaseTransitions,
} as const
