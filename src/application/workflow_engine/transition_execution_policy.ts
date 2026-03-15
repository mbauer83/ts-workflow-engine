import type { DeepPartial } from "../../common/deep_partial.js"
import type { EvaluationContext } from "../../domain/transition.js"
import type { StateOf } from "../../domain/workflow_registry.js"
import type { PlaceMap, TransitionCandidate, TransitionMap } from "./model.js"
import { buildEvaluationContext, collectTransitionInputStates } from "./evaluation_context.js"
import { applyStateUpdate } from "./state_updates.js"
import { Chalk } from "chalk"

const chalk = new Chalk({ level: 3 })

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

const humanizeIdentifier = (value: string): string =>
  value
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/([a-z\d])([A-Z])/g, "$1 $2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim()
    .toLowerCase()

const describeLabel = (label: PropertyKey): string => {
  if (typeof label === "symbol") {
    const description = label.description
    if (description && description.length > 0) {
      return humanizeIdentifier(description)
    }

    const fallback = String(label)
    const fromSymbolText = /^Symbol\((.*)\)$/.exec(fallback)?.[1]
    return humanizeIdentifier(fromSymbolText ?? fallback)
  }

  return humanizeIdentifier(String(label))
}

export function evaluateEnabledTransitions<
  Places extends object,
  Transitions extends TransitionMap<Places>,
>(
  placeMap: PlaceMap<Places>,
  transitionMap: Transitions
): Array<TransitionCandidate<Transitions>> {
  const evaluationContext = buildEvaluationContext(placeMap)
  const transitionNames = ownKeys(transitionMap)

  return transitionNames
    .map((transitionName, order) => {
      const transition = transitionMap[transitionName]
      if (!transition) return null

      const allInputsActive = transition.inputPlaces.every(
        inputPlace => placeMap[inputPlace].state.isActive
      )

      if (!allInputsActive) {
        return null
      }

      const inputStates = collectTransitionInputStates(placeMap, transition.inputPlaces)
      if (!transition.guard(inputStates, evaluationContext)) {
        return null
      }

      return {
        transition: transitionName,
        priority: transition.priority,
        order,
      }
    })
    .filter(
      (candidate): candidate is TransitionCandidate<Transitions> =>
        candidate !== null
    )
}

export function selectTransitionToFire<Transitions extends object>(
  candidates: Array<TransitionCandidate<Transitions>>
): TransitionCandidate<Transitions> | null {
  const [selected] = candidates.toSorted(
    (a, b) => b.priority - a.priority || a.order - b.order
  )

  return selected ?? null
}

export function fireTransitionAtomically<
  Places extends object,
  Transitions extends TransitionMap<Places>,
  K extends keyof Transitions,
>(
  placeMap: PlaceMap<Places>,
  transitionMap: Transitions,
  transitionName: K
) {
  const transition = transitionMap[transitionName]
  if (!transition) return

  const sourcePlaces = transition.inputPlaces.map(describeLabel).join(", ")
  const targetPlaces = transition.outputPlaces.map(describeLabel).join(", ")
  console.log(chalk.dim.gray(`· transition ${describeLabel(transitionName)} :: [${sourcePlaces}] ➔ [${targetPlaces}]`))

  const evaluationContext = buildEvaluationContext(placeMap)
  const inputStates = collectTransitionInputStates(placeMap, transition.inputPlaces)
  const transitionEffects = transition.effects as Partial<Record<
    keyof Places,
    (
      inputs: typeof inputStates,
      to: StateOf<Places, keyof Places>,
      context: EvaluationContext<Places>
    ) => DeepPartial<StateOf<Places, keyof Places>>
  >>

  for (const outputPlace of transition.outputPlaces) {
    const effectFn = transitionEffects[outputPlace]
    if (!effectFn) continue

    const effectUpdate = effectFn(inputStates, placeMap[outputPlace].state, evaluationContext)
    applyStateUpdate(placeMap, outputPlace, effectUpdate)
  }

  for (const inputPlace of transition.inputPlaces) {
    placeMap[inputPlace].state.isActive = false
  }

  for (const outputPlace of transition.outputPlaces) {
    placeMap[outputPlace].state.isActive = true
  }
}
