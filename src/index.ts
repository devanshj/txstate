import { A } from "./extras";
import MachineDefinition from "./MachineDefinition";

export declare const Machine:
  <D extends MachineDefinition.Of<D>>(definition: A.InferNarrowestObject<D>) => "TODO"
 
export declare const createSchema: <T>() => T
