import { O, A, U, L, B, Type, S, F } from "../extras";
import Machine from "../Machine";
import { ReferencePathString } from "../universal";

export default MachineDefinition;
namespace MachineDefinition { 
  export type Of<
    Definition,
    ContextSchema = A.Get<Definition, ["schema", "context"]>,
    Context = A.Get<Definition, "context">
  > =
    & StateNode.Of<
        Definition, [],
        Precomputed.Of<Definition>
      >
    & { schema?:
          { events?: 
              A.Get<Definition, ["schema", "events"]> extends { type: string }
                ? A.Get<Definition, ["schema", "events"]>
                : `Error: The type you provided does not extends { type: string }`
          , context?:
              A.IsPlainObject<A.Get<Definition, ["schema", "context"]>> extends true
                ? A.Get<Definition, ["schema", "context"]>
                : `Error: The type you is not an object`
          }
      }
    & { context?:
          ContextSchema extends undefined
            ? Context extends A.Function
                ? A.IsPlainObject<F.Called<Context>> extends true
                    ? Context
                    : () => `Error: context should be an object`
                : A.IsPlainObject<Context> extends true
                    ? Context
                    : `Error: context should be an object`
            : A.Get<Definition, "context"> extends A.Function
                ? () => A.Get<Definition, ["schema", "context"]>
                : A.Get<Definition, ["schema", "context"]>
      }
    & { [_ in $$Self]?: Definition }

 
  const $$Self = Symbol("$$Self")
  export type $$Self = typeof $$Self;


  export type Internal<T> =
    { [_ in $$Internal]: T }

  const $$Internal = Symbol("$$Internal")
  export type $$Internal = typeof $$Internal;

  export type Desugar<D> =
    & StateNode.Desugar<D, "">
    & { [K in U.Extract<keyof D, "schema" | "context">]: D[K] }

  export namespace Precomputed {
    export type Get<
      Precomputed,
      Key extends
        | "ReferencePathString.OfId"
        | "ReferencePathString"
        | "IdMap"
        | "DesugaredDefinition"
        | "InitialStateNodeReferencePathString"
    > =
      A.Get<Precomputed, Key>

    export type Of<Definition> =
      { "ReferencePathString.OfId": ReferencePathString.Unresolved.OfIdWithRoot<Definition>
      , "ReferencePathString": ReferencePathString.WithRoot<Definition>
      , "IdMap": IdMap.WithRoot<Definition>
      , "DesugaredDefinition": MachineDefinition.Desugar<Definition>
      } extends infer P
        ? & P
          & { "InitialStateNodeReferencePathString": Machine.InitialStateNodeReferencePathString.Of<Definition, P>
            }
        : never
  }

  export namespace StateNode {
    export type Of<
      Definition,
      Path,
      Precomputed,

      Self = A.Get<Definition, Path>,
      States = A.Get<Self, "states">,
      Type = A.Get<Self, "type", "compound">,
      On = A.Get<Self, "on">,
      EventIdentifierSpec = A.Get<Definition, ["schema", "events", "type"], never>
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
      & { id?: Id.Of<Definition, L.Pushed<Path, "id">, Precomputed>
        , on?: 
            { [EventIdentifier in keyof On]:
                EventIdentifier extends A.String
                  ? L.Some<
                    [ A.DoesExtend<[EventIdentifierSpec], [never]>
                    , A.DoesExtend<EventIdentifier, EventIdentifierSpec>
                    ]> extends true
                      ? Transition.OfWithStateNodePathAndEventType<
                          Definition,
                          L.Concat<Path, ["on", EventIdentifier]>,
                          Precomputed,
                          Path,
                          EventIdentifier
                        >
                      : `Error: ${EventIdentifier} is not included in schema.event`
                  : "Error: only string identifier allowed"
            }
        , always?: Transition.OfWithStateNodePathAndEventType<Definition, L.Pushed<Path, "always">, Precomputed, Path, "">
        , entry?: Entry.Of<Definition, L.Pushed<Path, "entry">, Precomputed>
        }

    export type Desugar<N, R> =
      { type: A.Get<N, "type",
          [keyof A.Get<N, "states", {}>] extends [never] ? "atomic" :
          keyof A.Get<N, "initial"> extends undefined ? "parallel" :
          "compound"
        >
      , initial:
          A.Get<N, "initial"> extends infer Initial
            ? Initial extends undefined ? undefined : 
              Initial extends A.Object ?
                { target: [ReferencePathString.Append<R, A.Get<Initial, "target">>]
                , actions:
                    Action.Desugar<
                      A.Get<Initial, "actions">,
                      ReferencePathString.Append<R, "initial.actions">
                    >
                } :
              { target: [ReferencePathString.Append<R, Initial>]
              , actions: []
              }
            : never
      , states: A.Get<N, "states", {}> extends infer States
          ? { [S in keyof States]: Desugar<States[S], ReferencePathString.Append<R, S>> }
          : never
      , id: A.Get<N, "id">
      , on: A.Get<N, "on", {}> extends infer On
          ? { [K in keyof On]:
                Transition.Desugar<
                  On[K],
                  ReferencePathString.Append<R, `on.${S.Assert<K>}`>
                >
            }
          : never
      , always: Transition.Desugar<A.Get<N, "always">, ReferencePathString.Append<R, "always">>
      , entry: Action.Desugar<A.Get<N, "entry">, ReferencePathString.Append<R, "entry">>
      , exit: Action.Desugar<A.Get<N, "exit">, ReferencePathString.Append<R, "exit">>
      , history: A.Get<N, "type"> extends "history" ? A.Get<N, "history", "shallow"> : undefined
      , target: A.Get<N, "target">
      }
  }

  export namespace Transition {

    export type OfWithStateNodePathAndEventType<
      Definition,
      Path,
      Precomputed,
      StateNodePath,
      EventType,
      Self = A.Get<Definition, Path>
    > =
      | TargetAndExtrasWithStateNodePathAndEventType<
          Definition, Path, Precomputed, StateNodePath, EventType
        >
      | ( Self extends { target: any } ? never :
          | TargetWithStateNodePath<Definition, Path, Precomputed, StateNodePath>
          | ( Self extends A.Tuple
              ? { [K in keyof Self]:
                    TargetAndExtrasWithStateNodePathAndEventType<
                      Definition, L.Pushed<Path, K>, Precomputed, StateNodePath, EventType
                    >
                }
              : A.Tuple<TargetAndExtrasWithStateNodePathAndEventType<
                  Definition, L.Pushed<Path, number>, Precomputed, StateNodePath, EventType, true
                >>
            )
        )

    type TargetAndExtrasWithStateNodePathAndEventType<
      Definition,
      Path,
      Precomputed,
      StateNodePath,
      EventType,
      NoChecks = false,
      Self = A.Get<Definition, Path>
    > =
      { target:
          TargetWithStateNodePath<
            Definition,
            L.Pushed<Path, "target">,
            Precomputed,
            StateNodePath,
            NoChecks
          >
      , actions?: Action.OfWithStateNodePathAndEventType<
          Definition, L.Pushed<Path, "actions">, Precomputed,
          StateNodePath, EventType
        >
      , internal?: boolean
      }

    type TargetWithStateNodePath<
      Definition,
      Path,
      Precomputed,
      StateNodePath,
      NoChecks = false,
      
      Self = A.Get<Definition, Path>,
      IsRoot = A.Get<StateNodePath, "length"> extends 0 ? true : false,
      StateNode = A.Get<Definition, StateNodePath>,
      SiblingIdentifier = IsRoot extends true ? never : keyof A.Get<Definition, L.Popped<StateNodePath>>,
      TargetPathString =
        | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
        | ( ReferencePathString.WithRoot<StateNode, "", 2> extends infer X ? S.Assert<X> : never )
        | ( Precomputed.Get<Precomputed, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
        | ( [SiblingIdentifier] extends [never]
              ? never
              : SiblingIdentifier extends any
                  ? ReferencePathString.WithRoot<
                      A.Get<Definition, [...L.Popped<StateNodePath>, SiblingIdentifier]>,
                      SiblingIdentifier,
                      2
                    > extends infer X ? S.Assert<X> : never
                  : never
          )
    > =
      | ( NoChecks extends true ? TargetPathString :
          Self extends A.String
            ? TargetPathString
            : never
        )
      | ( NoChecks extends true ? A.Tuple<TargetPathString> :
          Self extends A.Tuple<TargetPathString>
            ? ParallelTargetPathStrings.OfWithStateNodePath<
                Definition,
                Path,
                Precomputed,
                StateNodePath
              >
            : A.Tuple<TargetPathString>
        )

    export type Desugar<T, R> =
      ( T extends A.Object[] ? T :
        T extends A.Object ? [T] :
        T extends A.String | A.Tuple ? [{ target: T }] :
        T extends undefined ? [] :
        never
      ) extends infer Ts
        ? { [K in keyof Ts]:
              { target:
                  A.Get<Ts[K], "target"> extends infer T
                    ? T extends A.Tuple ? T : [T]
                    : never
              , internal: A.Get<Ts[K], "internal">
              , guard: A.Get<Ts[K], "guard", () => true>
              , actions: Action.Desugar<A.Get<Ts[K], "actions">, R>
              , __referencePath: ReferencePathString.Append<R, K>
              } extends infer Target
                ? O.Update<Target, {
                    internal: L.Every<{ [I in keyof A.Get<Target, "target">]: 
                      A.Get<Target, "target">[I] extends infer T
                        ? S.DoesStartWith<T, "."> extends true ? A.Get<Target, "internal", true> :
                          T extends undefined ? A.Get<Target, "internal", true> :
                          false
                        : never
                    }>
                  }>
                : false
          }
        : never
  }

  export namespace ParallelTargetPathStrings {

      /*
      const regionRoot = node =>
        !node.parent ? node :
        node.parent.type === "parallel" ? node :
        regionRoot(node.parent)
  
      const isParallelTargetValid = targets =>
        targets.some(i => target.some(j => isAncestor(i, j))) ? false :
        (roots => roots.length !== deduplicated(roots).length)(targets.map(regionRoot)) ? false :
        true
      */
  
      export type OfWithStateNodePath<
        Definition,
        Path,
        Precomputed,
        StateNodePath,

        Self = A.Get<Definition, Path>,
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
        { [I in keyof Self]:
          [
          | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsDescendant<
                    A.Get<SelfResolved, J>,
                    A.Get<SelfResolved, I>
                  > extends B.True
                    ? Self[J]
                    : never
              }[number & keyof Self] extends infer Ancestors
                ? [Ancestors] extends [never]
                    ? never
                    : `Error: ${S.Assert<Self[I]>} is descendant of ${S.Commas<S.Assert<Ancestors>>}`
                : never)
          | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsAncestor<
                    S.Assert<A.Get<SelfResolved, J>>,
                    S.Assert<A.Get<SelfResolved, I>>
                  > extends B.True
                    ? Self[J]
                    : never
              }[number & keyof Self] extends infer Descendants
                ? [Descendants] extends [never]
                    ? never
                    : `Error: ${S.Assert<Self[I]>} is ancestor of ${S.Commas<S.Assert<Descendants>>}`
                : never)
          , { [J in keyof Self]:
                J extends I ? never :
                A.Get<RegionRootOf, I> extends A.Get<RegionRootOf, J> ? Self[J] :
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
        }
  }

  export namespace IdMap {
    export type WithRoot<StateNode> = 
      O.Mergify<O.Assert<U.ToIntersection<_WithRoot<StateNode>>>>
          
    type _WithRoot<
      StateNode,
      PathString = "",

      Id = A.Get<StateNode, "id">, 
      States = A.Get<StateNode, "states", {}>
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

      Self = A.Get<Definition, Path>,
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

      Self = A.Get<Definition, Path>,
      NodeReferencePathString = ReferencePathString.FromDefinitionPath<L.Popped<Path>>,
    > =
      A.TupleOrUnitOfStringLiteralOr<
        ( context: "TODO"
        , event: Machine.EntryEventForStateNode.Of<
            Definition,
            Precomputed,
            NodeReferencePathString
          >
        ) => void,
        Self
      >
  }

  export namespace Action {
    export type OfWithStateNodePathAndEventType<
      Definition,
      Path,
      Precomputed,
      StateNodePath,
      EventType,
      Self = A.Get<Definition, Path>,
      Event = U.Extract<Machine.Event.Of<Definition, Precomputed>, { type: EventType }>
    > =
      | [ | S.InferNarrowest<A.Get<Self, 0>>
          | Machine.XstateAction.InferralHint.OfWithAdjacentAction<
              Definition, Precomputed,
              ((context: "TODO", event: Event) => unknown)
            >
          | ( { type: S.InferNarrowest<A.Get<Self, [0, "type"]>>
              , exec?: (context: "TODO", event: Event) => unknown
              }
            & { [_ in string]: unknown }
            )
        ]
      | ( Self extends { type: unknown } | [{ type: unknown }] ? never :
            { [K in keyof Self]:
                | S.InferNarrowest<Self[K]>
                | Machine.XstateAction.InferralHint.OfWithAdjacentAction<
                    Definition, Precomputed,
                    ((context: "TODO", event: Event) => unknown)
                  >
                | ( { type: S.InferNarrowest<A.Get<Self[K], "type">>
                    , exec?: (context: "TODO", event: Event) => unknown
                    }
                  & { [_ in string]: unknown }
                  )
            }
        )
      | S.InferNarrowest<Self>
      | Machine.XstateAction.InferralHint.OfWithAdjacentAction<
          Definition, Precomputed,
          ((context: "TODO", event: Event) => unknown)
        >
      | { type: S.InferNarrowest<A.Get<Self, "type">>
        , exec?: (context: "TODO", event: Event) => unknown
        }


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
