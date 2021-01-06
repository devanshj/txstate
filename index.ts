import { O, A, U, L, B, Test } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: A.InferNarrowest<D>): D
  <D extends MachineDefinition.Of<D, I>, I extends MachineDefinition.Implementations.Of<D, I>>(
    definition: D,
    implementations: I
  ): MachineHandle.Of<D, I>
}

export interface TXStateFlags {}

namespace MachineDefinition {
  export type Of<Definition extends A.Object, Implementations extends A.Object> =
    O.Has<TXStateFlags, "noChecks"> extends B.True ? object :
    & StateNode.Of<Definition, Implementations, []>
    & { context?: "TODO" };

  export namespace Cache {
    export type Get<
      Cache,
      Key extends
        | "TargetPath.OfId.WithRoot<Definition>"
        | "TargetPath.WithRoot<Definition>"
        | "IdMap.WithRoot<Definition>"
        | "TransitionMap.Of<Definition>"
    > =
      O.Prop<Cache, Key>

    export type Of<Definition extends A.Object, Implementations extends A.Object> =
      { "TargetPath.OfId.WithRoot<Definition>": TargetPath.OfId.WithRoot<Definition>
      , "TargetPath.WithRoot<Definition>": TargetPath.WithRoot<Definition>
      , "IdMap.WithRoot<Definition>": IdMap.WithRoot<Definition>
      } extends infer PartialCache
        ? & PartialCache 
          & { "TransitionMap.Of<Definition>":
                O.Has<TXStateFlags, "noTransitionMap"> extends B.True ? any :
                TransitionMap.Of<Definition, Implementations, [], O.Assert<PartialCache>>
            }
        : never
  }

  export namespace StateNode {
    export type Of<
      Definition extends A.Object,
      Implementations extends A.Object,
      Path extends readonly PropertyKey[],
      Cache extends A.Object = Cache.Of<Definition, Implementations>,
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
                        : StateNode.Of<Definition, Implementations, L.Concat<Path, ["states", StateIdentifier]>, Cache>
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
      & { id?: Id.Of<Definition, Implementations, L.Append<Path, "id">, Cache>
        , on?: 
            { [EventIdentifier in keyof On]:
                EventIdentifier extends string
                  ? Transition.Of<Definition, Implementations, L.Concat<Path, ["on", EventIdentifier]>, Cache>
                  : "Error: only string identifier allowed"
            }
        , always?: 
            Always extends any[]
              ? L.ReadonlyOf<L.Assert<{
                  [K in keyof Always]:
                    U.Exclude<
                      Transition.Of<Definition, Implementations, L.Concat<Path, ["always", K]>, Cache>,
                      string | undefined
                    >
                }>>
              : any[]
        }
      
    export type Any = A.Object;

  }

  export namespace Transition {
 
    export type Of<
        Definition extends A.Object,
        Implementations extends A.Object,
        Path extends readonly PropertyKey[],
        Cache extends A.Object,
        Self = O.Assert<O.Path<Definition, Path>>,
        StateNodePath extends readonly PropertyKey[] = L.Pop<L.Pop<Path>>,
        StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>,
        TargetPathString =
          | keyof O.Prop<StateNode, "states">
          | `.${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, readonly PropertyKey[]>, ".">}`
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.OfId.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
          | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
          | (StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>>)
      > =
        ( Self extends { target: any } ? never :
            ( Self extends object[] ? never :
              | `undefined3`
              | TargetPathString
              | ( Self extends A.ReadonlyTuple<TargetPathString>
                    ? MultipleTargetPath.OfWithStateNodePath<Definition, Implementations, Path, Cache, StateNodePath>
                    : A.ReadonlyTuple<TargetPathString>
                )
            )
            | ( Self extends object[]
                  ? L.ReadonlyOf<L.Assert<{
                      [K in keyof Self]:
                        { target?:
                            | `undefined1`
                            | TargetPathString
                            | ( O.Prop<Self[K], "target"> extends A.ReadonlyTuple<TargetPathString>
                                  ? MultipleTargetPath.OfWithStateNodePath<Definition, Implementations, L.Concat<Path, [K, "target"]>, Cache, StateNodePath>
                                  : A.ReadonlyTuple<TargetPathString>
                              )
                        , internal?: boolean
                        }
                    }>>
                  : {
                      target:
                        | `undefined2`
                        | TargetPathString
                        | A.ReadonlyTuple<TargetPathString>
                    }[]
              )
        )
        | { target?:
            | `undefined4`
            | TargetPathString
            | ( Self extends { target: A.Tuple<TargetPathString> }
                  ? MultipleTargetPath.OfWithStateNodePath<Definition, Implementations, L.Append<Path, "target">, Cache, StateNodePath>
                  : A.Tuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          };

    type TargetPathStringWithStateNodePath<
      Definition extends A.Object,
      Implementation extends A.Object,
      Cache extends A.Object,
      StateNodePath extends readonly PropertyKey[],
      StateNode extends A.Object = O.Assert<O.Path<Definition, StateNodePath>>
    > =
        | keyof O.Prop<StateNode, "states">
        | `.${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, readonly PropertyKey[]>, ".">}`
        | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.OfId.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
        | L.Join<A.Cast<Cache.Get<Cache, "TargetPath.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
        | (StateNodePath["length"] extends 0 ? never : keyof O.Path<Definition, L.Pop<StateNodePath>>)
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

    export type FromPath<Path extends readonly PropertyKey[]> =
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
      Accumulator extends readonly PropertyKey[] = [],
      States extends A.Object = O.Assert<O.Prop<StateNode, "states", A.Object>>,
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
                      ? A.IsNever<X> extends B.True ? [] : A.Cast<X, readonly PropertyKey[]>
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
        Implementations extends A.Object,
        Path extends readonly PropertyKey[],
        Cache extends A.Object,
        StateNodePath extends readonly PropertyKey[],
        Self extends A.ReadonlyTuple<string> = A.Cast<O.Path<Definition, Path>, A.ReadonlyTuple<string>>,
        StateNodePathString extends A.String = NodePathString.FromPath<StateNodePath>,
        SelfResolved extends A.ReadonlyTuple<A.String> =
          A.Cast<{ [I in keyof Self]:
            TargetPathString.ResolveWithStateNode<
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
      Cache extends A.Object,
      StateNodePathString extends string,
      TargetPathString extends string
    > =
      S.DoesStartWith<TargetPathString, "#"> extends B.True ?
        S.DoesContain<TargetPathString, "."> extends B.True
          ? TargetPathString extends `#${infer Id}.${infer RestPath}`
              ? O.KeyWithValue<
                  O.Assert<Cache.Get<Cache, "IdMap.WithRoot<Definition>">>,
                  Id
                > extends infer IdNodePath
                  ? IdNodePath extends "" ? RestPath : `${S.Assert<IdNodePath>}.${RestPath}`
                  : never
              : never
          : O.KeyWithValue<
              O.Assert<Cache.Get<Cache, "IdMap.WithRoot<Definition>">>,
              S.Shift<TargetPathString>
            > :
      S.DoesStartWith<TargetPathString, "."> extends B.True ?
        StateNodePathString extends ""
          ? S.Shift<TargetPathString>
          : `${StateNodePathString}${TargetPathString}` :
      B.Not<S.DoesContain<TargetPathString, ".">> extends B.True ?
        StateNodePathString extends ""
          ? TargetPathString
          : L.Join<
              L.Append<
                L.Pop<S.Split<StateNodePathString, ".">>,
                TargetPathString
              >, "."
            > :
      TargetPathString
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
      Implementations extends A.Object,
      Path extends readonly PropertyKey[],
      Cache extends A.Object,
      Self = O.Path<Definition, Path>,
      IdMap extends A.Object = O.Assert<Cache.Get<Cache, "IdMap.WithRoot<Definition>">>
    > =
      Self extends string
        ? U.IsUnit<O.KeyWithValue<IdMap, Self>> extends B.True
          ? Self
          : `Ids should be unique, '${Self}' is already used`
        : "Ids should be strings"
  }

  export namespace TransitionMap {
    export type Of<
      Definition extends A.Object,
      Implementation extends A.Object,
      Path extends readonly PropertyKey[],
      Cache extends A.Object,
      StateNode = O.Path<Definition, Path>,
      StateNodePathString extends A.String = NodePathString.FromPath<Path>,
      On = O.Prop<StateNode, "on", {}>,
      States = O.Prop<StateNode, "states", {}>
    > =
      O.Mergify<
        & { [_ in StateNodePathString]:
              { [EventIdentifier in keyof On]:
                  (On[EventIdentifier] extends { target: infer T } ? T : On[EventIdentifier]) extends infer Target
                    ? Target extends undefined ? undefined : 
                      Target extends readonly string[]
                        ? { [K in keyof Target]:
                              TargetPathString.ResolveWithStateNode<
                                Cache, StateNodePathString, S.Assert<Target[K]>
                              >
                          }
                        : TargetPathString.ResolveWithStateNode<
                            Cache, StateNodePathString, S.Assert<Target>
                          >
                    : never
              }
          }
        & U.IntersectOf<{ [ChildStateIdentifier in keyof States]: 
            TransitionMap.Of<Definition, Implementation, L.Concat<Path, ["states", ChildStateIdentifier]>, Cache>
          }[keyof States]>
      >

    type TestOf<D extends A.Object> = TransitionMap.Of<D, {}, [], Cache.Of<D, {}>>;
     
    Test.checks([
      Test.check<
        TestOf<{
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
        TestOf<{
          initial: "a",
          states: {
            a: { on: { A: "#foo" } },
            b: {
              id: "foo",
              on: { B: ["c.c1", "#bar"], C: ".p" },
              initial: "p",
              states: {
                p: { on: { XYZ: "#foo.q" } },
                q: {}
              }
            },
            c: {
              type: "parallel",
              states: {
                c1: { on: { X: undefined } },
                c2: { id: "bar" }
              }
            }
          }
        }>,
        { "": {}
        , "a": { A: "b" }
        , "b": { B: ["c.c1", "c.c2"], C: "b.p" }
        , "b.p": { XYZ: "b.q" }
        , "b.q": {}
        , "c": {}
        , "c.c1": { X: undefined }
        , "c.c2": {}
        },
        Test.Pass
      >()
    ])
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
