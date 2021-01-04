import { Machine } from ".";

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
      }
    }
  },
  on: {
    // @ts-expect-error
    DEACTIVATE: [".mode", "#lol"],
    // @ts-expect-error
    Z: ["#lol", "#xyz"],
    ACTIVATE: [".mode.active", ".status.enabled"],
    FOO: {
      // @ts-expect-error
      target: [".mode", "#lol"]
    },
    BAR: { target: [".mode.active", ".status.enabled"] }
  }
});
