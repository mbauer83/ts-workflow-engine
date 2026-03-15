import type { PlaceEntry, RawInterfaceRoleOf } from "../place_catalog.js"
import type {
  InputPlacesOfTransition,
  OutputPlacesOfTransition,
  RawInputPlacesOf,
  RawOutputPlacesOf,
  TransitionEntry,
  TransitionPriorityOf,
} from "../transition_catalog.js"
import type { ValidationIssue } from "./issue.js"
import type { IsPositiveIntegerOrGenericNumber } from "../type_algebra.js"

type InvalidPlaceStructureKeys<Places extends object> = {
  [K in keyof Places]: PlaceEntry<Places, K> extends never ? K : never
}[keyof Places]

type InvalidInterfaceRoleKeys<Places extends object> = {
  [K in keyof Places]: RawInterfaceRoleOf<Places, K> extends "internal" | "input" ? never : K
}[keyof Places]

type InvalidTransitionStructureKeys<Transitions extends object> = {
  [K in keyof Transitions]: TransitionEntry<Transitions, K> extends never ? K : never
}[keyof Transitions]

type PlaceStructureIssue<Places extends object> =
  [InvalidPlaceStructureKeys<Places>] extends [never]
    ? never
    : ValidationIssue<"invalid_place_structure", {
        places: InvalidPlaceStructureKeys<Places>
      }>

type InterfaceRoleIssue<Places extends object> =
  [InvalidInterfaceRoleKeys<Places>] extends [never]
    ? never
    : ValidationIssue<"invalid_interface_role", {
        places: InvalidInterfaceRoleKeys<Places>
      }>

type TransitionStructureIssue<Transitions extends object> =
  [InvalidTransitionStructureKeys<Transitions>] extends [never]
    ? never
    : ValidationIssue<"invalid_transition_structure", {
        transitions: InvalidTransitionStructureKeys<Transitions>
      }>

type UnknownTransitionInputPlaceIssue<Places extends object, Transitions extends object> = {
  [Tr in keyof Transitions]:
    Exclude<RawInputPlacesOf<Transitions, Tr>, keyof Places> extends never
      ? never
      : ValidationIssue<"unknown_transition_input_place", {
          transition: Tr
          places: Exclude<RawInputPlacesOf<Transitions, Tr>, keyof Places>
        }>
}[keyof Transitions]

type UnknownTransitionOutputPlaceIssue<Places extends object, Transitions extends object> = {
  [Tr in keyof Transitions]:
    Exclude<RawOutputPlacesOf<Transitions, Tr>, keyof Places> extends never
      ? never
      : ValidationIssue<"unknown_transition_output_place", {
          transition: Tr
          places: Exclude<RawOutputPlacesOf<Transitions, Tr>, keyof Places>
        }>
}[keyof Transitions]

type TransitionWithoutInputsIssue<Places extends object, Transitions extends object> = {
  [Tr in keyof Transitions]:
    [InputPlacesOfTransition<Places, Transitions, Tr>] extends [never]
      ? ValidationIssue<"transition_requires_input_places", { transition: Tr }>
      : never
}[keyof Transitions]

type TransitionWithoutOutputsIssue<Places extends object, Transitions extends object> = {
  [Tr in keyof Transitions]:
    [OutputPlacesOfTransition<Places, Transitions, Tr>] extends [never]
      ? ValidationIssue<"transition_requires_output_places", { transition: Tr }>
      : never
}[keyof Transitions]

type TransitionPriorityIssue<Transitions extends object> = {
  [Tr in keyof Transitions]:
    TransitionPriorityOf<Transitions, Tr> extends infer Priority
      ? Priority extends number
        ? IsPositiveIntegerOrGenericNumber<Priority> extends true
          ? never
          : ValidationIssue<"transition_priority_must_be_positive_integer", {
              transition: Tr
              priority: Priority
            }>
        : ValidationIssue<"transition_priority_must_be_positive_integer", { transition: Tr }>
      : never
}[keyof Transitions]

export type StructuralSoundnessIssues<Places extends object, Transitions extends object> =
  | PlaceStructureIssue<Places>
  | InterfaceRoleIssue<Places>
  | TransitionStructureIssue<Transitions>
  | UnknownTransitionInputPlaceIssue<Places, Transitions>
  | UnknownTransitionOutputPlaceIssue<Places, Transitions>
  | TransitionWithoutInputsIssue<Places, Transitions>
  | TransitionWithoutOutputsIssue<Places, Transitions>
  | TransitionPriorityIssue<Transitions>
