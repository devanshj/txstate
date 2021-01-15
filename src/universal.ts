import { O, A, L, B, Test, S } from "./extras";
import MachineDefinition from "./MachineDefinition";

export namespace ReferencePathString {

  export type RegionRoot<
    ReferencePathString extends string,
    RootNode extends A.Object,

    NodePath extends string[] = ReferencePathString.ToDefinitionPath<ReferencePathString>,
    ParentNodePath extends string[] = L.Pop<L.Pop<NodePath>>,
    ParentNode extends A.Object = O.Assert<O.Path<RootNode, ParentNodePath>>,
    ParentReferencePathString extends string = ReferencePathString.FromDefinitionPath<ParentNodePath>
  > =
    O.Prop<ParentNode, "type", "compound"> extends "parallel" ? NodePath :
    ParentNodePath["length"] extends 0 ? [] :
    RegionRoot<ParentReferencePathString, RootNode>

  export type IsDescendant<A extends string, B extends string> =
    S.DoesStartWith<B, A>

  export type IsAncestor<A extends string, B extends string> =
    IsDescendant<B, A>

  export type FromDefinitionPath<Path extends A.ReadonlyTuple<PropertyKey>> =
    Path["length"] extends 0 ? "" :
    S.Replace<L.Join<Path, ".">, "states.", "">

  Test.checks([
    Test.check<FromDefinitionPath<[]>, "", Test.Pass>(),
    Test.check<FromDefinitionPath<["states", "a"]>, "a", Test.Pass>(),
    Test.check<FromDefinitionPath<["states", "a", "states", "b"]>, "a.b", Test.Pass>()
  ])

  export type ToDefinitionPath<PathString extends string> =
    PathString extends "" ? [] :
    ["states", ...S.Split<S.Replace<PathString, ".", ".states.">, ".">]

  Test.checks([
    Test.check<ToDefinitionPath<"">, [], Test.Pass>(),
    Test.check<ToDefinitionPath<"a">, ["states", "a"], Test.Pass>(),
    Test.check<ToDefinitionPath<"a.b">, ["states", "a", "states", "b"], Test.Pass>(),
  ])

  export namespace Unresolved {
    export type ResolveWithStateNode<
      Definition extends A.Object,
      Precomputed extends A.Object,
      StateReferencePathString extends string,
      TargetPathString extends string,

      SiblingStateIdentifier = keyof O.Prop<O.Path<Definition, ReferencePathString.ToDefinitionPath<StateReferencePathString>>, "states">
    > =
      S.Assert<
        S.DoesStartWith<TargetPathString, "#"> extends B.True
          ? S.DoesContain<TargetPathString, "."> extends B.True
              ? TargetPathString extends `#${infer Id}.${infer RestPath}`
                  ? O.KeyWithValue<
                      O.Assert<MachineDefinition.Precomputed.Get<Precomputed, "IdMap">>,
                      Id
                    > extends infer IdNodePath
                      ? ReferencePathString.Append<S.Assert<IdNodePath>, RestPath>
                      : never
                  : never
              : O.KeyWithValue<
                  O.Assert<MachineDefinition.Precomputed.Get<Precomputed, "IdMap">>,
                  S.Shift<TargetPathString>
                > :
        S.DoesStartWith<TargetPathString, "."> extends B.True
          ? StateReferencePathString extends ""
              ? S.Shift<TargetPathString>
              : `${StateReferencePathString}${TargetPathString}` :
        B.Not<S.DoesContain<TargetPathString, ".">> extends B.True
          ? StateReferencePathString extends ""
              ? TargetPathString :
            TargetPathString extends SiblingStateIdentifier
              ? L.Join<
                  L.Append<
                    L.Pop<S.Split<StateReferencePathString, ".">>,
                    TargetPathString
                  >, "."
                > :
            TargetPathString
        : TargetPathString
      >

      export type OfIdWithRoot<
        StateNode extends A.Object,

        Id = O.Prop<StateNode, "id">,
        States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>,
        IdPathString extends A.String = `#${S.Assert<Id>}`
      > = 
        | ( A.IsUndefined<Id> extends B.True ? never :
              | IdPathString
              | ReferencePathString.WithRoot<StateNode, IdPathString>
          )
        | { [S in keyof States]:
              ReferencePathString.Unresolved.OfIdWithRoot<O.Assert<States[S]>>
          }[keyof States]

        Test.checks([
          Test.check<
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
            , Test.Pass>()
        ])
  }

  

  export type WithRoot<
    StateNode extends A.Object,
    StateReferencePathString extends A.String = "",

    States extends A.Object = O.Assert<O.Prop<StateNode, "states", {}>>
  > =
    | ( StateReferencePathString extends "" ? never :
        StateReferencePathString extends "." ? never :
        StateReferencePathString
      )
    | { [S in keyof States]:
          WithRoot<
            O.Assert<States[S]>,
            ReferencePathString.Append<StateReferencePathString, S.Assert<S>>
          >
      }[keyof States]

  Test.checks([
    Test.check<
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
      , Test.Pass>()
  ])

  export type Append<A extends A.String, B extends A.String> =
    A extends "" ? B :
    A extends "." ? `.${B}` :
    `${A}.${B}`
}
