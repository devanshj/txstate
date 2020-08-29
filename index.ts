import { O, A, U, L, B, F } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: D): MachineHandle.Of<D, {}>
  <D extends MachineDefinition.Of<D, I>, I extends MachineDefinition.Implementations.Of<D, I>>(
    definition: D,
    implementations: I
  ): MachineHandle.Of<D, I>

  dignose: 
    <D extends O.InferNarrowest<D>>(defintion: D) => D.Show<MachineDefinition.Dignostics.Of<A.Cast<D, object>, {}>>
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
      Self extends A.Object = A.Cast<O.Path<Definition, Path>, object>,
      Initial = O.Prop<Self, "initial">,
      States = O.Prop<Self, "states">,
      Type = O.Prop<Self, "type", "compound">,
      Id = O.At<Self, "id">
    > =
      & (
        | & { type?:
              | "compound"
              | "parallel"
              | "final"
              | "history"
            , states?:
                & { [StateIdentifier in U.Intersect<keyof O.At<Self, "states">, string>]:
                      StateNode.Of<Definition, Implementations, L.Concat<Path, ["states", StateIdentifier]>>
                  }
                & { [_ in U.Filter<keyof O.At<Self, "states">, string>]?: never }
            }
          & (B.Not<A.Equals<States, undefined>> extends B.True ? { initial: keyof States } : {})
        | { type: "atomic"
          , initial?: never
          , states?: never
          }
        )
      & { id?: string
        }

      export namespace Dignostics {
        export type Of<
          Definition extends A.Object,
          Implementations extends A.Object,
          Path extends PropertyKey[],
          Self extends A.Object = A.Cast<O.Path<Definition, Path>, object>
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
          StateNode extends A.Object = A.Cast<O.Path<Definition, Path>, object>,
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
            StateNode extends A.Object = A.Cast<O.Path<Definition, Path>, object>,
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
    
    export type Any = A.Object;
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
}

declare module "Any/_api" {
  export type Function = (...args: any[]) => any;
  export type Tuple<T = any> = [any] | any[];
  export type TupleOrUnit<T = any> = T | Tuple<T>;
  export type Object = {}
}

declare module "List/_api" {
  export type ConcatAll<L extends L.List> = L.Flatten<L, 1, '1'>;
}