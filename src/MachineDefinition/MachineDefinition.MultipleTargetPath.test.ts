import { Machine } from "..";

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
        pending: {
          id: "xyz"
        },
        active: {}
      }
    },
    status: {
      initial: "enabled",
      states: {
        disabled: {},
        enabled: {}
      },
      // @ts-expect-error
      always: { target: ["mode", "#lol"] }
    }
  },
  always: [
    // @ts-expect-error
    { target: [".mode", "#lol"] },
    // @ts-expect-error
    { target: ["#lol", "#xyz"] },
    { target: [".mode.active", ".status.enabled"] },
    // @ts-expect-error
    { target: ["foobar"] }
  ],
  on: {
    // @ts-expect-error
    DEACTIVATE: [".mode", "#lol"],
    // @ts-expect-error
    A: { target: [".mode", "#lol"] },
    // @ts-expect-error
    Z: ["#lol", "#xyz"],
    // @ts-expect-error
    Y: ["foobar"],
    ACTIVATE: [".mode.active", ".status.enabled"],
    X: [
      // @ts-expect-error
      { target: [".mode", "#lol"] },
      // @ts-expect-error
      { target: ["#lol", "#xyz"] },
      { target: [".mode.active", ".status.enabled"] },
      // @ts-expect-error
      { target: ["foobar"] }
    ],
    FOO: {
      // @ts-expect-error
      target: [".mode", "#lol"]
    },
    BAR: { target: [".mode.active", ".status.enabled"] },
  }
});
