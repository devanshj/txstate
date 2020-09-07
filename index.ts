import { O, A, U, L, B, F, I, N, Test } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: D): MachineHandle.Of<D, {}>
  <D extends MachineDefinition.Of<D, I>, I extends MachineDefinition.Implementations.Of<D, I>>(
    definition: D,
    implementations: I
  ): MachineHandle.Of<D, I>

  dignose: 
    <D extends O.InferNarrowest<D>>(defintion: D) => D.Show<MachineDefinition.Dignostics.Of<A.Cast<D, A.Object>, {}>>
}

namespace MachineDefinition {
  export type Of<Definition extends A.Object, Implementations extends A.Object> =
    & StateNode.Of<Definition, Implementations, []>
    & { context?: "TODO" };


  export namespace Dignostics {
    export type Of<Definition extends A.Object, Implementations extends A.Object> =
      StateNode.Dignostics.Of<Definition, Implementations, []>
  }

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

    export namespace Dignostics {
      export type Of<
        Definition extends A.Object,
        Implementations extends A.Object,
        Path extends PropertyKey[],
        Self extends A.Object = A.Cast<O.Path<Definition, Path>, A.Object>
      > =
        [
          ...Initial<Definition, Implementations, Path>,
          ...({
            0: States<Definition, Implementations, Path>,
            1: []
          }[A.Equals<O.Prop<Self, "states", undefined>, undefined>])
        ];
      
      export type Initial<
        Definition extends A.Object,
        Implementations extends A.Object,
        Path extends PropertyKey[],
        StateNode extends A.Object = A.Cast<O.Path<Definition, Path>, A.Object>,
        Initial = O.Prop<StateNode, "initial">,
        States = O.Prop<StateNode, "states">,
        Type = O.Prop<StateNode, "type", "compound">
      > =
        B.And<A.Equals<Initial, undefined>, B.Not<A.Equals<States, undefined>>> extends B.True
          ? [D.WithPath<Path, "initial state is required">] :
        A.Equals<Initial, undefined> extends B.True
          ? [] :
        A.Equals<Type, "atomic"> extends B.True
          ? [ D.WithPath<L.Append<Path, "initial">
            , "The state node is atomic meaning no nested states, so can't have an initial property"> ] :
        A.Equals<States, undefined> extends B.True
          ? [ D.WithPath<L.Append<Path, "initial">
            , "There are no states defined hence can't have an initial state">] : 
        A.Contains<keyof States, number | symbol> extends B.True
          ? [] :
        B.Not<A.Contains<Initial, keyof States>> extends B.True
          ? [ D.WithPath<L.Append<Path, "initial">
            , ["state", O.At<StateNode, "initial">, "is not defined in states"]>] :
        [];

      export type States<
          Definition extends A.Object,
          Implementations extends A.Object,
          Path extends PropertyKey[],
          StateNode extends A.Object = A.Cast<O.Path<Definition, Path>, A.Object>,
          States = O.Prop<StateNode, "states">,
          Type = O.Prop<StateNode, "type", "compound">
        > =
          A.Equals<States, undefined> extends B.True ? [] :
          A.Equals<States, {}> extends B.True ? [] :
          [
            ...(
              A.Contains<keyof States, number | symbol> extends B.True
                ? [D.WithPath<L.Append<Path, "states">, "state identifiers should be only strings">]
                : []
            ),
            ...(
              B.And<A.Equals<Type, "atomic">, B.Not<A.Equals<States, undefined>>> extends B.True
                ? [ D.WithPath<L.Append<Path, "states">
                  , "The state node is atomic meaning no nested states, so can't have an states property">]
                : []
            ),
            ...(
              A.Equals<States, {}> extends B.True
                ? []
                : L.ConcatAll<U.ListOf<{
                    [S in keyof States]:
                      Of<Definition, Implementations, A.Cast<L.Concat<Path, ["states", S]>, PropertyKey[]>>
                  }[keyof States]>>
            ),
          ];
    }
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
        TargetPathInternal = 
          | keyof O.Prop<StateNode, "states">
          | `${Delimiter}${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, PropertyKey[]>, Delimiter>}`,
        TargetPathExternal =
          | L.Join<A.Cast<O.Prop<Cache, "TargetPath.OfId.WithRoot<Definition>">, PropertyKey[]>, Delimiter>
          | L.Join<A.Cast<O.Prop<Cache, "TargetPath.WithRoot<Definition>">, PropertyKey[]>, Delimiter>
      > =
        | TargetPathInternal
        | TargetPathExternal
        | { target: TargetPathInternal
          , internal?: boolean
          }
        | { target: TargetPathExternal
          , internal?: false
          }
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
        | [PathForId]
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
                [S in keyof States]: IdMap.WithRoot<States[S], `${PathString}.${A.Cast<S, string>}`>
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
      IdMap extends A.Object = A.Cast<O.Prop<Cache, "IdMap.WithRoot<Definition>">, A.Object>
    > =
      Self extends string
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, "${Self}" is already used`
        : "Ids should be strings"
  }

  export namespace Implementations {
    export type Of<Definition extends A.Object, Implementations extends A.Object> =
      {} // TODO;
  }
}

namespace D {
  export type WithPath<P extends PropertyKey[], M> =
    { error: M, at: A.Equals<P, []> extends B.True ? "root" : P }

  export type Show<T> = 
    A.Is<T, []> extends B.True
      ? "All good!"
      : { [I in keyof T]:
            T[I] extends { error: infer M, at: infer P }
              ? { error: M, at: P }
              : never
        };
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
      T[K] extends A.Object ? InferNarrowest<T[K]> :
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
}


declare module "Any/_api" {
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = [any] | any[];
  export type TupleOrUnit<T = any> = T | Tuple<T>;
  export type Object = {}
  export type IsUndefined<T> = A.Equals<T, undefined>
  export type IsNever<T> = A.Equals<T, never>
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