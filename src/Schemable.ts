/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.0
 */
import { Kind, URIS, HKT } from 'fp-ts/lib/HKT'

/**
 * @since 2.2.0
 */
export type Literal = string | number | boolean | null

/**
 * @since 2.2.3
 */
export interface Schemable<S> {
  readonly URI: S
  readonly literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => HKT<S, A[number]>
  readonly string: HKT<S, string>
  readonly number: HKT<S, number>
  readonly boolean: HKT<S, boolean>
  readonly nullable: <A>(or: HKT<S, A>) => HKT<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, { [K in keyof A]: A[K] }>
  readonly partial: <A>(properties: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, Partial<{ [K in keyof A]: A[K] }>>
  readonly record: <A>(codomain: HKT<S, A>) => HKT<S, Record<string, A>>
  readonly array: <A>(items: HKT<S, A>) => HKT<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A>
  readonly intersect: <B>(right: HKT<S, B>) => <A>(left: HKT<S, A>) => HKT<S, A & B>
  readonly sum: <T extends string>(tag: T) => <A>(members: { [K in keyof A]: HKT<S, A[K]> }) => HKT<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => HKT<S, A>) => HKT<S, A>
}

/**
 * @since 2.2.3
 */
export interface Schemable1<S extends URIS> {
  readonly URI: S
  readonly literal: <A extends readonly [Literal, ...Array<Literal>]>(...values: A) => Kind<S, A[number]>
  readonly string: Kind<S, string>
  readonly number: Kind<S, number>
  readonly boolean: Kind<S, boolean>
  readonly nullable: <A>(or: Kind<S, A>) => Kind<S, null | A>
  readonly type: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, { [K in keyof A]: A[K] }>
  readonly partial: <A>(properties: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, Partial<{ [K in keyof A]: A[K] }>>
  readonly record: <A>(codomain: Kind<S, A>) => Kind<S, Record<string, A>>
  readonly array: <A>(items: Kind<S, A>) => Kind<S, Array<A>>
  readonly tuple: <A extends ReadonlyArray<unknown>>(...components: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A>
  readonly intersect: <B>(right: Kind<S, B>) => <A>(left: Kind<S, A>) => Kind<S, A & B>
  readonly sum: <T extends string>(tag: T) => <A>(members: { [K in keyof A]: Kind<S, A[K]> }) => Kind<S, A[keyof A]>
  readonly lazy: <A>(id: string, f: () => Kind<S, A>) => Kind<S, A>
}

/**
 * @since 2.2.3
 */
export interface WithUnknownContainers<S> {
  readonly UnknownArray: HKT<S, Array<unknown>>
  readonly UnknownRecord: HKT<S, Record<string, unknown>>
}

/**
 * @since 2.2.3
 */
export interface WithUnknownContainers1<S extends URIS> {
  readonly UnknownArray: Kind<S, Array<unknown>>
  readonly UnknownRecord: Kind<S, Record<string, unknown>>
}

/**
 * @since 2.2.3
 */
export interface WithUnion<S> {
  readonly union: <A extends readonly [unknown, ...Array<unknown>]>(
    ...members: { [K in keyof A]: HKT<S, A[K]> }
  ) => HKT<S, A[number]>
}

/**
 * @since 2.2.3
 */
export interface WithUnion1<S extends URIS> {
  readonly union: <A extends readonly [unknown, ...Array<unknown>]>(
    ...members: { [K in keyof A]: Kind<S, A[K]> }
  ) => Kind<S, A[number]>
}

/**
 * @since 2.2.3
 */
export interface WithRefine<S> {
  readonly refine: <A, B extends A>(refinement: (a: A) => a is B, id: string) => (from: HKT<S, A>) => HKT<S, B>
}

/**
 * @since 2.2.3
 */
export interface WithRefine1<S extends URIS> {
  readonly refine: <A, B extends A>(refinement: (a: A) => a is B, id: string) => (from: Kind<S, A>) => Kind<S, B>
}

/**
 * @since 2.2.0
 */
export function memoize<A, B>(f: (a: A) => B): (a: A) => B {
  let cache = new Map()
  return (a) => {
    if (!cache.has(a)) {
      const b = f(a)
      cache.set(a, b)
      return b
    }
    return cache.get(a)
  }
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

const typeOf = (x: unknown): string => (x === null ? 'null' : typeof x)

/**
 * @internal
 */
export const intersect_ = <A, B>(a: A, b: B): A & B => {
  if (a !== undefined && b !== undefined) {
    const tx = typeOf(a)
    const ty = typeOf(b)
    if (tx === 'object' || ty === 'object') {
      return Object.assign({}, a, b)
    }
  }
  return b as any
}
