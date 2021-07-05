import { A, U, L, S, O, F } from "../extras";
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


  export namespace Event {
    export type Of<
      Definition,
      Precomputed,
      EventSchema = Schema.Of<Definition, Precomputed>
    > =
      EventSchema extends undefined
        ? WithRoot<Definition>
        : EventSchema

    type WithRoot<Root> =
      | ( [keyof A.Get<Root, "on">] extends [never] ? never :
          keyof A.Get<Root, "on"> extends infer E
            ? E extends any ? { type: E } : never
            : never
        )
      | ( [keyof A.Get<Root, "states">] extends [never] ? never :
          { [S in keyof A.Get<Root, "states">]:
              WithRoot<A.Get<Root, "states">[S]>
          }[keyof A.Get<Root, "states">]
        )

    export namespace Schema {
      export type Of<Definition, Precomputed> =
        Definition extends { schema?: { events?: infer E } } ? E : undefined
    }

    export namespace ForEntry {
      export type OfWithStateNodePath<
        Definition,
        Precomputed,
        StateNodePath,
        DesugaredDefinition = MachineDefinition.Precomputed.Get<Precomputed, "DesugaredDefinition">
      > =
        WithRootPath<DesugaredDefinition, Precomputed, StateNodePath, []>
    
      type WithRootPath<
        DesugaredDefinition,
        Precomputed,
        StateNodePath,
        RootPath,

        
        Root = A.Get<DesugaredDefinition, RootPath>,
        StateNodeReferencePathString = ReferencePathString.FromDefinitionPath<StateNodePath>,
        RootReferencePathString = ReferencePathString.FromDefinitionPath<RootPath>,
        On = A.Get<Root, "on">,
        Always = A.Get<Root, "always">,
        States = A.Get<Root, "states">,
        EventSchema = Schema.Of<DesugaredDefinition, Precomputed>,
        InitialState = MachineDefinition.Precomputed.Get<Precomputed, "InitialStateNodeReferencePathString">
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
                  ? OfWithStateNodePath<DesugaredDefinition, Precomputed, RootPath>
                  : never
              : never
          )
        | ( [keyof States] extends [never] ? never :
            { [C in keyof States]:
                WithRootPath<
                  DesugaredDefinition, Precomputed, StateNodePath,
                  L.Concat<RootPath, ["states", C]>
                >
            }[keyof States]
          )
        | ( StateNodeReferencePathString extends InitialState
              ? { type: "xstate.init" }
              : never
          )
    }

    export namespace ForExit {
      export type OfWithStateNodePath<
        Definition,
        Precomputed,
        StateNodePath
      > =
        // TODO
        Machine.Event.Of<Definition, Precomputed>
    }

  }

  export namespace InitialStateNodeReferencePathString {
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

  export namespace XstateAction {
    export namespace InferralHint {
      export type OfWithAdjacentAction<Definition, Precomputed, Action> =
        SendAction.InferralHint.OfWithAdjacentAction<Definition, Precomputed, Action>
    }
    

    export type IsOne<T> =
      T extends { type: "xstate.send" } ? true :
      false
  }

  export namespace SendAction {
    export namespace InferralHint {
      export type OfWithAdjacentAction<
        Definition,
        Precomputed,
        Action,
        PrecedingParameters = F.Parameters<Action>
      > =
        { ( context: A.Get<PrecedingParameters, 0>
          , event: A.Get<PrecedingParameters, 1>
          , $$internal:
              MachineDefinition.Internal<
                Creator.Parameters.Of<Definition, Precomputed>
              >
          ): void
        , type?: "xstate.send"
        }
    }

    export type FromInternalAndParameters<Internal, Parameters> =
      { (context: unknown, event: unknown, $$internal: Internal): void
      , type: "xstate.send"
      , event:
          A.Get<Parameters, 0> extends string
            ? { type: A.Get<Parameters, 0> }
            : A.Get<Parameters, 0>
      }
      
    export type Creator =
      < Internal
      , Parameters extends Creator.Parameters.FromInternalAndSelf<Internal, Parameters>
      > (...parameters: Parameters) =>
        SendAction.FromInternalAndParameters<Internal, A.NoInfer<Parameters>>

    export namespace Creator {
      export namespace Parameters {
        export type Of<
          Definition,
          Precomputed,
          Event = Machine.Event.Of<Definition, Precomputed>
        > =
          Event extends any
            ? | [event: Event]
              | ( { type: A.Get<Event, "type"> } extends Event
                    ? [event: A.Get<Event, "type">]
                    : never
                )
            : never

        export type FromInternalAndSelf<
          Internal,
          Self,
          Parameters = A.Get<Internal, [MachineDefinition.$$Internal]>,
          EventType = U.Extract<A.Get<Parameters, 0>, A.String>,
          Event = U.Exclude<A.Get<Parameters, 0>, A.String>
        > =
          [ event:
          | ( EventType extends any
                ? S.InferNarrowest<EventType>
                : never
            )
          | ( Event extends any
                ? ( { type: S.InferNarrowest<A.Get<Event, "type">> }
                  & O.Omit<Event, "type">
                  )
                : never
            )
          ]
      }
    }
  }

  

  export namespace Context {
    export type Of<
      Definition,
      Precomputed,
      ContextSchema = Definition extends { schema?: { context?: infer C } } ? C : undefined
    > =
      ContextSchema extends undefined
        ? A.Get<Definition, "context">
        : ContextSchema
  }
}
