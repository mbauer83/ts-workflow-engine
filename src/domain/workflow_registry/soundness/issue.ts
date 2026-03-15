export type ValidationIssue<
  Code extends string,
  Details extends object = Record<never, never>,
> = {
  readonly __workflow_registry_error: Code
} & Details
