import type { InterfaceRoleOf, StateOf } from "./workflow_registry.js"

export interface WorkflowPlace<R extends object, Name extends keyof R> {
  readonly name: Name
  readonly interfaceRole: InterfaceRoleOf<R, Name>
  state: StateOf<R, Name>
}

type PlaceDefinition<R extends object, Name extends keyof R, S extends StateOf<R, Name>> = {
  interfaceRole?: InterfaceRoleOf<R, Name>
  state: S
}

export function definePlace<R extends object>() {
  return <Name extends keyof R, S extends StateOf<R, Name>>(
    name: Name,
    definition: PlaceDefinition<R, Name, S>
  ): WorkflowPlace<R, Name> & { state: S } => ({
    name,
    interfaceRole: (definition.interfaceRole ?? "internal") as InterfaceRoleOf<R, Name>,
    state: definition.state,
  })
}
