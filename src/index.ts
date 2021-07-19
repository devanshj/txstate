import { Behavior, UnknownActorRef } from "./Behavior";
import { A } from "./extras";
import Machine from "./Machine";
import MachineDefinition from "./MachineDefinition";
import MachineImplementations from "./MachineImplementations";

export declare const createMachine: {
  <D extends MachineDefinition.Of<D>>
    (definition: A.InferNarrowestObject<D>):
      Machine.Of<D, {}>
  
  < D extends MachineDefinition.Of<D>
  , I extends MachineImplementations.Of<D>>
    ( definition: A.InferNarrowestObject<D>
    , implementations: I
    ):
      Machine.Of<D, I>
}
  
 
export declare const createSchema: <T>() => T
export declare const send: Machine.SendAction.Creator;

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
