import { O, A, L, B, Type, S } from "./extras";
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

  export type IsDescendant<A, B> =
    S.DoesStartWith<B, A>

  export type IsAncestor<A, B> =
    IsDescendant<B, A>

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

  export namespace Tuple {
    export type MapToDefinitionPath<T> =
      { [K in keyof T]: ToDefinitionPath<S.Assert<T[K]>> }
  }

  export namespace Unresolved {
    export type ResolveWithStateNode<
      Definition,
      Precomputed,
      StateReferencePathString,
      TargetPathString,

      SiblingStateIdentifier = keyof O.Get<O.Get<Definition, ReferencePathString.ToDefinitionPath<StateReferencePathString>>, "states">
    > =
      S.Assert<
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
                  S.Shift<TargetPathString>
                > :
        S.DoesStartWith<TargetPathString, "."> extends B.True
          ? StateReferencePathString extends ""
              ? S.Shift<TargetPathString>
              : `${S.Assert<StateReferencePathString>}${S.Assert<TargetPathString>}` :
        B.Not<S.DoesContain<TargetPathString, ".">> extends B.True
          ? StateReferencePathString extends ""
              ? TargetPathString :
            TargetPathString extends SiblingStateIdentifier
              ? L.Join<
                  L.Pushed<
                    L.Popped<S.Split<StateReferencePathString, ".">>,
                    TargetPathString
                  >, "."
                > :
            TargetPathString
        : TargetPathString
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

    States = O.Get<StateNode, "states", {}>
  > =
    | ( StateReferencePathString extends "" ? never :
        StateReferencePathString extends "." ? never :
        StateReferencePathString
      )
    | { [S in keyof States]:
          WithRoot<
            States[S],
            ReferencePathString.Append<StateReferencePathString, S>
          >
      }[keyof States]

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
