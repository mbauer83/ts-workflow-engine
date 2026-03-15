import { type AiDrivenDevelopmentEvent, AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE } from "../places/environment.js"
import type { AiDrivenDevelopmentEngine } from "../engine_factory.js"
import { logCuratedEffects, logCuratedEvent } from "./logging.js"

export type InjectEvent = (event: AiDrivenDevelopmentEvent, label: string) => Promise<void>

export function createEventInjector(engine: AiDrivenDevelopmentEngine): InjectEvent {
  return async (event, label) => {
    const before = engine.getSnapshot()
    logCuratedEvent(label, event)

    const result = await engine.inject(AI_DRIVEN_DEVELOPMENT_EVENT_INTAKE, {
      pendingEvent: event,
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    const after = engine.getSnapshot()
    logCuratedEffects(before, after)
  }
}
