import { UnknownBehavior } from "../Behavior";
import { A, U, S, L, O } from "../extras";
import Machine from "../Machine";
import MachineDefinition from "../MachineDefinition";

export default MachineImplementations;
namespace MachineImplementations {
  export type Of<
    _Global,
    Global = MachineDefinition.Global.Resolved<_Global>,
    _I = U.ToIntersection<WithRoot<Global, []>>,
    I = U.ToIntersection<
      { [K in keyof _I]:
          [keyof _I[K]] extends [never]
            ? { [_ in K]?: _I[K] }
            : { [_ in K]: _I[K] }
      }[keyof _I]
    >
  > =
    { [T in keyof I]: { [K in keyof I[T]]: I[T][K] } }


  type WithRoot<
    Global,
    RootNodePath,
    Definition = A.Get<Global, "Definition">,
    Root = A.Get<Definition, RootNodePath>,
    Context = Machine.Context.Of<Global>,
    UniversalEvent = Machine.Event.Of<Global>,
    EntryEvent = Machine.Event.ForEntry.OfWithStateNodePath<Global, RootNodePath>,
    States = A.Get<Root, "states">,
    On = A.Get<Root, "on">,
    Entry = A.Get<Root, "entry">
  > =
    | O.Value<{ [ExecableType in "action" | "guard"]:
        [keyof On] extends [never] ? { actions: {} } | { guards: {} } :
        O.Value<{ [E in keyof On]:
          A.Get<
            MachineDefinition.Transition.Desugar<On[E]>,
            [ number
            , ExecableType extends "action" ? "actions" :
              ExecableType extends "guard" ? "guard" :
              never
            , ExecableType extends "action" ? number :
              ExecableType extends "guard" ? A.Get.Identity :
              never
            , "type"
            ]
          > extends infer I ?
            S.IsLiteral<I> extends false ? {} : // TODO: don't capture defaultActionType
            I extends any ?
              { [_ in `${S.Assert<ExecableType>}s`]:
                  { [_ in S.Assert<I>]:
                      MachineDefinition.Execable.OfWithContextEvent<
                        Global,
                        L.Concat<RootNodePath, ["on", // TODO: should be something like ["on", string
                          ExecableType extends "action" ? "actions" :
                          ExecableType extends "guard" ? "guard" :
                          never
                        ]>,
                        Context,
                        U.Extract<UniversalEvent, { type: E }>,
                        | ( ExecableType extends "action" ? "IsAction" :
                            ExecableType extends "guard" ? "IsGuard" :
                            never
                          )
                        | "IsImplementation"
                      >
                  }
              }
            : never
          : never
        }>
      }>
    | ( A.Get<MachineDefinition.Execable.Desugar<Entry, string>, [number, "type"]> extends infer I
          ? S.IsLiteral<I> extends false ? {} :
            { actions:
              { [_ in S.Assert<I>]:
                  MachineDefinition.Execable.OfWithContextEvent<
                    Global,
                    L.Concat<RootNodePath, ["entry"]>,
                    Context,
                    EntryEvent,
                    "IsAction" | "IsImplementation"
                  >
              }
            }
          : never
      )
    | ( A.Get<
          MachineDefinition.Invocation.Desugar<A.Get<Root, "invoke">>,
          [number, "src", "type"]
        > extends infer I
          ? S.IsLiteral<I> extends false ? { behaviors: {} } :
            I extends any
              ? { behaviors:
                  { [_ in S.Assert<I>]:
                      ( context: Context
                      , event: EntryEvent
                      , meta: "TODO"
                      ) => UnknownBehavior
                  }
                }
              : never
          : never
        )
    | ( [keyof States] extends [never] ? never :
        O.Value<{ [S in keyof States]:
          WithRoot<Global, L.Concat<RootNodePath, ["states", S]>>
        }>
      )
}
