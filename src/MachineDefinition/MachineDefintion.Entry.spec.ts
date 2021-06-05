import { Machine } from "..";
import { Type } from "../extras";

Machine({
  initial: "a",
  states: {
    a: {
      on: {
        FOO: "b.b1",
        BAR: "c"
      },
    },
    b: {
      initial: "b1",
      states: {
        b1: {},
        b2: {}
      },
      entry: (_, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "FOO" }>()
        ])
      }
    },
    c: {}
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
          Type.areEqual<typeof event, { type: "X" }>()
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
