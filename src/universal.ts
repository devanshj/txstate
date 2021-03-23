import { O, L, B, Type, S, U, N } from "./extras";
import MachineDefinition from "./MachineDefinition";

export namespace ReferencePathString {

  export type RegionRoot<
    ReferencePathString,
    RootNode,

    NodePath = ReferencePathString.ToDefinitionPath<ReferencePathString>,
    ParentNodePath = L.Popped<L.Popped<NodePath>>,
    ParentNode = O.Get<RootNode, ParentNodePath>,
    ParentReferencePathString = ReferencePathString.FromDefinitionPath<ParentNodePath>
  > =
    O.Get<ParentNode, "type", "compound"> extends "parallel" ? NodePath :
    O.Get<ParentNodePath, "length"> extends 0 ? [] :
    RegionRoot<ParentReferencePathString, RootNode>

  /** is B descendant of A */
  export type IsDescendant<A, B> =
    A extends B ? false :
    S.DoesStartWith<B, A>

  /** is B ancestor of A */
  export type IsAncestor<A, B> =
    A extends B ? false :
    IsDescendant<B, A>

  export type Parent<A> = 
    [A] extends [never] ? never :
    A extends "" ? never :
    L.Join<L.Popped<S.Split<A, ".">>, ".">

  export type Child<A, D, S = ToNode<A, D>, C = keyof O.Get<S, "states">> =
    [C] extends [never] ? never :
    C extends any ? Append<A, C> : never

  export type Children<A, D, C = Child<A, D>> =
    [C] extends [never] ? [] : U.ToList<C>

  export type Ancestor<A> =
    [A] extends [never] ? never :
    | Parent<A>
    | Ancestor<Parent<A>>

  Type.tests([
    Type.areEqual<Ancestor<"a.b.c">, "" | "a" | "a.b">()
  ])

  export type ProperAncestors<A, B = never> =
    [A] extends [never] ? [] :
    [Parent<A>] extends [never] ? [] :
    [Parent<A>] extends [B] ? [] :
    [Parent<A>, ...ProperAncestors<Parent<A>, B>]

  Type.tests([
    Type.areEqual<ProperAncestors<"a.b.c">, ["a.b", "a", ""]>(),
    Type.areEqual<ProperAncestors<"a.b.c", "a">, ["a.b"]>()
  ])

  export type ProperAncestorsReversed<A, B = never> =
    [A] extends [never] ? [] :
    [Parent<A>] extends [never] ? [] :
    [Parent<A>] extends [B] ? [] :
    [...ProperAncestorsReversed<Parent<A>, B>, Parent<A>]

  Type.tests([
    Type.areEqual<ProperAncestorsReversed<"a.b.c">, ["", "a", "a.b"]>(),
    Type.areEqual<ProperAncestorsReversed<"a.b.c", "a">, ["a.b"]>()
  ])

  export type FromDefinitionPath<Path> =
    O.Get<Path, "length"> extends 0 ? "" :
    S.Replace<L.Join<Path, ".">, "states.", "">

  Type.tests([
    Type.areEqual<FromDefinitionPath<[]>, "">(),
    Type.areEqual<FromDefinitionPath<["states", "a"]>, "a">(),
    Type.areEqual<FromDefinitionPath<["states", "a", "states", "b"]>, "a.b">()
  ])

  export type ToDefinitionPath<ReferencePathString> =
    ReferencePathString extends "" ? [] :
    ["states", ...S.Split<S.Replace<ReferencePathString, ".", ".states.">, ".">]

  Type.tests([
    Type.areEqual<ToDefinitionPath<"">, []>(),
    Type.areEqual<ToDefinitionPath<"a">, ["states", "a"]>(),
    Type.areEqual<ToDefinitionPath<"a.b">, ["states", "a", "states", "b"]>(),
  ])

  export type ToNode<ReferencePathString, Definition> =
    O.Get<Definition, ToDefinitionPath<ReferencePathString>>

  export namespace Tuple {
    export type MapToDefinitionPath<T> =
      { [K in keyof T]: ToDefinitionPath<S.Assert<T[K]>> }

    export namespace Unresolved {
      export type ResolveWithStateNode<
        Definition,
        Precomputed,
        TargetPathStringTuple,
        StateReferencePathString
      > = {
        [I in keyof TargetPathStringTuple]:
          ReferencePathString.Unresolved.ResolveWithStateNode<
            Definition,
            Precomputed,
            TargetPathStringTuple[I],
            StateReferencePathString
          >
      }
    }
  }

  export namespace Unresolved {
    export type ResolveWithStateNode<
      Definition,
      Precomputed,
      TargetPathString,
      StateReferencePathString,
      ParentStateReferencePathString = Parent<StateReferencePathString>,

      SiblingStateIdentifier =
        StateReferencePathString extends "" ? never :
        keyof O.Get<ReferencePathString.ToNode<ParentStateReferencePathString, Definition>, "states">,
      ChildStateIdentifier =
        keyof O.Get<ReferencePathString.ToNode<StateReferencePathString, Definition>, "states">
    > =
      S.Assert<
        // id
        S.DoesStartWith<TargetPathString, "#"> extends B.True
          ? S.DoesContain<TargetPathString, "."> extends B.True
              ? TargetPathString extends `#${infer Id}.${infer RestPath}`
                  ? O.KeyWithValue<
                      O.Assert<MachineDefinition.Precomputed.Get<Precomputed, "IdMap">>,
                      Id
                    > extends infer IdNodePath
                      ? ReferencePathString.Append<IdNodePath, RestPath>
                      : never
                  : never
              : O.KeyWithValue<
                  O.Assert<MachineDefinition.Precomputed.Get<Precomputed, "IdMap">>,
                  S.Shifted<TargetPathString>
                > :
        // relative children
        S.DoesStartWith<TargetPathString, "."> extends B.True
          ? StateReferencePathString extends ""
              ? S.Shifted<TargetPathString>
              : `${S.Assert<StateReferencePathString>}${S.Assert<TargetPathString>}` :
        // children
        [ S.DoesStartWith<TargetPathString, ChildStateIdentifier>
        , [ChildStateIdentifier] extends [never] ? B.False : B.True
        ] extends [B.True, B.True]
          ? ReferencePathString.Append<StateReferencePathString, TargetPathString> :
        // sibling
        [ S.DoesStartWith<TargetPathString, SiblingStateIdentifier>
        , [SiblingStateIdentifier] extends [never] ? B.False : B.True
        ] extends [B.True, B.True]
          ? ReferencePathString.Append<ParentStateReferencePathString, TargetPathString> :
        never
      >

      export type OfIdWithRoot<
        StateNode,

        Id = O.Get<StateNode, "id">,
        States = O.Get<StateNode, "states", {}>,
        IdPathString = `#${S.Assert<Id>}`
      > = 
        | ( Id extends undefined ? never :
              | IdPathString
              | ReferencePathString.WithRoot<StateNode, IdPathString>
          )
        | { [S in keyof States]:
              ReferencePathString.Unresolved.OfIdWithRoot<States[S]>
          }[keyof States]

        Type.tests([
          Type.areEqual<
            ReferencePathString.Unresolved.OfIdWithRoot<{ id: "root", states: {
              a: { states: { a1: {}, a2: {} } },
              b: { id: "b", states: { b1: {}, b2: {} } }
            } }>
            , | "#root"
              | "#root.a"
              | "#root.a.a1"
              | "#root.a.a2"
              | "#root.b"
              | "#root.b.b1"
              | "#root.b.b2"
              | "#b"
              | "#b.b1"
              | "#b.b2"
            >()
        ])
  }

  

  export type WithRoot<
    StateNode,
    StateReferencePathString = "",
    Depth = 20,

    States = O.Get<StateNode, "states", {}>
  > =
    | ( StateReferencePathString extends "" ? never :
        StateReferencePathString extends "." ? never :
        StateReferencePathString
      )
    | ( N.IsGreaterThan<Depth, 0> extends true
          ? { [S in keyof States]:
              WithRoot<
                States[S],
                ReferencePathString.Append<StateReferencePathString, S>,
                N.Decrement<Depth>
              >
            }[keyof States]
          : never
      )

  Type.tests([
    Type.areEqual<
      ReferencePathString.WithRoot<{ states: {
        a: { states: { a1: {}, a2: {} } },
        b: { states: { b1: {}, b2: {} } }
      } }>
      , | "a"
        | "a.a1"
        | "a.a2"
        | "b"
        | "b.b1"
        | "b.b2"
      >()
  ])

  export type Append<A, B> =
    A extends "" ? B :
    A extends "." ? `.${S.Assert<B>}` :
    `${S.Assert<A>}.${S.Assert<B>}`
}
