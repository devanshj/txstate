import MachineInstant from ".";
import { B, N, O, Type, U, L, A, S } from "../extras";
import MachineDefinition from "../MachineDefinition";
import { ReferencePathString } from "../universal";

export default MachineInstantMap;
namespace MachineInstantMap {

  export type Of<_D, P, D = MachineDefinition.StateNode.Desugar<_D, "">,
    C = Configuration<D>,
    E = Event<D>,
    CE = C extends any ? E extends any ? EncodeConfigurationEventPair<[C, E]> : never : never
  > =
    { [CE_ in S.Assert<CE>]:
      DecodeConfigurationEventPair<CE_> extends [infer C_, infer E_]
        ? E extends E_
          ? MachineInstant.Transition<D, P,
              { configuration: C_, actions: [] },
              E
            >
          : never
        : never
    }
    

  type TestMap<D> =
    Of<D, MachineDefinition.Precomputed.Of<D>>

  type Lol = EntryEvent<Foo, "c"> extends { [_ in keyof any]: infer X } ? X : never

  type EntryEvent<MachineInstantMap, NodeReferencePathString> =
    { [CE in keyof MachineInstantMap]:
        L.IncludesSubtype<
          O.Get<MachineInstantMap[CE], "actions">,
          { __referencePath: `${S.Assert<NodeReferencePathString>}.entry.0` }
        > extends true
          ? O.Get<DecodeConfigurationEventPair<CE>, 1>
          : never
    }


  type Foo = TestMap<{
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
  }>

  Type.tests([
    Type.areEqual<
      TestMap<{
        initial: "a",
        states: {
          a: {
            on: {
              "TO_B": "b"
            }
          },
          b: {
            entry: () => {}
          }
        }
      }>,
      { ",b|TO_B":
        { configuration: ["", "b"]
        , actions: []
        }
      , ",a|TO_B":
        { configuration: ["", "b"]
        , historyValue: {}
        , actions:
          [ { type: "actions"
            , exec: () => {}
            , __referencePath: "b.entry.0"
            ,
            }
          ]
        }
      }
    >()
  ])


  export type EncodeConfigurationEventPair<CE> =
    `${L.Join<O.Get<CE, 0>, ",">}|${S.Assert<O.Get<O.Get<CE, 1>, "type">>}`
  export type DecodeConfigurationEventPair<S> =
    S extends `${infer C}|${infer E}`
      ? [S.Split<C, ",">, { type: E }]
      : never

  type Configuration<D> =
    ActiveAtomicStates<D, ""> extends infer S
      ? S extends any ? ConfigurationFromAtomicStates<S> : never
      : never

  type TestConfiguration<D> = Configuration<MachineDefinition.StateNode.Desugar<D, "">>

  type ActiveAtomicStates<D, R, N = ReferencePathString.ToNode<R, D>> =
    O.Get<N, "type"> extends "compound"
      ? ReferencePathString.Append<R, keyof O.Get<N, "states">> extends infer Ir
          ? Ir extends any ? ActiveAtomicStates<D, Ir> : never
          : never :
    O.Get<N, "type"> extends "parallel"
      ? ["TODO"] :
    O.Get<N, "type"> extends "history"
      ? ["TODO"] :
    [R]

  type TestActiveAtomicStates<D> =
    ActiveAtomicStates<MachineDefinition.StateNode.Desugar<D, "">, "">

  Type.tests([
    Type.areEqual<
      TestActiveAtomicStates<{
        initial: "a",
        states: {
          a: {},
          b: {},
          c: {}
        }
      }>,
      ["a"] | ["b"] | ["c"]
    >(),
    Type.areEqual<
      TestActiveAtomicStates<{
        initial: "a",
        states: {
          a: {
            initial: "a1",
            states: {
              a1: {},
              a2: {}
            }
          },
          b: {},
          c: {}
        }
      }>,
      ["a.a1"] | ["a.a2"] | ["b"] | ["c"]
    >()
  ])

  type ConfigurationFromAtomicStates<States> =
    MachineInstant.SortWithEntryOrder<U.ToList<
      | O.Get<States, number>
      | ReferencePathString.Ancestor<O.Get<States, number>>
    >>
    
  Type.tests([
    Type.areEqual<
      ConfigurationFromAtomicStates<["a.a1", "b.c.d"]>,
      ["", "a", "a.a1", "b", "b.c", "b.c.d"]
    >()
  ])

  type Event<N> = 
    | (keyof O.Get<N, "on"> extends infer E ? E extends any ? { type: E } : never : never)
    | ( keyof O.Get<N, "states"> extends infer C
          ? [C] extends [never] ? never :
            C extends any ? Event<O.Get<N, ["states", C]>> : never
          : never
      )


  Type.tests([
    Type.areEqual<
      Event<{
        initial: "a",
        states: {
          a: {
            initial: "a1",
            states: {
              a1: {},
              a2: {
                on: { D: {} }
              }
            }
          },
          b: {
            on: { C: {} }
          },
          c: {}
        },
        on: { A: {}, B: {} }
      }>,
      | { type: "A" }
      | { type: "B" }
      | { type: "C" }
      | { type: "D" }
    >()
  ])
}
