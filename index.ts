import { O, A, U, L, B, Test } from "ts-toolbelt";

export declare const Machine: {
  <D extends MachineDefinition.Of<D, {}>>(definition: A.InferNarrowest<D>): MachineHandle.Of<D, {}>
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
      Path extends readonly PropertyKey[],
      Cache extends A.Object =
        { "TargetPath.OfId.WithRoot<Definition>": TargetPath.OfId.WithRoot<Definition>
        , "TargetPath.WithRoot<Definition>": TargetPath.WithRoot<Definition>
        , "IdMap.WithRoot<Definition>": IdMap.WithRoot<Definition>
        },
      Self extends A.Object = A.Cast<O.Path<Definition, Path>, A.Object>,
      Initial = O.Prop<Self, "initial">,
      States = O.Prop<Self, "states">,
      Type = O.Prop<Self, "type", "compound">,
      Id = O.Prop<Self, "id">,
      On = O.Prop<Self, "on">
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
        }
      
    export type Any = A.Object;

  }

  export namespace Transition {

    export type Of<
        Definition extends A.Object,
        Implementations extends A.Object,
        Path extends readonly PropertyKey[],
        Cache extends A.Object,
        Self = A.Cast<O.Path<Definition, Path>, A.Object>,
        StateNodePath extends readonly PropertyKey[] = L.Pop<L.Pop<Path>>,
        StateNode extends A.Object = A.Cast<O.Path<Definition, StateNodePath>, A.Object>,  
        TargetPathString =
          | keyof O.Prop<StateNode, "states">
          | `.${L.Join<A.Cast<TargetPath.WithRoot<StateNode> extends infer X ? X : never, readonly PropertyKey[]>, ".">}`
          | L.Join<A.Cast<FromCache<Cache, "TargetPath.OfId.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
          | L.Join<A.Cast<FromCache<Cache, "TargetPath.WithRoot<Definition>"> extends infer X ? X : never, readonly PropertyKey[]>, ".">
      > =
        ( Self extends { target: any } ? never : // for better errors
            | TargetPathString
            | ( Self extends TargetPathString[]
                  ? MultipleTargetPath.OfWithStateNodePath<Definition, Implementations, Path, Cache, StateNodePath>
                  : A.Tuple<TargetPathString>
              )
        )
        | { readonly target:
            | TargetPathString
            | ( Self extends { readonly target: TargetPathString[] }
                  ? MultipleTargetPath.OfWithStateNodePath<Definition, Implementations, L.Append<Path, "target">, Cache, StateNodePath>
                  : A.Tuple<TargetPathString>
              )
          , internal?: boolean // TODO: enforce false for external
          }
  }

  export namespace NodePathString {
    export type RegionRoot<
      NodePathString extends string,
      RootNode extends A.Object,
      NodePath extends string[] = NodePathString.ToPath<NodePathString>,
      ParentNodePath extends string[] = L.Pop<L.Pop<NodePath>>,
      ParentNode extends A.Object = A.Cast<O.Path<RootNode, ParentNodePath>, A.Object>,
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
      States extends A.Object = A.Cast<O.Prop<StateNode, "states", A.Object>, A.Object>,
      ChildStateIdentifier extends keyof States = keyof States
    > =
      | (A.Equals<Accumulator, []> extends B.True ? never : Accumulator)
      | { hasChildStates:
            ChildStateIdentifier extends any
              ? TargetPath.WithRoot<A.Cast<States[ChildStateIdentifier], A.Object>, [...Accumulator, ChildStateIdentifier]>
              : never
        , else: never
        }[A.IsNever<ChildStateIdentifier> extends B.False ? "hasChildStates" : "else"] 

    export namespace OfId {
      export type WithRoot<
        StateNode extends A.Object,
        Id = O.Prop<StateNode, "id", undefined>,
        PathForId extends string = A.IsUndefined<Id> extends B.True ? never : `#${A.Cast<Id, string>}`,
        States extends A.Object = A.Cast<O.Prop<StateNode, "states", {}>, A.Object>
      > =
        | (A.IsNever<PathForId> extends B.True ? never : [PathForId])
        | { hasChildStates:  
            | { [S in keyof States]: TargetPath.OfId.WithRoot<A.Cast<States[S], A.Object>> }[keyof States]
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
              Definition, Implementations, Cache,
              StateNodePathString,
              A.Cast<Self[I], A.String>
            >
          }, A.ReadonlyTuple<string>>,
        RegionRootOf extends A.ReadonlyTuple<A.Tuple<A.String>> =
          A.Cast<{ [I in keyof SelfResolved]:
            NodePathString.RegionRoot<
              A.Cast<SelfResolved[I], A.String>,
              Definition
            >
          }, A.ReadonlyTuple<A.Tuple<A.String>>>
      > =
        L.ReadonlyOf<A.Cast<{ [I in keyof Self]:
          [ | ({ [J in keyof Self]:
                  J extends I ? never : 
                  NodePathString.IsDescendant<A.Cast<O.Prop<SelfResolved, J>, string>, A.Cast<O.Prop<SelfResolved, I>, string>> extends B.True
                    ? Self[J]
                    : never
              }[number] extends infer Ancestors
                ? A.IsNever<Ancestors> extends B.False
                    ? `Error: ${A.Cast<Self[I], string>} is descendant of ${S.Commas<A.Cast<Ancestors, string>>}`
                    : never
                : never)
            | ({ [J in keyof Self]:
                  J extends I ? never : 
                  NodePathString.IsAncestor<A.Cast<O.Prop<SelfResolved, J>, string>, A.Cast<O.Prop<SelfResolved, I>, string>> extends B.True
                    ? Self[J]
                    : never
              }[number] extends infer Descendants
                ? A.IsNever<Descendants> extends B.False
                    ? `Error: ${A.Cast<Self[I], string>} is ancestor of ${S.Commas<A.Cast<Descendants, string>>}`
                    : never
                : never)
          , { [J in keyof Self]:
                J extends I ? never :
                O.Prop<RegionRootOf, I> extends O.Prop<RegionRootOf, J> ? Self[J] :
                never
            }[number] extends infer NodesWithCommonRegionRoot
              ? A.IsNever<NodesWithCommonRegionRoot> extends B.False
                  ? `Error: ${A.Cast<Self[I], string>} has region root same as that of ${
                      S.Commas<A.Cast<NodesWithCommonRegionRoot, string>>
                    }`
                  : never
              : never
          ] extends [infer AncestryError, infer RegionRootError]
            ? A.IsNever<AncestryError> extends B.False ? AncestryError :
              A.IsNever<RegionRootError> extends B.False ? RegionRootError :
              Self[I]
            : never
        }, L.List>>
    }

  export namespace TargetPathString {
    export type ResolveWithStateNode<
      Definition extends A.Object,
      Implementations extends A.Object,
      Cache extends A.Object,
      StateNodePathString extends string,
      TargetPathString extends string
    > =
      IsResolved<TargetPathString> extends B.True ? TargetPathString :
      IsId<TargetPathString> extends B.True ?
        O.KeyWithValue<A.Cast<FromCache<Cache, "IdMap.WithRoot<Definition>">, A.Object>, S.Shift<TargetPathString>> :
      IsStateIdentifier<TargetPathString> extends B.True ?
        StateNodePathString extends ""
          ? TargetPathString
          : `${StateNodePathString}.${TargetPathString}` :
      IsRelative<TargetPathString> extends B.True ?
        StateNodePathString extends ""
          ? S.Shift<TargetPathString>
          : `${StateNodePathString}${TargetPathString}` :
      never

    export type IsId<P extends string> = S.DoesStartWith<P, "#">
    export type IsRelative<P extends string> = S.DoesStartWith<P, ".">
    export type IsStateIdentifier<P extends string> = B.Not<S.DoesContain<P, ".">>
    export type IsResolved<P extends string> =
      A.Equals<[IsId<P>, IsRelative<P>, IsStateIdentifier<P>], [B.False, B.False, B.False]>
  }


  export namespace IdMap {
    export type WithRoot<
        StateNode extends A.Object,
        PathString extends string = "",
        Id = O.Prop<StateNode, "id">, 
        States extends A.Object = A.Cast<O.Prop<StateNode, "states", {}>, A.Object>
      > = 
        & (A.Equals<Id, undefined> extends B.True
            ? {}
            : { [_ in PathString]: Id }
          )
        & { hasChildStates:
              U.IntersectOf<{
                [S in keyof States]: IdMap.WithRoot<A.Cast<States[S], A.Object>, PathString extends "" ? S : `${PathString}.${A.Cast<S, string>}`>
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
  
  export type KeyWithValue<O extends O.Object, V> =
    { [K in keyof O]: O[K] extends V ? K : never }[keyof O]

  export type DeepOmit<O extends O.Object, E extends PropertyKey> =
    { [K in U.Exclude<keyof O, E>]:
        O[K] extends object ? O.DeepOmit<O[K], E> : O[K]
    }
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


declare const m: <T>(node: A.InferNarrowest<T>) => void
