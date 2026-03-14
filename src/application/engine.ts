import type { DeepPartial } from "../common/deep_partial.js"
import { failure, success, type Result } from "../common/result.js"
import type { WorkflowPlace, EvaluationContext } from "../domain/place.js"
import type { ActionsOf, StateOf, TargetsOf, WorkflowRegistry } from "../domain/workflow_registry.js"

export class WorkflowEngine<R extends object> {
  private readonly placeMap: { [K in keyof R]: WorkflowPlace<R, K> };

  constructor(places: { [K in keyof R]: WorkflowPlace<R, K> }) {
    this.placeMap = places;
  }

  public async trigger<L extends keyof R, A extends keyof ActionsOf<R, L>>(
    label: L, 
    action: A, 
    ...args: ActionsOf<R, L>[A] extends (s: any, ...args: infer P) => any ? P : never
  ): Promise<Result<void, string>> {
    const place = this.placeMap[label];
    
    // Support Cold Start: Any action can be called. 
    // If the result sets isActive: true, the Petri-net starts firing.
    const actionFn = (place.actions as any)[action];
    const result = await actionFn(place.state, ...args);
    
    if (!result.success) return result;

    this.applyUpdate(label, result.value);
    await this.runUntilStable();
    return success(undefined);
  }

  private applyUpdate<L extends keyof R>(label: L, update: DeepPartial<StateOf<R, L>>) {
    const place = this.placeMap[label];
    place.state = { ...place.state, ...update };
  }

  private async runUntilStable() {
    while (await this.executeTick());
  }

  private async executeTick(): Promise<boolean> {
    const ctx = this.getEvaluationContext();
    const labels = Reflect.ownKeys(this.placeMap) as (keyof R)[];
    const places = labels.map(k => this.placeMap[k]);

    const candidates = places
      .filter(p => p.state.isActive)
      .flatMap(p => {
        const targetKeys = Reflect.ownKeys(p.preconditions) as Array<TargetsOf<R, typeof p.name>>;
        
        // Logical AND: Transition fires only if all targets are ready
        const isPermitted = targetKeys.length > 0 && targetKeys.every(t => 
          (p.preconditions as any)[t](p.state, this.placeMap[t].state, ctx)
        );
        
        return isPermitted ? { from: p.name, targets: targetKeys, priority: 1 } : null;
      })
      // FIXED: Predicate now uses the strict subset 'TargetsOf' instead of broadening to 'keyof R'
      .filter((n): n is { from: keyof R; targets: Array<TargetsOf<R, keyof R>>; priority: number } => n !== null);

    if (candidates.length === 0) return false;

    const [best] = candidates.toSorted((a, b) => b.priority - a.priority);
    if (!best) return false;

    await this.fireTransition(best.from, best.targets);
    return true;
  }

  private async fireTransition(from: keyof R, targets: Array<keyof R>) {
    console.log(`[TRANSITION] ⚙️  ${String(from)} ➔ ${targets.map(String).join(', ')}`);
    const map = this.placeMap as Record<keyof R, WorkflowPlace<R, keyof R>>;
    map[from].state.isActive = false;
    for (const to of targets) {
      map[to].state.isActive = true;
    }
  }

  private getEvaluationContext(): EvaluationContext<R> {
    const allStates = {} as any;
    const labels = Reflect.ownKeys(this.placeMap) as (keyof R)[];
    for (const key of labels) { allStates[key] = this.placeMap[key].state; }
    return {
      allStates: allStates as EvaluationContext<R>['allStates'],
      activePlaces: labels.filter(k => this.placeMap[k].state.isActive),
      timestampMs: Date.now()
    };
  }

  public getSnapshot(): { [K in keyof R]: StateOf<R, K> } {
    const snapshot = {} as any;
    const labels = Reflect.ownKeys(this.placeMap) as (keyof R)[];
    for (const key of labels) { snapshot[key] = { ...this.placeMap[key].state }; }
    return snapshot;
  }
}