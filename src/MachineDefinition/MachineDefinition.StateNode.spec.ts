import { createMachine } from "..";

createMachine({
  initial: "a",
  states: { a: {} },
});


createMachine({
  // @ts-expect-error
  initial: "b",
  states: { a: {} }
})


createMachine({
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
createMachine({
  states: { a: {} }
})


createMachine({
  initial: 1,
  // @ts-expect-error
  states: { 1: {} }
})


createMachine({
  type: "atomic",
  // @ts-expect-error
  initial: "a",
  // @ts-expect-error
  states: { a: {} }
})


createMachine({})

createMachine({
  type: "parallel",
  // @ts-expect-error
  initial: "a",
  states: { a: {}, b: {} }
})

createMachine({
  states: {
    // @ts-expect-error
    "a.b": {}
  }
})
