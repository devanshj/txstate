import MachineInstant from "..";
import { L, O, Type } from "../../extras";
import MachineDefinition from "../../MachineDefinition";
import { ReferencePathString } from "../../universal";


type P<D> = MachineDefinition.Precomputed.Of<D>
type Initial<D> = MachineInstant.Initial<D, P<D>>;
type Transition<D, _As, E, As = _As extends any[] ? _As : [_As]> =
  MachineInstant.Transition<
    D, P<D>,
    { configuration:
        L.FilterDuplicates<L.ConcatAll<{
          [I in keyof As]: L.Concat<ReferencePathString.ProperAncestorsReversed<As[I]>, [As[I]]>
        }>>
    , actions: []
    },
    { type: E }
  >
type TransitionWithInstant<D, I, E> =
  MachineInstant.Transition<D, P<D>, I, { type: E }>;
type TransitionWithInstantConfiguration<D, I, E> =
  TransitionWithInstant<D, { configuration: O.Get<I, "configuration"> }, E>

Type.tests([
  Type.areEqual<O.Get<Transition<{
    initial: "a",
    states: {
      a: {
        on: { FOO: "b" }
      },
      b: {
        always: { target: "c" },
        on: { BAR: "a" }
      },
      c: {
        entry: () => void
      }
    }
  }, "a", "FOO">, "configuration">, ["", "c"]>()
])

