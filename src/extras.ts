export namespace O {
  export type Assert<T> = A.Cast<T, A.Object>;

  export type KeyWithValue<O, V> =
    { [K in keyof O]: O[K] extends V ? K : never }[keyof O]

  export type Mergify<T> =
    { [K in keyof T]: T[K] }

  export type Update<A, B> =
    & { [K in U.Exclude<keyof A, keyof B>]: A[K] }
    & { [K in keyof B]: B[K] }

  export type Omit<T, K> =
    { [P in U.Exclude<keyof T, K>]: T[P] }

  export type Value<T> =
    T[keyof T]
}

export namespace L {
  export type Assert<T> = A.Cast<T, A.Tuple>;
  
  export type Concat<A, B> =
    [...L.Assert<A>, ...L.Assert<B>]
  
  export type Pushed<A, X> =
    [...L.Assert<A>, X];

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

  export type Unshift<A, X> =
    [X, ...L.Assert<A>]

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

  export type Includes<A, X> =
    A extends [] ? false :
    X extends A.Get<A, number> ? true : false;

  export type IncludesSubtype<A, X> =
    A extends [] ? false :
    A.Get<A, number> extends X ? true : false;

  export type Every<A> =
    A extends [] ? true :
    A.AreEqual<U.ToIntersection<A.Get<A, number>>, true>

  export type Some<A> =
    B.Not<A.AreEqual<A.Get<A, number>, false>>

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

  export type Get<T, I> =
    N.IsWhole<I> extends true
      ? A.Get<T, I>
      : A.Get<T, N.Add<I, A.Get<T, "length">>>
}

export namespace A {
  export type Cast<T, U> = T extends U ? T : U;
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = T[] | [T];
  export type TupleOrUnit<T> = T | Tuple<T>;

  export type TupleOrUnitOfStringLiteral<Self> =
    | [S.InferNarrowest<A.Get<Self, 0>>]
    | { [K in keyof Self]: S.InferNarrowest<Self[K]> }
    | (S.InferNarrowest<Self>)
  
  export type Object = object;
  export type String = string;
  export type Number = number;
  export type Universal =
    | string | number | boolean | undefined | null | bigint
    | object | ((...a: any[]) => any)
  export type Key = keyof any;
    

  export type Get<T, P, F = undefined> =
    P extends any[]
      ? P extends [] ?
          T extends undefined ? F : T :
        P extends [infer K1, ...infer Kr] ?
          K1 extends Get.Parameters ?
            F.Parameters<T, F> :
          K1 extends Get.Called ?
            F.Called<T, F> :
          K1 extends Get.Identity ?
            Get<T, [], F> :
          K1 extends keyof T ?
            Get<T[K1], Kr, F> extends infer X ? A.Cast<X, any> : never :
          F :
        never 
      : Get<T, [P], F>

  export namespace Get {
    declare const Parameters: unique symbol;
    export type Parameters = typeof Parameters;

    declare const Called: unique symbol;
    export type Called = typeof Called;

    declare const Identity: unique symbol;
    export type Identity = typeof Identity;
  }

  export type InferNarrowest<T> =
    T extends any
      ? ( T extends A.Function ? T :
          T extends A.Object ? InferNarrowestObject<T> :
          T
        )
      : never

  export type InferNarrowestObject<T> =
    { readonly [K in keyof T]: InferNarrowest<T[K]> }

  export type NoInfer<T> =
    [T][T extends any ? 0 : never]

  export type AreEqual<A, B> =
    (<T>() => T extends B ? 1 : 0) extends (<T>() => T extends A ? 1 : 0)
      ? true
      : false;

  export type DoesExtend<A, B> = A extends B ? true : false;
  export type IsPlainObject<T> =
    B.And<
      A.DoesExtend<T, A.Object>,
      B.Not<A.DoesExtend<T, A.Function>>
    >
  
  export declare const test: (o: true) => void;
  export declare const tests:
    (ts:
      [ true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
      ]) => void
  export declare const areEqual: <A, B>(f?: (b?: A) => void) => A.AreEqual<A, B>;

}

export namespace U {
  export type IsUnit<T> = [U.Popped<T>] extends [never] ? B.True : B.False
  export type Popped<T> = U.Exclude<T, U.Pop<T>>
  export type Exclude<A, B> = A extends B ? never : A;
  export type Extract<A, B> = A extends B ? A : never;

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
  export type Called<T, F = never> = T extends (...args: any[]) => infer R ? R : F;
  export type Parameters<T, F = never> = T extends (...args: infer A) => any ? A : F;
}

export namespace S {
  export type String = string;
  export type Assert<T> = A.Cast<T, A.String>
  export type InferNarrowest<T> = T extends string ? T : string
  export type IsLiteral<T> =
    T extends A.String
      ? A.String extends T
          ? false
          : true
      : false;
  
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
    A.Get<L, "length"> extends 0 ? "" :
    A.Get<L, "length"> extends 1 ? S.Assert<A.Get<L, 0>> :
    `${L.Join<L.Popped<L>, ",">} & ${S.Assert<L.Pop<L>>}`

  export type Shifted<S> = S extends `${infer _}${infer T}` ? T : ""; 

  export type Replace<S, What, With> =
    S extends `${infer P}${S.Assert<What>}${infer S}`
      ? `${P}${S.Assert<With>}${Replace<S, What, With>}`
      : S;
}

export namespace N {
  export type Assert<T> = A.Cast<T, A.Number>;
  export type PositiveIntegers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  export type NegativeIntegers = [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17, -18, -19, -20]
  export type PositiveIntegersUnshifted = L.Unshift<PositiveIntegers, 0>
  export type PositiveIntegersUnshiftedTwice = L.Unshift<PositiveIntegersUnshifted, -1>
  export type NegativeIntegersUnshifted = L.Unshift<NegativeIntegers, 0>
  export type NegativeIntegersUnshiftedTwice = L.Unshift<NegativeIntegersUnshifted, 1>
  
  export type IsWhole<N> = B.Not<IsNegative<N>>
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
            `-${N.Assert<I>}` extends S ? NegativeIntegersUnshifted[I] : never
        }[keyof NegativeIntegersUnshifted]


  export type Increment<N> =
    IsNegative<N> extends false
      ? A.Get<PositiveIntegers, N>
      : A.Get<NegativeIntegersUnshiftedTwice, N.Negate<N>>

  export type Decrement<N> =
    IsNegative<N> extends false
      ? A.Get<PositiveIntegersUnshiftedTwice, N>
      : A.Get<NegativeIntegers, N.Negate<N>>

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
