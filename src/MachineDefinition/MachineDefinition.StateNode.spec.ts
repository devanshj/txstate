import { Machine } from "..";

Machine({
  initial: "a",
  states: { a: {} },
});


Machine({
  // @ts-expect-error
  initial: "b",
  states: { a: {} }
})


Machine({
  initial: "a",
  states: {
    a: {
      // @ts-expect-error
      initial: "x",
      states: {
        b: {}
      }
    }
  }
})


// @ts-expect-error
Machine({
  states: { a: {} }
})


Machine({
  initial: 1,
  // @ts-expect-error
  states: { 1: {} }
})


Machine({
  type: "atomic",
  // @ts-expect-error
  initial: "a",
  // @ts-expect-error
  states: { a: {} }
})


Machine({})

Machine({
  type: "parallel",
  // @ts-expect-error
  initial: "a",
  states: { a: {}, b: {} }
})

Machine({
  states: {
    // @ts-expect-error
    "a.b": {}
  }
})
