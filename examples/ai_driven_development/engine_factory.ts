import { WorkflowEngine } from "../../src/application/engine.js"
import { aiDrivenDevelopmentTransitions } from "./transitions.js"
import {
  ARCHITECT_ANALYSIS,
  architectAnalysisPlace,
  JOINT_ALIGNMENT,
  jointAlignmentPlace,
  PRINCIPAL_ANALYSIS,
  principalAnalysisPlace,
} from "./places/analysis.js"
import {
  ARCHITECT_SOLUTION_SPEC,
  architectSolutionSpecPlace,
  PRINCIPAL_SPEC_COLLAB,
  principalSpecCollabPlace,
} from "./places/architecture.js"
import {
  AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE,
  aiDrivenDevelopmentEventIntakePlace,
} from "./places/environment.js"
import {
  ARCHITECT_PART_REVIEW,
  architectPartReviewPlace,
  DEVELOPER_WORK,
  developerWorkPlace,
  FINAL_TRIAD_REVIEW,
  finalTriadReviewPlace,
  IMPLEMENTATION_ORCHESTRATION,
  implementationOrchestrationPlace,
  PART_REVIEW_SYNC,
  partReviewSyncPlace,
  PRINCIPAL_PART_REVIEW,
  principalPartReviewPlace,
} from "./places/implementation.js"
import { PO_DISCOVERY, poDiscoveryPlace } from "./places/po_discovery.js"
import { RELEASE_PREP, releasePrepPlace, WORKFLOW_DONE, workflowDonePlace } from "./places/release.js"
import { SPEC_REVIEW, specReviewPlace } from "./places/spec_review.js"
import type { AiDrivenDevelopmentRegistry } from "./workflow_registry.js"

export function createAiDrivenDevelopmentEngine() {
  return WorkflowEngine.create<AiDrivenDevelopmentRegistry>()({
    places: {
      [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE]: aiDrivenDevelopmentEventIntakePlace,
      [SPEC_REVIEW]: specReviewPlace,
      [PO_DISCOVERY]: poDiscoveryPlace,
      [ARCHITECT_ANALYSIS]: architectAnalysisPlace,
      [PRINCIPAL_ANALYSIS]: principalAnalysisPlace,
      [JOINT_ALIGNMENT]: jointAlignmentPlace,
      [ARCHITECT_SOLUTION_SPEC]: architectSolutionSpecPlace,
      [PRINCIPAL_SPEC_COLLAB]: principalSpecCollabPlace,
      [IMPLEMENTATION_ORCHESTRATION]: implementationOrchestrationPlace,
      [DEVELOPER_WORK]: developerWorkPlace,
      [ARCHITECT_PART_REVIEW]: architectPartReviewPlace,
      [PRINCIPAL_PART_REVIEW]: principalPartReviewPlace,
      [PART_REVIEW_SYNC]: partReviewSyncPlace,
      [FINAL_TRIAD_REVIEW]: finalTriadReviewPlace,
      [RELEASE_PREP]: releasePrepPlace,
      [WORKFLOW_DONE]: workflowDonePlace,
    },
    transitions: aiDrivenDevelopmentTransitions,
  })
}

export type AiDrivenDevelopmentEngine = ReturnType<typeof createAiDrivenDevelopmentEngine>
