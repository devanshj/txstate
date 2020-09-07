import { Machine } from ".";
import { Test } from "ts-toolbelt"

let test1 = Machine({
  initial: "a",
  states: { a: {} },
});
let diagnosis1 = Machine.dignose({
  initial: "a",
  states: { a: {} },
})
Test.checks([
  Test.check<typeof diagnosis1, "All good!", Test.Pass>()
])


let test2 = Machine({
  // @ts-expect-error
  initial: "b",
  states: { a: {} }
})
let diagnosis2 = Machine.dignose({
  initial: "b",
  states: { a: {} }
})
Test.checks([
  Test.check<typeof diagnosis2, [{
    error: ["state", "b", "is not defined in states"],
    at: ["initial"]
  }], Test.Pass>()
])


let test3 = Machine({
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
let diagnosis3 = Machine.dignose({
  initial: "a",
  states: {
    a: {
      initial: "x",
      states: {
        b: {}
      }
    }
  }
})
Test.checks([
  Test.check<typeof diagnosis3, [{
    error: ["state", "x", "is not defined in states"];
    at: ["states", "a", "initial"];
  }], Test.Pass>()
])

// @ts-expect-error
let test4 = Machine({
  states: { a: {} }
})
let diagnosis4 = Machine.dignose({
  states: { a: {} }
})
Test.checks([
  Test.check<typeof diagnosis4, [{
      error: "initial state is required";
      at: "root";
  }], Test.Pass>()
])


let test5 = Machine({
  initial: 1,
  // @ts-expect-error
  states: { 1: {} }
})
let diagnosis5 = Machine.dignose({
  initial: 1,
  states: { 1: {} }
})
Test.checks([
  Test.check<typeof diagnosis5, [{
      error: "state identifiers should be only strings";
      at: ["states"];
  }], Test.Pass>()
])


// @ts-expect-error
let test6 = Machine({
  type: "atomic",
  initial: "a",
  states: { a: {} }
})
let diagnosis6 = Machine.dignose({
  type: "atomic",
  initial: "a",
  states: { a: {} }
})
Test.checks([
  Test.check<typeof diagnosis6, [{
      error: "The state node is atomic meaning no nested states, so can't have an initial property";
      at: ["initial"];
  }, {
      error: "The state node is atomic meaning no nested states, so can't have an states property";
      at: ["states"];
  }], Test.Pass>()
])


let test7 = Machine({})
let diagnosis7 = Machine.dignose({})
Test.checks([
  Test.check<typeof diagnosis7, "All good!", Test.Pass>()
])

Machine({
  type: "parallel",
  // @ts-expect-error
  initial: "a",
  states: { a: {}, b: {} }
})