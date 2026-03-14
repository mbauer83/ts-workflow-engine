import type { StateOf, ActionsOf, TargetsOf } from "./workflow_registry.js";

export type EvaluationContext<R> = {
  allStates: { [K in keyof R]: StateOf<R, K> };
  activePlaces: (keyof R)[];
  timestampMs: number;
};

export interface WorkflowPlace<R, Name extends keyof R> {
  readonly name: Name;
  state: StateOf<R, Name>;
  readonly actions: ActionsOf<R, Name>;
  // No 'targets' here. The keys of 'preconditions' are the targets.
  readonly preconditions: {
    [T in TargetsOf<R, Name>]: (
      from: StateOf<R, Name>, 
      to: StateOf<R, T>, 
      ctx: EvaluationContext<R>
    ) => boolean;
  };
}