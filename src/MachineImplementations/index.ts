import { L } from "../../publish/extras";
import { A, U, S } from "../extras";
import Machine from "../Machine";
import MachineDefinition from "../MachineDefinition";

export default MachineImplementations;
namespace MachineImplementations {
  export type Of<
    MaybeDefinition, // in an machine with error this would be MachineDefinition.Of<D> otherwise it'll be D
    Definition =
      MaybeDefinition extends { [MachineDefinition.$$Self]: unknown }
        ? U.Exclude<A.Get<MaybeDefinition, MachineDefinition.$$Self>, undefined>
        : MaybeDefinition,
    Precomputed = MachineDefinition.Precomputed.Of<Definition>, // TODO: reuse from definition
    I = U.ToIntersection<WithRoot<Definition, Precomputed, []>>
  > =
    { [T in keyof I as [keyof I[T]] extends [never] ? never : T]:
        { [K in keyof I[T]]: I[T][K] }
    }

  type WithRoot<
    Definition,
    Precomputed,
    RootPath,
    Root = A.Get<Definition, RootPath>
  > =
    | ( "action" | "guard" extends infer ExecableType ? ExecableType extends any ?
        keyof A.Get<Root, "on"> extends infer E ? E extends any ?
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
        > extends infer I ? I extends any ?
            { [_ in `${S.Assert<ExecableType>}s`]:
                I extends undefined ? {} :
                { [_ in S.Assert<I>]:
                    ExecableType extends "action"
                      ? MachineDefinition.Execable.OfWithContextEvent<
                          Definition, L.Concat<RootPath, ["on", "actions"]>, Precomputed,
                          Machine.Context.Of<Definition, Precomputed>,
                          U.Extract<Machine.Event.Of<Definition, Precomputed>, { type: E }>,
                          "IsAction" | "IsImplementation"
                        > :
                    ExecableType extends "guard"
                      ? MachineDefinition.Execable.OfWithContextEvent<
                          Definition, L.Concat<RootPath, ["on", "guard"]>, Precomputed,
                          Machine.Context.Of<Definition, Precomputed>,
                          U.Extract<Machine.Event.Of<Definition, Precomputed>, { type: E }>,
                          "IsGuard" | "IsImplementation"
                        > :
                    never
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
