import type {
  CorePlaces,
  RegistryValidation,
  SourcePlaces,
} from "../../domain/workflow_registry.js"
import type { PlaceMap, TransitionMap } from "./model.js"
import type { WorkflowEngineOptions } from "./configuration.js"

type InterfacePlaceKeys<P extends object> = {
  [K in keyof P]: P[K] extends { interfaceRole: "input" } ? K : never
}[keyof P]

type HasInputInterfacePlaces<P extends object> =
  [InterfacePlaceKeys<P>] extends [never] ? false : true

type DefaultActiveKeys<P extends object> = {
  [K in keyof P]: P[K] extends { state: { isActive: true } } ? K : never
}[keyof P]

type CoreDefaultActiveKeys<Places extends object, P extends PlaceMap<Places>> =
  Extract<DefaultActiveKeys<P>, CorePlaces<Places>>

type RegistryConstraint<Places extends object, Transitions extends object> =
  RegistryValidation<Places, Transitions> extends true
    ? unknown
    : {
        __registry_validation_error__: RegistryValidation<Places, Transitions>
      }

type ClosedNetMarkingError<Places extends object, Transitions extends object, P extends PlaceMap<Places>> = {
  __creation_marking_error__: {
    code: "closed_net_default_active_must_match_source_place"
    defaultActiveCorePlaces: CoreDefaultActiveKeys<Places, P>
    sourcePlace: SourcePlaces<Places, Transitions>
  }
}

type DefaultActiveMatchesSource<
  Places extends object,
  Transitions extends object,
  P extends PlaceMap<Places>,
> =
  [CoreDefaultActiveKeys<Places, P>] extends [SourcePlaces<Places, Transitions>]
    ? [SourcePlaces<Places, Transitions>] extends [CoreDefaultActiveKeys<Places, P>]
      ? unknown
      : ClosedNetMarkingError<Places, Transitions, P>
    : ClosedNetMarkingError<Places, Transitions, P>

type OpenNetNoDefaultActive<Places extends object, P extends PlaceMap<Places>> =
  [CoreDefaultActiveKeys<Places, P>] extends [never]
    ? unknown
    : {
        __creation_marking_error__: {
          code: "open_net_requires_all_core_places_to_start_inactive"
          defaultActiveCorePlaces: CoreDefaultActiveKeys<Places, P>
        }
      }

type CreationMarkingConstraint<
  Places extends object,
  Transitions extends object,
  P extends PlaceMap<Places>,
> =
  HasInputInterfacePlaces<P> extends true
    ? OpenNetNoDefaultActive<Places, P>
    : DefaultActiveMatchesSource<Places, Transitions, P>

export type WorkflowDefinition<
  Places extends object,
  P extends PlaceMap<Places>,
  T extends TransitionMap<Places>,
> = {
  places: P
  transitions: T
  configuration?: WorkflowEngineOptions
} & RegistryConstraint<Places, T> & CreationMarkingConstraint<Places, T, P>
