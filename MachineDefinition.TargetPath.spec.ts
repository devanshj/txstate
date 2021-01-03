import { Machine } from ".";

Machine({
  initial: "a",
  id: "bar",
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
          id: "foo"
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
        B: "a.a1",
        C: {
          target: "#bar.a.a2",
          // @\ts-expect-error TODO enforce internal: false
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
        inactive: {
          id: "lol"
        },
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
    // @ts-expect-error
    DEACTIVATE: [".mode", "#lol"],
    ACTIVATE: [".mode.active", ".status.enabled"],
    FOO: {
      // @ts-expect-error
      target: [".mode", "#lol"]
    },
    BAR: { target: [".mode.active", ".status.enabled"] }
  }
});
