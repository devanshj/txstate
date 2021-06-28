import { A, U, L } from "../extras";
import MachineDefinition from "../MachineDefinition";
import { ReferencePathString } from "../universal";

export default Machine;
namespace Machine {
  export type Of<
    MaybeDefinition, // in an machine with error this would be MachineDefinition.Of<D> otherwise it'll be D
    Definition =
      MaybeDefinition extends { [_ in MachineDefinition.$$Self]: unknown }
        ? U.Exclude<A.Get<MaybeDefinition, MachineDefinition.$$Self>, undefined>
        : MaybeDefinition
    > =
      { config: Definition
      }


  export namespace EntryEventForStateNode {
    export type Of<
      Definition,
      Precomputed,
      StateNodeReferencePathString,
      DesugaredDefinition = MachineDefinition.Precomputed.Get<Precomputed, "DesugaredDefinition">
    > =
      WithRoot<DesugaredDefinition, Precomputed, StateNodeReferencePathString, "">
  
    type WithRoot<
      DesugaredDefinition,
      Precomputed,
      StateNodeReferencePathString,
      RootReferencePathString,

      Root = ReferencePathString.ToNode<RootReferencePathString, DesugaredDefinition>,
      On = A.Get<Root, "on">,
      Always = A.Get<Root, "always">,
      States = A.Get<Root, "states">,
      EventSchema = A.Get<DesugaredDefinition, ["schema", "events"]>,
      InitialConfigurationState = MachineDefinition.Precomputed.Get<Precomputed, "InitialConfigurationState">
    > =
      | { [E in keyof On]: 
          A.Get<On, [E, number]> extends infer T
            ? [T] extends [never] ? never :
              T extends any
                ? ( L.IncludesSubtype<
                      ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
                        DesugaredDefinition, Precomputed, A.Get<T, "target">, RootReferencePathString
                      >,
                      | StateNodeReferencePathString 
                      | ( A.Get<T, "internal"> extends false
                            ? ReferencePathString.Child<StateNodeReferencePathString, DesugaredDefinition>
                            : never
                        )
                    > extends true 
                      ? EventSchema extends undefined ? { type: E } :
                        U.Extract<EventSchema, { type: E }>
                      : never
                  )
                : never
            : never
        }[keyof On]
      | ( A.Get<Always, number> extends infer T
            ? [T] extends [never] ? never :
              L.IncludesSubtype<
                ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
                  DesugaredDefinition, Precomputed, A.Get<T, "target">, RootReferencePathString
                >,
                | StateNodeReferencePathString
                | ( A.Get<T, "internal"> extends false
                      ? ReferencePathString.Child<StateNodeReferencePathString, DesugaredDefinition>
                      : never
                  )
              > extends true
                ? Of<DesugaredDefinition, Precomputed, RootReferencePathString>
                : never
            : never
        )
      | { [C in keyof States]:
            WithRoot<
              DesugaredDefinition, Precomputed, StateNodeReferencePathString,
              ReferencePathString.Append<RootReferencePathString, C>
            >
        }[keyof States]
      | ( StateNodeReferencePathString extends InitialConfigurationState
            ? { type: "xstate.init" }
            : never
        )
  }

  export namespace InitialConfigurationState {
    export type Of<Definition, Precomputed> =
      WithRoot<Definition, Precomputed, "">;

    type WithRoot<Definition, Precomputed, Root,
      Node = ReferencePathString.ToNode<Root, Definition>,
      Initial = A.Get<Node, "initial">,
      ChildState = keyof A.Get<Node, "states">,
      Always = MachineDefinition.Transition.Desugar<A.Get<Node, "always">, Root>
    > =
      | ( Initial extends A.String
          ? | ReferencePathString.Append<Root, Initial>
            | WithRoot<Definition, Precomputed, ReferencePathString.Append<Root, Initial>>
          : [ChildState] extends [never] ? never :
            ChildState extends any
              ? | ReferencePathString.Append<Root, ChildState>
                | WithRoot<Definition, Precomputed, ReferencePathString.Append<Root, ChildState>>
              : never
        )
      | { [I in keyof Always]:
          A.Get<ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
            Definition, Precomputed, A.Get<Always[I], "target">, Root
          >, number> extends infer T
            ? [T] extends [never] ? never :
              T extends any
                ? WithRoot<Definition, Precomputed, T>
                : never
            : never
        }[keyof Always]
  }
}