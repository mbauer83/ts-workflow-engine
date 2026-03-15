export type IsNever<T> = [T] extends [never] ? true : false

export type IsUnion<T, U = T> =
  IsNever<T> extends true
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false

export type HasExactlyOne<T> =
  IsNever<T> extends true
    ? false
    : IsUnion<T> extends true
      ? false
      : true

export type IsNumberLiteral<N extends number> = number extends N ? false : true

export type IsPositiveIntegerLiteral<N extends number> =
  `${N}` extends `${bigint}`
    ? `${N}` extends `-${string}` | "0"
      ? false
      : true
    : false

export type IsPositiveIntegerOrGenericNumber<N extends number> =
  IsNumberLiteral<N> extends false ? true : IsPositiveIntegerLiteral<N>
