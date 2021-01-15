import { Machine } from "txstate";

Machine({
  initial: "idle",
  states: {
    idle: {
      on: {
        FETCH: "loading",
        CREATE: "creating",
        UPDATE: "updating",
        DELETE: "deleting",
      },
    },
    loading: {},
    updating: {},
    creating: {},
    deleting: {},
    success: {
      on: {
        FETCH: "loading",
        CREATE: "creating",
        UPDATE: "updating",
        DELETE: "deleting",
      },
      initial: "unknown",
      states: {
        unknown: {},
        withData: {},
        withoutData: {},
      },
    },
    failure: {
      on: {
        FETCH: "success",
      }
    }
  }
});
