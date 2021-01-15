import { A, O, S } from "../extras";
import MachineDefinition from "../MachineDefinition";
import { ReferencePathString } from "../universal";

export default MachineInstant;
namespace MachineInstant {
  export type Transition<
    Definition extends A.Object,
    Instant extends A.Object,
    Event extends A.String | MachineDefinition.Always.$$Event | null,
    Precomputed extends A.Object = MachineDefinition.Precomputed.Of<Definition>,

    State extends A.String = S.Assert<O.Prop<Instant, "state">>, // TODO: parallel
    StateNode = O.Path<Definition, ReferencePathString.ToDefinitionPath<State>>,
    EventMap = O.Prop<MachineDefinition.Precomputed.Get<Precomputed, "TransitionMap">, State>
  > =
    "TODO"

    
  export type InitialState<Definition extends A.Object> = "TODO"
}
