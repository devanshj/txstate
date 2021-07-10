import { createMachine, createSchema, send } from ".."
import { A, U } from "../extras"

let t0 = createMachine({
  schema: {
    events: createSchema<
      | { type: "A", foo: number }
      | { type: "B", foo: number }
      | { type: "C", foo: number }
      | { type: "D", bar: number }
    >()
  },
  context: {},
  initial: "a",
  states: {
    a: {
      on: {
        A: {
          target: "a",
          actions: [{
            type: "foo",
            exec: (c, e, m) => {
              A.tests([
                A.areEqual<typeof e, { type: "A", foo: number }>(),
                A.areEqual<typeof m, { action: { type: "foo", bar: number } }>()
              ])
              return "A.actions.Called" as const
            },
            bar: 10
          }, "ha"]
        },
        B: {
          target: "a",
          actions: "foo"
        },
        C: {
          target: "a",
          actions: (c, e, m) => {
            A.tests([
              A.areEqual<typeof e, { type: "C", foo: number }>(),
              A.areEqual<typeof m, { action: { type: string } }>()
            ])
            return { fooBarBaz: 100 }
          }
        },
        D: {
          target: "a",
          actions: {
            type: "foo",
            exec: (c, e, m) => {
              A.tests([
                A.areEqual<typeof e, { type: "D", bar: number }>(),
                A.areEqual<typeof m, { action: { type: "foo", bar: number } }>()
              ])
            },
            bar: 10
          }
        }
      }
    }
  } 
})

A.tests([
  A.areEqual<typeof t0.config.states.a.on.A.actions[0]["type"], "foo">(),

  /*A.areEqual<
    typeof t0.config.states.a.on.A.actions[0]["exec"],
    (c: {}, e: { type: "A", foo: number }) => "A.actions.Called"
  >(),*/

  A.areEqual<
    typeof t0.config.states.a.on.A.actions[0]["bar"],
    number
  >(),

  A.areEqual<
    typeof t0.config.states.a.on.A.actions[1],
    "ha"
  >(),

  A.areEqual<
    typeof t0.config.states.a.on.B.actions,
    "foo"
  >(),

  /*A.areEqual<
    typeof t0.config.states.a.on.C.actions,
    (c: {}, e: { type: "C", foo: number }) => { fooBarBaz: number }
  >(),*/

  A.areEqual<
    typeof t0.config.states.a.on.D.actions.type,
    "foo"
  >(),

  /*A.areEqual<
    typeof t0.config.states.a.on.D.actions.exec,
    (c: {}, e: { type: "D", bar: number }) => void
  >(),*/

  A.areEqual<
    typeof t0.config.states.a.on.D.actions.bar,
    number
  >()
])

createMachine({
  initial: "a",
  states: {
    a: {
      on: {
        E: {
          target: "a",
          // @ts-expect-error TODO: better error
          actions: { type: 1 }
        },
        F: {
          target: "a",
          // TODO @\ts-expect-error
          actions: {}
        },
        G: {
          target: "a",
          // @ts-expect-error TODO: better error
          actions: [{ type: 1 }]
        }
      }
    }
  } 
})


let t4 = createMachine({
  schema: {
    events: createSchema<
      | { type: "X" }
      | { type: "Y", bar: number }
      | { type: "Z" }
      | { type: "W" }
    >()
  },
  context: {},
  initial: "a",
  states: {
    a: {
      on: {
        X: {
          target: "a",
          actions: send("X")
        },
        Y: {
          target: "a",
          actions: send({ type: "Z" })
        },
        Z: {
          target: "a",
          actions: [send("X"), "ha"]
        },
        W: {
          target: "a",
          actions: [send("X")]
        }
      }
    }
  }
})

A.tests([
  A.areEqual<typeof t4.config.states.a.on.X.actions.event, { type: "X" }>(),
  // @ts-ignore TODO
  A.areEqual<typeof t4.config.states.a.on.Y.actions.event, { type: "Z" }>(),
  A.areEqual<typeof t4.config.states.a.on.Z.actions[0]["event"], { type: "X" }>(),
  A.areEqual<typeof t4.config.states.a.on.Z.actions[1], "ha">(),
  A.areEqual<typeof t4.config.states.a.on.W.actions[0]["event"], { type: "X" }>()
])


createMachine({
  schema: {
    events: createSchema<
      | { type: "X" }
      | { type: "Y", bar: number }
      | { type: "Z" }
    >()
  },
  context: {},
  initial: "a",
  states: {
    a: {
      on: {
        X: {
          target: "a",
          actions: send(
            // @ts-expect-error
            "Y"
          )
        },
        Y: {
          target: "a",
          actions: send(
            // @ts-expect-error
            { type: "Y" }
          )
        },
        Z: {
          target: "a",
          actions: [send({
            type: "Y",
            // @ts-expect-error
            bar: "hello"
          })]
        }
      }
    }
  }
})

createMachine({
  context: {},
  initial: "a",
  states: {
    a: {
      type: "final",
      data: { bar: () => 10 },
      onDone: {
        target: "a",
        actions: (c, e) => {
          A.tests([
            A.areEqual<
              typeof e.data,
              { bar: number }
            >()
          ])
          let x: string = e.toString()
        }
      },
      on: {
        X: "a"
      }
    }
  }
})
