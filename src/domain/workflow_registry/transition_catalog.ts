export type TransitionEntry<Transitions extends object, K extends keyof Transitions> =
  Transitions[K] extends {
    inputPlaces: readonly (infer In)[]
    outputPlaces: readonly (infer Out)[]
  }
    ? {
        input: In
        output: Out
        priority: Transitions[K] extends { priority: infer P } ? P : 1
      }
    : never

export type RawInputPlacesOf<Transitions extends object, K extends keyof Transitions> =
  TransitionEntry<Transitions, K> extends { input: infer In } ? In : never

export type RawOutputPlacesOf<Transitions extends object, K extends keyof Transitions> =
  TransitionEntry<Transitions, K> extends { output: infer Out } ? Out : never

export type TransitionPriorityOf<Transitions extends object, K extends keyof Transitions> =
  TransitionEntry<Transitions, K> extends { priority: infer P } ? P : 1

export type InputPlacesOfTransition<
  Places extends object,
  Transitions extends object,
  K extends keyof Transitions,
> = Extract<RawInputPlacesOf<Transitions, K>, keyof Places>

export type OutputPlacesOfTransition<
  Places extends object,
  Transitions extends object,
  K extends keyof Transitions,
> = Extract<RawOutputPlacesOf<Transitions, K>, keyof Places>

export type TargetsOf<
  Places extends object,
  Transitions extends object,
  K extends keyof Places,
> = {
  [Tr in keyof Transitions]:
    K extends InputPlacesOfTransition<Places, Transitions, Tr>
      ? OutputPlacesOfTransition<Places, Transitions, Tr>
      : never
}[keyof Transitions]

export type KeysWithTargets<Places extends object, Transitions extends object> = {
  [K in keyof Places]: TargetsOf<Places, Transitions, K> extends never ? never : K
}[keyof Places]
