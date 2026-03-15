import type { DeepPartial } from "../common/deep_partial.js"
import { failure, success, type Result } from "../common/result.js"
import type { InputInterfacePlaces, StateOf } from "../domain/workflow_registry.js"
import type { WorkflowDefinition } from "./workflow_engine/creation_contract.js"
import { assertWorkflowNetCanInitialize } from "./workflow_engine/creation_policy.js"
import type { PlaceMap, TransitionMap } from "./workflow_engine/model.js"
import {
  resolveWorkflowEngineConfiguration,
  type WorkflowEngineOptions,
} from "./workflow_engine/configuration.js"
import { applyStateUpdate } from "./workflow_engine/state_updates.js"
import { snapshotWorkflowState } from "./workflow_engine/state_projection.js"
import {
  evaluateEnabledTransitions,
  fireTransitionAtomically,
  selectTransitionToFire,
} from "./workflow_engine/transition_execution_policy.js"

export type { WorkflowEngineOptions } from "./workflow_engine/configuration.js"

export class WorkflowEngine<
  Places extends object,
  Transitions extends TransitionMap<Places>,
> {
  private readonly placeMap: PlaceMap<Places>
  private readonly transitionMap: Transitions
  private readonly configuration: Required<WorkflowEngineOptions>

  private constructor(
    places: PlaceMap<Places>,
    transitions: Transitions,
    configuration: Required<WorkflowEngineOptions>
  ) {
    this.placeMap = places
    this.transitionMap = transitions
    this.configuration = configuration
  }

  public static create<Places extends object>() {
    return <P extends PlaceMap<Places>, T extends TransitionMap<Places>>(
      definition: WorkflowDefinition<Places, P, T>
    ): WorkflowEngine<Places, T> => {
      assertWorkflowNetCanInitialize(definition.places, definition.transitions)
      const configuration = resolveWorkflowEngineConfiguration(definition.configuration)
      return new WorkflowEngine<Places, T>(
        definition.places,
        definition.transitions,
        configuration
      )
    }
  }

  public async inject<L extends InputInterfacePlaces<Places>>(
    label: L,
    tokenUpdate: DeepPartial<StateOf<Places, L>>
  ): Promise<Result<void, string>> {
    const place = this.placeMap[label]

    if (place.interfaceRole !== "input") {
      return failure(`Place '${String(label)}' is not an input interface place.`)
    }

    applyStateUpdate(this.placeMap, label, {
      ...tokenUpdate,
      isActive: true,
    } as DeepPartial<StateOf<Places, L>>)

    return this.runUntilStable()
  }

  private async runUntilStable(): Promise<Result<void, string>> {
    for (let tick = 0; tick < this.configuration.stabilizationTickLimit; tick += 1) {
      const progressed = this.executeTick()
      if (!progressed) {
        return success(undefined)
      }
    }

    return failure(
      `Workflow did not stabilize within ${this.configuration.stabilizationTickLimit} ticks. `
      + "The net likely contains an auto-progress cycle."
    )
  }

  private executeTick(): boolean {
    const candidates = evaluateEnabledTransitions(this.placeMap, this.transitionMap)
    const transitionToFire = selectTransitionToFire(candidates)

    if (!transitionToFire) {
      return false
    }

    fireTransitionAtomically(
      this.placeMap,
      this.transitionMap,
      transitionToFire.transition
    )

    return true
  }

  public getSnapshot(): { [K in keyof Places]: StateOf<Places, K> } {
    return snapshotWorkflowState(this.placeMap)
  }
}
