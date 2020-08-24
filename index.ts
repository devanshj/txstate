declare const machine:
  <D extends MachineDefinition.Of<D>>(definition: D) => MachineHandle.Of<D> & Tag<"Machine">;

namespace MachineDefinition {
  export type Of<D> =
    { initial:
      { value: keyof Prop<D, "states">
      , context?: unknown
      }
    , states: { [state in string]: State<keyof Prop<D, "states">, unknown, unknown, unknown> }
    };

  type State<T, Ci, E, Co> =
    | (
      & StateBase<T, Ci, E, Co>
      & { initial?: never
        , states?: never
        }
      )
    | (
      & StateBase<T, Ci, E, Co>
      & Tag<"ChildMachine">
      );

  type StateBase<T, Ci, E, Co> =
    { on?:
      { [event in string]:
        | T
        | { target?: T
          , actions: Array<(c: Ci, e: E) => Co>
          }
      }
    }
}

namespace MachineHandle {
  export type Of<D> = {
    transition: (event: Event<D>) => State<D>
  }

  type Event<D> = {
    [S in StateIdentifier<D>]: {
      [E in keyof Transitions<D, S>]:
        HasTransition<D, S> extends true
          ? { type: E } & EventPayloadFromActions<Actions<D, S, E>>
          : never
    }[keyof Transitions<D, S>]
  }[StateIdentifier<D>]

  type EventPayloadFromActions<Actions> =
    Actions extends []
      ? never
      : Prop<Actions, number> extends (_: any, payload: infer P) => any
        ? P
        : never;

  type State<D> =
    | {
        [S in StateIdentifier<D>]:
          { [E in keyof Transitions<D, S>]:
            HasTransition<D, S> extends true
              ? { value: Target<D, S, E>
                , context: ContextFromActions<Actions<D, S, E>>
                }
              : never
          }[keyof Transitions<D, S>]
      }[StateIdentifier<D>]
    | Prop<D, "initial">

  type ContextFromActions<Actions> =
    Actions extends []
      ? never
      : Prop<Actions, number> extends (ci: any, payload: any) => infer Co
        ? Co
        : never;

  type StateIdentifier<D> = keyof Prop<D, "states">;
  type Transitions<D, S> = Prop3<D, "states", S, "on", {}>;
  type HasTransition<D, S> = Not<AreEqual<Prop3<D, "states", S, "on">, {}>>
  type Transition<D, S, E> = Prop4<D, "states", S, "on", E>;
  type Actions<D, S, E> = Prop<Transition<D, S, E>, "actions", []>;
  type Target<D, S, E> =
    Transition<D, S, E> extends string
      ? Transition<D, S, E>
      : Prop<Transition<D, S, E>, "target", S>;
}

type Prop<T, A, F = never> = A extends keyof T ? T[A] extends undefined ? F : T[A] : F;
type Prop2<T, A, B, F = never> = Prop<Prop<T, A>, B, F>
type Prop3<T, A, B, C, F = never> = Prop<Prop2<T, A, B>, C, F>;
type Prop4<T, A, B, C, D, F = never> = Prop<Prop3<T, A, B, C>, D, F>;
type Prop5<T, A, B, C, D, E, F = never> = Prop<Prop4<T, A, B, C, D>, E, F>;
type AreEqual<A, B> =
  Exclude<A, B> extends never
    ? Exclude<B, A> extends never
      ? true
      : false
    : false;
type Not<T> = T extends true ? false : true;
type Opaque<T> = { __value: T };
type FromOpaque<T> = T extends Opaque<infer V> ? V : never;
type Tag<N extends string> = { __type: N };
type Brand<T, N extends string, E = {}> = T & { __brand: N } & E;
type Cast<T, U> = T extends U ? T : U;

const promiseMachine = machine({
  initial: { value: "pending", context: {} },
  states: {
    pending: {
      on: {
        FULFILL: {
          target: "fulfilled",
          actions: [
            (_: {}, { value }: { value: unknown }) => ({ value })
          ]
        },
        REJECT: {
          target: "rejected",
          actions: [
            (_: {}, { error }: { error: unknown }) => ({ error })
          ]
        }
      }
    },
    fulfilled: {},
    rejected: {}
  }
});

// @ts-expect-error
promiseMachine.transition({ type: "FOO" })

// @ts-expect-error
promiseMachine.transition({ type: "FULFILL" })

promiseMachine.transition({ type: "FULFILL", value: 100 })

// @ts-expect-error
promiseMachine.transition({ type: "REJECT" })

promiseMachine.transition({ type: "REJECT", error: new Error() })

// @ts-expect-error
promiseMachine.transition({ type: "REJECT", error: new Error(), foo: "foo" })


let nextState = promiseMachine.transition({ type: "FULFILL", value: 100 })

// @ts-expect-error
nextState.value === "foo"

// @ts-expect-error
nextState.context.value

if (nextState.value === "fulfilled") {
  nextState.context.value
}

// @ts-expect-error
nextState.context.error

if (nextState.value === "rejected") {
  nextState.context.error
}