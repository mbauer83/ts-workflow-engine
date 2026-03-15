type ActiveState<S extends object> = S & { isActive: boolean }

export type PlaceEntry<Places extends object, K extends keyof Places> =
  Places[K] extends {
    state: infer S extends object
  }
    ? { state: S }
    : never

export type RawStateOf<Places extends object, K extends keyof Places> =
  PlaceEntry<Places, K> extends { state: infer S extends object } ? S : never

export type RawInterfaceRoleOf<Places extends object, K extends keyof Places> =
  Places[K] extends { interface: infer Role } ? Role : "internal"

export type InterfaceRoleOf<Places extends object, K extends keyof Places> =
  RawInterfaceRoleOf<Places, K> extends "input" ? "input" : "internal"

export type InputInterfacePlaces<Places extends object> = {
  [K in keyof Places]: InterfaceRoleOf<Places, K> extends "input" ? K : never
}[keyof Places]

export type CorePlaces<Places extends object> =
  Exclude<keyof Places, InputInterfacePlaces<Places>>

export type HasInputInterfaces<Places extends object> =
  [InputInterfacePlaces<Places>] extends [never] ? false : true

export type StateOf<Places extends object, K extends keyof Places> =
  ActiveState<RawStateOf<Places, K>>
