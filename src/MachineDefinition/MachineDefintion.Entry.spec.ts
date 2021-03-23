import { Machine } from "..";
import { Type } from "../extras";

Machine({
  initial: "a",
  states: {
    a: {
      on: {
        FOO: "b",
        BAR: "c"
      }
    },
    b: {
      entry: (context, event) => {
        Type.tests([
          Type.areEqual<typeof event, { type: "FOO" }>()
        ])
      },
      _: null
    },
    c: {}
  }
})
