import { Test } from "ts-toolbelt";
import { Machine } from ".";

Machine({
  initial: "a",
  states: {
    a: { on: { A: "c" } },
    b: { on: { B: "c" } },
    c: {
      entry: (_, event) => {
        Test.checks([
          Test.check<typeof event, { type: "A" } | { type: "B" }, Test.Pass>()
        ])
      }
    }
  }
})

Machine({
  id: "foo",
  initial: "c",
  states: {
    a: { on: { A: "b" } },
    b: { always: { target: "#foo" } },
    c: {
      entry: (_, event) => {
        Test.checks([
          Test.check<typeof event, { type: "A" }, Test.Pass>()
        ])
      }
    }
  }
})
