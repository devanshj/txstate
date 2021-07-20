import { createMachine, createSchema } from "..";
import { A } from "../extras";

createMachine({
  initial: "a",
  context: {},
  states: { a: {} }
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

let t0 = createMachine({
  context: { foo: 1 },
  initial: "a",
  states: {
    a: {
      type: "final",
      on: {
        X: "b"
      },
      data: (c, e) => {
        A.tests([
          A.areEqual<typeof c, { foo: number }>(),
          A.areEqual<typeof e, { type: "X" }>()
        ])
        return "foo" as const
      }
    },
    b: {
      type: "final",
      data: {
        bar: (c, e) => {
          A.tests([
            A.areEqual<typeof c, { foo: number }>(),
            A.areEqual<typeof e, { type: "X" }>()
          ])
          return c.foo + 2
        },
        x: 100
      }
    }
  }
})
/* TODO 4.4.0 regression
A.tests([
  A.areEqual<
    typeof t0.config.states.a.data,
    (c: { foo: number }, e: { type: "X" }) => "foo"
  >(),
  A.areEqual<
    typeof t0.config.states.b.data,
    { bar: (c: { foo: number }, e: { type: "X" }) => number
    , x: number
    }
  >()
])
*/

createMachine({
  context: { foo: 1 },
  initial: "a",
  states: {
    a: {
      // @ts-expect-error
      data: { x: 100 }
    }
  }
})

let t1 = createMachine({
  context: {},
  initial: "a",
  states: {
    a: {
      tags: ["foo", "bar"]
    }
  }
})
A.test(A.areEqual<
  typeof t1.config.states.a.tags,
  ["foo", "bar"]
>())

let t2 = createMachine({
  context: { foo: 1 },
  initial: "a",
  states: {
    a: {
      after: [
        { target: "a", delay: 100 },
        { // @ts-ignore TODO unexpected error
          target: "a",
          delay: (c, e) => {
            A.tests([
              A.areEqual<typeof c, { foo: number }>(),
              A.areEqual<typeof e, { type: "X" }>()
            ])
            return 100
          }
        },
        { 
          target: "a",
          // @ts-expect-error
          delay: () => {}
        }
      ],
      on: {
        X: "a"
      }
    },
    b: {
      after: {
        100: { target: "a" },
        200: {
          target: "b",
          // @ts-expect-error
          delay: 10
        }
      }
    },
    c: { after: ["a"] },
    d: { after: { target: "a" } }
  }
})

let t3 = createMachine({
  context: {},
  initial: "a",
  states: {
    a: {
      _: null,
      invoke: [
        { 
          src: "foo",
          onDone: {
            target: "a"
          }
        }
      ]
    }
  }
})
A.test(A.areEqual<typeof t3.config.states.a.invoke[0]["src"], "foo">())
A.test(A.areEqual<typeof t3.config.states.a.invoke[0]["onDone"]["target"], "a">())

createMachine({
  context: { foo: 1 },
  initial: "a",
  states: {
    a: {
      _: null,
      invoke: [
        { src: "foo" },
        // @ts-expect-error
        (c, e) => {
          A.tests([
            A.areEqual<typeof c, { foo: number }>(),
            A.areEqual<typeof e, { type: "X" } | { type: "xstate.init" }>()
          ])
        }
      ],
      on: {
        X: "a"
      }
    }
  }
})
