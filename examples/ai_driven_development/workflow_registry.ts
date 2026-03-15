import type {
  ARCHITECT_ANALYSIS,
  ArchitectAnalysisState,
  JOINT_ALIGNMENT,
  JointAlignmentState,
  PRINCIPAL_ANALYSIS,
  PrincipalAnalysisState,
} from "./places/analysis.js"
import type {
  ARCHITECT_SOLUTION_SPEC,
  ArchitectSolutionSpecState,
  PRINCIPAL_SPEC_COLLAB,
  PrincipalSpecCollaborationState,
} from "./places/architecture.js"
import type {
  AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE,
  AiDrivenDevelopmentEventIntakeState,
} from "./places/environment.js"
import type {
  ARCHITECT_PART_REVIEW,
  DEVELOPER_WORK,
  DeveloperWorkState,
  FINAL_TRIAD_REVIEW,
  FinalTriadReviewState,
  IMPLEMENTATION_ORCHESTRATION,
  ImplementationOrchestrationState,
  PART_REVIEW_SYNC,
  PartReviewSyncState,
  PRINCIPAL_PART_REVIEW,
  ReviewerLaneState,
} from "./places/implementation.js"
import type { PO_DISCOVERY, PoDiscoveryState } from "./places/po_discovery.js"
import type {
  RELEASE_PREP,
  ReleasePreparationState,
  WORKFLOW_DONE,
  WorkflowDoneState,
} from "./places/release.js"
import type { SPEC_REVIEW, SpecReviewState } from "./places/spec_review.js"

export interface AiDrivenDevelopmentRegistry {
  [AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE]: {
    interface: "input"
    state: AiDrivenDevelopmentEventIntakeState
  }
  [SPEC_REVIEW]: {
    state: SpecReviewState
  }
  [PO_DISCOVERY]: {
    state: PoDiscoveryState
  }
  [ARCHITECT_ANALYSIS]: {
    state: ArchitectAnalysisState
  }
  [PRINCIPAL_ANALYSIS]: {
    state: PrincipalAnalysisState
  }
  [JOINT_ALIGNMENT]: {
    state: JointAlignmentState
  }
  [ARCHITECT_SOLUTION_SPEC]: {
    state: ArchitectSolutionSpecState
  }
  [PRINCIPAL_SPEC_COLLAB]: {
    state: PrincipalSpecCollaborationState
  }
  [IMPLEMENTATION_ORCHESTRATION]: {
    state: ImplementationOrchestrationState
  }
  [DEVELOPER_WORK]: {
    state: DeveloperWorkState
  }
  [ARCHITECT_PART_REVIEW]: {
    state: ReviewerLaneState
  }
  [PRINCIPAL_PART_REVIEW]: {
    state: ReviewerLaneState
  }
  [PART_REVIEW_SYNC]: {
    state: PartReviewSyncState
  }
  [FINAL_TRIAD_REVIEW]: {
    state: FinalTriadReviewState
  }
  [RELEASE_PREP]: {
    state: ReleasePreparationState
  }
  [WORKFLOW_DONE]: {
    state: WorkflowDoneState
  }
}
