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
      always: { target: [
        // @ts-expect-error
        "mode",
        // @ts-expect-error
        "#lol"
      ] }
    }
  },
  always: [
    { target: [
      // @ts-expect-error
      ".mode",
      // @ts-expect-error
      "#lol"
    ] },
    { target: [
      // @ts-expect-error
      "#lol",
      // @ts-expect-error
      "#xyz"
    ] },
    { target: [".mode.active", ".status.enabled"] },
    { target: [
      // @ts-expect-error
      "foobar"
    ] }
  ],
  on: {
    DEACTIVATE: [
      // @ts-expect-error
      ".mode",
      // @ts-expect-error
      "#lol"
    ],
    A: { target: [
      // @ts-expect-error
      ".mode",
      // @ts-expect-error
      "#lol"
    ] },
    Z: [
      // @ts-expect-error
      "#lol",
      // @ts-expect-error
      "#xyz"
    ],
    Y: [
      // @ts-expect-error
      "foobar"
    ],
    ACTIVATE: [".mode.active", ".status.enabled"],
    X: [
      { target: [
        // @ts-expect-error
        ".mode",
        // @ts-expect-error
        "#lol"
      ] },
      { target: [
        // @ts-expect-error
        "#lol",
        // @ts-expect-error
        "#xyz"
      ] },
      { target: [".mode.active", ".status.enabled"] },
      { target: [
        // @ts-expect-error
        "foobar"
      ] }
    ],
    FOO: {
      target: [
        // @ts-expect-error
        ".mode",
        // @ts-expect-error
        "#lol"
      ]
    },
    BAR: { target: [".mode.active", ".status.enabled"] },
  }
})
