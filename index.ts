import { O, A, U, L, B } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: O.Identity<D>): MachineHandle.Of<D, {}>
  <D extends MachineDefinition.Of<D, I>, I extends MachineDefinition.Implementations.Of<D, I>>(
    definition: D,
    implementations: I
  ): MachineHandle.Of<D, I>
}

namespace MachineDefinition {
  export type Of<Definition extends A.Object, Implementations extends A.Object> =
    & StateNode.Of<Definition, Implementations, []>
    & { context?: "TODO" };


  export type FromCache<
    Cache,
    Key extends
      | "TargetPath.OfId.WithRoot<Definition>"
      | "TargetPath.WithRoot<Definition>"
      | "IdMap.WithRoot<Definition>"
  > =
    O.Prop<Cache, Key>

  export namespace StateNode {
    export type Of<
      Definition extends A.Object,
      Implementations extends A.Object,
      Path extends PropertyKey[],
      Cache =
        { "TargetPath.OfId.WithRoot<Definition>": TargetPath.OfId.WithRoot<Definition>
        , "TargetPath.WithRoot<Definition>": TargetPath.WithRoot<Definition>
        , "IdMap.WithRoot<Definition>": IdMap.WithRoot<Definition>
        },
      Self extends A.Object = A.Cast<O.Path<Definition, Path>, A.Object>,
      Initial = O.Prop<Self, "initial">,
      States = O.Prop<Self, "states">,
      Type = O.Prop<Self, "type", "compound">,
      Id = O.Prop<Self, "id">,
      On = O.Prop<Self, "on">,
      Delimiter = O.Prop<Self, "delimiter">,
    > =
      & (
        | & { type?:
              | "compound"
              | "parallel"
              | "final"
              | "history"
            , states?:
                & { [StateIdentifier in U.Intersect<keyof States, string>]:
                      StateNode.Of<Definition, Implementations, L.Concat<Path, ["states", StateIdentifier]>, Cache>
                  }
                & { [_ in U.Filter<keyof States, string>]?: "state identifiers should be strings" }
            }
          & (B.Not<A.Equals<States, undefined>> extends B.True
              ? { initial: A.Equals<Type, "parallel"> extends B.True ? undefined : keyof States } 
              : {}
            )
        | { type: "atomic"
          , initial?: never
          , states?: never
          }
        )
      & { id?: Id.Of<Definition, Implementations, L.Append<Path, "id">, Cache>
        , on?: 
            & { [EventIdentifier in U.Intersect<keyof On, string>]:
                  Transition.Of<Definition, Implementations, L.Concat<Path, ["on", EventIdentifier]>, Cache>
              }
            & { [EventIdentifier in U.Filter<keyof On, string>]: "event identifiers should be strings" }
        , delimiter?:
            Delimiter extends string
              ? Delimiter
              : "Delimiter should be string"
        }
      
    export type Any = A.Object;

  }

  export namespace Transition {

    export type Of<
        Definition extends A.Object,
        Implementations extends A.Object,
        Path extends PropertyKey[],
        Cache extends A.Object,
        Self = A.Cast<O.Path<Definition, Path>, A.Object>,
        StateNode extends A.Object = A.Cast<O.Path<Definition, L.Pop<L.Pop<Path>>>, A.Object>,
        Delimiter extends string = A.Cast<O.Prop<StateNode, "delimiter", ".">, string>,
        TargetPathStringInternal = 
          | keyof O.Prop<StateNode, "states">
          | `${Delimiter}${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, PropertyKey[]>, Delimiter>}`,
        TargetPathStringExternal =
          | L.Join<A.Cast<FromCache<Cache, "TargetPath.OfId.WithRoot<Definition>">, PropertyKey[]>, Delimiter>
          | L.Join<A.Cast<FromCache<Cache, "TargetPath.WithRoot<Definition>">, PropertyKey[]>, Delimiter>
      > =
        | TargetPathStringInternal
        | TargetPathStringExternal
        | (
          & (
            | { target: TargetPathStringInternal
              , internal?: boolean
              }
            | { target: TargetPathStringExternal
              , internal?: false
              }
            )
          & {}
          )
  }

  export namespace TargetPath {

    export type WithRoot<
      StateNode extends A.Object,
      Accumulator extends PropertyKey[] = [],
      States extends A.Object = O.Prop<StateNode, "states", {}>,
      ChildStateIdentifier extends keyof States = keyof States
    > =
      | (A.Equals<Accumulator, []> extends B.True ? never : Accumulator)
      | { hasChildStates:
            ChildStateIdentifier extends any
              ? TargetPath.WithRoot<States[ChildStateIdentifier], [...Accumulator, ChildStateIdentifier]>
              : never
        , else: never
        }[A.IsNever<ChildStateIdentifier> extends B.False ? "hasChildStates" : "else"] 

    export namespace OfId {
      export type WithRoot<
        StateNode extends A.Object,
        Id = O.Prop<StateNode, "id", undefined>,
        PathForId extends string = A.IsUndefined<Id> extends B.True ? never : `#${A.Cast<Id, string>}`,
        States extends A.Object = O.Prop<StateNode, "states", {}>
      > =
        | (A.IsNever<PathForId> extends B.True ? never : [PathForId])
        | { hasChildStates:  
            | { [S in keyof States]: TargetPath.OfId.WithRoot<States[S]> }[keyof States]
            | { hasId: 
                [ PathForId
                , ...(TargetPath.WithRoot<StateNode> extends infer X ? A.Cast<X, PropertyKey[]> : never)
                ]
              , else: never
              }[A.IsNever<PathForId> extends B.False ? "hasId" : "else"]
          , else: never
          }[A.IsNever<keyof States> extends B.False ? "hasChildStates" : "else"]
    }

    
  }

  export namespace IdMap {
    export type WithRoot<
        StateNode extends A.Object,
        PathString extends string = "",
        Id = O.Prop<StateNode, "id">, 
        States extends A.Object = O.Prop<StateNode, "states", {}>
      > = 
        & (A.Equals<Id, undefined> extends B.True
            ? {}
            : { [_ in PathString]: Id }
          )
        & { hasChildStates:
              U.IntersectOf<{
                [S in keyof States]: IdMap.WithRoot<States[S], PathString extends "" ? S : `${PathString}.${A.Cast<S, string>}`>
              }[keyof States]>
          , else: {}
          }[A.IsNever<keyof States> extends B.False ? "hasChildStates" : "else"]
  }

  export namespace Id {
    export type Of<
      Definition extends A.Object,
      Implementations extends A.Object,
      Path extends PropertyKey[],
      Cache extends A.Object,
      Self = A.Cast<O.Path<Definition, Path>, A.Object>,
      IdMap extends A.Object = A.Cast<FromCache<Cache, "IdMap.WithRoot<Definition>">, A.Object>
    > =
      Self extends string
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, '${Self}' is already used`
        : "Ids should be strings"
  }

  export namespace Implementations {
    export type Of<Definition extends A.Object, Implementations extends A.Object> =
      {} // TODO;
  }
}

namespace MachineHandle {
  export type Of<D, I> = {} // TODO;
}

declare module "Object/_api" {
  export type Prop<T, K, F = undefined> =
    K extends keyof T
      ? A.Equals<T[K], undefined> extends B.True
        ? F
        : T[K]
      : F;

  export type InferNarrowest<T> = {
    readonly [K in keyof T]:
      A.IsPlainObject<T[K]> extends B.True ? InferNarrowest<T[K]> :
      T[K] extends string ? string : // to force literal inference
      T[K] extends number ? number : 
      T[K] extends symbol ? symbol : 
      T[K] extends undefined ? undefined : 
      T[K] extends null ? null : 
      T[K] extends A.Function ? A.Function :
      never
  }
  
  export type KeyWithValue<O extends O.Object, V> =
    { [K in keyof O]: O[K] extends V ? K : never }[keyof O]

  export type DeepOmit<O extends O.Object, E extends PropertyKey> =
    { [K in U.Exclude<keyof O, E>]:
        O[K] extends object ? O.DeepOmit<O[K], E> : O[K]
    }

  export type Identity<O> =
    { [K in keyof O]:
        A.IsPlainObject<O[K]> extends B.True ? Identity<O[K]> : O[K]
    }
}


declare module "Any/_api" {
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = [T] | T[];
  export type TupleOrUnit<T = any> = T | Tuple<T>;
  export type Object = {}
  export type IsUndefined<T> = A.Equals<T, undefined>
  export type IsNever<T> = A.Equals<T, never>
  export type IsPlainObject<T> =
    T extends object ?
      T extends A.Function
        ? B.False
        : B.True
      : B.False;
}

declare module "List/_api" {
  export type ConcatAll<L extends L.List> =
    L.Flatten<L, 1, '1'>;
  
  export type Join<L extends L.List, D extends string> =
    L extends [] ? "" :
    L extends [any] ? `${L[0]}` :
    L extends [any, ...infer T] ? `${L[0]}${D}${Join<T, D>}` :
    string;
}

declare module "Union/_api" {
  export type IsUnit<U extends U.Union> = A.IsNever<U.Pop<U>>
}

namespace S {
  export type String = string;
  
  export type DoesStartWith<S extends S.String, X extends S.String> =
    S extends X ? B.True :
    S extends `${infer H}${infer T}` ? H extends X ? B.True : B.False :
    B.False
  
  export type DoesContain<S extends S.String, X extends S.String> =
    S extends X ? B.True :
    S extends `${infer Pr}${X}${infer Su}` ? B.True :
    B.False

  export type Shift<S extends S.String> = S extends `${infer H}${infer T}` ? T : "";
}
