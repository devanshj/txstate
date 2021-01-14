import { O, A, U, L, B, Test } from "ts-toolbelt";
export { O, A, U, L, B, Test, S };

declare module "Object/_api" {
  export type Assert<T> = A.Cast<T, A.Object>;

  export type Prop<T, K, F = undefined> =
    K extends keyof T
      ? A.Equals<T[K], undefined> extends B.True
        ? F
        : T[K]
      : F;
  
  export type KeyWithValue<O extends O.Object, V> =
    { [K in keyof O]: O[K] extends V ? K : never }[keyof O]

  export type DeepOmit<O extends O.Object, E extends PropertyKey> =
    { [K in U.Exclude<keyof O, E>]:
        O[K] extends object ? O.DeepOmit<O[K], E> : O[K]
    }
  
  export type Mergify<T extends object> = { [K in keyof T]: T[K] }
}


declare module "Any/_api" {
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = T[] | [T];
  export type ReadonlyTuple<T> = readonly T[] | readonly [T]
  export type TupleOrUnit<T = any> = T | Tuple<T>;
  export type Object = object;
  export type String = string;
  
  export type IsUndefined<T> = A.Equals<T, undefined>
  export type IsNever<T> = A.Equals<T, never>

  export type InferNarrowest<T> =
    T extends any
      ? ( T extends A.Tuple ? readonly [...A.Cast<T, any[]>] :
          T extends A.Function ? T :
          T extends A.Object ? { readonly [K in keyof T]: InferNarrowest<T[K]> } :
          T
        )
      : never
}

declare module "List/_api" {
  export type Assert<T> = A.Cast<T, A.Tuple>;

  export type ConcatAll<L extends L.List> =
    L.Flatten<L, 1, '1'>;
  
  export type Join<L extends L.List, D extends string> =
    L.List extends L ? string :
    L extends readonly [] ? "" :
    L extends readonly [any] ? `${L[0]}` :
    L extends readonly [any, ...infer T] ? `${L[0]}${D}${Join<T, D>}` :
    string;

  export type ReadonlyOf<L extends L.List> = readonly [...L];
  
}

declare module "Union/_api" {
  export type IsUnit<U extends U.Union> = A.IsNever<U.Pop<U>>
}

namespace S {
  export type String = string;
  export type Assert<T> = A.Cast<T, A.String>
  
  export type DoesStartWith<S extends S.String, X extends S.String> =
    S extends X ? B.True :
    S extends `${X}${infer _}` ? B.True :
    B.False
  
  export type DoesContain<S extends S.String, X extends S.String> =
    S extends X ? B.True :
    S extends `${infer _}${X}${infer __}` ? B.True :
    B.False

  export type Split<S extends S.String, D extends S.String> =
    S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S]

  export type Commas<S extends S.String, L extends L.List<S.String> = U.ListOf<S>> =
    L["length"] extends 0 ? "" :
    L["length"] extends 1 ? L[0] :
    `${L.Join<L.Pop<L>, ",">} & ${L.Last<L>}`

  export type Shift<S extends S.String> = S extends `${infer _}${infer T}` ? T : ""; 

  export type Replace<S extends S.String, What extends S.String, With extends S.String> =
    S extends `${infer P}${What}${infer S}`
      ? `${P}${With}${Replace<S, What, With>}`
      : S;
}
