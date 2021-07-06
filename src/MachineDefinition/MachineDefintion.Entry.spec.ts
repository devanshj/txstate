import { createSchema, createMachine } from "..";
import { A } from "../extras";

createMachine({
  initial: "a",
  context: {},
  schema: {
    events: createSchema<
      | { type: "FOO", x: number }
      | { type: "BAR" }
    >()
  },
  states: {
    a: {
      on: {
        FOO: "b.b1",
        BAR: "c",
        // @ts-expect-error
        BAZ: "a"
      },
      always: {
        target: "b.b2"
      }
    },
    b: {
      initial: "b1",
      states: {
        b1: {},
        b2: {}
      },
      entry: (_, event) => {
        A.test(A.areEqual<
          typeof event,
          | { type: "FOO", x: number }
          | { type: "xstate.init" }
        >())
      }
    },
    c: {}
  }
})

createMachine({
  initial: "a",
  context: {},
  schema: {
    // @ts-expect-error
    events: createSchema<
      | { noType: "" }
    >()
  },
  states: {
    a: { }
  }
})

createMachine({
  initial: "a",
  context: {},
  states: {
    a: {
      on: { FOO: "b" }
    },
    b: {
      always: { target: "c" },
      on: { BAR: "a" }
    },
    c: {
      entry: (_, event) => {
        A.tests([
          A.areEqual<typeof event, { type: "FOO" }>()
        ])
      }
    }
  }
})


createMachine({
  initial: "a",
  context: {},
  states: {
    a: {}
  },
  on: {
    X: { target: ".a" }
  },
  entry: [(_, event) => {
    A.test(A.areEqual<typeof event, never>())
  }, "a"]
})

createMachine({
  initial: "a",
  context: {},
  states: {
    a: {}
  },
  on: {
    X: { target: ".a", internal: false }
  },
  entry: (_, event) => {
    A.test(A.areEqual<typeof event, { type: "X" }>())
  }
})

createMachine({
  initial: "a",
  context: {},
  states: {
    a: {
      _: null,
      entry: (_, event) => {
        A.tests([
          A.areEqual<typeof event, { type: "X" } | { type: "xstate.init" }>()
        ])
      }
    },
    b: {
      entry: (_, event) => {
        A.tests([
          A.areEqual<typeof event, { type: "X" }>()
        ])
      }
    },
    c: {
      // @\ts-expect-error TODO
      entry: {}
    }
  },
  on: {
    X: [
      { target: ".a" },
      { target: ".b" }
    ]
  },
})


let testA = createMachine({
  initial: "a",
  context: {},
  states: {
    a: {
      on: { FOO: "b" },
      entry: [(_, event) => {
        A.test(A.areEqual<typeof event, { type: "xstate.init" }>())
      }]
    },
    b: {
      entry: (_, event) => {
        A.test(A.areEqual<typeof event, { type: "FOO" }>())
      }
    },
    c: { entry: "a" },
    d: { entry: [] }
  },
  entry: [(_, event) => {
    A.tests([
      A.areEqual<typeof event, { type: "FOO" }>()
    ])
  }, "a"]
})
/*
TODO: TS 4.4.0 regression
testA.config.entry[0]({} as any, {
  type: "FOO"
})
testA.config.entry[0]({} as any, {
  // @ts-expect-error
  type: ""
})

testA.config.states.a.entry[0]({} as any, {
  type: "xstate.init"
})
testA.config.states.a.entry[0]({} as any, {
  // @ts-expect-error
  type: ""
})

testA.config.entry[1] === "a"
// @ts-expect-error
testA.config.entry[1] === ""

testA.config.states.c.entry === "a";
// @ts-expect-error
testA.config.states.c.entry === "";
*/
