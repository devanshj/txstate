type TODO = any;

type StringConstraint = string & { __type?: "StringConstraint" }
type IsStringContraint<T> = T extends { __type?: "StringConstraint" } ? true : false;

type MachineConfigDepth4
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  , StateDepth2 extends StringConstraint
  , InitialStateDepth2 extends StateDepth2  
  , OnEventStateDepth2 extends StateDepth2
  , EventDepth2 extends StringConstraint
  , StateDepth3 extends StringConstraint
  , InitialStateDepth3 extends StateDepth3  
  , OnEventStateDepth3 extends StateDepth3
  , EventDepth3 extends StringConstraint
  , StateDepth4 extends StringConstraint
  , InitialStateDepth4 extends StateDepth4  
  , OnEventStateDepth4 extends StateDepth4
  , EventDepth4 extends StringConstraint
  > =
    { initial: InitialStateDepth0
    , states: 
      { [S in StateDepth0]:
          & { on?: { [E in EventDepth0]: OnEventStateDepth0 } }
          & (
            | {}
            | MachineConfigDepth0<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              >
            | MachineConfigDepth1<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              >
            | MachineConfigDepth2<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              , StateDepth3
              , InitialStateDepth3
              , OnEventStateDepth3
              , EventDepth3
              >
            | MachineConfigDepth3<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              , StateDepth3
              , InitialStateDepth3
              , OnEventStateDepth3
              , EventDepth3
              , StateDepth4
              , InitialStateDepth4
              , OnEventStateDepth4
              , EventDepth4
              >
            )
      }
    }


type MachineConfigDepth3
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  , StateDepth2 extends StringConstraint
  , InitialStateDepth2 extends StateDepth2  
  , OnEventStateDepth2 extends StateDepth2
  , EventDepth2 extends StringConstraint
  , StateDepth3 extends StringConstraint
  , InitialStateDepth3 extends StateDepth3  
  , OnEventStateDepth3 extends StateDepth3
  , EventDepth3 extends StringConstraint
  > =
    { initial: InitialStateDepth0
    , states: 
      { [S in StateDepth0]:
          & { on?: { [E in EventDepth0]: OnEventStateDepth0 } }
          & (
            | {}
            | MachineConfigDepth0<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              >
            | MachineConfigDepth1<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              >
            | MachineConfigDepth2<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              , StateDepth3
              , InitialStateDepth3
              , OnEventStateDepth3
              , EventDepth3
              >
            )
      }
    }

type MachineConfigDepth2
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  , StateDepth2 extends StringConstraint
  , InitialStateDepth2 extends StateDepth2  
  , OnEventStateDepth2 extends StateDepth2
  , EventDepth2 extends StringConstraint
  > =
    { initial: InitialStateDepth0
    , states: 
      { [S in StateDepth0]:
          & { on?: { [E in EventDepth0]: OnEventStateDepth0 } }
          & (
            | {}
            | MachineConfigDepth0<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              >
            | MachineConfigDepth1<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              , StateDepth2
              , InitialStateDepth2
              , OnEventStateDepth2
              , EventDepth2
              >
            )
      }
    }

type MachineConfigDepth1
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  > =
    { initial: InitialStateDepth0
    , states: 
      { [S in StateDepth0]:
          & { on?: { [E in EventDepth0]: OnEventStateDepth0 } }
          & (
            | {}
            | MachineConfigDepth0<
                StateDepth1
              , InitialStateDepth1
              , OnEventStateDepth1
              , EventDepth1
              >
            )
      }
    }

type MachineConfigDepth0
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  > =
    { initial: InitialStateDepth0
    , states: 
      { [S in StateDepth0]:
          & { on?: { [E in EventDepth0]: OnEventStateDepth0 } }
          & { initial?: "we don\"t have typescript definitions this deep"  }
      }
    }


type Scxml
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  , StateDepth2 extends StringConstraint
  , InitialStateDepth2 extends StateDepth2  
  , OnEventStateDepth2 extends StateDepth2
  , EventDepth2 extends StringConstraint
  , StateDepth3 extends StringConstraint
  , InitialStateDepth3 extends StateDepth3  
  , OnEventStateDepth3 extends StateDepth3
  , EventDepth3 extends StringConstraint
  , StateDepth4 extends StringConstraint
  , InitialStateDepth4 extends StateDepth4  
  , OnEventStateDepth4 extends StateDepth4
  , EventDepth4 extends StringConstraint
  > =
    MachineConfigDepth4<
      StateDepth0
    , InitialStateDepth0
    , OnEventStateDepth0
    , EventDepth0
    , StateDepth1
    , InitialStateDepth1
    , OnEventStateDepth1
    , EventDepth1
    , StateDepth2
    , InitialStateDepth2
    , OnEventStateDepth2
    , EventDepth2
    , StateDepth3
    , InitialStateDepth3
    , OnEventStateDepth3
    , EventDepth3
    , StateDepth4
    , InitialStateDepth4
    , OnEventStateDepth4
    , EventDepth4
    >

type Machine<Depths extends Array<{ state: string, event: string }>> =
  Depths;

declare const createMachine:
  < StateDepth0 extends StringConstraint
  , InitialStateDepth0 extends StateDepth0  
  , OnEventStateDepth0 extends StateDepth0
  , EventDepth0 extends StringConstraint
  , StateDepth1 extends StringConstraint
  , InitialStateDepth1 extends StateDepth1  
  , OnEventStateDepth1 extends StateDepth1
  , EventDepth1 extends StringConstraint
  , StateDepth2 extends StringConstraint
  , InitialStateDepth2 extends StateDepth2  
  , OnEventStateDepth2 extends StateDepth2
  , EventDepth2 extends StringConstraint
  , StateDepth3 extends StringConstraint
  , InitialStateDepth3 extends StateDepth3  
  , OnEventStateDepth3 extends StateDepth3
  , EventDepth3 extends StringConstraint
  , StateDepth4 extends StringConstraint
  , InitialStateDepth4 extends StateDepth4  
  , OnEventStateDepth4 extends StateDepth4
  , EventDepth4 extends StringConstraint
  , D = Depth<StateDepth0, StateDepth1, StateDepth2, StateDepth3, StateDepth4>
  >
  (config: 
    Scxml<
        StateDepth0
      , InitialStateDepth0
      , OnEventStateDepth0
      , EventDepth0
      , StateDepth1
      , InitialStateDepth1
      , OnEventStateDepth1
      , EventDepth1
      , StateDepth2
      , InitialStateDepth2
      , OnEventStateDepth2
      , EventDepth2
      , StateDepth3
      , InitialStateDepth3
      , OnEventStateDepth3
      , EventDepth3
      , StateDepth4
      , InitialStateDepth4
      , OnEventStateDepth4
      , EventDepth4
      >
  ) =>
    Machine<
      D extends 0 ? [
        { state: StateDepth0, event: EventDepth0 }
      ] :
      D extends 1 ? [
        { state: StateDepth0, event: EventDepth0 },
        { state: StateDepth1, event: EventDepth1 }
      ] : 
      D extends 2 ? [
        { state: StateDepth0, event: EventDepth0 },
        { state: StateDepth1, event: EventDepth1 },
        { state: StateDepth2, event: EventDepth2 }
      ] :
      D extends 3 ? [
        { state: StateDepth0, event: EventDepth0 },
        { state: StateDepth1, event: EventDepth1 },
        { state: StateDepth2, event: EventDepth2 }
      ] :
      never
    >

type Depth<StateDepth0, StateDepth1, StateDepth2, StateDepth3, StateDepth4> =
  IsStringContraint<StateDepth0> extends true ? -1 :
  IsStringContraint<StateDepth1> extends true ? 0 :
  IsStringContraint<StateDepth2> extends true ? 1 :
  IsStringContraint<StateDepth3> extends true ? 2 :
  IsStringContraint<StateDepth4> extends true ? 3 :
  never

const lightMachine = createMachine({
  initial: "green",
  states: {
    green: {
      on: {
        TIMER: "yellow"
      }
    },
    yellow: {
      on: {
        TIMER: "red"
      }
    },
    red: {
      on: {
        TIMER: "green"
      },
      initial: "walk",
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
    }
  }
})