import { O, A, U, L, B, Test, S } from "./extras";
import { ReferencePathString } from "./universal";

export default MachineDefinition;
namespace MachineDefinition {
  export type Of<Definition extends A.Object> =
    & StateNode.Of<Definition, [], Precomputed.Of<Definition>>
    & { context?: "TODO" };

  export namespace Precomputed {
    export type Get<
      Precomputed,
      Key extends
        | "ReferencePathString.OfId"
        | "ReferencePathString"
        | "IdMap"
        | "StaticTransitionMap"
        | "TransitionMap"
    > =
      O.Prop<Precomputed, Key>

    export type Of<Definition extends A.Object> =
      { "ReferencePathString.OfId": ReferencePathString.Unresolved.OfIdWithRoot<Definition>
      , "ReferencePathString": ReferencePathString.WithRoot<Definition>
      , "IdMap": IdMap.WithRoot<Definition>
      } extends infer Precomputed1
        ? ( & Precomputed1 
            & { "StaticTransitionMap": StaticTransitionMap.Of<Definition, [], O.Assert<Precomputed1>> }
          ) extends infer Precomputed2
              ? & Precomputed2
                & { "TransitionMap": TransitionMap.Of<Definition, O.Assert<Precomputed2>> }
              : never
        : never
  }

  export namespace StateNode {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Precomputed extends A.Object,

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
                        : StateNode.Of<Definition, L.Concat<Path, ["states", StateIdentifier]>, Precomputed>
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
      & { id?: Id.Of<Definition, L.Append<Path, "id">, Precomputed>
        , on?: 
            & { [EventIdentifier in keyof On]:
                  EventIdentifier extends string
                    ? Transition.Of<Definition, L.Concat<Path, ["on", EventIdentifier]>, Precomputed>
                    : "Error: only string identifier allowed"
              }
        , always?: Always.Of<Definition, L.Append<Path, "always">, Precomputed>
        , __debugger?:
            { __Precomputed?: Partial<Precomputed> }
        }
  }

  export namespace Transition {
 
    export type Of<
        Definition extends A.Object,
        Path extends A.ReadonlyTuple<PropertyKey>,
        Precomputed extends A.Object,

        Self = O.Assert<O.Path<Definition, Path>>,
        StateNodePath extends A.ReadonlyTuple<PropertyKey> = A.Cast<L.Pop<L.Pop<Path>>, A.ReadonlyTuple<PropertyKey>>,
        StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>,
        TargetPathString =
          | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString"> extends infer X ? S.Assert<X> : never )
          | ( StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>> )
      > =
        ( Self extends { target: any } ? never :
            ( Self extends object[] ? never :
              | undefined
              | TargetPathString
              | ( Self extends A.ReadonlyTuple<TargetPathString>
                    ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, Path, Precomputed, StateNodePath>
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
                                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Precomputed, StateNodePath>
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
                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Append<Path, "target">, Precomputed, StateNodePath>
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
        Precomputed extends A.Object,
        
        Self = O.Assert<O.Path<Definition, Path>>,
        StateNodePath extends A.ReadonlyTuple<PropertyKey> = L.Pop<Path>, // TODO: only diff, try to reuse Transition.Of
        StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>,
        ReferencePathString =
          | ( ReferencePathString.WithRoot<StateNode, "."> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString.OfId"> extends infer X ? S.Assert<X> : never )
          | ( Precomputed.Get<Precomputed, "ReferencePathString"> extends infer X ? S.Assert<X> : never )
          | ( StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>> )
      > =
        ( Self extends { target: any } ? never :
          | ( Self extends A.ReadonlyTuple<A.Object>
                ? L.ReadonlyOf<L.Assert<{
                    [K in keyof Self]:
                      { target?:
                          | undefined
                          | ReferencePathString
                          | ( O.Prop<Self[K], "target"> extends A.ReadonlyTuple<ReferencePathString>
                                ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Concat<Path, [K, "target"]>, Precomputed, StateNodePath>
                                : A.ReadonlyTuple<ReferencePathString>
                            )
                      , internal?: boolean
                      , cond?: any
                      }
                  }>>
                : A.ReadonlyTuple<{
                    target:
                      | undefined
                      | ReferencePathString
                      | A.ReadonlyTuple<ReferencePathString>
                  }>
            )
        )
        | { target?:
            | undefined
            | ReferencePathString
            | ( Self extends { target: A.ReadonlyTuple<ReferencePathString> }
                  ? ParallelReferencePathStrings.OfWithStateNodePath<Definition, L.Append<Path, "target">, Precomputed, StateNodePath>
                  : A.ReadonlyTuple<ReferencePathString>
              )
          , internal?: boolean // TODO: enforce false for external
          , cond?: any
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
        Definition extends A.Object,
        Path extends A.ReadonlyTuple<PropertyKey>,
        Precomputed extends A.Object,
        StateNodePath extends A.ReadonlyTuple<PropertyKey>,

        Self extends A.ReadonlyTuple<string> = A.Cast<O.Path<Definition, Path>, A.ReadonlyTuple<string>>,
        StateReferencePathString extends A.String = ReferencePathString.FromDefinitionPath<StateNodePath>,
        SelfResolved extends A.ReadonlyTuple<A.String> =
          A.Cast<{ [I in keyof Self]:
            ReferencePathString.Unresolved.ResolveWithStateNode<
              Definition,
              Precomputed,
              StateReferencePathString,
              S.Assert<Self[I]>
            >
          }, A.ReadonlyTuple<string>>,
        RegionRootOf extends A.ReadonlyTuple<A.Tuple<A.String>> =
          A.Cast<{ [I in keyof SelfResolved]:
            ReferencePathString.RegionRoot<
              S.Assert<SelfResolved[I]>,
              Definition
            >
          }, A.ReadonlyTuple<A.Tuple<A.String>>>
      > =
        L.ReadonlyOf<L.Assert<{ [I in keyof Self]:
          [ | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsDescendant<S.Assert<O.Prop<SelfResolved, J>>, S.Assert<O.Prop<SelfResolved, I>>> extends B.True
                    ? Self[J]
                    : never
              }[number] extends infer Ancestors
                ? A.IsNever<Ancestors> extends B.False
                    ? `Error: ${S.Assert<Self[I]>} is descendant of ${S.Commas<S.Assert<Ancestors>>}`
                    : never
                : never)
            | ({ [J in keyof Self]:
                  J extends I ? never : 
                  ReferencePathString.IsAncestor<S.Assert<O.Prop<SelfResolved, J>>, S.Assert<O.Prop<SelfResolved, I>>> extends B.True
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

  export namespace IdMap {
    export type WithRoot<StateNode extends A.Object> = 
        O.Mergify<O.Assert<U.IntersectOf<_WithRoot<StateNode>>>>
          
    type _WithRoot<
      StateNode extends A.Object,

      PathString extends string = "",
      Id = O.Prop<StateNode, "id">, 
      States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>
    > = 
      | ( A.IsUndefined<Id> extends B.True ? {} : { [_ in PathString]: Id } )
      | { [S in keyof States]:
            _WithRoot<O.Assert<States[S]>, ReferencePathString.Append<PathString, S.Assert<S>>>
        }[keyof States]

    Test.checks([
      Test.check<
        IdMap.WithRoot<{ id: "root", states: {
          a: { states: { a1: {}, a2: {} } },
          b: { states: { b1: {}, b2: { id: "bar" } } }
        } }>
        , { "": "root", "b.b2": "bar" }
        , Test.Pass
      >()
    ])
  }

  export namespace Id {
    export type Of<
      Definition extends A.Object,
      Path extends A.ReadonlyTuple<PropertyKey>,
      Precomputed extends A.Object,

      Self = O.Path<Definition, Path>,
      IdMap extends A.Object = O.Assert<Precomputed.Get<Precomputed, "IdMap">>
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
      Precomputed extends A.Object,

      StateNode = O.Path<Definition, Path>,
      StateReferencePathString extends A.String = ReferencePathString.FromDefinitionPath<Path>,
      On =
        & O.Prop<StateNode, "on", {}> 
        & ( O.Prop<StateNode, "always"> extends undefined
              ? {}
              : { [Always.$$Event]: O.Prop<StateNode, "always"> }
          ),
      States = O.Prop<StateNode, "states", {}>
    > =
      O.Mergify<
        & { [_ in StateReferencePathString]:
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
                                          ReferencePathString.Unresolved.ResolveWithStateNode<
                                            Definition, Precomputed, StateReferencePathString, S.Assert<TargetI[J]>
                                          >
                                      }
                                    : ReferencePathString.Unresolved.ResolveWithStateNode<Definition, Precomputed, StateReferencePathString, S.Assert<TargetI>>
                                : never
                          }[A.Cast<number, keyof Target>]
                        | (Target extends A.Tuple<{ cond: any }> ? StateReferencePathString : never)
                      : never :
                  Target extends A.Tuple<A.String>
                    ? { [K in keyof Target]:
                          ReferencePathString.Unresolved.ResolveWithStateNode<Definition, Precomputed, StateReferencePathString, S.Assert<Target[K]>>
                      } :
                  ReferencePathString.Unresolved.ResolveWithStateNode<Definition, Precomputed, StateReferencePathString, S.Assert<Target>>
                : never
            }
          }
        & U.IntersectOf<{ [ChildStateIdentifier in keyof States]: 
            StaticTransitionMap.Of<Definition, L.Concat<Path, ["states", ChildStateIdentifier]>, Precomputed>
          }[keyof States]>
      >

    type TestStaticTransitionMapOf<D extends A.Object> = StaticTransitionMap.Of<D, [], Precomputed.Of<D>>;

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

}
