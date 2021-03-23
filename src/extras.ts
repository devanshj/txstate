export namespace O {
  export type Assert<T> = A.Cast<T, A.Object>;
  
  type _Get<O, P, F> =
    P extends [] ?
      O extends undefined ? F : O :
    P extends [infer K1, ...infer Kr] ?
      K1 extends keyof O ? _Get<O[K1], Kr, F> : F :
    never 

  export type Get<O, P, F = undefined> =
    (P extends any[] ? _Get<O, P, F> : _Get<O, [P], F>) extends infer X
      ? A.Cast<X, any>
      : never

  export type KeyWithValue<O, V> =
    { [K in keyof O]: O[K] extends V ? K : never }[keyof O]

  export type Mergify<T extends object> = { [K in keyof T]: T[K] }
  export type Omit<O, L> = { [K in Exclude<keyof O, L>]: O[K] }

  export type Update<A, B> =
    A.Clean<
      & { [K in U.Exclude<keyof A, keyof B>]: A[K] }
      & { [K in keyof B]: B[K] }
    >

  export type Defaults<A, B> =
    Update<A, { [K in keyof B]: O.Get<A, K, B[K]> }>


  export type FromEntries<A> =
    U.ToIntersection<
      O.Get<{
        [I in keyof A]:
          { [_ in A.Cast<O.Get<A[I], 0>, keyof any>]: O.Get<A[I], 1> }
      }, number>
    >
}

export namespace L {
  export type Assert<T> = A.Cast<T, A.Tuple>;
  export type Concat<A, B> = [...L.Assert<A>, ...L.Assert<B>]
  export type Push<A, X> = [...L.Assert<A>, X];
  export type Popped<A> =
    A extends [] ? [] :
    A extends [...infer Popped, any] ? Popped : never
  export type Pop<A> =
    A extends [] ? undefined : 
    A extends [...L.Popped<A>, infer X] ? X : never;
  export type Shifted<A> =  
    A extends [] ? [] :
    A extends [any, ...infer Shifted] ? Shifted : never
  export type Shift<A> =
    A extends [] ? undefined : 
    A extends [infer X, ...infer _] ? X : never;
  export type Unshift<A, X> = [X, ...L.Assert<A>]

  export type ConcatAll<Ls> =
    Ls extends [] ? [] :
    Ls extends [infer A] ? A :
    Ls extends [infer A, infer B, ...infer X] ? ConcatAll<[L.Concat<A, B>, ...X]> :
    never
  
  export type Join<L, D> =
    L extends [] ? "" :
    L extends [infer H, ...infer T]
      ? T extends [] ? H : `${S.Assert<H>}${S.Assert<D>}${Join<T, D>}` :
    string;

  export type ReadonlyOf<L> = readonly [...L.Assert<L>];

  export type Filter<L, X = Filter.Out> =
    L extends [] ? [] :
    L extends [infer H, ...infer T]
      ? H extends X
        ? Filter<T, X>
        : [H, ...Filter<T, X>]
      : never
  export namespace Filter {
    declare const Out: unique symbol;
    export type Out = typeof Out;
  }

  export type Includes<A, X> = X extends O.Get<A, number> ? true : false;

  export type DistributeThenFilter<L, X> =
    L extends any ? Filter<L, X> : never;

  export type Subtract<A, B> = Filter<A, O.Get<B, number>>

  export type HaveIntersection<A, B> =
    [O.Get<A, number> & O.Get<B, number>] extends [never]
      ? false
      : true

  export type Every<A> =
    A extends [] ? true :
    A.AreEqual<U.ToIntersection<O.Get<A, number>>, true>

  export type Some<A> =
    B.Not<A.AreEqual<O.Get<A, number>, false>>

  export type LiftElementUnion<A> = 
    A extends [] ? [] :
    A extends [infer H, ...infer T] ?
      H extends any ? [H, ...LiftElementUnion<T>] : never :
    never;

  Type.tests([
    Type.areEqual<
      LiftElementUnion<["a" | "b", "x" | "y"]>,
      | ["a", "x"]
      | ["a", "y"]
      | ["b", "x"]
      | ["b", "y"]
    >()
  ])  

  export type Update<A, _B,
    B = U.ToIntersection<{
      [K in keyof _B]:
        { [_ in `${N.Assert<K>}`]: _B[K] }
    }[keyof _B]>
  > =
    { [I in keyof A]: I extends keyof B ? B[I] : A[I] }

  export type FilterDuplicates<A> =
    L.Filter<{ [I in keyof A]:
      L.Some<{ [K in keyof A]:
        N.IsGreaterThanOrEqual<N.FromString<K>, N.FromString<I>> extends true ? false :
        A[K] extends A[I] ? true :
        false
      }> extends true
        ? L.Filter.Out
        : A[I]
    }>

  export type IsLiteral<T> = B.Not<A.AreEqual<O.Get<T, "length">, number>>

  export type ConcatS<A, B> = 
    O.Get<B, "length"> extends 0 ? A :
    B extends [infer H, ...infer T]
      ? L.Includes<A, H> extends B.True
          ? ConcatS<A, T>
          : ConcatS<[...L.Assert<A>, H], T>
      : never

  Type.tests([
    Type.areEqual<L.ConcatS<["a", "b", "c"], ["d", "a", "e"]>, ["a", "b", "c", "d", "e"]>()
  ])

  export type AnyContaining<X> =
    | [...any[], X]
    | [...any[], X, any]
    | [...any[], X, any, any]
    | [...any[], X, any, any, any]
    | [...any[], X, any, any, any, any]
    | [...any[], X, any, any, any, any, any]
}

export namespace A {
  export type Cast<T, U> = T extends U ? T : U;
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = T[] | [T];
  export type StringTuple = A.Tuple<A.String>;
  export type ReadonlyTuple<T> = readonly T[] | readonly [T]
  export type TupleOrUnit<T = any> = T | Tuple<T>;
  export type Object = object;
  export type String = string;
  export type Number = number;

  export type InferNarrowest<T> =
    T extends any
      ? ( T extends A.Tuple ? readonly [...L.Assert<T>] :
          T extends A.Function ? T :
          T extends A.Object ? { readonly [K in keyof T]: InferNarrowest<T[K]> } :
          T
        )
      : never

  export type AreEqual<A, B> =
    (<T>() => T extends B ? 1 : 0) extends (<T>() => T extends A ? 1 : 0)
      ? true
      : false;

  export type DoesExtend<A, B> = A extends B ? true : false;

  export type Clean<T> =
    T extends any
      ? A.IsPlainObject<T> extends true ? { [K in keyof T]: Clean<T[K]> } : T
      : never;

  export type IsPlainObject<T> =
    T extends A.Object
      ? T extends A.Function ? false : true
      : false

  export type IsAny<T> = 0 extends (1 & T) ? true : false
  
  export type IsUnknown<T> =
    [T] extends [never] ? false :
    T extends unknown ? unknown extends T ? IsAny<T> extends false ? true :
    false : false : false

  export type IsConcrete<T> =
    B.Not<L.Some<[A.IsAny<T>, A.IsUnknown<T>, [T] extends [never] ? true : false]>>
}

export namespace U {
  export type IsUnit<T> = [U.Popped<T>] extends [never] ? B.True : B.False
  export type Popped<T> = U.Exclude<T, U.Pop<T>>
  export type Exclude<A, B> = A extends B ? never : A;

  export type Pop<T> =
    ToIntersection<T extends unknown ? (x: T) => void : never> extends (x: infer P) => void ? P : never

  export type ToIntersection<T> =
    (T extends unknown ? (k: T) => void : never) extends ((k: infer I) => void) ? I : never;

  export type ToList<T> =
    [T] extends [never]
      ? []
      : [...U.ToList<U.Popped<T>>, U.Pop<T>]
}

export namespace B {
  export type True = true;
  export type False = false;

  export type Not<B> = B extends true ? false : true;

  export type And<A, B> = L.Every<[A, B]>
}

export namespace F {
  export type Call<F> = F extends (...args: any[]) => infer R ? R : never;
}

export namespace S {
  export type String = string;
  export type Assert<T> = A.Cast<T, A.String>
  
  export type DoesStartWith<S, X> =
    S extends X ? B.True :
    S extends `${S.Assert<X>}${infer _}` ? B.True :
    B.False
  
  export type DoesContain<S, X> =
    S extends X ? B.True :
    S extends `${infer _}${S.Assert<X>}${infer __}` ? B.True :
    B.False

  export type Split<S, D> =
    S extends `${infer H}${S.Assert<D>}${infer T}` ? [H, ...Split<T, D>] : [S]

  export type Commas<S, L = U.ToList<S>> =
    O.Get<L, "length"> extends 0 ? "" :
    O.Get<L, "length"> extends 1 ? S.Assert<O.Get<L, 0>> :
    `${L.Join<L.Popped<L>, ",">} & ${S.Assert<L.Pop<L>>}`

  export type Shifted<S> = S extends `${infer _}${infer T}` ? T : ""; 

  export type Replace<S, What, With> =
    S extends `${infer P}${S.Assert<What>}${infer S}`
      ? `${P}${S.Assert<With>}${Replace<S, What, With>}`
      : S;

  type TagKey<S> = U.Exclude<keyof S, keyof string>;
  type Tag<S> = { [K in TagKey<S>]: O.Get<S, K> }
  export type Untag<S> = S extends (infer T) & Tag<S> ? T : never;

  Type.tests([
    Type.areEqual<Untag<"a" & { foo: true }>, "a">()
  ])
}

export namespace N {
  export type Assert<T> = A.Cast<T, A.Number>;
  export type PositiveIntegers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  export type NegativeIntegers = [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17, -18, -19, -20]
  export type PositiveIntegersUnshifted = L.Unshift<PositiveIntegers, 0>
  export type PositiveIntegersUnshiftedTwice = L.Unshift<PositiveIntegersUnshifted, -1>
  export type NegativeIntegersUnshifted = L.Unshift<NegativeIntegers, 0>
  export type NegativeIntegersUnshiftedTwice = L.Unshift<NegativeIntegersUnshifted, 1>
  
  export type IsNegative<N> = S.DoesStartWith<N.ToString<N>, "-">
  export type Negate<N> =
    N extends 0 ? 0 :
    IsNegative<N> extends true
      ? N.FromString<S.Shifted<N.ToString<N>>>
      : N.FromString<`-${N.Assert<N>}`>;
  
  export type ToString<X> = `${N.Assert<X>}`
  export type FromString<S> =
    S extends "0" ? 0 :
    S.DoesStartWith<S, "-"> extends false
      ? { [I in keyof PositiveIntegersUnshifted]:
            I extends S ? PositiveIntegersUnshifted[I] : never
        }[keyof PositiveIntegersUnshifted]
      : { [I in keyof NegativeIntegersUnshifted]:
            `-${I}` extends S ? NegativeIntegersUnshifted[I] : never
        }[keyof NegativeIntegersUnshifted]


  export type Increment<N> =
    IsNegative<N> extends false
      ? O.Get<PositiveIntegers, N>
      : O.Get<NegativeIntegersUnshiftedTwice, N.Negate<N>>

  export type Decrement<N> =
    IsNegative<N> extends false
      ? O.Get<PositiveIntegersUnshiftedTwice, N>
      : O.Get<NegativeIntegers, N.Negate<N>>

  export type Add<A, B> =
   B extends 0 ? A :
   A extends 0 ? B :
   [ IsNegative<A> extends true ? "-" : "+"
   , IsNegative<B> extends true ? "-" : "+"
   ] extends infer X
      ? X extends ["+", "+"] ? Add<Increment<A>, Decrement<B>> :
        X extends ["-", "-"] ? Add<Increment<A>, Decrement<B>> :
        X extends ["+", "-"] ? Add<Decrement<A>, Increment<B>> :
        X extends ["-", "+"] ? Add<Increment<A>, Decrement<B>> :
        never :
  never

  export type Subtract<A, B> =
    Add<A, Negate<B>>;
    
  export type IsLessThan<A, B> =
    [A, B] extends [0, 0] ? false :
    A extends 0 ? B.Not<IsNegative<B>> :
    B extends 0 ? IsNegative<A> :
    IsLessThan<Subtract<A, B>, 0>

  export type IsGreaterThanOrEqual<A, B> =
    B.Not<IsLessThan<A, B>>

  export type IsGreaterThan<A, B> =
    A extends B ? false :
    IsGreaterThanOrEqual<A, B>
}

export namespace Type {
  export declare const tests:
    (ts:
      [ true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
      ]) => void

  export declare const areEqual: <A, B>(f?: (b?: A) => void) => A.AreEqual<A, B>;
}
