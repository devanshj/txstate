import { A } from "./extras";
import Machine from "./Machine";
import MachineDefinition from "./MachineDefinition";

export declare const createMachine:
  <D extends MachineDefinition.Of<D>>(definition: A.InferNarrowestObject<D>) =>
    Machine.Of<D>
 
export declare const createSchema: <T>() => T
