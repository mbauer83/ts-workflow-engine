import {
  ARCHITECT_ANALYSIS,
  architectAnalysisPlace,
  JOINT_ALIGNMENT,
  jointAlignmentPlace,
  PRINCIPAL_ANALYSIS,
  principalAnalysisPlace,
} from "../../../examples/ai_driven_development/places/analysis.js"
import {
  ARCHITECT_SOLUTION_SPEC,
  architectSolutionSpecPlace,
  PRINCIPAL_SPEC_COLLAB,
  principalSpecCollabPlace,
} from "../../../examples/ai_driven_development/places/architecture.js"
import {
  AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE,
  aiDrivenDevelopmentEventIntakePlace,
} from "../../../examples/ai_driven_development/places/environment.js"
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
} from "../../../examples/ai_driven_development/places/implementation.js"
import { PO_DISCOVERY, poDiscoveryPlace } from "../../../examples/ai_driven_development/places/po_discovery.js"
import { RELEASE_PREP, releasePrepPlace, WORKFLOW_DONE, workflowDonePlace } from "../../../examples/ai_driven_development/places/release.js"
import { SPEC_REVIEW, specReviewPlace } from "../../../examples/ai_driven_development/places/spec_review.js"
import { aiDrivenDevelopmentTransitions } from "../../../examples/ai_driven_development/transitions.js"

export const places = {
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
} as const

export const transitions = aiDrivenDevelopmentTransitions

export const workflowNetDiagramSource = {
  title: "AI-driven development workflow net",
  places,
  transitions,
} as const
