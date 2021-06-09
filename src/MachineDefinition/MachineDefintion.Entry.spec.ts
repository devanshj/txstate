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
  entry: (_, event) => {
    Type.tests([
      Type.areEqual<typeof event, never>()
    ])
  }
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
