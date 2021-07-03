import { createMachine, createSchema } from "..";

createMachine({
  initial: "a",
  context: {},
  states: { a: {} },
});


createMachine({
  // @ts-expect-error
  initial: "b",
  context: {},
  states: { a: {} }
})


createMachine({
  initial: "a",
  context: {},
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
  context: {},
  states: { a: {} }
})


createMachine({
  // @ts-expect-error 
  initial: 1,
  context: {},
  // @ts-expect-error
  states: { 1: {} }
})


createMachine({
  type: "atomic",
  // @ts-expect-error
  initial: "a",
  context: {},
  // @ts-expect-error
  states: { a: {} }
})


createMachine({
  context: {}
})

createMachine({
  type: "parallel",
  // @ts-expect-error
  initial: "a",
  context: {},
  states: { a: {}, b: {} }
})

createMachine({
  context: {},
  states: {
    // @ts-expect-error
    "a.b": {}
  }
})

createMachine({
  schema: {
    // @ts-expect-error
    context: ""
  }
})

createMachine({
  schema: {
    context: createSchema<{ foo: number }>()
  },
  context: {
    // @ts-expect-error
    foo: ""
  }
})


createMachine({
  schema: {
    context: createSchema<{ foo: number }>()
  },
  // @ts-expect-error
  context: () => ({ foo: "" })
})

createMachine({
  schema: {
    context: createSchema<{ foo: number }>()
  },
  context: { foo: 1 }
})

createMachine({
  schema: {
    context: createSchema<{ foo: number }>()
  },
  context: () => ({ foo: 1 })
})

createMachine({
  // @ts-expect-error
  context: ""
})

createMachine({
  // @ts-expect-error
  context: () => ""
})

createMachine({
  context: { foo: 1 }
})

createMachine({
  context: () => ({ foo: 1 })
})
