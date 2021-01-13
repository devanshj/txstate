import { O, A, U, L, B, Test, N } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D>>(definition: A.InferNarrowest<D>): D
}

export interface TXStateFlags {}

namespace MachineDefinition {
  export type Of<Definition extends A.Object> =
    O.Has<TXStateFlags, "noChecks"> extends B.True ? object :
    & StateNode.Of<Definition, []>
    & { context?: "TODO" };

  export namespace Cache {
    export type Get<
      Cache,
      Key extends
        | "TargetPath.OfId"
        | "TargetPath"
        | "IdMap"
        | "StaticTransitionMap"
        | "TransitionMap"
    > =
      O.Prop<Cache, Key>

    export type Of<Definition extends A.Object> =
      { "TargetPath.OfId": TargetPath.OfId.WithRoot<Definition>
      , "TargetPath": TargetPath.WithRoot<Definition>
      , "IdMap": IdMap.WithRoot<Definition>
      } extends infer Cache1
        ? ( & Cache1 
            & { "StaticTransitionMap": StaticTransitionMap.Of<Definition, [], O.Assert<Cache1>> }
          ) extends infer Cache2
              ? & Cache2
                & { "TransitionMap": TransitionMap.Of<Definition, O.Assert<Cache2>> }
              : never
        : never
  }

  export namespace StateNode {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Cache extends A.Object = Cache.Of<Definition>,
      Self extends A.Object = O.Assert<O.Path<Definition, Path>>,
      Initial = O.Prop<Self, "initial">,
      States = O.Prop<Self, "states">,
      Type = O.Prop<Self, "type", "compound">,
      Id = O.Prop<Self, "id">,
      On = O.Prop<Self, "on">,
      Always = O.Prop<Self, "always">
    > =
      & { type?:
            | "compound"
            | "parallel"
            | "final"
            | "history"
            | "atomic"
        , states?:
          A.Equals<Type, "atomic"> extends B.True
            ? "Error: atomic state node can't have states property"
            : { [StateIdentifier in keyof States]:
                  StateIdentifier extends string
                    ? S.DoesContain<StateIdentifier, "."> extends B.True
                        ? `Error: identifiers can't have '.' as it's use as a path delimiter`
                        : StateNode.Of<Definition, L.Concat<Path, ["states", StateIdentifier]>, Cache>
                    : `Error: only string identifiers allowed`
              }
        }
      & ( A.Equals<Type, "atomic"> extends B.True ?
            { initial?: "Error: atomic state node can't have initial property" } :
          A.Equals<States, undefined> extends B.True ?
            { initial?: "Error: no states defined" } :
          A.Equals<Type, "parallel"> extends B.True ?
            { initial?: undefined } :
          { initial: keyof States }
        )
      & { id?: Id.Of<Definition, L.Append<Path, "id">, Cache>
        , on?: 
            & { [EventIdentifier in keyof On]:
                  EventIdentifier extends string
                    ? Transition.Of<Definition, L.Concat<Path, ["on", EventIdentifier]>, Cache>
                    : "Error: only string identifier allowed"
              }
        , always?: Always.Of<Definition, L.Append<Path, "always">, Cache>
        , entry?: Entry.Of<Definition, L.Append<Path, "entry">, Cache>
        , __debugger?:
            { __Cache?: Partial<Cache> }
        }
      
    export type Any = A.Object;

  }

  export namespace Transition {
 
    export type Of<
        Definition extends A.Object,
        Path extends A.ReadonlyTuple<PropertyKey>,
        Cache extends A.Object,
        Self = O.Assert<O.Path<Definition, Path>>,
        StateNodePath extends A.ReadonlyTuple<PropertyKey> = A.Cast<L.Pop<L.Pop<Path>>, A.ReadonlyTuple<PropertyKey>>,
        StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>,
        TargetPathString =
          | keyof O.Prop<StateNode, "states">
          | `.${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">}`
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.OfId"> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath"> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">
          | (StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>>),
        IsRedundant = MachineSnapshot.IsRedundantTransition<
          Definition, Cache, NodePathString.FromPath<StateNodePath>, S.Assert<L.Last<Path>>
        >
      > =
        IsRedundant extends B.True ? `Error: this transition is redundant` :
        ( Self extends { target: any } ? never :
            ( Self extends object[] ? never :
              | undefined
              | TargetPathString
              | ( Self extends A.ReadonlyTuple<TargetPathString>
                    ? MultipleTargetPath.OfWithStateNodePath<Definition, Path, Cache, StateNodePath>
                    : A.ReadonlyTuple<TargetPathString>
                )
            )
            | ( Self extends object[]
                  ? L.ReadonlyOf<L.Assert<{
                      [K in keyof Self]:
                        { target?:
                            | undefined
                            | TargetPathString
                            | ( O.Prop<Self[K], "target"> extends A.ReadonlyTuple<TargetPathString>
                                  ? MultipleTargetPath.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Cache, StateNodePath>
                                  : A.ReadonlyTuple<TargetPathString>
                              )
                        , internal?: boolean
                        , cond?: any
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
                  ? MultipleTargetPath.OfWithStateNodePath<Definition, L.Append<Path, "target">, Cache, StateNodePath>
                  : A.Tuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          , cond?: any
          };
  }

  export namespace Always {
 
    export type Of<
        Definition extends A.Object,
        Path extends A.ReadonlyTuple<PropertyKey>,
        Cache extends A.Object,
        Self = O.Assert<O.Path<Definition, Path>>,
        StateNodePath extends A.ReadonlyTuple<PropertyKey> = L.Pop<Path>, // TODO: only diff, try to reuse Transition.Of
        StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>,
        TargetPathString =
          | keyof O.Prop<StateNode, "states">
          | `.${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">}`
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.OfId"> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath"> extends infer X ? X : never, A.ReadonlyTuple<PropertyKey>>, ".">
          | (StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>>),
        IsRedundant = MachineSnapshot.IsRedundantTransition<
            Definition, Cache, NodePathString.FromPath<StateNodePath>, Always.$$Event>
      > =
        IsRedundant extends B.True ? `Error: this transition causes infinite loop` :
        ( Self extends { target: any } ? never :
          | ( Self extends A.ReadonlyTuple<A.Object>
                ? L.ReadonlyOf<L.Assert<{
                    [K in keyof Self]:
                      { target?:
                          | undefined
                          | TargetPathString
                          | ( O.Prop<Self[K], "target"> extends A.ReadonlyTuple<TargetPathString>
                                ? MultipleTargetPath.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Cache, StateNodePath>
                                : A.ReadonlyTuple<TargetPathString>
                            )
                      , internal?: boolean
                      , cond?: any
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
                  ? MultipleTargetPath.OfWithStateNodePath<Definition, L.Append<Path, "target">, Cache, StateNodePath>
                  : A.ReadonlyTuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          , cond?: any
          };

    export declare const $$Event: unique symbol;
    export type $$Event = typeof $$Event
  }

  // NodePathString = Resolved TargetPathString
  export namespace NodePathString {
    export type RegionRoot<
      NodePathString extends string,
      RootNode extends A.Object,
      NodePath extends string[] = NodePathString.ToPath<NodePathString>,
      ParentNodePath extends string[] = L.Pop<L.Pop<NodePath>>,
      ParentNode extends A.Object = O.Assert<O.Path<RootNode, ParentNodePath>>,
      ParentNodePathString extends string = NodePathString.FromPath<ParentNodePath>
    > =
      O.Prop<ParentNode, "type", "compound"> extends "parallel" ? NodePath :
      ParentNodePath["length"] extends 0 ? [] :
      RegionRoot<ParentNodePathString, RootNode>

    export type IsDescendant<A extends string, B extends string> =
      S.DoesStartWith<B, A>

    export type IsAncestor<A extends string, B extends string> =
      IsDescendant<B, A>

    export type FromPath<Path extends A.ReadonlyTuple<PropertyKey>> =
      Path["length"] extends 0 ? "" :
      S.Replace<L.Join<Path, ".">, "states.", "">

    Test.checks([
      Test.check<FromPath<[]>, "", Test.Pass>(),
      Test.check<FromPath<["states", "a"]>, "a", Test.Pass>(),
      Test.check<FromPath<["states", "a", "states", "b"]>, "a.b", Test.Pass>()
    ])

    export type ToPath<PathString extends string> =
      PathString extends "" ? [] :
      ["states", ...S.Split<S.Replace<PathString, ".", ".states.">, ".">]

    Test.checks([
      Test.check<ToPath<"">, [], Test.Pass>(),
      Test.check<ToPath<"a">, ["states", "a"], Test.Pass>(),
      Test.check<ToPath<"a.b">, ["states", "a", "states", "b"], Test.Pass>(),
    ])


    
  }

  export namespace TargetPath {

    export type WithRoot<
      StateNode extends A.Object,
      Accumulator extends A.ReadonlyTuple<PropertyKey> = [],
      States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>,
      ChildStateIdentifier extends keyof States = keyof States
    > =
      | (A.Equals<Accumulator, []> extends B.True ? never : Accumulator)
      | { hasChildStates:
            ChildStateIdentifier extends any
              ? TargetPath.WithRoot<O.Assert<States[ChildStateIdentifier]>, [...Accumulator, ChildStateIdentifier]>
              : never
        , else: never
        }[A.IsNever<ChildStateIdentifier> extends B.False ? "hasChildStates" : "else"] 

    export namespace OfId {
      export type WithRoot<
        StateNode extends A.Object,
        Id = O.Prop<StateNode, "id", undefined>,
        PathForId extends string = A.IsUndefined<Id> extends B.True ? never : `#${S.Assert<Id>}`,
        States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>
      > =
        | (A.IsNever<PathForId> extends B.True ? never : [PathForId])
        | { hasChildStates:  
            | { [S in keyof States]: TargetPath.OfId.WithRoot<O.Assert<States[S]>> }[keyof States]
            | { hasId: 
                [ PathForId
                , ...(
                    TargetPath.WithRoot<StateNode> extends infer X
                      ? A.IsNever<X> extends B.True ? [] : A.Cast<X, A.ReadonlyTuple<PropertyKey>>
                      : never
                  )
                ]
              , else: never
              }[A.IsNever<PathForId> extends B.False ? "hasId" : "else"]
          , else: never
          }[A.IsNever<keyof States> extends B.False ? "hasChildStates" : "else"]
    }

  }

  export namespace MultipleTargetPath {

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
        Definition extends A.Object,
        Path extends A.ReadonlyTuple<PropertyKey>,
        Cache extends A.Object,
        StateNodePath extends A.ReadonlyTuple<PropertyKey>,
        Self extends A.ReadonlyTuple<string> = A.Cast<O.Path<Definition, Path>, A.ReadonlyTuple<string>>,
        StateNodePathString extends A.String = NodePathString.FromPath<StateNodePath>,
        SelfResolved extends A.ReadonlyTuple<A.String> =
          A.Cast<{ [I in keyof Self]:
            TargetPathString.ResolveWithStateNode<
              Definition,
              Cache,
              StateNodePathString,
              S.Assert<Self[I]>
            >
          }, A.ReadonlyTuple<string>>,
        RegionRootOf extends A.ReadonlyTuple<A.Tuple<A.String>> =
          A.Cast<{ [I in keyof SelfResolved]:
            NodePathString.RegionRoot<
              S.Assert<SelfResolved[I]>,
              Definition
            >
          }, A.ReadonlyTuple<A.Tuple<A.String>>>
      > =
        L.ReadonlyOf<L.Assert<{ [I in keyof Self]:
          [ | ({ [J in keyof Self]:
                  J extends I ? never : 
                  NodePathString.IsDescendant<S.Assert<O.Prop<SelfResolved, J>>, S.Assert<O.Prop<SelfResolved, I>>> extends B.True
                    ? Self[J]
                    : never
              }[number] extends infer Ancestors
                ? A.IsNever<Ancestors> extends B.False
                    ? `Error: ${S.Assert<Self[I]>} is descendant of ${S.Commas<S.Assert<Ancestors>>}`
                    : never
                : never)
            | ({ [J in keyof Self]:
                  J extends I ? never : 
                  NodePathString.IsAncestor<S.Assert<O.Prop<SelfResolved, J>>, S.Assert<O.Prop<SelfResolved, I>>> extends B.True
                    ? Self[J]
                    : never
              }[number] extends infer Descendants
                ? A.IsNever<Descendants> extends B.False
                    ? `Error: ${S.Assert<Self[I]>} is ancestor of ${S.Commas<S.Assert<Descendants>>}`
                    : never
                : never)
          , { [J in keyof Self]:
                J extends I ? never :
                O.Prop<RegionRootOf, I> extends O.Prop<RegionRootOf, J> ? Self[J] :
                never
            }[number] extends infer NodesWithCommonRegionRoot
              ? A.IsNever<NodesWithCommonRegionRoot> extends B.False
                  ? `Error: ${S.Assert<Self[I]>} has region root same as that of ${
                      S.Commas<S.Assert<NodesWithCommonRegionRoot>>
                    }`
                  : never
              : never
          ] extends [infer AncestryError, infer RegionRootError]
            ? A.IsNever<AncestryError> extends B.False ? AncestryError :
              A.IsNever<RegionRootError> extends B.False ? RegionRootError :
              Self[I]
            : never
        }>>
    }

  export namespace TargetPathString {
    export type ResolveWithStateNode<
      Definition extends A.Object,
      Cache extends A.Object,
      StateNodePathString extends string,
      TargetPathString extends string,
      SiblingStateIdentifier = keyof O.Prop<O.Path<Definition, NodePathString.ToPath<StateNodePathString>>, "states">
    > =
      S.Assert<
        S.DoesStartWith<TargetPathString, "#"> extends B.True
          ? S.DoesContain<TargetPathString, "."> extends B.True
              ? TargetPathString extends `#${infer Id}.${infer RestPath}`
                  ? O.KeyWithValue<
                      O.Assert<Cache.Get<Cache, "IdMap">>,
                      Id
                    > extends infer IdNodePath
                      ? IdNodePath extends "" ? RestPath : `${S.Assert<IdNodePath>}.${RestPath}`
                      : never
                  : never
              : O.KeyWithValue<
                  O.Assert<Cache.Get<Cache, "IdMap">>,
                  S.Shift<TargetPathString>
                > :
        S.DoesStartWith<TargetPathString, "."> extends B.True
          ? StateNodePathString extends ""
              ? S.Shift<TargetPathString>
              : `${StateNodePathString}${TargetPathString}` :
        B.Not<S.DoesContain<TargetPathString, ".">> extends B.True
          ? StateNodePathString extends ""
              ? TargetPathString :
            TargetPathString extends SiblingStateIdentifier
              ? L.Join<
                  L.Append<
                    L.Pop<S.Split<StateNodePathString, ".">>,
                    TargetPathString
                  >, "."
                > :
            TargetPathString
        : TargetPathString
      >
  }


  export namespace IdMap {
    export type WithRoot<
        StateNode extends A.Object,
        PathString extends string = "",
        Id = O.Prop<StateNode, "id">, 
        States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>
      > = 
        & (A.Equals<Id, undefined> extends B.True
            ? {}
            : { [_ in PathString]: Id }
          )
        & { hasChildStates:
              U.IntersectOf<{
                [S in keyof States]: IdMap.WithRoot<O.Assert<States[S]>, PathString extends "" ? S : `${PathString}.${S.Assert<S>}`>
              }[keyof States]>
          , else: {}
          }[A.IsNever<keyof States> extends B.False ? "hasChildStates" : "else"]
  }

  export namespace Id {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Cache extends A.Object,
      Self = O.Path<Definition, Path>,
      IdMap extends A.Object = O.Assert<Cache.Get<Cache, "IdMap">>
    > =
      Self extends string
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, '${Self}' is already used`
        : "Ids should be strings"
  }

  export namespace StaticTransitionMap {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Cache extends A.Object,
      StateNode = O.Path<Definition, Path>,
      StateNodePathString extends A.String = NodePathString.FromPath<Path>,
      On =
        & O.Prop<StateNode, "on", {}> 
        & ( O.Prop<StateNode, "always"> extends undefined
              ? {}
              : { [Always.$$Event]: O.Prop<StateNode, "always"> }
          ),
      States = O.Prop<StateNode, "states", {}>
    > =
      O.Mergify<
        & { [_ in StateNodePathString]:
            { [EventIdentifier in keyof On]:
              On[EventIdentifier] extends infer Target
                ? Target extends undefined
                    ? undefined :
                  Target extends (A.Tuple<A.Object> | A.Object)
                    ? (Target extends A.Tuple<A.Object> ? Target : [Target]) extends infer Target
                      ? | { [I in keyof Target]:
                              O.Prop<Target[I], "target"> extends infer TargetI
                                ? TargetI extends A.Tuple<A.String>
                                    ? { [J in keyof TargetI]:
                                          TargetPathString.ResolveWithStateNode<
                                            Definition, Cache, StateNodePathString, S.Assert<TargetI[J]>
                                          >
                                      }
                                    : TargetPathString.ResolveWithStateNode<Definition, Cache, StateNodePathString, S.Assert<TargetI>>
                                : never
                          }[A.Cast<number, keyof Target>]
                        | (Target extends A.Tuple<{ cond: any }> ? StateNodePathString : never)
                      : never :
                  Target extends A.Tuple<A.String>
                    ? { [K in keyof Target]:
                          TargetPathString.ResolveWithStateNode<Definition, Cache, StateNodePathString, S.Assert<Target[K]>>
                      } :
                  TargetPathString.ResolveWithStateNode<Definition, Cache, StateNodePathString, S.Assert<Target>>
                : never
            }
          }
        & U.IntersectOf<{ [ChildStateIdentifier in keyof States]: 
            StaticTransitionMap.Of<Definition, L.Concat<Path, ["states", ChildStateIdentifier]>, Cache>
          }[keyof States]>
      >

    type TestStaticTransitionMapOf<D extends A.Object> = StaticTransitionMap.Of<D, [], Cache.Of<D>>;

    Test.checks([
      Test.check<
        TestStaticTransitionMapOf<{
          initial: "enabled",
          states: {
            enabled: { on: { DISABLE: "#foo" } },
            disabled: { id: "foo", on: { ENABLE: "enabled" } }
          }
        }>,
        { "": {}
        , "enabled": { DISABLE: "disabled" }
        , "disabled": { ENABLE: "enabled" }
        },
        Test.Pass
      >(),
      Test.check<
        TestStaticTransitionMapOf<{
          initial: "a",
          states: {
            a: { on: { A: "#foo" } },
            b: {
              id: "foo",
              on: { B: [{ target: ["c.c1", "#bar"] }, { target: ".p" }], C: ".p" },
              initial: "p",
              states: {
                p: { on: { XYZ: { target: "#foo.q", cond: any } } },
                q: {}
              },
              always: [{ target: "#bar", cond: any }, { target: "a" }]
            },
            c: {
              type: "parallel",
              states: {
                c1: { on: { X: undefined } },
                c2: { id: "bar" }
              },
              always: { target: ["#foo"] }
            }
          },
          always: [{ target: "#foo.q", cond: any }, { target: "#foo", cond: any }]
        }>,
        { "": { [Always.$$Event]: "b.q" | "b" | "" }
        , "a": { A: "b" }
        , "b": { B:  ["c.c1", "c.c2"] | "b.p", C: "b.p", [Always.$$Event]: "c.c2" | "a" }
        , "b.p": { XYZ: "b.q" | "b.p" }
        , "b.q": {}
        , "c": { [Always.$$Event]: ["b"] }
        , "c.c1": { X: undefined }
        , "c.c2": {}
        },
        Test.Pass
      >(),

      Test.check<TestStaticTransitionMapOf<{
        initial: "a",
        states: {
          a: { on: { X: { target: "#foo" } } },
          b: {
            id: "foo",
            initial: "x",
            states: {
              x: { always: { target: "a" } }
            }
          }
        }
      }>,
      { "": {}
      , "a": { X: "b" }
      , "b": {}
      , "b.x": { [Always.$$Event]: "a" }
      },
      Test.Pass>()
    ])
  }


  namespace MachineSnapshot {

    export type Transition<
      Definition extends A.Object,
      Cache extends A.Object,
      InitialStateNodePathString extends A.String,
      Event extends A.String | Always.$$Event | null,
      VisitedStateNodePathStrings extends A.Tuple<A.String> = [],
      InitialStateNode extends A.Object = O.Assert<O.Path<Definition, NodePathString.ToPath<InitialStateNodePathString>>>,
      Initial extends A.String | undefined = A.Cast<O.Prop<InitialStateNode, "initial">, A.String | undefined>,
      StateNodeType = O.Prop<InitialStateNode, "type", "compound">,
      ChildStates = O.Prop<InitialStateNode, "states">,
      TransitionMap = Cache.Get<Cache, "StaticTransitionMap">,
      EventMap = O.Prop<TransitionMap, InitialStateNodePathString>,
      IsVisited = L.Includes<VisitedStateNodePathStrings, InitialStateNodePathString>,
      NextVisitedStateNodePathString extends A.Tuple<A.String> =
        L.Append<VisitedStateNodePathStrings, InitialStateNodePathString>
    > =
      IsVisited extends B.True ? 
        StateNodeType extends "parallel"
          ? U.ListOf<keyof ChildStates> extends infer NextStates
            ? { [K in keyof NextStates]:
                  Transition<
                    Definition,
                    Cache, 
                    InitialStateNodePathString extends ""
                      ? S.Assert<NextStates[K]>
                      : `${InitialStateNodePathString}.${S.Assert<NextStates[K]>}`,
                    null,
                    NextVisitedStateNodePathString
                  >
              }
            : never
          : InitialStateNodePathString :
      Event extends null
        ? ( Always.$$Event extends keyof EventMap
              ? Transition<
                  Definition,
                  Cache, 
                  InitialStateNodePathString,
                  Always.$$Event,
                  VisitedStateNodePathStrings
                > :
            Initial extends undefined
              ? StateNodeType extends "parallel"
                  ? U.ListOf<keyof ChildStates> extends infer NextStates
                    ? { [K in keyof NextStates]:
                          Transition<
                            Definition,
                            Cache, 
                            InitialStateNodePathString extends ""
                              ? S.Assert<NextStates[K]>
                              : `${InitialStateNodePathString}.${S.Assert<NextStates[K]>}`,
                            null,
                            NextVisitedStateNodePathString
                          >
                      }
                    : never
                  : InitialStateNodePathString :
            Transition<
              Definition,
              Cache, 
              InitialStateNodePathString extends ""
                ? S.Assert<Initial>
                : `${InitialStateNodePathString}.${S.Assert<Initial>}`,
              null,
              NextVisitedStateNodePathString
            >
          ) 
        : Event extends keyof EventMap
            ? EventMap[Event] extends undefined ? never :
              EventMap[Event] extends infer NextState
                ? NextState extends any 
                  ? (NextState extends A.Tuple<A.String> ? NextState : [NextState]) extends infer NextStates
                    ? { [K in keyof NextStates]:
                        Transition<Definition, Cache, S.Assert<NextStates[K]>, null, NextVisitedStateNodePathString>
                      }[A.Cast<number, keyof NextStates>]
                    : never
                  : never
                : never
            : never;

    export type TestTransition<
      D extends A.Object,
      I extends A.String,
      E extends A.String | Always.$$Event | null
    > = Transition<D, Cache.Of<D>, I, E>

    Test.checks([
      Test.check<
        TestTransition<{
          initial: "a",
          states: { a: {} }
        }, "", null>,
        "a",
        Test.Pass
      >(),

      Test.check<
        TestTransition<{
          initial: "a", states: { a: {
            initial: "b", states: { b: {
                initial: "c", states: { c: {} }
            } }
          } }
        }, "", null>,
        "a.b.c",
        Test.Pass
      >(),

      Test.check<
        TestTransition<{
          initial: "a",
          states: { a: {}, b: {} },
          always: [{ target: "b" }]
        }, "", null>,
        "b",
        Test.Pass
      >(),

      Test.check<
        TestTransition<{
          type: "parallel",
          states: { a: {}, b: {} }
        }, "", null>,
        ["a", "b"],
        Test.Pass
      >(),

      
      Test.check<
        TestTransition<{
          type: "parallel",
          states: { a: {}, b: {}, c: {} },
          always: { target: "c", cond: any }
        }, "", null>,
        ["a", "b", "c"] | "c",
        Test.Pass
      >(),
      

      Test.check<
        TestTransition<{
          initial: "a",
          states: { a: {}, b: { always: [{ target: "#foo" }] }, c: { id: "foo" } },
          on: { A: "b" }
        }, "", "A">,
        "c",
        Test.Pass
      >(),

      Test.check<
        TestTransition<{
          initial: "a",
          states: {
            a: { always: { target: "b" } },
            b: { always: { target: "a" } }
          }
        }, "", null>,
        "a",
        Test.Pass
      >(),


      Test.check<
        TestTransition<{
          initial: "a",
          states: {
            a: { always: { target: "b" } },
            b: { always: { target: "a", cond: any } }
          }
        }, "", null>,
        "a" | "b",
        Test.Pass
      >()

    ])

    


    export type IsRedundantTransition<
      Definition extends A.Object,
      Cache extends A.Object,
      InitialStateNodePathString extends A.String,
      Event extends A.String | Always.$$Event | null
    > =
      A.String extends InitialStateNodePathString ? B.Boolean :
      A.Equals<
        InitialStateNodePathString,
        Transition<Definition, Cache, InitialStateNodePathString, Event>
      >

    export type TestIsRedundantTransition<
      Definition extends A.Object, 
      InitialStateNodePathString extends A.String,
      Event extends A.String | Always.$$Event | null
    > = IsRedundantTransition<Definition, Cache.Of<Definition>, InitialStateNodePathString, Event>

    Test.checks([
      Test.check<
        TestIsRedundantTransition<{
          initial: "a",
          states: {
            a: { always: { target: "b" } },
            b: { always: { target: "a" } }
          }
        }, "a", Always.$$Event>,
        B.True,
        Test.Pass
      >(),

      Test.check<
        TestIsRedundantTransition<{
          initial: "a",
          states: {
            a: { on: { X: { target: "#foo" } } },
            b: { id: "foo", always: { target: "a" } }
          }
        }, "a", "X">,
        B.True,
        Test.Pass
      >(),

      Test.check<
        TestIsRedundantTransition<{
          initial: "a",
          states: {
            a: { on: { X: { target: "#foo" } } },
            b: { id: "foo", always: { target: "a", cond: any } }
          }
        }, "a", "X">,
        B.False,
        Test.Pass
      >(),

      Test.check<
        TestIsRedundantTransition<{
          initial: "a",
          states: {
            a: { on: { X: { target: "#foo" } } },
            b: {
              id: "foo",
              initial: "x",
              states: {
                x: { always: { target: "a" } }
              }
            }
          }
        }, "a", "X">,
        B.True,
        Test.Pass
      >()
      
    ])
  }

  export namespace TransitionMap {
    export type Of<
      Definition extends A.Object,
      Cache extends A.Object,
      StaticMap = Cache.Get<Cache, "StaticTransitionMap">
    > =
      { [State in keyof StaticMap]:
          { [Event in keyof StaticMap[State]]:
              MachineSnapshot.Transition<
                Definition, Cache, S.Assert<State>, A.Cast<Event, A.String | Always.$$Event>
              >
          }
      }
  }


  export namespace Entry {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Cache extends A.Object,
      Self = O.Assert<O.Path<Definition, Path>>,
      StateNodePathString extends A.String = NodePathString.FromPath<L.Pop<Path>>,
      TransitionMap = Cache.Get<Cache, "TransitionMap">,
      EventIdentifier = U.Exclude<{ [State in keyof TransitionMap]:
          { [Event in keyof TransitionMap[State]]:
              StateNodePathString extends TransitionMap[State][Event]
                ? Event
                : never
          }[keyof TransitionMap[State]]
      }[keyof TransitionMap], Always.$$Event>
    > =
      ( context: "TODO"
      , event: EventIdentifier extends any ? { type: EventIdentifier } : never
      ) => void
  }
}

namespace MachineHandle {
  export type Of<D, I> = {} // TODO;
}

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
    S extends `${infer Pr}${X}${infer Su}` ? B.True :
    B.False

  export type Split<S extends S.String, D extends S.String> =
    S extends `${infer H}${D}${infer T}` ? [H, ...Split<T, D>] : [S]

  export type Commas<S extends S.String, L extends L.List<S.String> = U.ListOf<S>> =
    L["length"] extends 0 ? "" :
    L["length"] extends 1 ? L[0] :
    `${L.Join<L.Pop<L>, ",">} & ${L.Last<L>}`

  export type Shift<S extends S.String> = S extends `${infer H}${infer T}` ? T : ""; 

  export type Replace<S extends S.String, What extends S.String, With extends S.String> =
    S extends `${infer P}${What}${infer S}`
      ? `${P}${With}${Replace<S, What, With>}`
      : S;
}
