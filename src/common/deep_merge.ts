import type { DeepPartial } from "./deep_partial.js"
import { isPlainObject } from "./isPlainObject.js"

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

export function deepMergeUnknown(
  base: Record<PropertyKey, unknown>,
  patch: Record<PropertyKey, unknown>
): Record<PropertyKey, unknown> {
  const merged: Record<PropertyKey, unknown> = { ...base }

  for (const key of ownKeys(patch)) {
    const patchValue = patch[key]
    const baseValue = merged[key]

    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      merged[key] = deepMergeUnknown(baseValue, patchValue)
      continue
    }

    merged[key] = patchValue
  }

  return merged
}

export function deepMerge<T extends object>(base: T, patch: DeepPartial<T>): T {
  return deepMergeUnknown(
    base as Record<PropertyKey, unknown>,
    patch as Record<PropertyKey, unknown>
  ) as T
}
