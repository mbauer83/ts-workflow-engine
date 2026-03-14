import type { DeepPartial } from "../common/deep_partial.js"
import type { Result } from "../common/result.js"

export type WorkflowRegistry<R> = {
  [K in keyof R]: {
    state: R[K] extends { state: infer S } ? S & { isActive: boolean } : never
    actions: {
      [A in keyof (R[K] extends { actions: infer Acts } ? Acts : never)]: 
        R[K] extends { state: infer S, actions: infer Acts }
          ? Acts[A & keyof Acts] extends (state: S, ...args: infer P) => Promise<Result<DeepPartial<S>, any>>
            ? (state: S, ...args: P) => Promise<Result<DeepPartial<S>, any>>
            : never : never
    };
    // Enforce targets as an array of labels, excluding the current key
    targets: R[K] extends { targets: Array<infer T> } ? T[] & Array<Exclude<keyof R, K>> : never
  }
}

export type StateOf<R, K extends keyof R> = R[K] extends { state: infer S } ? S & { isActive: boolean } : never
export type ActionsOf<R, K extends keyof R> = R[K] extends { actions: infer A } ? A : never
export type TargetsOf<R, K extends keyof R> = R[K] extends { targets: Array<infer T> } ? T & keyof R : never
