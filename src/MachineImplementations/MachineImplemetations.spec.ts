import { createMachine, createSchema, send } from "..";
import { A } from "../extras";

type User = { name: string };
createMachine({
  schema: {
    context: createSchema<{ user: null } | { user: User }>(),
    events: createSchema<
      | { type: "LOGIN", user: User }
      | { type: "LOGOUT" }
    >()
  },
  context: { user: null },
  initial: "loggedOut",
  states: {
    loggedOut: {
      on: {
        LOGIN: { target: "loggedIn", actions: "sendLogInAnalytics" }
      }
    },
    loggedIn: {
      on: {
        LOGOUT: { target: "loggedOut", actions: ["foo", "bar"] }
      }
    }
  }
}, {
  actions: {
    sendLogInAnalytics: (c, e) => {
      A.tests([
        A.areEqual<typeof c, { user: User } | { user: null }>(),
        A.areEqual<typeof e, { type: "LOGIN", user: User }>()
      ])
    },
    foo: send(
      // @ts-expect-error
      ""
    ),
    bar: send("LOGIN")
  }
})
