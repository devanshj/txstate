import { A, U, L, S, O, F } from "../extras";
import MachineDefinition from "../MachineDefinition";
import { ReferencePathString } from "../universal";

export default Machine;
namespace Machine {
  export type Of<
    Global
  > =
      { config: A.Get<Global, "Definition">
      , options: A.Get<Global, "Implementations">
      }


  export namespace Event {
    export type Of<
      Global,
      Flags = never,
      EventSchema = Schema.Of<Global, Flags>
    > =
      EventSchema extends undefined
        ? WithRoot<A.Get<Global, "Definition">>
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
      export type Of<Global, Flags = never, Definition = A.Get<Global, "Definition">> =
        "UseInferForSchema" extends Flags
          ? Definition extends { schema?: { events?: infer E } } ? E : undefined
          : A.Get<Definition, ["schema", "events"]>
    }

    export namespace ForEntry {
      export type OfWithStateNodePath<
        Global,
        StateNodePath,
        
      > =
        WithRootPath<Global, StateNodePath, []>
    
      type WithRootPath<
        Global,
        StateNodePath,
        RootPath,

        DesugaredDefinition = MachineDefinition.Precomputed.FromGlobal<Global, "DesugaredDefinition">,
        Root = A.Get<DesugaredDefinition, RootPath>,
        StateNodeReferencePathString = ReferencePathString.FromDefinitionPath<StateNodePath>,
        RootReferencePathString = ReferencePathString.FromDefinitionPath<RootPath>,
        On = A.Get<Root, "on">,
        Always = A.Get<Root, "always">,
        States = A.Get<Root, "states">,
        EventSchema = Schema.Of<Global>,
        InitialState = MachineDefinition.Precomputed.FromGlobal<Global, "InitialStateNodeReferencePathString">
      > =
        | { [E in keyof On]: 
            A.Get<On, [E, number]> extends infer T
              ? [T] extends [never] ? never :
                T extends any
                  ? ( L.IncludesSubtype<
                        ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
                          Global, A.Get<T, "target">, RootReferencePathString
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
                    Global, A.Get<T, "target">, RootReferencePathString
                  >,
                  | StateNodeReferencePathString
                  | ( A.Get<T, "internal"> extends false
                        ? ReferencePathString.Child<StateNodeReferencePathString, DesugaredDefinition>
                        : never
                    )
                > extends true
                  ? OfWithStateNodePath<Global, RootPath>
                  : never
              : never
          )
        | ( [keyof States] extends [never] ? never :
            { [C in keyof States]:
                WithRootPath<
                  Global, StateNodePath,
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
        Global,
        StateNodePath
      > =
        // TODO
        Machine.Event.Of<Global>
    }

    export namespace ForDone {
      export type OfWithStateNodePath<
        Global,
        StateNodePath,
        Definition = A.Get<Global, "Definition">,
        Data = A.Get<Definition, L.Pushed<StateNodePath, "data">>
      > =
        & Machine.Event.Of<Global> // TODO
        & { data:
              Data extends undefined ? undefined :
              Data extends A.Function ? F.Called<Data> :
              { [K in keyof Data]:
                  Data[K] extends A.Function
                    ? F.Called<Data[K]>
                    : Data[K]
              }
          , toString: () => string
          }
    }

  }

  export namespace InitialStateNodeReferencePathString {
    export type Of<Global> =
      WithRoot<Global, "">;

    type WithRoot<Global, Root,
      Definition = A.Get<Global, "Definition">,
      Node = ReferencePathString.ToNode<Root, Definition>,
      Initial = A.Get<Node, "initial">,
      ChildState = keyof A.Get<Node, "states">,
      Always = MachineDefinition.Transition.Desugar<A.Get<Node, "always">>
    > =
      | ( Initial extends A.String
          ? | ReferencePathString.Append<Root, Initial>
            | WithRoot<Global, ReferencePathString.Append<Root, Initial>>
          : [ChildState] extends [never] ? never :
            ChildState extends any
              ? | ReferencePathString.Append<Root, ChildState>
                | WithRoot<Global, ReferencePathString.Append<Root, ChildState>>
              : never
        )
      | { [I in keyof Always]:
          A.Get<ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
            Global, A.Get<Always[I], "target">, Root
          >, number> extends infer T
            ? [T] extends [never] ? never :
              T extends any
                ? WithRoot<Global, T>
                : never
            : never
        }[keyof Always]
  }

  export namespace XstateAction {
    export namespace InferralHint {
      export type OfWithAdjacentAction<Global, Action> =
        SendAction.InferralHint.OfWithAdjacentAction<Global, Action>
    }
  }

  export namespace SendAction {
    export namespace InferralHint {
      export type OfWithAdjacentAction<
        Global,
        Action,
        PrecedingParameters = F.Parameters<Action>
      > =
        { ( context: A.Get<PrecedingParameters, 0>
          , event: A.Get<PrecedingParameters, 1>
          , meta: A.Get<PrecedingParameters, 2>
          , $$internal:
              MachineDefinition.Internal<
                Creator.Parameters.Of<Global>
              >
          ): void
        , type?: "xstate.send"
        }
    }

    export type FromInternalAndParameters<Internal, Parameters> =
      { (context: unknown, event: unknown, meta: unknown, $$internal: Internal): void
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
          Global,
          Event = Machine.Event.Of<Global, "UseInferForSchema">
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
          SpecEventType = U.Extract<A.Get<Parameters, 0>, A.String>,
          SpecEvent = U.Exclude<A.Get<Parameters, 0>, A.String>
        > =
          [ event:
          | ( SpecEventType extends any
                ? S.InferNarrowest<SpecEventType>
                : never
            )
          | ( { type:
                  S.IsLiteral<A.Get<Self, [0, "type"]>> extends true
                    ? A.Get<Self, [0, "type"]> extends A.Get<SpecEvent, "type">
                        ? S.InferNarrowest<A.Get<Self, [0, "type"]>>
                        : S.InferNarrowest<A.Get<SpecEvent, "type">>
                    : S.InferNarrowest<A.Get<SpecEvent, "type">>
              }
            & ( U.Extract<SpecEvent, { type: A.Get<Self, [0, "type"]> }> extends infer E
                  ? [E] extends [never] ? {} :
                    E extends any
                      ? { [K in keyof E as U.Exclude<K, "type">]: E[K] }
                      : never
                  : never
              )
            )
          ]
      }
    }
  }

  

  export namespace Context {
    export type Of<
      Global,
      Flags = never,
      Definition = A.Get<Global, "Definition">,
      ContextSchema = Schema.Of<Global, Flags>,
    > =
      ContextSchema extends undefined
        ? A.Get<Definition, "context">
        : ContextSchema

    export namespace Schema {
      export type Of<Global, Flags = never, Definition = A.Get<Global, "Definition">> =
        "UseInferForSchema" extends Flags
          ? Definition extends { schema?: { context?: infer C } } ? C : undefined
          : A.Get<Definition, ["schema", "context"]>
    }
  }
}
