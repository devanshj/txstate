import { createMachine } from "..";

createMachine({
  initial: "a",
  id: "bar",
  on: {
    A: "#foo",
    B: ".b.b2",
    C: "#bar.a.a2",
    D: [
      { target: "#baz.b2" },
      { target: "b.b1" },
      // @ts-expect-error
      { target: "xyz" }
    ],
    E: "a",
    F: "b.b1",
    // @ts-expect-error
    Z: "",
    // @ts-expect-error
    W: "bogus"
  },
  states: {
    a: {
      initial: "a1",
      states: {
        a1: {
          id: "foo",
          always: [
            { target: "#baz" },
            // @ts-expect-error
            { target: "zzz" }
          ]
        },
        a2: {}
      }
    },
    b: {
      id: "baz",
      initial: "b1",
      states: {
        b1: {},
        b2: {}
      },
      // delimiter: "/", TODO
      on: {
        A: ".b2",
        B: "a.a2",
        C: {
          target: "#bar.a.a2",
          // TODO @\ts-expect-error enforce internal: false
          internal: true
        },
        // @ts-expect-error
        Z: ""
      }
    }
  }
})

createMachine({
  initial: "a",
  // @ts-expect-error
  id: "bar",
  states: {
    a: {
      // @ts-expect-error
      id: "bar"
    },
    b: {
      // @ts-expect-error
      id: "foo"
    },
    c: {
      // @ts-expect-error
      id: "foo"
    }
  }
})

createMachine({
  // @ts-expect-error
  id: 1,
})

createMachine({
  initial: "a",
  states: {
    a: { on: { FOO: "c" } },
    c: {
      initial: "c1",
      states: {
        c1: {

        }
      }
    }
  }
})


createMachine({
  initial: "a",
  states: {
    a: {
      initial: "p",
      states: {
        p: { on: { X: "q" } },
        q: {}
      }
    }
  },
  // @ts-expect-error
  on: { X: "states" }
})
