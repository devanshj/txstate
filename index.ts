import { O, A, U, L, B } from "ts-toolbelt";
import { P } from "Object/_api";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: D): MachineHandle.Of<D, {}>
  <D extends MachineDefinition.Of<D, I>, I extends MachineDefinition.Implementations.Of<D, I>>(
    definition: D,
    implementations: I
  ): MachineHandle.Of<D, I>

  dignose: 
    <D extends OE.DeepReadonly<D>>(defintion: D) => D.Show<MachineDefinition.Dignostics.Of<A.Cast<D, object>, {}>>
}

namespace MachineDefinition {
  export type Of<Definition extends object, Implementations extends object> =
    & StateNode.Of<Definition, Implementations, []>
    & { context?: "TODO" };


  export namespace Dignostics {
    export type Of<Definition extends object, Implementations extends object> =
      StateNode.Dignostics.Of<Definition, Implementations, []>
  }

  export namespace StateNode {
    export type Of<
      Definition extends object,
      Implementations extends object,
      Path extends string[],
      Self extends object = A.Cast<O.Path<Definition, Path>, object>,
      Initial = OE.At<Self, "initial">,
      States = OE.At<Self, "states">,
      Type = OE.At<Self, "type", "compound">,
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
                & { [_ in U.Filter<keyof O.At<Self, "states">, string>]?: never } // disallow non-string keys
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
          Definition extends object,
          Implementations extends object,
          Path extends PropertyKey[],
          Self extends object = A.Cast<O.Path<Definition, Path>, object>
        > = 
          [
            ...Initial<Definition, Implementations, Path>,
            ...(O.Has<Self, "states"> extends B.True
              ? States<Definition, Implementations, Path>
              : []
            )
          ];
        
        export type Initial<
          Definition extends object,
          Implementations extends object,
          Path extends PropertyKey[],
          StateNode extends object = A.Cast<O.Path<Definition, Path>, object>,
          Initial = OE.At<StateNode, "initial">,
          States = OE.At<StateNode, "states">,
          Type = OE.At<StateNode, "type", "compound">
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
            Definition extends object,
            Implementations extends object,
            Path extends PropertyKey[],
            StateNode extends object = A.Cast<O.Path<Definition, Path>, object>,
            States = OE.At<StateNode, "states">,
            Type = OE.At<StateNode, "type", "compound">
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
                  : L.Flatten<U.ListOf<{
                    [S in keyof States]:
                      Of_<Definition, Implementations, A.Cast<L.Concat<Path, ["states", S]>, PropertyKey[]>>
                  }[keyof States]>>
              ),
            ];

          export type Of_<
            Definition extends object,
            Implementations extends object,
            Path extends PropertyKey[],
            Self extends object = A.Cast<O.Path<Definition, Path>, object>
          > = 
            [
              ...Initial<Definition, Implementations, Path>,
              ...(O.Has<Self, "states"> extends B.True
                ? States_<Definition, Implementations, Path>
                : []
              )
            ];

          export type States_<
            Definition extends object,
            Implementations extends object,
            Path extends PropertyKey[],
            StateNode extends object = A.Cast<O.Path<Definition, Path>, object>,
            States = OE.At<StateNode, "states">,
            Type = OE.At<StateNode, "type", "compound">
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
              )
            ];
      }
  }

  export namespace Implementations {
    export type Of<Definition extends object, Implementations extends object> =
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

namespace OE {
  export type At<T, K, F = undefined> =
    K extends keyof T
      ? A.Equals<T[K], undefined> extends B.True
        ? F
        : T[K]
      : F;

  export type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : string
  }
}