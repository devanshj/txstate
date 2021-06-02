import { O, A, U, L, B, Type, S, F } from "../extras";
import MachineInstant from "../MachineInstant";
import { ReferencePathString } from "../universal";

export default MachineDefinition;
namespace MachineDefinition {
  export type Of<Definition> =
    & StateNode.Of<
        Definition, [],
        Precomputed.Of<Definition> extends infer P
          ? P & { "MachineInstantMap": MachineInstant.Map<Definition, P> }
          : never
      >
    & { context?: "TODO" };

  export namespace Precomputed {
    export type Get<
      Precomputed,
      Key extends
        | "ReferencePathString.OfId"
        | "ReferencePathString"
        | "IdMap"
        | "MachineInstantMap"
    > =
      O.Get<Precomputed, Key>

    export type Of<Definition> =
      { "ReferencePathString.OfId": ReferencePathString.Unresolved.OfIdWithRoot<Definition>
      , "ReferencePathString": ReferencePathString.WithRoot<Definition>
      , "IdMap": IdMap.WithRoot<Definition>
      }
  }

  export namespace StateNode {
    export type Of<
      Definition,
      Path,
      Precomputed,

      Self = O.Get<Definition, Path>,
      States = O.Get<Self, "states">,
      Type = O.Get<Self, "type", "compound">,
      On = O.Get<Self, "on">
    > =
      & { type?:
            | "compound"
            | "parallel"
            | "final"
            | "history"
            | "atomic"
        , states?:
          Type extends "atomic"
            ? "Error: atomic state node can't have states property"
            : { [StateIdentifier in keyof States]:
                  StateIdentifier extends A.String
                    ? S.DoesContain<StateIdentifier, "."> extends B.True
                        ? `Error: identifiers can't have '.' as it's use as a path delimiter`
                        : StateNode.Of<Definition, L.Concat<Path, ["states", StateIdentifier]>, Precomputed>
                    : `Error: only string identifiers allowed`
              }
        }
      & ( Type extends "atomic" ?
            { initial?: "Error: atomic state node can't have initial property" } :
          [keyof States] extends [never] ?
            { initial?: "Error: no states defined" } :
          Type extends "parallel" ?
            { initial?: undefined } :
          { initial: keyof States }
        )
      & { id?: Id.Of<Definition, L.Push<Path, "id">, Precomputed>
        , on?: 
            & { [EventIdentifier in keyof On]:
                  EventIdentifier extends A.String
                    ? Transition.Of<Definition, L.Concat<Path, ["on", EventIdentifier]>, Precomputed>
                    : "Error: only string identifier allowed"
              }
        , always?: Always.Of<Definition, L.Push<Path, "always">, Precomputed>
        , entry?:
            Entry.Of<Definition, L.Push<Path, "entry">, Precomputed>
        }


    export type Desugar<N, R> =
      { type: O.Get<N, "type",
          [keyof O.Get<N, "states", {}>] extends [never] ? "atomic" :
          keyof O.Get<N, "initial"> extends undefined ? "parallel" :
          "compound"
        >
      , initial:
          O.Get<N, "initial"> extends infer Initial
            ? Initial extends undefined ? undefined : 
              Initial extends A.Object ? {
                target: [ReferencePathString.Append<R, O.Get<Initial, "target">>],
                actions: Actions.Desugar<O.Get<Initial, "actions">, ReferencePathString.Append<R, "initial.actions">>
              } :
              { target: [ReferencePathString.Append<R, Initial>], actions: [] }
            : never
      , states: O.Get<N, "states", {}> extends infer States
          ? { [S in keyof States]: Desugar<States[S], ReferencePathString.Append<R, S>> }
          : never
      , id: O.Get<N, "id">
      , on: O.Get<N, "on", {}> extends infer On
          ? { [K in keyof On]: Transition.Desugar<On[K], ReferencePathString.Append<R, `on.${S.Assert<K>}`>> }
          : never
      , always: Transition.Desugar<O.Get<N, "always">, ReferencePathString.Append<R, "always">>
      , entry: Actions.Desugar<O.Get<N, "entry">, ReferencePathString.Append<R, "entry">>
      , exit: Actions.Desugar<O.Get<N, "exit">, ReferencePathString.Append<R, "exit">>
      , history: O.Get<N, "type"> extends "history" ? O.Get<N, "history", "shallow"> : undefined
      , target: O.Get<N, "target">
      }
  }

  export namespace Transition {

    export type Of<
        Definition,
        Path,
        Precomputed,

        Self = O.Get<Definition, Path>,
        StateNodePath = L.Popped<L.Popped<Path>>,
        IsRoot = O.Get<StateNodePath, "length"> extends 0 ? true : false,
        StateNode = O.Get<Definition, StateNodePath>,
        SiblingIdentifier = IsRoot extends true ? never : keyof O.Get<Definition, L.Popped<StateNodePath>>,
        TargetPathString =
          | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
          | ( ReferencePathString.WithRoot<StateNode, "", 2> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
          | ( [SiblingIdentifier] extends [never]
                ? never
                : SiblingIdentifier extends any
                    ? ReferencePathString.WithRoot<
                        O.Get<Definition, [...L.Popped<StateNodePath>, SiblingIdentifier]>,
                        SiblingIdentifier,
                        2
                      > extends infer X ? S.Assert<X> : never
                    : never
            )
      > =
        ( Self extends { target: any } ? never :
            ( Self extends A.Object[] ? never :
              | undefined
              | TargetPathString
              | ( Self extends A.ReadonlyTuple<TargetPathString>
                    ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, Path, Precomputed, StateNodePath>
                    : A.ReadonlyTuple<TargetPathString>
                )
            )
            | ( Self extends A.Object[]
                  ? L.ReadonlyOf<L.Assert<{
                      [K in keyof Self]:
                        { target?:
                            | undefined
                            | TargetPathString
                            | ( O.Get<Self[K], "target"> extends A.ReadonlyTuple<TargetPathString>
                                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Precomputed, StateNodePath>
                                  : A.ReadonlyTuple<TargetPathString>
                              )
                        , internal?: boolean
                        , guard?: any
                        }
                    }>>
                  : {
                      target:
                        | undefined
                        | TargetPathString
                        | A.ReadonlyTuple<TargetPathString>
                    }[]
              )
        )
        | { target?:
            | undefined
            | TargetPathString
            | ( Self extends { target: A.Tuple<TargetPathString> }
                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Push<Path, "target">, Precomputed, StateNodePath>
                  : A.Tuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          , guard?: any
          };


    export type Desugar<T, R> =
      ( T extends A.Object[] ? T :
        T extends A.Object ? [T] :
        T extends A.String | A.StringTuple ? [{ target: T }] :
        T extends undefined ? [] :
        never
      ) extends infer Ts
        ? { [K in keyof Ts]:
              { target:
                  O.Get<Ts[K], "target"> extends infer T
                    ? T extends A.StringTuple ? T : [T]
                    : never
              , internal: O.Get<Ts[K], "internal", false>
              , guard: O.Get<Ts[K], "guard", () => true>
              , actions: Actions.Desugar<O.Get<Ts[K], "actions">, R>
              , __referencePath: ReferencePathString.Append<R, K>
              }
          }
        : never
          
  }

  export namespace Always {
 
    export type Of<
        Definition,
        Path,
        Precomputed,
        
        Self = O.Get<Definition, Path>,
        StateNodePath = L.Popped<Path>, // TODO: only diff, try to reuse Transition.Of
        IsRoot = O.Get<StateNodePath, "length"> extends 0 ? true : false,
        StateNode = O.Get<Definition, StateNodePath>,
        SiblingIdentifier = IsRoot extends true ? never : keyof O.Get<Definition, L.Popped<StateNodePath>>,
        TargetPathString =
          | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
          | ( ReferencePathString.WithRoot<StateNode, "", 2> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
          | ( [SiblingIdentifier] extends [never]
                ? never
                : SiblingIdentifier extends any
                    ? ReferencePathString.WithRoot<
                        O.Get<Definition, [...L.Popped<StateNodePath>, SiblingIdentifier]>,
                        SiblingIdentifier,
                        2
                      > extends infer X ? S.Assert<X> : never
                    : never
            )
      > =
        ( Self extends { target: any } ? never :
          | ( Self extends A.ReadonlyTuple<A.Object>
                ? L.ReadonlyOf<L.Assert<{
                    [K in keyof Self]:
                      { target?:
                          | undefined
                          | TargetPathString
                          | ( O.Get<Self[K], "target"> extends A.ReadonlyTuple<TargetPathString>
                                ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Precomputed, StateNodePath>
                                : A.ReadonlyTuple<TargetPathString>
                            )
                      , internal?: boolean
                      , guard?: any
                      }
                  }>>
                : A.ReadonlyTuple<{
                    target:
                      | undefined
                      | TargetPathString
                      | A.ReadonlyTuple<TargetPathString>
                  }>
            )
        )
        | { target?:
            | undefined
            | TargetPathString
            | ( Self extends { target: A.ReadonlyTuple<TargetPathString> }
                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Push<Path, "target">, Precomputed, StateNodePath>
                  : A.ReadonlyTuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          , guard?: any
          };

    export declare const $$Event: unique symbol;
    export type $$Event = typeof $$Event
  }

  export namespace ParallelReferencePathStrings {

      /*
      const regionRoot = node =>
        !node.parent ? node :
        node.parent.type === "parallel" ? node :
        regionRoot(node.parent)
  
      const isMultipleTargetValid = targets =>
        targets.some(i => target.some(j => isAncestor(i, j))) ? false :
        (roots => roots.length !== deduplicated(roots).length)(targets.map(regionRoot)) ? false :
        true
      */
  
      export type OfWithStateNodePath<
        Definition,
        Path,
        Precomputed,
        StateNodePath,

        Self = O.Get<Definition, Path>,
        StateReferencePathString = ReferencePathString.FromDefinitionPath<StateNodePath>,
        SelfResolved =
          { [I in keyof Self]:
              ReferencePathString.Unresolved.ResolveWithStateNode<
                Definition,
                Precomputed,
                Self[I],
                StateReferencePathString
              >
          },
        RegionRootOf =
          { [I in keyof SelfResolved]:
              ReferencePathString.RegionRoot<SelfResolved[I], Definition>
          }
      > =
        L.ReadonlyOf<{ [I in keyof Self]:
          [ | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsDescendant<O.Get<SelfResolved, J>, O.Get<SelfResolved, I>> extends B.True
                    ? Self[J]
                    : never
              }[number & keyof Self] extends infer Ancestors
                ? [Ancestors] extends [never]
                    ? never
                    : `Error: ${S.Assert<Self[I]>} is descendant of ${S.Commas<S.Assert<Ancestors>>}`
                : never)
            | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsAncestor<S.Assert<O.Get<SelfResolved, J>>, S.Assert<O.Get<SelfResolved, I>>> extends B.True
                    ? Self[J]
                    : never
              }[number & keyof Self] extends infer Descendants
                ? [Descendants] extends [never]
                    ? never
                    : `Error: ${S.Assert<Self[I]>} is ancestor of ${S.Commas<S.Assert<Descendants>>}` : never)
          , { [J in keyof Self]:
                J extends I ? never :
                O.Get<RegionRootOf, I> extends O.Get<RegionRootOf, J> ? Self[J] :
                never
            }[number & keyof Self] extends infer NodesWithCommonRegionRoot
              ? [NodesWithCommonRegionRoot] extends [never]
                  ? never
                  : `Error: ${S.Assert<Self[I]>} has region root same as that of ${
                      S.Commas<NodesWithCommonRegionRoot>
                    }`
              : never
          ] extends [infer AncestryError, infer RegionRootError]
            ? [AncestryError] extends [never]
                ? [RegionRootError] extends [never]
                  ? Self[I]
                  : RegionRootError
                : AncestryError
            : never
        }>
    }

  export namespace IdMap {
    export type WithRoot<StateNode> = 
        O.Mergify<O.Assert<U.ToIntersection<_WithRoot<StateNode>>>>
          
    type _WithRoot<
      StateNode,

      PathString = "",
      Id = O.Get<StateNode, "id">, 
      States = O.Get<StateNode, "states", {}>
    > = 
      | ( Id extends undefined ? {} : { [_ in S.Assert<PathString>]: Id } )
      | { [S in keyof States]:
            _WithRoot<O.Assert<States[S]>, ReferencePathString.Append<PathString, S.Assert<S>>>
        }[keyof States]

    Type.tests([
      Type.areEqual<
        IdMap.WithRoot<{ id: "root", states: {
          a: { states: { a1: {}, a2: {} } },
          b: { states: { b1: {}, b2: { id: "bar" } } }
        } }>
        , { "": "root", "b.b2": "bar" }
      >()
    ])
  }

  export namespace Id {
    export type Of<
      Definition,
      Path,
      Precomputed,

      Self = O.Get<Definition, Path>,
      IdMap = Precomputed.Get<Precomputed, "IdMap">
    > =
      Self extends A.String
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, '${Self}' is already used`
        : "Ids should be strings"
  }

  export namespace Entry {
    export type Of<
      Definition,
      Path,
      Precomputed,
      Self = O.Get<Definition, Path>,
      NodeReferencePathString = ReferencePathString.FromDefinitionPath<L.Popped<Path>>,
      MachineInstantMap = Precomputed.Get<Precomputed, "MachineInstantMap">
    > =
      ( context: "TODO"
      , event: _EntryEvent<MachineInstantMap, NodeReferencePathString> extends { [_ in keyof any]: infer X } ? X : never
      ) => void

    type _EntryEvent<MachineInstantMap, NodeReferencePathString> =
      { [CE in keyof MachineInstantMap]:
        MachineInstantMap[CE] extends
          { actions:
              L.AnyContaining<
                { __referencePath: `${S.Assert<NodeReferencePathString>}.entry.0` }
              >
          } ? O.Get<MachineInstant.DecodeConfigurationEventPair<CE>, 1>
            : never
      }
  }


  export namespace Actions {
    export type Desugar<A, R, DefaultActionType = "actions"> =
      A extends undefined ? [] :
      (A extends any[] ? A : [A]) extends infer A
        ? { [I in keyof A]:
            ( A[I] extends A.String ? { type: A[I] } :
              A[I] extends A.Function ? {
                type:
                  A[I] extends { name: infer X }
                    ? string extends X ? DefaultActionType : X
                    : DefaultActionType,
                exec: A[I]
              } :
              A[I]
            ) & { __referencePath: ReferencePathString.Append<R, I> }
          }
        : never
  }
}
