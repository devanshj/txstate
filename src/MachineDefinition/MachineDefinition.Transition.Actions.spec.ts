import { createMachine } from ".."

let testA = createMachine({
  initial: "a",
  states: {
    a: {
      on: {
        A: {
          target: "a",
          actions: [{ type: "foo", exec: x => x, bar: 10 }, "ha"]
        },
        B: {
          target: "a",
          actions: "foo"
        },
        C: {
          target: "a",
          actions: x => x
        },
        D: {
          target: "a",
          actions: { type: "foo", exec: x => x, bar: 10 }
        }
      }
    }
  } 
})

testA.config.states.a.on.A.actions[0].type === "foo"
// @ts-expect-error
testA.config.states.a.on.A.actions[0].type === ""

testA.config.states.a.on.A.actions[0].exec("TODO")
// @ts-expect-error
testA.config.states.a.on.A.actions[0].exec("")

testA.config.states.a.on.A.actions[0].bar === 1

testA.config.states.a.on.A.actions[1] === "ha"
// @ts-expect-error
testA.config.states.a.on.A.actions[1] === ""

testA.config.states.a.on.B.actions === "foo"
// @ts-expect-error
testA.config.states.a.on.B.actions === ""

testA.config.states.a.on.D.actions.type === "foo"
// @ts-expect-error
testA.config.states.a.on.D.actions.type === ""

testA.config.states.a.on.D.actions.exec("TODO")
// @ts-expect-error
testA.config.states.a.on.D.actions.exec("")

testA.config.states.a.on.D.actions.bar === 1

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
