import MachineInstant from "..";
import { L, O, Type } from "../../extras";
import MachineDefinition from "../../MachineDefinition";
import { ReferencePathString } from "../../universal";

export type PedestrianStates = {
  initial: "walk",
  states: {
    walk: {
      on: {
        PED_COUNTDOWN: "wait"
      },
      entry: "enter_walk",
      exit: "exit_walk"
    },
    wait: {
      on: {
        PED_COUNTDOWN: "stop"
      },
      entry: "enter_wait",
      exit: "exit_wait"
    },
    stop: {
      entry: ["enter_stop"],
      exit: ["exit_stop"]
    }
  }
};

export type LightMachine = {
  key: "light",
  initial: "green",
  states: {
    green: {
      on: {
        TIMER: "yellow",
        POWER_OUTAGE: "red",
        NOTHING: "green"
      },
      entry: "enter_green",
      exit: "exit_green"
    },
    yellow: {
      on: {
        TIMER: "red",
        POWER_OUTAGE: "red"
      },
      entry: "enter_yellow",
      exit: "exit_yellow"
    },
    red: {
      on: {
        TIMER: "green",
        POWER_OUTAGE: "red",
        NOTHING: "red"
      },
      entry: "enter_red",
      exit: "exit_red"
    } & PedestrianStates
  }
};

export type NewPedestrianStates = {
  initial: "walk",
  states: {
    walk: {
      on: {
        PED_COUNTDOWN: "wait"
      },
      entry: "enter_walk",
      exit: "exit_walk"
    },
    wait: {
      on: {
        PED_COUNTDOWN: "stop"
      },
      entry: "enter_wait",
      exit: "exit_wait"
    },
    stop: {
      entry: ["enter_stop"],
      exit: ["exit_stop"]
    }
  }
};

export type NewLightMachine = {
  key: "light",
  initial: "green",
  states: {
    green: {
      on: {
        TIMER: "yellow",
        POWER_OUTAGE: "red",
        NOTHING: "green"
      },
      entry: "enter_green",
      exit: "exit_green"
    },
    yellow: {
      on: {
        TIMER: "red",
        POWER_OUTAGE: "red"
      },
      entry: "enter_yellow",
      exit: "exit_yellow"
    },
    red: {
      on: {
        TIMER: "green",
        POWER_OUTAGE: "red",
        NOTHING: "red"
      },
      entry: "enter_red",
      exit: "exit_red",
    } & NewPedestrianStates
  }
};

export type ParallelMachine = {
  type: "parallel",
  states: {
    a: {
      initial: "a1",
      states: {
        a1: {
          on: {
            CHANGE: { target: "a2", actions: ["do_a2", "another_do_a2"] }
          },
          entry: "enter_a1",
          exit: "exit_a1"
        },
        a2: { entry: "enter_a2", exit: "exit_a2" }
      },
      entry: "enter_a",
      exit: "exit_a"
    },
    b: {
      initial: "b1",
      states: {
        b1: {
          on: { CHANGE: { target: "b2", actions: "do_b2" } },
          entry: "enter_b1",
          exit: "exit_b1"
        },
        b2: { entry: "enter_b2", exit: "exit_b2" }
      },
      entry: "enter_b",
      exit: "exit_b"
    }
  }
};

export type DeepMachine = {
  initial: "a",
  states: {
    a: {
      initial: "a1",
      states: {
        a1: {
          on: {
            NEXT: "a2",
            NEXT_FN: "a3"
          },
          entry: "enter_a1",
          exit: "exit_a1"
        },
        a2: {
          entry: "enter_a2",
          exit: "exit_a2"
        },
        a3: {
          on: {
            NEXT: {
              target: "a2",
              actions: [
                (() => void) & { name: "do_a3_to_a2" }
              ]
            }
          },
          entry: (() => void) & { name: "enter_a3_fn" },
          exit: (() => void) & { name: "exit_a3_fn" }
        }
      },
      entry: "enter_a",
      exit: ["exit_a", "another_exit_a"],
      on: { CHANGE: "b" }
    },
    b: {
      entry: ["enter_b", "another_enter_b"],
      exit: "exit_b",
      initial: "b1",
      states: {
        b1: {
          entry: "enter_b1",
          exit: "exit_b1"
        }
      }
    }
  }
};

export type ParallelMachine2 = {
  initial: "A",
  states: {
    A: {
      on: {
        "to-B": "B"
      }
    },
    B: {
      type: "parallel",
      on: {
        "to-A": "A"
      },
      states: {
        C: {
          initial: "C1",
          states: {
            C1: {},
            C2: {}
          }
        },
        D: {
          initial: "D1",
          states: {
            D1: {
              on: {
                "to-D2": "D2"
              }
            },
            D2: {
              entry: ["D2 Entry"],
              exit: ["D2 Exit"]
            }
          }
        }
      }
    }
  }
};

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
  TransitionWithInstant<D, { configuration: O.Get<I, "configuration"> }, E>;
type ActionTypes<I, As = O.Get<I, "actions">> = { [I in keyof As]: O.Get<As[I], "type"> }

// should return the entry actions of an initial state
Type.tests([
  Type.areEqual<
    ActionTypes<Initial<LightMachine>>,
    ["enter_green"]
  >()
])

// should return the entry actions of an initial state (deep)
Type.tests([
  Type.areEqual<
    ActionTypes<Initial<DeepMachine>>,
    ["enter_a", "enter_a1"]
  >()
])

/* TODO: works only for lang server not tsc
// should return the entry actions of an initial state (parallel)
Type.tests([
  Type.areEqual<
    ActionTypes<Initial<ParallelMachine>>,
    ["enter_a", "enter_a1", "enter_b", "enter_b1"]
  >()
])
*/

// should return the entry and exit actions of a transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "green", "TIMER">>,
    ["exit_green", "enter_yellow"]
  >()
])

// should return the entry and exit actions of a deep transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "yellow", "TIMER">>,
    ["exit_yellow", "enter_red", "enter_walk"]
  >()
])

// should return the entry and exit actions of a nested transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "red.walk", "PED_COUNTDOWN">>,
    ["exit_walk", "enter_wait"]
  >()
])

// should not have actions for unhandled events (shallow)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "green", "FAKE">>,
    []
  >()
])

// should not have actions for unhandled events (deep)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "red", "FAKE">>,
    []
  >()
])

// should exit and enter the state for self-transitions (shallow)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "green", "NOTHING">>,
    ["exit_green", "enter_green"]
  >()
])

// should exit and enter the state for self-transitions (deep)
// TODO: xstate test has "red" instead of "red.walk" idk if that"s acceptable
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<LightMachine, "red.walk", "NOTHING">>, 
    ["exit_walk", "exit_red", "enter_red", "enter_walk"]
  >()
])

/* TODO: has conflicting transitions ig
// should return actions for parallel machines
Type.tests([
  Type.areEqual<
    ActionTypes<TransitionWithInstantConfiguration<ParallelMachine, Initial<ParallelMachine>, "CHANGE">>,
    ["exit_b1", "exit_a1", "do_a2", "another_do_a2", "do_b2", "enter_a2", "enter_b2"]
  >()
])
*/

// should return nested actions in the correct (child to parent) order
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<DeepMachine, "a.a1", "CHANGE">>,
    [
      "exit_a1",
      "exit_a",
      "another_exit_a",
      "enter_b",
      "another_enter_b",
      "enter_b1"
    ]
  >()
])

// should ignore parent state actions for same-parent sub-states
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<DeepMachine, "a.a1", "NEXT">>,
    ["exit_a1", "enter_a2"]
  >()
])

// should work with function actions
Type.tests([
  Type.areEqual<
    ActionTypes<TransitionWithInstantConfiguration<
      DeepMachine,
      Initial<DeepMachine>,
      "NEXT_FN"
    >>,
    ["exit_a1", "enter_a3_fn"]
  >(),
  Type.areEqual<
    ActionTypes<Transition<DeepMachine, "a.a3", "NEXT">>,
    ["exit_a3_fn", "do_a3_to_a2", "enter_a2"]
  >()
])

/* TODO: some shits going on idk fuck it for now
// should exit children of parallel state nodes
Type.tests([
  Type.areEqual<
    TransitionWithInstantConfiguration<
      ParallelMachine2,
      Initial<ParallelMachine2>,
      "to-B"
    > extends infer StateB ?
    TransitionWithInstant<
      ParallelMachine2,
      StateB,
      "to-D2"
    > extends infer StateD2 ?
    TransitionWithInstant<
      ParallelMachine2,
      StateD2,
      "to-A"
    > extends infer StateA ?
      ActionTypes<StateA>
    : never : never : never,
    ["D2 Exit"]
  >()
])
*/


// should ignore same-parent state actions (sparse)
type PingPong = {
  initial: "ping",
  id: "machine",
  states: {
    ping: {
      entry: ["entryEvent"],
      on: {
        TICK: "pong"
      },
      initial: "foo",
      states: {
        foo: {
          on: {
            TACK: "bar",
            ABSOLUTE_TACK: "#machine.ping.bar"
          }
        },
        bar: {
          on: {
            TACK: "foo"
          }
        }
      }
    },
    pong: {
      on: {
        TICK: "ping"
      }
    }
  }
}
Type.tests([
  // with a relative transition
  Type.areEqual<
    Transition<PingPong, "ping.foo", "TACK">["actions"],
    []
  >(),

  // with an absolute transition
  Type.areEqual<
    Transition<PingPong, "ping.foo", "ABSOLUTE_TACK">["actions"],
    []
  >(),
])

// should return the entry actions of an initial state
Type.tests([
  Type.areEqual<
    ActionTypes<Initial<NewLightMachine>>,
    ["enter_green"]
  >()
])


// should return the entry and exit actions of a transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "green", "TIMER">>,
    ["exit_green", "enter_yellow"]
  >()
])

// should return the entry and exit actions of a deep transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "yellow", "TIMER">>,
    ["exit_yellow", "enter_red", "enter_walk"]
  >()
])

// should return the entry and exit actions of a nested transition
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "red.walk", "PED_COUNTDOWN">>,
    ["exit_walk", "enter_wait"]
  >()
])

// should not have actions for unhandled events (shallow)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "green", "FAKE">>,
    []
  >()
])

// should not have actions for unhandled events (deep)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "red", "FAKE">>,
    []
  >()
])


// should exit and enter the state for self-transitions (shallow)
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "green", "NOTHING">>,
    ["exit_green", "enter_green"]
  >()
])

// should exit and enter the state for self-transitions (deep)
// TODO: (same as above) xstate test has "red" instead of "red.walk" idk if that"s acceptable
Type.tests([
  Type.areEqual<
    ActionTypes<Transition<NewLightMachine, "red.walk", "NOTHING">>,
    ["exit_walk", "exit_red", "enter_red", "enter_walk"]
  >()
])

// should return entry action defined on parallel state
type ParallelMachineWithEntry = {
  id: "fetch",
  context: { attempts: 0 },
  initial: "start",
  states: {
    start: {
      on: { ENTER_PARALLEL: "p1" }
    },
    p1: {
      type: "parallel",
      entry: "enter_p1",
      states: {
        nested: {
          initial: "inner",
          states: {
            inner: {
              entry: "enter_inner"
            }
          }
        }
      }
    }
  }
};

Type.tests([
  Type.areEqual<
    ActionTypes<Transition<ParallelMachineWithEntry, "start", "ENTER_PARALLEL">>,
    ["enter_p1", "enter_inner"]
  >()
])

/*
// TODO: some weird shit is happing here, the type resolution is nondeterministic
type WhateverMachine = {
  initial: "one",
  on: {
    WHATEVER: {
      actions: (() => {}) & { name: "gotWhatever" }
    }
  },
  states: {
    one: {
      entry: (() => {}) & { name: "enteredOne" },
      always: "two"
    },
    two: {
      exit: (() => {}) & { name: "exitedTwo" }
    }
  }
}
Type.tests([
  Type.areEqual<
    ActionTypes<TransitionWithInstant<
      WhateverMachine,
      Initial<WhateverMachine>,
      "WHATEVER"
    >>,
    ["enteredOne", "gotWhatever"]
  >(x => {})
])
*/
