import { createMachine, createSchema } from "..";

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
  // @ts-expect-error 
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
