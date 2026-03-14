import type { DeepPartial } from "../common/deep_partial.js"
import { failure, success, type Result } from "../common/result.js"
import type { EvaluationContext, WorkflowPlace } from "../domain/place.js"
import type { InputInterfacePlaces, RegistryValidation, SourcePlaces, StateOf, TargetsOf } from "../domain/workflow_registry.js"

type PlaceMap<R extends object> = { [K in keyof R]: WorkflowPlace<R, K> }

type InterfacePlaceKeys<P extends object> = {
  [K in keyof P]: P[K] extends { interfaceRole: "input" } ? K : never
}[keyof P]

type HasInputInterfacePlaces<P extends object> =
  [InterfacePlaceKeys<P>] extends [never] ? false : true

type DefaultActiveKeys<P extends object> = {
  [K in keyof P]: P[K] extends { state: { isActive: true } } ? K : never
}[keyof P]

type RegistryConstraint<R extends object> =
  RegistryValidation<R> extends true ? unknown : never

type DefaultActiveMatchesSource<R extends object, P extends PlaceMap<R>> =
  [DefaultActiveKeys<P>] extends [SourcePlaces<R>]
    ? [SourcePlaces<R>] extends [DefaultActiveKeys<P>]
      ? unknown
      : never
    : never

type OpenNetNoDefaultActive<P extends object> =
  [DefaultActiveKeys<P>] extends [never] ? unknown : never

type CreationMarkingConstraint<R extends object, P extends PlaceMap<R>> =
  HasInputInterfacePlaces<P> extends true
    ? OpenNetNoDefaultActive<P>
    : DefaultActiveMatchesSource<R, P>

type TransitionCandidate<R extends object> = {
  from: keyof R
  targets: Array<keyof R>
  priority: number
}

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

const isPlainObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const deepMergeUnknown = (
  base: Record<PropertyKey, unknown>,
  patch: Record<PropertyKey, unknown>
): Record<PropertyKey, unknown> => {
  const merged: Record<PropertyKey, unknown> = { ...base }

  for (const key of ownKeys(patch)) {
    const patchValue = patch[key]
    const baseValue = merged[key]

    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      merged[key] = deepMergeUnknown(baseValue, patchValue)
      continue
    }

    merged[key] = patchValue
  }

  return merged
}

const deepMerge = <T extends object>(base: T, patch: DeepPartial<T>): T =>
  deepMergeUnknown(
    base as Record<PropertyKey, unknown>,
    patch as Record<PropertyKey, unknown>
  ) as T

export class WorkflowEngine<R extends object> {
  private readonly placeMap: PlaceMap<R>

  private constructor(places: PlaceMap<R>) {
    this.placeMap = places
  }

  public static create<R extends object>() {
    return <P extends PlaceMap<R>>(
      places: P & RegistryConstraint<R> & CreationMarkingConstraint<R, P>
    ): WorkflowEngine<R> => {
      WorkflowEngine.assertCreationInvariants(places)
      return new WorkflowEngine<R>(places)
    }
  }

  private static assertCreationInvariants<R extends object>(places: PlaceMap<R>) {
    const labels = ownKeys(places)
    const interfaceLabels = labels.filter(label => places[label].interfaceRole === "input")
    const coreLabels = labels.filter(label => places[label].interfaceRole !== "input")

    if (coreLabels.length === 0) {
      throw new Error("Workflow net requires at least one core place (non-interface place).")
    }

    const activeInterfaces = interfaceLabels.filter(label => places[label].state.isActive)
    if (activeInterfaces.length > 0) {
      throw new Error("Input interface places must start inactive.")
    }

    const defaultActive = coreLabels.filter(label => places[label].state.isActive)

    if (interfaceLabels.length > 0) {
      if (defaultActive.length > 0) {
        throw new Error("Open workflow net requires all core places to start inactive.")
      }
      return
    }

    const coreLabelSet = new Set<keyof R>(coreLabels)
    const incomingCount = new Map<keyof R, number>(coreLabels.map(label => [label, 0]))

    for (const label of coreLabels) {
      const targets = ownKeys(places[label].transitionGuards) as unknown as Array<keyof R>
      for (const target of targets) {
        if (!coreLabelSet.has(target)) continue
        incomingCount.set(target, (incomingCount.get(target) ?? 0) + 1)
      }
    }

    const sources = coreLabels.filter(label => (incomingCount.get(label) ?? 0) === 0)

    if (sources.length !== 1) {
      throw new Error(`Workflow net requires exactly one source place; found ${sources.length}.`)
    }

    if (defaultActive.length !== 1) {
      throw new Error(`Workflow net requires exactly one default-active core place; found ${defaultActive.length}.`)
    }

    const [source] = sources
    const [active] = defaultActive

    if (source !== active) {
      throw new Error(`Default-active place (${String(active)}) must match the source place (${String(source)}).`)
    }
  }

  public async inject<L extends InputInterfacePlaces<R>>(
    label: L,
    tokenUpdate: DeepPartial<StateOf<R, L>>
  ): Promise<Result<void, string>> {
    const place = this.placeMap[label]

    if (place.interfaceRole !== "input") {
      return failure(`Place '${String(label)}' is not an input interface place.`)
    }

    this.applyUpdate(label, {
      ...tokenUpdate,
      isActive: true,
    } as DeepPartial<StateOf<R, L>>)

    await this.runUntilStable()
    return success(undefined)
  }

  private applyUpdate<L extends keyof R>(label: L, update: DeepPartial<StateOf<R, L>>) {
    const place = this.placeMap[label]
    place.state = deepMerge(place.state, update)
  }

  private async runUntilStable() {
    while (await this.executeTick());
  }

  private async executeTick(): Promise<boolean> {
    const ctx = this.getEvaluationContext()
    const labels = ownKeys(this.placeMap)
    const candidates = labels
      .map(label => this.getTransitionCandidate(this.placeMap[label], ctx))
      .filter((candidate): candidate is TransitionCandidate<R> => candidate !== null)

    if (candidates.length === 0) return false

    const [best] = candidates.toSorted((a, b) => b.priority - a.priority)
    if (!best) return false

    await this.fireTransition(best.from, best.targets)
    return true
  }

  private getTransitionCandidate<K extends keyof R>(
    place: WorkflowPlace<R, K>,
    ctx: EvaluationContext<R>
  ): TransitionCandidate<R> | null {
    if (!place.state.isActive) return null

    const targetKeys = ownKeys(place.transitionGuards) as unknown as Array<TargetsOf<R, K>>
    if (targetKeys.length === 0) return null

    const transitionGuards = place.transitionGuards as {
      [T in TargetsOf<R, K>]: (
        from: StateOf<R, K>,
        to: StateOf<R, T>,
        ctx: EvaluationContext<R>
      ) => boolean
    }

    const permittedTargets = targetKeys.filter(target =>
      transitionGuards[target](place.state, this.placeMap[target].state, ctx)
    )

    if (permittedTargets.length === 0) return null
    return { from: place.name, targets: permittedTargets, priority: 1 }
  }

  private async fireTransition(from: keyof R, targets: Array<keyof R>) {
    console.log(`[TRANSITION] ⚙️  ${String(from)} ➔ ${targets.map(String).join(', ')}`)

    const ctx = this.getEvaluationContext()
    const sourcePlace = this.placeMap[from] as WorkflowPlace<R, keyof R>
    const transitionEffects = sourcePlace.transitionEffects as {
      [K in keyof R]?: (
        fromState: StateOf<R, keyof R>,
        toState: StateOf<R, K>,
        evaluationContext: EvaluationContext<R>
      ) => DeepPartial<StateOf<R, K>>
    }

    for (const to of targets) {
      const effectFn = transitionEffects[to]
      if (!effectFn) continue

      const effectUpdate = effectFn(sourcePlace.state, this.placeMap[to].state, ctx)
      this.applyUpdate(to as never, effectUpdate as never)
    }

    sourcePlace.state.isActive = false
    for (const to of targets) {
      this.placeMap[to].state.isActive = true
    }
  }

  private getEvaluationContext(): EvaluationContext<R> {
    const labels = ownKeys(this.placeMap)
    const allStates = Object.fromEntries(
      labels.map(key => [key, this.placeMap[key].state] as const)
    ) as EvaluationContext<R>["allStates"]

    return {
      allStates,
      activePlaces: labels.filter(key => this.placeMap[key].state.isActive),
      timestampMs: Date.now(),
    }
  }

  public getSnapshot(): { [K in keyof R]: StateOf<R, K> } {
    const labels = ownKeys(this.placeMap)
    return Object.fromEntries(
      labels.map(key => [key, { ...this.placeMap[key].state }] as const)
    ) as { [K in keyof R]: StateOf<R, K> }
  }
}
