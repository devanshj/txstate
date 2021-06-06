import { L, O } from "../extras"
import { ReferencePathString } from "../universal"

export default MachineExtras;
namespace MachineExtras {
  export type EntryEventForStateNode<D, P, StateNodeReferencePathString> =
    EntryEventForStateNodeWithRoot<D, P, StateNodeReferencePathString, "">

  export type EntryEventForStateNodeWithRoot<D, P, StateNodeReferencePathString, RootReferencePathString,
    Root = ReferencePathString.ToNode<RootReferencePathString, D>,
    On = O.Get<Root, "on">,
    Always = O.Get<Root, "always">,
    States = O.Get<Root, "states">,
    EventSchema = O.Get<D, ["schema", "events"]>
  > =
    | { [E in keyof On]:
        O.Get<On, [E, number]> extends infer T
          ? [T] extends [never] ? never :
            T extends any
              ? ( L.IncludesSubtype<
                    ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
                      D, P, O.Get<T, "target">, RootReferencePathString
                    >,
                    | StateNodeReferencePathString
                    | ( O.Get<T, "internal"> extends false
                          ? ReferencePathString.Child<StateNodeReferencePathString, D>
                          : never
                      )
                  > extends true 
                    ? EventSchema extends undefined ? { type: E } :
                      EventSchema extends any
                        ? EventSchema extends { type: E }
                          ? EventSchema
                          : never
                        : never
                    : never
                )
              : never
          : never
      }[keyof On]
    | ( O.Get<Always, number> extends infer T
          ? [T] extends [never] ? never :
            L.IncludesSubtype<
              ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<
                D, P, O.Get<T, "target">, RootReferencePathString
              >,
              | StateNodeReferencePathString
              | ( O.Get<T, "internal"> extends false
                    ? ReferencePathString.Child<StateNodeReferencePathString, D>
                    : never
                )
            > extends true
              ? EntryEventForStateNode<D, P, RootReferencePathString>
              : never
          : never
      )
    | { [C in keyof States]:
          EntryEventForStateNodeWithRoot<
            D, P, StateNodeReferencePathString,
            ReferencePathString.Append<RootReferencePathString, C>
          >
      }[keyof States]
}
