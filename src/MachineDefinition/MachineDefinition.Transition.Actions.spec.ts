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
  initial: "a",
  states: {
    a: {
      on: {
        A: {
          target: "a",
          actions: [{
            type: "foo",
            exec: (c, e) => {
              A.test(A.areEqual<typeof e, { type: "A", foo: number }>())
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
          actions: (c, e) => {
            A.test(A.areEqual<typeof e, { type: "C", foo: number }>())
            return { fooBarBaz: 100 }
          }
        },
        D: {
          target: "a",
          actions: {
            type: "foo",
            exec: (c, e) => {
              A.test(A.areEqual<typeof e, { type: "D", bar: number }>())
            },
            bar: 10
          }
        }
      }
    }
  } 
})

t0.config.states.a.on.A.actions[0].type === "foo"
// @ts-expect-error
t0.config.states.a.on.A.actions[0].type === ""

let t1 = t0.config.states.a.on.A.actions[0].exec("TODO", { type: "A", foo: 1 })
A.test(A.areEqual<typeof t1, "A.actions.Called">())
// @ts-expect-error
t0.config.states.a.on.A.actions[0].exec()

t0.config.states.a.on.A.actions[0].bar === 1
// @ts-expect-error
t0.config.states.a.on.A.actions[0].bar === ""

t0.config.states.a.on.A.actions[1] === "ha"
// @ts-expect-error
t0.config.states.a.on.A.actions[1] === ""

t0.config.states.a.on.B.actions === "foo"
// @ts-expect-error
t0.config.states.a.on.B.actions === ""

let t2 = t0.config.states.a.on.C.actions("TODO", { type: "C", foo: 1 })
A.test(A.areEqual<typeof t2, { fooBarBaz: number }>())
// @ts-expect-error
t0.config.states.a.on.C.actions()

t0.config.states.a.on.D.actions.type === "foo"
// @ts-expect-error
t0.config.states.a.on.D.actions.type === ""

let t3 = t0.config.states.a.on.D.actions.exec("TODO", { type: "D", bar: 1 })
A.test(A.areEqual<typeof t3, void>())
// @ts-expect-error
t0.config.states.a.on.D.actions.exec()

t0.config.states.a.on.D.actions.bar === 1
// @ts-expect-error
t0.config.states.a.on.D.actions.bar === ""

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
A.test(A.areEqual<typeof t4.config.states.a.on.X.actions.event, { type: "X" }>())
// @ts-ignore TODO
A.test(A.areEqual<typeof t4.config.states.a.on.Y.actions.event, { type: "Z" }>())
let t5 = t4.config.states.a.on.Z.actions[0].event;
A.test(A.areEqual<typeof t5, { type: "X" }>())
A.test(A.areEqual<typeof t4.config.states.a.on.Z.actions[1], "ha">())
let t51 = t4.config.states.a.on.W.actions[0].event;
A.test(A.areEqual<typeof t51, { type: "X" }>())


createMachine({
  schema: {
    events: createSchema<
      | { type: "X" }
      | { type: "Y", bar: number }
      | { type: "Z" }
    >()
  },
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
