import { L } from "../../publish/extras";
import { A, U, S } from "../extras";
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
    RootPath,
    Root = A.Get<Definition, RootPath>
  > =
    | ( "action" | "guard" extends infer ExecableType ? ExecableType extends any ?
        keyof A.Get<Root, "on"> extends infer E ?
          [E] extends [never] ? { actions: {} } | { guards: {} } :
          E extends any ?
        A.Get<
          MachineDefinition.Transition.Desugar<A.Get<Root, ["on", E]>>,
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
                      L.Concat<RootPath, ["on",
                        ExecableType extends "action" ? "actions" :
                        ExecableType extends "guard" ? "guard" :
                        never
                      ]>,
                      Precomputed,
                      Machine.Context.Of<Definition, Precomputed>,
                      U.Extract<Machine.Event.Of<Definition, Precomputed>, { type: E }>,
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
    | ( [keyof A.Get<Root, "states">] extends [never] ? never :
        { [S in keyof A.Get<Root, "states">]:
            WithRoot<Definition, Precomputed,L.Concat<RootPath, ["states", S]>>
        }[keyof A.Get<Root, "states">]
      )
}
