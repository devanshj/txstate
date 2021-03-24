import { Machine } from "..";
import { Type } from "../extras";

Machine({
  initial: "a",
  states: {
    a: {
      on: {
        FOO: "b.b1",
        BAR: "c"
      }
    },
    b: {
      initial: "b1",
      states: {
        b1: {},
        b2: {}
      },
      entry: (context, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "FOO" }>()
        ])
      }
    },
    c: {}
  }
})
