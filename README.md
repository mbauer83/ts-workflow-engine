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
- Input interface place: [examples/factory/places/environment.ts](examples/factory/places/environment.ts)
- Core places:
	- [examples/factory/places/hardware.ts](examples/factory/places/hardware.ts)
	- [examples/factory/places/software.ts](examples/factory/places/software.ts)
	- [examples/factory/places/assembly.ts](examples/factory/places/assembly.ts)
	- [examples/factory/places/shipping.ts](examples/factory/places/shipping.ts)

## Core model

This project uses an open-net style encoding:
- **core places** represent workflow state
- **input interface places** represent environment ingress

An **input interface place** is a place marked as `interface: "input"` in the registry. It is the typed boundary where external events enter the net: it starts inactive, is activated through `inject(...)`, has outgoing targets into core places, and cannot have incoming edges from the workflow graph.

Each place defines:
- state
- `transitionGuards` keyed by outgoing targets
- optional `transitionEffects` (per-target typed state deltas)

Execution model:
1. `inject` a token update into an input interface place
2. evaluate enabled transitions
3. apply `transitionEffects`
4. repeat until stable

## Compile-time guarantees

`RegistryValidation<R>` in [src/domain/workflow_registry.ts](src/domain/workflow_registry.ts) enforces:
- valid registry shape (`state`, `targets`, optional `interface`)
- valid target keys
- input interface role constraints and no incoming edges to input interfaces
- closed nets: exactly one source core place and one sink core place
- open nets: at least one interface-to-core entry place and one sink core place
- reachability (all core places reachable from start/entry)
- co-reachability (all core places can reach sink)

## Engine constraints

`WorkflowEngine.create<R>()` in [src/application/engine.ts](src/application/engine.ts) enforces:
- registry must satisfy `RegistryValidation<R>`
- closed nets: exactly one default-active core place and it must be the source
- open nets: input interface places start inactive and all core places start inactive

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

