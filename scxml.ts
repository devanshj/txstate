type TODO = any;

declare const machine:
  <C extends Config<C>>(config: C) => C & MachineTag;

declare const childMachine:
  <C extends Config<C>>(config: C) => C & ChildMachineTag;

interface MachineTag
  { __type: "Machine" }

interface ChildMachineTag
  { __type: "ChildMachine" }

interface Config<Config>
  { readonly initial: InitialState<Config>
  , readonly states: States<Config>
  };

type InitialState<Config> =
  keyof Prop<Config, "states">

interface States<Config>
  { readonly [S: string]: State<Config> };

type State<Config> =
  | StateWithoutChildMachine<Config>
  | StateWithChildMachine<Config>

interface StateWithChildMachine<Config>
  extends StateBase<Config>, ChildMachineTag {};

interface StateWithoutChildMachine<Config>
  extends StateBase<Config>, UseChildMachineFactoryToFixThisError {};

interface StateBase<Config>
  { readonly on?:
    { readonly [E: string]: keyof Prop<Config, "states">
    }
  }  

interface UseChildMachineFactoryToFixThisError
  { initial?: never
  , states?: never
  }

type Prop<T, K> = K extends keyof T ? T[K] : never;

const lightMachine = machine({
  initial: "green",
  states: {
    green: { on: { TIMER: "yellow" } },
    yellow: { on: { TIMER: "red" } },
    red: {
      on: { TIMER: "green" },
      ...childMachine({
        initial: "stop",
        states: {
          walk: {
            on: {
              PED_COUNTDOWN: "wait"
            }
          },
          wait: {
            on: {
              PED_COUNTDOWN: "stop"
            }
          },
          stop: {},
          blinking: {}
        }
      })
    }
  } 
})