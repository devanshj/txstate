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
}

export namespace L {
  export type Assert<T> = A.Cast<T, A.Tuple>;
  export type Concat<A, B> = [...L.Assert<A>, ...L.Assert<B>]
  export type Pushed<A, X> = [...L.Assert<A>, X];
  export type Popped<A> =
    A extends [] ? [] :
    A extends [...infer Popped, any] ? Popped : never
  export type Pop<A> =
    A extends [] ? never : 
    A extends [...L.Popped<A>, infer X] ? X : never;

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
      : [U.Pop<T>, ...U.ToList<U.Popped<T>>]
}

export namespace B {
  export type True = true;
  export type False = false;

  export type Not<B> = B extends true ? false : true;
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

  export type Shift<S> = S extends `${infer _}${infer T}` ? T : ""; 

  export type Replace<S, What, With> =
    S extends `${infer P}${S.Assert<What>}${infer S}`
      ? `${P}${S.Assert<With>}${Replace<S, What, With>}`
      : S;

}

export namespace Type {
  export declare const tests:
    (ts:
      [ true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
        true?, true?, true?, true?, true?,
      ]) => void

  export declare const areEqual: <A, B>(f?: (b?: B) => void) => A.AreEqual<A, B>;
}
