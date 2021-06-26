import { createSchema, Machine } from "..";
import { Type } from "../extras";

Machine({
  initial: "a",
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
        Type.tests([
          Type.areEqual<typeof event,
            | { type: "FOO", x: number }
            | { type: "xstate.init" }
          >()
        ])
      }
    },
    c: {}
  }
})

Machine({
  initial: "a",
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

Machine({
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
      entry: (_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "FOO" }>()
        ])
      }
    }
  }
})


Machine({
  initial: "a",
  states: {
    a: {}
  },
  on: {
    X: { target: ".a" }
  },
  entry: [(_, event) => {
    Type.tests([
      Type.areEqual<typeof event, never>()
    ])
  }, "a"]
})

Machine({
  initial: "a",
  states: {
    a: {}
  },
  on: {
    X: { target: ".a", internal: false }
  },
  entry: (_, event) => {
    Type.tests([
      Type.areEqual<typeof event, { type: "X" }>()
    ])
  }
})

Machine({
  initial: "a",
  states: {
    a: {
      _: null,
      entry: (_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "X" } | { type: "xstate.init" }>()
        ])
      }
    },
    b: {
      entry: (_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "X" }>()
        ])
      }
    }
  },
  on: {
    X: [
      { target: ".a" },
      { target: ".b" }
    ]
  },
})


let testA = Machine({
  initial: "a",
  states: {
    a: {
      on: { FOO: "b" },
      entry: [(_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "xstate.init" }>()
        ])
      }]
    },
    b: {
      entry: (_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "FOO" }>()
        ])
      }
    },
    c: {
      entry: "a"
    }
  },
  entry: [(_, event) => {
    Type.tests([
      Type.areEqual<typeof event, { type: "FOO" }>()
    ])
  }, "a"]
})
testA.config.entry[0]({} as any, {
  type: "FOO"
})
testA.config.entry[0]({} as any, {
  // @ts-expect-error
  type: "BAR"
})

testA.config.states.a.entry[0]({} as any, {
  type: "xstate.init"
})
testA.config.states.a.entry[0]({} as any, {
  // @ts-expect-error
  type: "BAR"
})

testA.config.entry[1] === "a"
// @ts-expect-error
testA.config.entry[1] === "b"

testA.config.states.c.entry === "a";
// @ts-expect-error
testA.config.states.c.entry === "b";
