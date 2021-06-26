import { A, O, U } from "./extras";
import MachineDefinition from "./MachineDefinition";

type Machine<
  _D, // in an machine with error this would be MachineDefinition.Of<D> otherwise it'll be D
  D =
    _D extends { [_ in MachineDefinition.$$Self]: unknown }
      ? U.Exclude<O.Get<_D, MachineDefinition.$$Self>, undefined>
      : _D
> =
  { config: D
  }

export declare const Machine:
  <D extends MachineDefinition.Of<D>>(definition: A.InferNarrowestObject<D>) =>
    Machine<D>
 
export declare const createSchema: <T>() => T
