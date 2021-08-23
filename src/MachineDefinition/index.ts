import { UnknownBehavior } from "../Behavior";
import { O, A, U, L, B, S, F } from "../extras";
import Machine from "../Machine";
import { ReferencePathString } from "../universal";

export default MachineDefinition;
namespace MachineDefinition { 
  export type Of<
    Global,
    Definition = A.Get<Global, "Definition">,
    ContextSchema = A.Get<Definition, ["schema", "context"]>,
    Context = A.Get<Definition, "context">
  > =
    & StateNode.Of<Global, []>
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
    & { context:
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
    & { [$$Self]?: Definition }

 
  export declare const $$Self: unique symbol;
  export type $$Self = typeof $$Self;
  export declare const $$Internal: unique symbol;
  export type $$Internal = typeof $$Internal;
  export type Internal<T> = { [$$Internal]: T }

  export type Desugar<D> =
    & StateNode.Desugar<D, "">
    & { [K in U.Extract<keyof D, "schema" | "context">]: D[K] }

  export namespace Precomputed {
    export type FromGlobal<
      Global,
      Key extends
        | "ReferencePathString.OfId"
        | "ReferencePathString"
        | "IdMap"
        | "DesugaredDefinition"
        | "InitialStateNodeReferencePathString"
    > =
      A.Get<Global, ["Precomputed", Key]>

    export type Of<Definition> =
      { "ReferencePathString.OfId": ReferencePathString.Unresolved.OfIdWithRoot<Definition>
      , "ReferencePathString": ReferencePathString.WithRoot<Definition>
      , "IdMap": IdMap.WithRoot<Definition>
      , "DesugaredDefinition": MachineDefinition.Desugar<Definition>
      } extends infer P
        ? & P
          & { "InitialStateNodeReferencePathString":
                Machine.InitialStateNodeReferencePathString.Of<{ Definition: Definition, Precomputed: P }>
            }
        : never
  }

  export namespace StateNode {
    export type Of<
      Global,
      Path,

      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>,
      States = A.Get<Self, "states">,
      Type = A.Get<Self, "type", "compound">,
      On = A.Get<Self, "on">,
      EventIdentifierSpec = A.Get<Definition, ["schema", "events", "type"], never>,
      IsAfterRecord = A.DoesExtend<A.Get<Self, ["after", "length"]>, undefined>,
      Context = Machine.Context.Of<Global>,
      Event = Machine.Event.Of<Global, "UseInferForSchema">
    > =
      & { type?:
          | "compound"
          | "parallel"
          | "final"
          | "history"
          | "atomic"
        }
      & ( Type extends "atomic" ?
            { initial?: "Error: atomic state node can't have initial property" } :
          [keyof States] extends [never] ?
            { initial?: "Error: no states defined" } :
          Type extends "parallel" ?
            { initial?: undefined } :
          { initial:
              Transition.OfWithStateNodePathContextEvent<
                Global, L.Pushed<Path, "initial">, 
                Path, Context, Event
              >
          }
        )
      & { states?:
            Type extends "atomic"
              ? "Error: atomic state node can't have states property"
              : { [StateIdentifier in keyof States]:
                    StateIdentifier extends A.String
                      ? S.DoesContain<StateIdentifier, "."> extends B.True
                          ? `Error: identifiers can't have '.' as it's use as a path delimiter`
                          : StateNode.Of<Global, L.Concat<Path, ["states", StateIdentifier]>>
                      : `Error: only string identifiers allowed`
                }
        , on?: 
            { [EventIdentifier in keyof On]:
                EventIdentifier extends A.String
                  ? L.Some<
                    [ A.DoesExtend<[EventIdentifierSpec], [never]>
                    , A.DoesExtend<EventIdentifier, EventIdentifierSpec>
                    ]> extends true
                      ? Transition.OfWithStateNodePathContextEvent<
                          Global, L.Concat<Path, ["on", EventIdentifier]>,
                          Path, Context, U.Extract<Event, { type: EventIdentifier }>
                        >
                      : `Error: ${EventIdentifier} is not included in schema.event`
                  : "Error: only string identifier allowed"
            }
        , always?:
            Transition.OfWithStateNodePathContextEvent<
              Global, L.Pushed<Path, "always">, 
              Path, Context, Event
            >
        , after?:
            | ( IsAfterRecord extends true ? never :
                Transition.OfWithStateNodePathContextEvent<
                  Global, L.Pushed<Path, "after">,
                  Path, Context, Event
                >
              )
            | { [N in keyof A.Get<Self, "after">]:
                  Transition.OfWithStateNodePathContextEvent<
                    Global, L.Concat<Path, ["after", N]>,
                    Path, Context, Event
                  >
              }
        , onDone?:
            Transition.OfWithStateNodePathContextEvent<
              Global, L.Pushed<Path, "onDone">,
              Path, Context, Machine.Event.ForDone.OfWithStateNodePath<Global, Path>
            >
        , _?: null
        , entry?:
            Execable.OfWithContextEvent<
              Global, L.Pushed<Path, "entry">,
              Context, Machine.Event.ForEntry.OfWithStateNodePath<Global, Path>, "IsAction"
            >
        , exit?:
            Execable.OfWithContextEvent<
              Global, L.Pushed<Path, "exit">,
              Context, Machine.Event.ForExit.OfWithStateNodePath<Global, Path>, "IsAction"
            >
        , invoke?: Invocation.OfWithStateNodePath<Global, L.Pushed<Path, "invoke">, Path>
        , id?: Id.Of<Global, L.Pushed<Path, "id">>
        , order?: number
        , meta?: unknown
        , strict?: boolean
        , history?:
            Type extends "history"
              ? "shallow" | "deep" | boolean
              : "Error: history can be only set for history nodes"
        , target?:
            Type extends "history"
              ? Transition.TargetWithStateNodePath<Global, L.Pushed<Path, "target">, Path>
              : "Error: target can be only set for history nodes"
        , data?:
            A.DoesExtend<Type, "final"> extends false
              ? "Error: data can be only set for final nodes" :
            | (( context: Machine.Context.Of<Global>
              , event: Machine.Event.Of<Global>
              ) => unknown)
            | { [K in A.String]:
                  | ( ( context: Machine.Context.Of<Global>
                      , event: Machine.Event.Of<Global>
                      ) => unknown
                    )
                  | U.Exclude<A.Universal, A.Function>
              }
        , tags?:
            A.TupleOrUnitOfStringLiteral<A.Get<Self, "tags">>
        }

    export type Desugar<N, R> =
      { type: A.Get<N, "type",
          [keyof A.Get<N, "states", {}>] extends [never] ? "atomic" :
          keyof A.Get<N, "initial"> extends undefined ? "parallel" :
          "compound"
        >
      , initial: Transition.Desugar<A.Get<N, "initial">>
      , states: A.Get<N, "states", {}> extends infer States
          ? { [S in keyof States]: Desugar<States[S], ReferencePathString.Append<R, S>> }
          : never
      , on: A.Get<N, "on", {}> extends infer On
          ? { [K in keyof On]: Transition.Desugar<On[K]>
            }
          : never
      , always: Transition.Desugar<A.Get<N, "always">>
      , after:
          A.Get<N, "after"> extends infer After
            ? After extends A.Tuple
                ? Transition.Desugar<After>
                : { [K in keyof After]:
                      Transition.Desugar<After>
                  }
            : never
      , onDone: Transition.Desugar<A.Get<N, "onDone">>
      , entry: Execable.Desugar<A.Get<N, "entry">, "entry">
      , exit: Execable.Desugar<A.Get<N, "exit">, "exit">
      , invoke: Invocation.Desugar<A.Get<N, "invoke">>
      , id: A.Get<N, "id">
      , order: A.Get<N, "order">
      , meta: A.Get<N, "meta">
      , strict: A.Get<N, "strict">
      , history: A.Get<N, "type"> extends "history" ? A.Get<N, "history", "shallow"> : undefined
      , target: A.Get<N, "target">
      , data: A.Get<N, "data">
      , tags: A.Get<N, "tags">
      }
  }

  export namespace Transition {
    export type OfWithStateNodePathContextEvent<
      Global,
      Path,
      StateNodePath,
      Context,
      Event,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>,
      IsInitial = A.DoesExtend<L.Pop<Path>, "initial">
    > =
      IsInitial extends true
        ? | TargetWithStateNodePath<Global, Path, StateNodePath>
          | TargetAndExtrasWithStateNodePathContextEvent<
              Global, Path,
              StateNodePath, Context, Event
            > :
      | TargetAndExtrasWithStateNodePathContextEvent<
          Global, Path,
          StateNodePath, Context, Event, Flags
        >
      | ( Self extends { target: any } ? never :
          | TargetWithStateNodePath<Global, Path, StateNodePath>
          | ( Self extends A.Tuple
                ? { [K in keyof Self]:
                      TargetAndExtrasWithStateNodePathContextEvent<
                        Global, L.Pushed<Path, K>,
                        StateNodePath, Context, Event, Flags
                      >
                  }
                : A.Tuple<TargetAndExtrasWithStateNodePathContextEvent<
                    Global, L.Pushed<Path, number>,
                    StateNodePath, Context, Event, "NoChecks" | Flags
                  >>
            )
        )

    export type TargetAndExtrasWithStateNodePathContextEvent<
      Global,
      Path,
      StateNodePath,
      Context,
      Event,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      IsAfter =
        L.Some<
          [ A.DoesExtend<L.Get<Path, -1>, "after">
          , A.DoesExtend<L.Get<Path, -2>, "after">
          ]>,
      IsAfterRecord = 
        A.DoesExtend<A.Get<Definition, L.Pushed<L.Popped<Path>, "length">>, undefined>
    > =
      { target:
          TargetWithStateNodePath<
            Global,
            L.Pushed<Path, "target">,
            StateNodePath,
            Flags
          >
      , guard?: Execable.OfWithContextEvent<
          Global, L.Pushed<Path, "guard">,
          Context, Event, "IsGuard"
        >
      , actions?: Execable.OfWithContextEvent<
          Global, L.Pushed<Path, "actions">,
          Context, Event, "IsAction"
        >
      , internal?: boolean
      , delay?:
          IsAfter extends true
            ? IsAfterRecord extends true
                ? `Error: delay is already set as ${A.Cast<L.Get<Path, -1>, A.Number | A.String>}`
                : | ( ( context: Machine.Context.Of<Global>
                      , event: Machine.Event.Of<Global>
                      ) => A.Number
                    )
                  | A.String
                  | A.Number
            : "Error: `delay` can be set only for `after` transitions"
      }

    export type TargetWithStateNodePath<
      Global,
      Path,
      StateNodePath,
      Flags = never,

      Definition = A.Get<Global, "Definition">,
      StateNode = A.Get<Definition, StateNodePath>,
      Self = A.Get<Definition, Path> extends infer X ? X : never,
      IsRoot = A.Get<StateNodePath, "length"> extends 0 ? true : false,
      SiblingIdentifier = IsRoot extends true ? never : keyof A.Get<Definition, L.Popped<StateNodePath>>,
      TargetPathString =
        | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
        | ( ReferencePathString.WithRoot<StateNode, "", 2> extends infer X ? S.Assert<X> : never )
        | ( Precomputed.FromGlobal<Global, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
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
      | ( "NoChecks" extends Flags ? TargetPathString :
          Self extends A.String
            ? TargetPathString
            : never
        )
      | ( "NoChecks" extends Flags ? A.Tuple<TargetPathString> :
          Self extends A.Tuple<TargetPathString>
            ? ParallelTargetPathStrings.OfWithStateNodePath<
                Global,
                Path,
                StateNodePath
              >
            : A.Tuple<TargetPathString>
        )

    export type Desugar<T> =
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
              , guard: Execable.Desugar<A.Get<Ts[K], "guard">, "guard">
              , actions: Execable.Desugar<A.Get<Ts[K], "actions">, "actions">
              , delay: A.Get<Ts[K], "delay">
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
        Global,
        Path,
        StateNodePath,

        Definition = A.Get<Global, "Definition">,
        Self = A.Get<Definition, Path>,
        StateReferencePathString = ReferencePathString.FromDefinitionPath<StateNodePath>,
        SelfResolved =
          { [I in keyof Self]:
              ReferencePathString.Unresolved.ResolveWithStateNode<
                Global,
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

    A.tests([
      A.areEqual<
        IdMap.WithRoot<{ id: "root", states: {
          a: { states: { a1: {}, a2: {} } },
          b: { states: { b1: {}, b2: { id: "bar" } } }
        } }>,
        { "": "root", "b.b2": "bar" }
      >()
    ])
  }

  export namespace Id {
    export type Of<
      Global,
      Path,
      Definition = A.Get<Global, "Definition">,

      Self = A.Get<Definition, Path>,
      IdMap = Precomputed.FromGlobal<Global, "IdMap">
    > =
      Self extends A.String
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, '${Self}' is already used`
        : "Ids should be strings"
  }

  export namespace Execable {
    export type OfWithContextEvent<
      Global,
      Path,
      Context,
      Event,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>
    > =
      | ( "IsImplementation" extends Flags ? never :
          ( "IsGuard" extends Flags ? never :
          | [ Unit<
                Global, L.Pushed<Path, 0>,
                Context, Event, "IsTupleElement" | Flags
              >
            ]
          | ( Self extends { type: unknown } | [{ type: unknown }] ? never :
              { [K in keyof Self]:
                  Unit<
                    Global, L.Pushed<Path, K>,
                    Context, Event, "IsTupleElement" | Flags
                  >
              }
            )
          )
        )
      | Unit<Global, Path, Context, Event, Flags>

    type Unit<
      Global, Path,
      Context, Event,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>
    > =
      | ( "IsImplementation" extends Flags ? never : S.InferNarrowest<Self> )
      | ( "IsAction" extends Flags
            ? Machine.XstateAction.InferralHint.OfWithAdjacentAction<
                Global,
                ( ( context: Context
                  , event: Event
                  , meta: "TODO"
                  ) => unknown
                )
              > :
          "IsGuard" extends Flags
            ? (context: Context, event: Event, meta: "TODO") => boolean :
          (context: Context, event: Event, meta: "TODO") => unknown
        )
      | ( { type:
              "IsImplementation" extends Flags
                ? A.String
                : S.InferNarrowest<A.Get<Self, "type">>
          , exec?:
              ( context: Context
              , event: Event
              , meta: "TODO"
              ) => unknown
          }
          & ( "IsTupleElement" extends Flags
                ? { [_ in A.String]: unknown }
                : { [_ in U.Exclude<keyof Self, "type" | "exec">]: unknown }
            )
        )

    export type Desugar<A, DefaultType> =
      A extends undefined ? [] :
      (A extends any[] ? A : [A]) extends infer A
        ? { [I in keyof A]:
              A[I] extends A.String ? { type: A[I] } :
              A[I] extends A.Function ? {
                type:
                  A[I] extends { name: infer X }
                    ? string extends X ? DefaultType : X
                    : DefaultType,
                exec: A[I]
              } :
              A[I]
          }
        : never
  }

  export namespace Invocation {
    export type OfWithStateNodePath<
      Global,
      Path,
      StateNodePath,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>
    > =
      | [ Unit<Global, L.Pushed<Path, 0>, StateNodePath> ]
      | ( Self extends A.Tuple
            ? { [K in keyof Self]: Unit<Global, L.Pushed<Path, K>, StateNodePath> }
            : never
        )
      | Unit<Global, Path, StateNodePath>

    type Unit<
      Global,
      Path,
      StateNodePath,
      Definition = A.Get<Global, "Definition">,
      Self = A.Get<Definition, Path>,
      Context = Machine.Context.Of<Global>,
      Event = Machine.Event.ForEntry.OfWithStateNodePath<Global, StateNodePath>
    > =
      | S.InferNarrowest<Self>
      | ( ( context: Context
          , event: Event
          ) => UnknownBehavior
        )
      | { src?:
            | S.InferNarrowest<A.Get<Self, "src">>
            | ( { type: S.InferNarrowest<A.Get<Self, ["src", "type"]>> }
              & { [_ in A.String]: unknown }
              )
            | ( ( context: Context
                , event: Event
                , meta: "TODO"
                ) => UnknownBehavior
              )
        , id?: S.InferNarrowest<A.Get<Self, "id">>
        , autoForward?: boolean
        , data?: // TODO
            | ( ( context: Context
                , event: Event
                ) => unknown
              )
            | { [K in A.Key]:
                  ( context: Context
                  , event: Event
                  ) => unknown
              }
        , onDone?: // TODO
            Transition.OfWithStateNodePathContextEvent<
              Global, L.Pushed<Path, "onDone">,
              StateNodePath, Context, Event
            >
        , onError?: // TODO
            Transition.OfWithStateNodePathContextEvent<
              Global, L.Pushed<Path, "onError">,
              StateNodePath, Context, Event
            >
        }

    export type Desugar<Is> =
      ( Is extends undefined ? [] :
        Is extends A.Tuple ? Is : [Is]
      ) extends infer Is
        ? { [K in keyof Is]:
              ( Is[K] extends A.String ? { src: { type: Is[K] } } :
                Is[K] extends A.Function ? { src: Is[K] } :
                Is[K]
              ) extends infer I
                ? { src:
                      A.Get<I, "src"> extends infer Src
                        ? Src extends A.String ? { type: Src } :
                          Src
                        : never
                  , id: A.Get<I, "id">
                  , autoForward: A.Get<I, "autoForward", false>
                  , data: A.Get<I, "data">
                  , onDone: Transition.Desugar<A.Get<I, "onDone">>
                  , onError: Transition.Desugar<A.Get<I, "onError">>
                  }
                : never
          }
        : never
  }
}
