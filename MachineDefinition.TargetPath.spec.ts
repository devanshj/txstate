import { Machine } from ".";

Machine({
  initial: "a",
  id: "bar" as const,
  on: {
    A: "#foo",
    B: ".b.b2",
    C: "#bar.a.a2",
    D: "#baz.b2",
    E: "a",
    F: "b.b1",
    // @ts-expect-error
    Z: ""
  },
  states: {
    a: {
      initial: "a1",
      states: {
        a1: {
          id: "foo" as const
        },
        a2: {}
      }
    },
    b: {
      id: "baz" as const,
      initial: "b1",
      states: {
        b1: {},
        b2: {}
      },
      delimiter: "/" as const,
      on: {
        A: "/b2",
        B: "a/a1",
        c: {
          target: "#bar/a/a2",
          // @ts-expect-error
          internal: true
        },
        // @ts-expect-error
        Z: ""
      }
    }
  }
})

Machine({
  initial: "a",
  // @ts-expect-error
  id: "bar" as const,
  states: {
    a: {
      // @ts-expect-error
      id: "bar" as const
    },
    b: {
      // @ts-expect-error
      id: "foo" as const
    },
    c: {
      // @ts-expect-error
      id: "foo" as const
    }
  }
})

Machine({
  // @ts-expect-error
  id: 1,
})

Machine({
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

Machine({
  id: "settings",
  type: "parallel",
  states: {
    mode: {
      initial: "active",
      states: {
        inactive: {},
        pending: {},
        active: {}
      }
    },
    status: {
      initial: "enabled",
      states: {
        disabled: {},
        enabled: {}
      }
    }
  },
  on: {
    DEACTIVATE: {
      target: [".mode.inactive", ".status.disabled"]
    }
  }
});