import { Behavior, UnknownActorRef } from "./Behavior";
import { A } from "./extras";
import Machine from "./Machine";
import MachineDefinition from "./MachineDefinition";
import MachineImplementations from "./MachineImplementations";

export declare const createMachine: {
  < D extends
      MachineDefinition.Of<{
        Definition: D,
        Precomputed: P
      }>
  , P = MachineDefinition.Precomputed.Of<D>
  >
    (definition: A.InferNarrowestObject<D>):
      Machine.Of<{ Definition: D, Precomputed: P }>
  
  < D extends
      MachineDefinition.Of<{
        Definition: D,
        Precomputed: P
      }>
  , I extends 
      MachineImplementations.Of<{
        Definition: D,
        Precomputed: P
      }>
  , P = MachineDefinition.Precomputed.Of<D>
  >
    ( definition: A.InferNarrowestObject<D>
    , implementations: I
    ):
      Machine.Of<{ Definition: D, Precomputed: P }>
}
  
 
export declare const createSchema: <T>() => T
export declare const send: Machine.SendAction.Creator;
export declare const assign: Machine.AssignAction.Creator;

export interface UnknownEvent
  { type: string
  }

export declare namespace SCXML {
  export interface Event<E extends UnknownEvent>
    { name: string
    , type: "platform" | "internal" | "external"
    , sendid?: string
    , origin?: UnknownActorRef
    , origintype?: string
    , invokeid?: string
    , data: E
    , $$type: "scxml"
    }
}

export declare const createBehaviorFrom: {
  <T>(x: PromiseLike<T>): Behavior<never, T>
}
