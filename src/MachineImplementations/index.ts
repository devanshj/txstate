import { UnknownBehavior } from "../Behavior";
import { A, U, S, L } from "../extras";
import Machine from "../Machine";
import MachineDefinition from "../MachineDefinition";

export default MachineImplementations;
namespace MachineImplementations {
  export type Of<
    Definition,
    Precomputed = MachineDefinition.Precomputed.Of<Definition>, // TODO: reuse from definition
    _I = U.ToIntersection<WithRoot<Definition, Precomputed, []>>,
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
    Definition,
    Precomputed,
    RootNodePath,
    RootNode = A.Get<Definition, RootNodePath>,
    Context = Machine.Context.Of<Definition, Precomputed>,
    UniversalEvent = Machine.Event.Of<Definition, Precomputed>,
    EntryEvent = Machine.Event.ForEntry.OfWithStateNodePath<Definition, Precomputed, RootNodePath>
  > =
    | ( "action" | "guard" extends infer ExecableType ? ExecableType extends any ?
        keyof A.Get<RootNode, "on"> extends infer E ?
          [E] extends [never] ? { actions: {} } | { guards: {} } :
          E extends any ?
        A.Get<
          MachineDefinition.Transition.Desugar<A.Get<RootNode, ["on", E]>>,
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
          I extends undefined ? {} :
          I extends any ?
            { [_ in `${S.Assert<ExecableType>}s`]:
                { [_ in S.Assert<I>]:
                    MachineDefinition.Execable.OfWithContextEvent<
                      Definition,
                      L.Concat<RootNodePath, ["on",
                        ExecableType extends "action" ? "actions" :
                        ExecableType extends "guard" ? "guard" :
                        never
                      ]>,
                      Precomputed,
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
        : never : never : never : never : never : never
      )
    | ( A.Get<
          MachineDefinition.Invocation.Desugar<A.Get<RootNode, "invoke">>,
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
    | ( [keyof A.Get<RootNode, "states">] extends [never] ? never :
        { [S in keyof A.Get<RootNode, "states">]:
            WithRoot<Definition, Precomputed,L.Concat<RootNodePath, ["states", S]>>
        }[keyof A.Get<RootNode, "states">]
      )
}
