# ts-workflow-system

A workflow-net oriented, strongly typed workflow engine (TypeScript).

## Quick start

```bash
pnpm install
pnpm start
pnpm test
```

`pnpm test` runs `tsd` against `test-d/**/*.test-d.ts`.

## Example (factory)

- Run: `pnpm start`
- Entrypoint: [examples/factory/main.ts](examples/factory/main.ts)
- Registry: [examples/factory/workflow_registry.ts](examples/factory/workflow_registry.ts)
- Transitions: [examples/factory/transitions.ts](examples/factory/transitions.ts)
- Input interface place: [examples/factory/places/environment.ts](examples/factory/places/environment.ts) (`FACTORY_EVENT_INTAKE`)
- Core places:
	- [examples/factory/places/hardware.ts](examples/factory/places/hardware.ts) (`ENCLOSURE_FABRICATION`)
	- [examples/factory/places/software.ts](examples/factory/places/software.ts) (`FIRMWARE_PREPARATION`)
	- [examples/factory/places/assembly.ts](examples/factory/places/assembly.ts) (`FINAL_ASSEMBLY`)
	- [examples/factory/places/shipping.ts](examples/factory/places/shipping.ts) (`DISPATCH_READY`)

Scenario: the factory builds a smart control unit. One workstream mills the enclosure, another prepares and signs the firmware package, and both must synchronize before final assembly can move to dispatch.

The example is event-driven (not command-driven). It starts with the first real business event (`work_order_released`) rather than a synthetic `initialize` command, then proceeds with:
1. `enclosure_milling_completed`
2. `firmware_package_signed`

Workflow-net semantics demonstrated in a compact flow:
1. **AND-split**: one transition forks a released work order into two concurrent places (`ENCLOSURE_FABRICATION` and `FIRMWARE_PREPARATION`)
2. **Independent lane progression**: each lane advances only when its corresponding external event arrives
3. **AND-join/synchronization**: final assembly transition requires both lanes to be complete for the same work order id
4. **Token/data propagation**: assembled and dispatched work-order ids are carried into downstream places

## Example (ai_driven_development)

- Run: `pnpm run start:ai-driven-development`
- Entrypoint: [examples/ai_driven_development/main.ts](examples/ai_driven_development/main.ts)
- Registry: [examples/ai_driven_development/workflow_registry.ts](examples/ai_driven_development/workflow_registry.ts)
- Transitions: [examples/ai_driven_development/transitions.ts](examples/ai_driven_development/transitions.ts)
- Input interface place: [examples/ai_driven_development/places/environment.ts](examples/ai_driven_development/places/environment.ts) (`AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE`)

This example is a simulated, simplified baseline for an AI-assisted CLI delivery workflow configured with a Git project plus Azure DevOps and Jira context.

Workflow shape demonstrated:
1. Inline note intake for a concrete dashboard task (`?` opens Help panel)
2. Initial approvals across PO, architect, principal, and developer
3. PO story + Jira issue creation (`WEB-271`)
4. Architect and principal analysis in parallel, then alignment join
5. Architect and principal tool/library recommendations during spec and review, with explicit alignment
6. Single implementation checklist execution and dual approval
7. Final triad approval, branch/PR creation, and Jira link completion

`architectureSpec.sections` are used as traceability anchors: principal checklists must reference valid section ids, and developer submissions must reference section ids linked by the active checklist.

The scenario intentionally uses a small, non-meta product task to avoid overlap with this engine's own implementation vocabulary.

All actor actions (for example, "architect asks initial clarification") are modeled as external environment events and therefore enter through `inject(...)` into the input interface place. In a real CLI, prompting for answers is simply the UI layer that collects user input and then emits the corresponding typed event into the same intake place.

## Workflow-net diagram utility

A standalone utility in `tools/workflow_net_diagram/` renders workflow nets into SVG diagrams (and optionally writes DOT source).

Quick commands:
- `pnpm run diagram:factory`
- `pnpm run diagram:ai-driven-development`

Outputs:
- `diagrams/factory.svg` (+ `diagrams/factory.dot`)
- `diagrams/ai-driven-development.svg` (+ `diagrams/ai-driven-development.dot`)

Generic usage:

```bash
pnpm run diagram -- --source factory
pnpm run diagram -- --source ai-driven-development --direction TB
pnpm run diagram -- --module ./my-workflow/source.ts --out diagrams/custom.svg --dot-out diagrams/custom.dot
```

Custom module contract (either option works):

```ts
export const workflowNetDiagramSource = {
	title: "My workflow",
	places,
	transitions,
}
```

or

```ts
export const places = { ... }
export const transitions = { ... }
```

Optional CLI switches:
- `--source-export <name>` (default: `workflowNetDiagramSource`)
- `--places-export <name>` (default: `places`)
- `--transitions-export <name>` (default: `transitions`)
- `--title <diagram title>`
- `--direction LR|TB` (default: `LR`)

## Core model

This project uses an open-net style encoding:
- **core places** represent workflow state
- **input interface places** represent environment ingress
- **transitions** are first-class nodes that connect places

An **input interface place** is a place marked as `interface: "input"` in the registry. It is the typed boundary where external events enter the net: it starts inactive, is activated through `inject(...)`, has outgoing targets into core places, and cannot have incoming edges from the workflow graph.

Each place defines:
- state
- optional `interfaceRole: "input"`

Each transition defines:
- `inputPlaces`
- `outputPlaces`
- optional `guard(inputs, ctx)`
- optional `effects` keyed by output places
- positive integer `priority`

Execution model:
1. `inject` a token update into an input interface place
2. evaluate enabled transitions (all input places must be active)
3. pick highest-priority enabled transition
4. fire atomically: apply effects, deactivate all input places, activate all output places
5. repeat until stable (or until stabilization tick limit is reached)

## Compile-time guarantees

`RegistryValidation<Places, Transitions>` in [src/domain/workflow_registry.ts](src/domain/workflow_registry.ts) enforces:
- valid place shape (`state`, optional `interface`)
- valid transition shape (`inputPlaces`, `outputPlaces`, optional `priority`)
- valid transition place references
- input interface role constraints and no incoming edges to input interfaces
- closed nets: exactly one source core place and one sink core place
- open nets: at least one interface-to-core entry place and one sink core place
- reachability (all core places reachable from start/entry)
- co-reachability (all core places can reach sink)

When validation fails, it now resolves to explicit typed error objects (for example `__workflow_registry_error: "missing_entry_places"`) instead of collapsing to `never`.

## Architecture layout

Domain soundness (`src/domain/workflow_registry/`):
- place catalog and role semantics: [src/domain/workflow_registry/place_catalog.ts](src/domain/workflow_registry/place_catalog.ts)
- transition catalog and graph edges: [src/domain/workflow_registry/transition_catalog.ts](src/domain/workflow_registry/transition_catalog.ts)
- topology/reachability model: [src/domain/workflow_registry/net_topology.ts](src/domain/workflow_registry/net_topology.ts)
- soundness aspects:
	- issue contract: [src/domain/workflow_registry/soundness/issue.ts](src/domain/workflow_registry/soundness/issue.ts)
	- structural: [src/domain/workflow_registry/soundness/structural_soundness.ts](src/domain/workflow_registry/soundness/structural_soundness.ts)
	- interface-boundary: [src/domain/workflow_registry/soundness/interface_boundary_soundness.ts](src/domain/workflow_registry/soundness/interface_boundary_soundness.ts)
	- topology: [src/domain/workflow_registry/soundness/topology_soundness.ts](src/domain/workflow_registry/soundness/topology_soundness.ts)
- public validation contract: [src/domain/workflow_registry/validation.ts](src/domain/workflow_registry/validation.ts)
- facade exports: [src/domain/workflow_registry.ts](src/domain/workflow_registry.ts)

Application runtime policies (`src/application/workflow_engine/`):
- create-time type contract: [src/application/workflow_engine/creation_contract.ts](src/application/workflow_engine/creation_contract.ts)
- create-time runtime policy: [src/application/workflow_engine/creation_policy.ts](src/application/workflow_engine/creation_policy.ts)
- transition scheduling and atomic firing: [src/application/workflow_engine/transition_execution_policy.ts](src/application/workflow_engine/transition_execution_policy.ts)
- transition evaluation context projection: [src/application/workflow_engine/evaluation_context.ts](src/application/workflow_engine/evaluation_context.ts)
- workflow state projection: [src/application/workflow_engine/state_projection.ts](src/application/workflow_engine/state_projection.ts)
- state updates/merge semantics: [src/application/workflow_engine/state_updates.ts](src/application/workflow_engine/state_updates.ts)
- engine configuration policy: [src/application/workflow_engine/configuration.ts](src/application/workflow_engine/configuration.ts)
- orchestration facade: [src/application/engine.ts](src/application/engine.ts)

Common utility primitives:
- deep merge: [src/common/deep_merge.ts](src/common/deep_merge.ts)
- plain-object type guard: [src/common/isPlainObject.ts](src/common/isPlainObject.ts)

## Engine constraints

`WorkflowEngine.create<R>()` in [src/application/engine.ts](src/application/engine.ts) enforces:
- registry must satisfy `RegistryValidation<Places, Transitions>`
- closed nets: exactly one default-active core place and it must be the source
- open nets: input interface places start inactive and all core places start inactive
- transition priorities must be positive integers
- no manual `const _registryValidation: RegistryValidation<...> = true` assertion is required

`WorkflowEngine.create(...)` accepts optional `configuration.stabilizationTickLimit` (default `10000`). If the engine cannot stabilize within the limit, `inject(...)` returns a failure `Result` with an explanatory error.

`inject(label, tokenUpdate)` is strictly typed:
- `label` must be an input interface place
- `tokenUpdate` is inferred from that place's state type

## Runtime-only concerns

These remain runtime-dependent and cannot be fully proven statically:
- guard satisfiability
- data-driven deadlocks
- liveness under external behavior

## Type-test coverage

Type tests:
- [test-d/result.test-d.ts](test-d/result.test-d.ts)
- [test-d/workflow-registry.test-d.ts](test-d/workflow-registry.test-d.ts)
- [test-d/place.test-d.ts](test-d/place.test-d.ts)
- [test-d/engine.test-d.ts](test-d/engine.test-d.ts)

