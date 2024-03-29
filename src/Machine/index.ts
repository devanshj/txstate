import { A, U, L, S, F } from "../extras";
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
          // TODO: return undefined if E is error message
          : A.Get<Definition, ["schema", "events"]>
    }

    export namespace ForEntry {
      export type OfWithStateNodePath<
        Global,
        StateNodePath,
        
      > =
        WithRootPath<Global, StateNodePath, []>
    
      type WithRootPath<
        _Global,
        StateNodePath,
        RootPath,

        Global = MachineDefinition.Global.Resolved<_Global>,
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
                T extends any
                  ? L.IncludesSubtype<
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
      export type OfWithAdjacentAction<
          Global,
          Action,
          PrecedingParameters = F.Parameters<Action>
        > =
          { ( context: A.Get<PrecedingParameters, 0>
            , event: A.Get<PrecedingParameters, 1>
            , meta: A.Get<PrecedingParameters, 2>
            , __inferralHint: MachineDefinition.Internal<{
                "Machine.Event": Machine.Event.Of<Global, "UseInferForSchema">
              }>
            ): void
          , type?:
              | "xstate.assign"
              | "xstate.send"
          }
    }
  }

  export namespace AssignAction {
    export type Creator =
      { < C
        , E
        , A extends (context: C, event: E) => { [K in keyof C]?: C[K] }
        >
          ( assignment: A
          ):
            { (context: C, event: E, meta: unknown, __inferralHint: unknown): void
            , type: "xstate.assign"
            , assignment: A
            }

        < C
        , E
        , A extends { [K in keyof C]?: (context: C[K], event: E) => C[K] }
        >
          ( assignment: A
          ):
            { (context: C, event: E, meta: unknown, __inferralHint: unknown): void
            , type: "xstate.assign"
            , assignment: A
            }
      }
  }

  export namespace SendAction {
    export type Creator =
      < InferralHint
      , Event extends EventWithInferralHint<Event, InferralHint>
      > (event: Event) =>
        { (context: unknown, event: unknown, meta: unknown, __inferralHint: InferralHint): void
        , type: "xstate.send"
        , event: Event extends A.String ? { type: Event } : Event
        }


    type EventWithInferralHint<
      Self,
      InferralHint,
      SpecEvent = A.Get<InferralHint, [MachineDefinition.$$Internal, "Machine.Event"]>,
      SpecEventType =
        SpecEvent extends any
          ? { type: A.Get<SpecEvent, "type"> } extends SpecEvent
              ? A.Get<SpecEvent, "type">
              : never
          : never
    > =
      | ( SpecEventType extends any
            ? S.InferNarrowest<SpecEventType>
            : never
        )
      | ( { type:
              S.IsLiteral<A.Get<Self, "type">> extends true
                ? A.Get<Self, "type"> extends A.Get<SpecEvent, "type">
                    ? S.InferNarrowest<A.Get<Self, "type">>
                    : S.InferNarrowest<A.Get<SpecEvent, "type">>
                : S.InferNarrowest<A.Get<SpecEvent, "type">>
          }
        & ( U.Extract<SpecEvent, { type: A.Get<Self, "type"> }> extends infer E
              ? [E] extends [never] ? {} :
                E extends any
                  ? { [K in keyof E as U.Exclude<K, "type">]: E[K] }
                  : never
              : never
          )
        )
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
