export interface WorkflowEngineOptions {
  stabilizationTickLimit?: number
}

const DEFAULT_STABILIZATION_TICK_LIMIT = 10_000

export function resolveWorkflowEngineConfiguration(
  configuration?: Partial<WorkflowEngineOptions>
): Required<WorkflowEngineOptions> {
  const stabilizationTickLimit =
    configuration?.stabilizationTickLimit ?? DEFAULT_STABILIZATION_TICK_LIMIT

  if (!Number.isInteger(stabilizationTickLimit) || stabilizationTickLimit <= 0) {
    throw new Error("WorkflowEngine configuration 'stabilizationTickLimit' must be a positive integer.")
  }

  return { stabilizationTickLimit }
}
