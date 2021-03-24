import { O, L, N, A, Type, F, U, S } from "../extras";
import MachineDefinition from "../MachineDefinition";
import { ReferencePathString } from "../universal";
import MachineInstantMap from "./map";

export default MachineInstant;
namespace MachineInstant {
  export type Map<D, P> = MachineInstantMap.Of<D, P>

  export type Transition<
    Definition, Precomputed, Instant,
    Event,

    D = MachineDefinition.StateNode.Desugar<Definition, "">,
    P = Precomputed,
    I = Instant,
  > =
    DoMicroStep<D, P, I, SelectTransitions<D, P, I, Event>> extends infer I ?
    RecursivelyDoMicroStepEventlessTransitions<D, P, I> extends infer I ?
    I : never : never

  export type RecursivelyDoMicroStepEventlessTransitions<D, P, I> =
    SelectEventlessTransitions<D, P, I> extends infer Ts
      ? Ts extends []
        ? I
        : RecursivelyDoMicroStepEventlessTransitions<D, P, DoMicroStep<D, P, I, Ts>>
      : never
   

  export type Initial<_D, P, D = Ds<_D>> =
    DoEnters<D, P, { configuration: [] }, [{ target: [""] }]>

  type DoMicroStep<D, P, I, Transitions> =
    L.IsLiteral<Transitions> extends false ? I :
    Transitions extends [] ? I :
    DoExits<D, P, I, Transitions> extends infer I ?
    DoExecuteActions<D, P, I, L.ConcatAll<{
      [J in keyof Transitions]: O.Get<Transitions[J], "actions">
    }>> extends infer I ?
    DoEnters<D, P, I, Transitions> : never : never

  /*
  const doExits = instant =>
    let
      exitingStates = sortWithExitOrder(exitSet(enabledTransitions))
    in
      ({
        ...instant,
        configuration: subtract(instant.configuration, exitingStates),
        historyValue: { ...instant.historyValue, ...Object.fromEntries(
          exitingStates
          .flatMap(s =>
            s.type !== "history" ? [] :
            [[s, configuration.filter(n =>
              s.history === "deep"  
                ? isAtomicState(n) && isDescendant(s, n)
                : n.parent === s 
            )]]
          ))
        ),
        ...doExecuteActions(instant, exitActionsFromState(existingStates))
      })
  */

  type DoExits<D, P, I,
    Transitions,

    ExitingStates = SortWithExitOrder<ExitSet<D, P, I, Transitions>>,
    Configuration = O.Get<I, "configuration">,
    AtomicStates = AtomicStatesFromConfiguration<Configuration>,
    HistoryValue = O.FromEntries<L.ConcatAll<{
      [J in keyof ExitingStates]:
        [ExitingStates[J], ReferencePathString.ToNode<ExitingStates[J], D>] extends [infer State, infer StateNode]
          ? O.Get<StateNode, "type"> extends "history"
            ? [ [ State
                , L.Filter<{ [J in keyof Configuration]:
                    O.Get<StateNode, "history"> extends "deep"
                      ? L.Every<
                        [ L.Includes<AtomicStates, Configuration[J]>
                        , ReferencePathString.IsDescendant<State, Configuration[J]>
                        ]> extends true
                          ? Configuration[J]
                          : L.Filter.Out
                      : ReferencePathString.Parent<Configuration[J]> extends State
                          ? Configuration[J]
                          : L.Filter.Out
                  }>
                ]
              ]
            : []
          : never
    }>>,
    Actions = L.ConcatAll<{
      [J in keyof ExitingStates]:
        O.Get<ReferencePathString.ToNode<ExitingStates[J], D>, "exit">
    }>
  > =
    O.Update<I, {
      configuration: L.Subtract<Configuration, ExitingStates>,
      historyValue: O.Update<O.Get<I, "historyValue", {}>, HistoryValue>
    }> extends infer I ?
    DoExecuteActions<D, P, I, Actions> : never

  type TestDoExits<D, I, Ts, D_ = Ds<D>, P_ = P<D>> =
    DoExits<D_, P_, I, Ts>

  Type.tests([
    Type.areEqual<
      TestDoExits<
        { 
          initial: "a",
          states: {
            a: { exit: "a.exit" },
            b: {}
          },
          exit: "exit"
        },
        { configuration: ["", "a"] },
        [{ target: ["b"], source: "a" }]
      >,
      { configuration: [""]
      , actions: [
          { type: "a.exit", __referencePath: "a.exit.0" }
        ]
      , historyValue: {}
      }
    >()
  ])

  // TODO
  type DoExecuteActions<D, P, I, Actions> =
    O.Update<I, { actions: L.Concat<O.Get<I, "actions", []>, Actions> }>


  /* 
  const doEnterStates = (instant, transitions) =>
    let
      entrySetAndDefaultHistoryActions = entrySetWithDefaultHistoryActions(transitions),
      enteringStates =
        entrySetAndDefaultHistoryActions
        .filter(s => !s.updateDefaultHistoryActions)
        .sort(entryOrder),
      defaultHistoryActions =
        entrySetAndDefaultHistoryActions
        .map(s => s.updateDefaultHistoryActions || {})
        .reduce((a, b) => ({ ...a, ...b })),
      defaultEnteringStates =
        enteringStates.filter(s => s.isDefaultEntry),
      actions =
        enteringStates.flatMap(s =>
          [ ...s.entry
          , ...(defaultEnteringStates.includes(s) ? s.initial.actions : [])
          , ...(defaultHistoryActions[s] || [])
          ]
        )
    in 
      instant
      |> i => { ...i, configuration: [...i.configuration, ...enteringStates] }
      |> i => { ...i, ...doExecuteActions(i, actions)}
  */

  type DoEnters<D, P, I,
    Transitions,

    EntrySetAndDefaultHistoryActions = EntrySetWithDefaultHistoryActions<D, P, I, Transitions>,
    EnteringStatesWithTags = L.Filter<EntrySetAndDefaultHistoryActions, { updateDefaultHistoryActions: any }>,
    DefaultHistoryActions = U.ToIntersection<L.Filter<EntrySetAndDefaultHistoryActions, A.String>>,
    DefaultEnteringStates = L.Filter<EnteringStatesWithTags, { isDefaultEntry: false }>,
    EnteringStates = SortWithEntryOrder<{
      [J in keyof EnteringStatesWithTags]: S.Untag<EnteringStatesWithTags[J]>
    }>,
    Actions =
      L.ConcatAll<{
        [J in keyof EnteringStates]:
          ReferencePathString.ToNode<EnteringStates[J], D> extends infer StateNode
            ? L.ConcatAll<
              [ O.Get<StateNode, "entry">
              , L.Includes<DefaultEnteringStates, EnteringStates[J]> extends true ? O.Get<StateNode, ["initial", "actions"]> : []
              , O.Get<DefaultHistoryActions, EnteringStates[J], []>
              ]>
            : never
      }>
  > =
    O.Update<I, { configuration: L.ConcatS<O.Get<I, "configuration">, EnteringStates> }> extends infer I ?
    DoExecuteActions<D, P, I, Actions> : never

  type TestDoEnters<D, I, Ts, D_ = Ds<D>, P_ = P<D>> =
    DoEnters<D_, P_, I, Ts>

  Type.tests([
    Type.areEqual<
      TestDoEnters<
        { 
          initial: "a",
          states: {
            a: {},
            b: {
              entry: "b.entry"
            }
          }
        },
        { configuration: [] },
        [{ target: ["b"], source: "a" }]
      >,
      { configuration: ["b"]
      , actions: [{ type: "b.entry", __referencePath: "b.entry.0" }]
      }
    >()
  ])

  /* TODO: works only for lang server not tsc
  Type.tests([
    Type.areEqual<
      TestDoEnters<
        {
          states: {
            a: {},
            b: {
              states: {
                c: {}
              }
            }
          }
        },
        { configuration: [] },
        [{ target: [""] }]
      >,
      { configuration: ["", "a", "b", "b.c"]
      , actions: []
      }
    >()
  ])
  */
  

  /*
  const entrySetWithDefaultHistoryActions = transitions =>
    let
      as = transitions.map(t => transitionDomain(t))
    in
      transitions
      .flatMap((t, i) =>
        [ ...t.target
          .flatMap(s => descendantEnteringStatesFromState(s))
        , ...effectiveTargetStates(t)
          .flatMap(s => ancestorEnteringStatesFromStateWithAncestor(s, as[i]))
        ]
      )
      |> (s => [...new Set(s)])
  */

  type EntrySetWithDefaultHistoryActions<D, P, I,
    Transitions,
    As = { [J in keyof Transitions]: TransitionDomain<D, P, I, Transitions[J]> },
  > =
    L.FilterDuplicates<L.ConcatAll<{
      [J in keyof Transitions]: 
        L.ConcatAll<
          [ O.Get<Transitions[J], "target"> extends infer Target
            ? L.ConcatAll<{
                [J in keyof Target]: DescendantEnteringStates<D, P, I, Target[J]>
              }>
            : never
          , EffectiveTargetStates<D, P, I, Transitions[J]> extends infer States
              ? L.ConcatAll<{
                  [J in keyof States]: AncestorEnteringStates<D, P, I, States[J], O.Get<As, J>>
                }>
              : never
          ]
        >
    }>>;
  
  // TODO: don't expand if already descendent of a state in set
  type ExpandParallelInEntrySet<D, P, I, State> =
    IsParallelState<D, P, I, State> extends false ? [] :
    ReferencePathString.Children<State, D> extends infer Children
      ? L.ConcatAll<{
          [K in keyof Children]: DescendantEnteringStates<D, P, I, Children[K]>
        }>
      : never

  

  type TestEntrySet<D, I, Ts, D_ = Ds<D>, P_ = P<D>> =
    EntrySetWithDefaultHistoryActions<D_, P_, I, Ts>


  /* TODO: works only for lang server not tsc
  Type.tests([
    Type.areEqual<
      TestEntrySet<
        {
          states: {
            a: {},
            b: {
              states: {
                c: {}
              }
            }
          }
        },
        { configuration: [] },
        [{ target: [""] }]
      >,
      [  "" & { isDefaultEntry: false }
      , "a" & { isDefaultEntry: false }
      , "b" & { isDefaultEntry: false }
      , "b.c" & { isDefaultEntry: false }
      ]
    >() 
  ])  
  */

  /*
  const descendantEnteringStatesFromState = state =>
    isHistoryState(state)
      ? !historyValue[state]
          ? [ { updateDefaultHistoryActions: state.parent.actions }
            , ...enteringStatesFromTarget(state.target, state)
            ]
          : enteringStatesFromTarget(historyValue[state], state)
      : [ { ...state, isDefaultEntry: isCompoundState(state) }
        , ...(
            isCompoundState(state) ? enteringStatesFromTarget(state.initial.target, state) :
            expandParallels([state])
            // TODO: dunno should be expandParallels four lines above but fuck it for now
          )
        ]
  */

  type DescendantEnteringStates<D, P, I,
    State,

    StateNode = ReferencePathString.ToNode<State, D>,
    ParentState = ReferencePathString.Parent<State>,
    HistoryValue = O.Get<I, "history">,
    IsCompound = IsCompoundState<D, P, I, State>,
    HistoryTarget = ResolveTarget<D, P, I, O.Get<StateNode, "target">, State>, // TODO: ReferencePathString.Unresolved for history
    InitialTarget = O.Get<StateNode, ["initial", "target"]>
  > =
    O.Get<StateNode, "type"> extends "history"
      ? O.Get<HistoryValue, State> extends undefined 
          ? L.Concat<
              [{ updateDefaultHistoryActions:
                  O.Get<
                    ReferencePathString.ToNode<ParentState, D>,
                    "actions"
                  >
              }],
              EnteringStatesFromTarget<D, P, I, HistoryTarget, State>
            >
          : EnteringStatesFromTarget<D, P, I, O.Get<HistoryValue, State>, State>
      : L.Concat<
          [State & { isDefaultEntry: IsCompound }],
          IsCompound extends true 
            ? EnteringStatesFromTarget<D, P, I, InitialTarget, State>
            : ExpandParallelInEntrySet<D, P, I, State>
        >


  /*
  const ancestorEnteringStatesFromStateWithAncestor = (state, ancestor) =>
    expandParallels(properAncestors(state, ancestor))
  */

  type AncestorEnteringStates<D, P, I, State, Ancestor,
    States = ReferencePathString.ProperAncestors<State, Ancestor>
  > =
    L.ConcatAll<{
      [J in keyof States]:
        L.Concat<
          [States[J]],
          ExpandParallelInEntrySet<D, P, I, States[J]>
        >
    }>
      
            

  /*
  const enteringStatesFromTarget = (target, source) =>
    [ ...states.flatMap(s => descendantEnteringStates(s))
    , ...states.flatMap(s => ancestorEnteringStates(s, source.parent))
    ]
  */

  type EnteringStatesFromTarget<D, P, I, Target, Source> =
    L.ConcatAll<
      [ L.ConcatAll<{ [J in keyof Target]:
          DescendantEnteringStates<D, P, I, Target[J]>
        }>
      , L.ConcatAll<{ [J in keyof Target]:
          AncestorEnteringStates<D, P, I, Target[J], ReferencePathString.Parent<Source>>
        }>
      ]
    >

  

  type SelectEventlessTransitions<D, P, I> =
    SelectTransitions<D, P, I, { type: "" }>
  
  /*
  const selectTransitions = event =>
    activeNodes
    .map(s => optimalTransition(s, event))
    .filter(notNull)
    |> filterConflictingTransitions
  */
  type SelectTransitions<D, P, I,
    Event,
    AtomicStates = AtomicStatesFromConfiguration<O.Get<I, "configuration">>,
    EnabledTransitions = L.DistributeThenFilter<L.LiftElementUnion<{
      [J in keyof AtomicStates]:
        OptimalTransition<
          D, P, I,
          AtomicStates[J], Event
        >
    }>, null>
  > =
    EnabledTransitions/* extends any
      ? FilterConflictingTransitions<D, P, I, EnabledTransitions> // TODO: debug
      : never*/;
  type TestSelectTransitions<D, I, E> = SelectTransitions<Ds<D>, P<D>, I, E>

  Type.tests([
    Type.areEqual<
      TestSelectTransitions<
        {
          initial: "a",
          states: {
            a: {
              on: { X: { target: "#foo", guard: () => boolean } }
            },
            b: {
              id: "foo",
              on: { Y: { target: "a" } }
            }
          }
        },
        { configuration: ["", "a"] },
        { type: "X" }
      >,
      | []
      | [ { internal: false
          , guard: () => boolean
          , actions: []
          , target: ["b"]
          , source: "a"
          , __referencePath: "a.on.X.0"
          }
        ]
    >()
  ])

  
  /*
  const optimalTransition = (node, event) =>
    let transitions =
      event.type === ""
        ? node.always.length !== 0 ? node.always :
          "" in node.on ? node.on[""] :
          null
        : event.type in node.on ? node.on[event.type] : null
    in
      transitions === null
        ? !node.parent ? null :
          optimalTransition(node.parent, event)
        : transitions.map(t => ({ ...t, source: node }))
  */

  type OptimalTransition<D, P, I,
    State,
    Event,
    
    Node = ReferencePathString.ToNode<State, D>,
    On = O.Get<Node, "on">,
    EventType = O.Get<Event, "type">,
    
    Transitions = 
      EventType extends ""
        ? O.Get<Node, ["always", "length"]> extends 0
            ? O.Get<On, "", null>
            : O.Get<Node, "always">
        : O.Get<On, EventType, null>
  > = 
    Transitions extends null
      ? State extends "" ? null :
        OptimalTransition<D, P, I, ReferencePathString.Parent<State>, Event>
      : ResolveTransitions<D, P, I, Transitions, State> extends infer Transitions
          ? Transitions extends []
            ? null
            : SelectFulfillingTransition<Transitions>
          : never;

  type ResolveTransitions<D, P, I, Ts, S> =
    { [J in keyof Ts]:
        O.Update<Ts[J], {
          target: ResolveTarget<D, P, I, O.Get<Ts[J], "target">, S>,
          source: S
        }>
    }

  type ResolveTarget<D, P, I, T, S> =
    ReferencePathString.Tuple.Unresolved.ResolveWithStateNode<D, P, T, S>

  type SelectFulfillingTransition<Transitions> =
    Transitions extends [] ? never :
    Transitions extends [infer T, ...infer Ts] ?
      A.AreEqual<F.Call<O.Get<T, "guard">>, true> extends true ? T :
      A.AreEqual<F.Call<O.Get<T, "guard">>, false> extends true ? null  :
      T | null | SelectFulfillingTransition<Ts> :
    never
      
  Type.tests([
    Type.areEqual<
      SelectFulfillingTransition<[{ target: ["a"], guard: () => true }]>,
      { target: ["a"], guard: () => true }
    >(),
    Type.areEqual<
      SelectFulfillingTransition<[{ target: ["a"], guard: () => boolean }]>,
      | { target: ["a"], guard: () => boolean }
      | null
    >(),
    Type.areEqual<
      SelectFulfillingTransition<[
        { target: ["a"], guard: () => boolean },
        { target: ["b"], guard: () => boolean }
      ]>,
      | { target: ["a"], guard: () => boolean }
      | { target: ["b"], guard: () => boolean }
      | null
    >(),
    Type.areEqual<
      SelectFulfillingTransition<[
        { target: ["a"], guard: () => boolean },
        { target: ["b"], guard: () => true }
      ]>,
      | { target: ["a"], guard: () => boolean }
      | { target: ["b"], guard: () => true }
      | null
    >(),
    Type.areEqual<
      SelectFulfillingTransition<[
        { target: ["a"], guard: () => boolean },
        { target: ["b"], guard: () => false }
      ]>,
      | { target: ["a"], guard: () => boolean }
      | null
    >(),
    Type.areEqual<
      SelectFulfillingTransition<[
        { target: ["a"], guard: () => true },
        { target: ["b"], guard: () => boolean }
      ]>,
      { target: ["a"], guard: () => true }
    >()
  ])

  /* 
  // from spec
  01. function removeConflictingTransitions(enabledTransitions):
  02.   filteredTransitions = new OrderedSet()
  03.   for t1 in enabledTransitions.toList():
  04.     t1Preempted = false
  05.     transitionsToRemove = new OrderedSet()
  06.     for t2 in filteredTransitions.toList():
  07.       if computeExitSet([t1]).hasIntersection(computeExitSet([t2])):
  08.         if isDescendant(t1.source, t2.source):
  09.           transitionsToRemove.add(t2)
  10.         else: 
  11.           t1Preempted = true
  12.           break
  13.     if not t1Preempted:
  14.       for t3 in transitionsToRemove.toList():
  15.         filteredTransitions.delete(t3)
  16.       filteredTransitions.add(t1)  
  17.  return filteredTransitions
  */

 type FilterConflictingTransitions<D, P, I,
    EnabledTransitions
  > =
    L.IsLiteral<EnabledTransitions> extends false ? EnabledTransitions :
    O.Get<FilterConflictingTransitionsLine3To17<
      D, P, I,
      { enabledTransitions: EnabledTransitions // line 1
      , filteredTransitions: [] // line 2
      }
    >, "filteredTransitions">

  type FilterConflictingTransitionsLine3To17<
    D, P, I, _S, S =
      O.Update<
        O.Defaults<_S, { t1i: 0 }>, // line 3
        { t1Preempted: false // line 4
        , transitionsToRemove: [] // line 5
        }
      >
  > =
    L.IsLiteral<O.Get<S, "enabledTransitions">> extends false ? S :
    O.Get<S, ["enabledTransitions", "length"]> extends number
      ? N.IsLessThan<O.Get<S, "t1i">, O.Get<S, ["enabledTransitions", "length"]>> extends true
        ? FilterConflictingTransitionsLine6To12<D, P, I, S> extends infer S ?
          FilterConflictingTransitionsLine13To16<D, P, I, S> extends infer S ?
          O.Update<S, { t1i: N.Increment<O.Get<S, "t1i">> }> extends infer S ?
          FilterConflictingTransitionsLine3To17<D, P, I, S> : never : never : never
        : S
      : never      

  type FilterConflictingTransitionsLine6To12<
    D, P, I, _S, S = O.Defaults<_S, { t2i: 0, t2Broke: false }>
  > = 
    L.IsLiteral<O.Get<_S, "filteredTransitions">> extends false ? S :
    N.IsLessThan<O.Get<S, "t2i">, O.Get<S, ["filteredTransitions", "length"]>> extends true
      ? FilterConflictingTransitionsLine7To12<D, P, I, S> extends infer X
          ? O.Get<X, "t2Broke"> extends true
            ? S
            : FilterConflictingTransitionsLine6To12<D, P, I,
                O.Update<X, { t2i: N.Increment<O.Get<X, "t2i">> }>
              >
          : never
      : S

  type FilterConflictingTransitionsLine7To12<
    D, P, I, S,
    T1 = O.Get<S, ["enabledTransitions", O.Get<S, "t1i">]>,
    T2 = O.Get<S, ["filteredTransitions", O.Get<S, "t2i">]>,
    T1Source = O.Get<T1, "source">,
    T2Source = O.Get<T2, "source">,
    T1ExitSet = ExitSet<D, P, I, [T1]>,
    T2ExitSet = ExitSet<D, P, I, [T2]>,

  > =
    L.HaveIntersection<T1ExitSet, T2ExitSet> extends true
      ? ReferencePathString.IsDescendant<T1Source, T2Source> extends true
          ? O.Update<S, {
              transitionsToRemove:
                L.Push<O.Get<S, "transitionsToRemove">, T2>
            }>
          : O.Update<S, {
              t1Preempted: true,
              t2Broke: true
            }>
      : S

  type FilterConflictingTransitionsLine13To16<D, P, I, S> = 
    O.Get<S, "t1Preempted"> extends false
      ? O.Update<S, {
          filteredTransitions:
            L.Push<
              L.Subtract<
                O.Get<S, "filteredTransitions">,
                O.Get<S, "transitionsToRemove">
              >,
              O.Get<S, ["enabledTransitions", O.Get<S, "t1i">]>
            >
        }>
      : S

    
  /*
  const exitSet = ts => 
    ts
    .filter(t => t.target !== undefined)
    .flatMap(t =>
      configuration
      .filter(n => isDescendent(getTransitionDomain(t), n))
    )
    |> (s => [...new Set(s)])
  */
  type ExitSet<D, P, I,
    Ts,
    Configuration = O.Get<I, "configuration">,
    _0 = L.Filter<Ts, { target: undefined }>,
    _1 = L.ConcatAll<{ [J in keyof _0]:
      L.Filter<{ [K in keyof Configuration]:
          ReferencePathString.IsDescendant<
            TransitionDomain<D, P, I, _0[J]>,
            Configuration[K]
          > extends true
            ? Configuration[K]
            : L.Filter.Out
      }>
    }>,
    _2 = L.FilterDuplicates<_1>
  >
   = _2

  type SortWithExitOrder<
    States,
    Childest = AtomicStatesFromConfiguration<States>,
    ChildestWithAncestors = L.FilterDuplicates<L.ConcatAll<{
      [J in keyof Childest]: L.Concat<[Childest[J]], ReferencePathString.ProperAncestors<Childest[J]>>
    }>>
  > =
    A.String[] extends States ? A.String[] :
    L.Filter<{ [J in keyof ChildestWithAncestors]:
        L.Includes<States, ChildestWithAncestors[J]> extends true
          ? ChildestWithAncestors[J]
          : L.Filter.Out
    }>

  Type.tests([
    Type.areEqual<
      SortWithExitOrder<["a", "a.b"]>,
      ["a.b", "a"]
    >(),
    Type.areEqual<
      SortWithExitOrder<["", "green"]>,
      ["green", ""]
    >()
  ])

  export type SortWithEntryOrder<
    States,
    Childest = AtomicStatesFromConfiguration<States>,
    ChildestWithAncestors = L.FilterDuplicates<L.ConcatAll<{
      [J in keyof Childest]: L.Concat<ReferencePathString.ProperAncestorsReversed<Childest[J]>, [Childest[J]]>
    }>>
  > =
    A.String[] extends States ? A.String[] :
    L.Filter<{ [J in keyof ChildestWithAncestors]:
        L.Includes<States, ChildestWithAncestors[J]> extends true
          ? ChildestWithAncestors[J]
          : L.Filter.Out
    }>

  Type.tests([
    Type.areEqual<
      SortWithEntryOrder<["a.b", "a"]>,
      ["a", "a.b"]
    >(),
    Type.areEqual<
      SortWithEntryOrder<["", "a", "a.a1", "b", "b.b1"]>,
      ["", "a", "a.a1", "b", "b.b1"]
    >()
  ])
    

  /*
  const transitionDomain = t =>
    let
      states = effectiveTargetStates(t)
    in 
      states === null ? null :
      t.internal &&
      isCompoundState(t.source) &&
      states.every(s => isDescendant(s, t.source)) ? t.source :
      findLCCA([t.source, ...states])
  */
  type TransitionDomain<D, P, I,
    Transition,

    States = EffectiveTargetStates<D, P, I, Transition>,
    Source = O.Get<Transition, "source">
  > = 
    States extends null ? null :
    L.Every<
    [ O.Get<Transition, "internal">
    , IsCompoundState<D, P, I, Source>
    , L.Every<{ [J in keyof States]:
        ReferencePathString.IsDescendant<States[J], Source>
      }>
    ]> extends true ? Source :
    Lcca<D, P, I, L.Unshift<States, Source>>

  
  /*
  const effectiveTargetStates = (transition) =>
    (transition.target || [])
    .flatMap(s =>
      s.type === "history"
        ? s in historyValue
            ? historyValue[s]
            : effectiveTargetStates({ target: s.target })
        : [s]
    )
  */
  type EffectiveTargetStates<D, P, I,
    Transition,

    HistoryValue = O.Get<I, "historyValue", {}>,
    States = O.Get<Transition, "target">
  > = 
    L.ConcatAll<{
      [J in keyof States]:
        O.Get<States[J], "type"> extends "history"
          ? States[J] extends keyof HistoryValue
            ? HistoryValue[States[J]]
            : EffectiveTargetStates<
                D, P, I,
                { target: O.Get<States[J], "target"> }
              >
          : [States[J]]
    }>

  /*
  // from spec
  function findLCCA(stateList):
    for anc in getProperAncestors(stateList.head(),null).filter(isCompoundStateOrScxmlElement):
        if stateList.tail().every(lambda s: isDescendant(s,anc)):
            return anc
  */
  type Lcca<D, P, I,
    States, Parent = never
  > = 
    L.Shift<States> extends infer Head ? Head extends undefined ? "" :
    L.Shifted<States> extends infer Tail ?
    ([Parent] extends [never] ? ReferencePathString.Parent<Head> : Parent) extends infer Parent ?
      Parent extends ""
        ? "" :
      IsCompoundState<D, P, I, Parent> extends false ?
        Lcca<D, P, I, States, ReferencePathString.Parent<Parent>> :
      L.Every<{ [J in keyof Tail]: ReferencePathString.IsDescendant<Parent, Tail[J]> }> extends true
        ? Parent :
      Lcca<D, P, I, States, ReferencePathString.Parent<Parent>> :
    never : never : never

  type TestLcca<D, I, Ss> = Lcca<Ds<D>, P<D>, I, Ss>

  Type.tests([
    Type.areEqual<
      TestLcca<{
        initial: "a",
        states: { a: {} }
      }, { state: ["a"] }, ["a"]>,
      ""
    >()
  ])

    
  type IsCompoundState<D, P, I,
    NodeReferencePathString,
    Node = ReferencePathString.ToNode<NodeReferencePathString, D>
  > =
    [keyof O.Get<Node, "states">] extends [never] ? false :
    O.Get<Node, "type"> extends "parallel" ? false :
    true

  type IsParallelState<D, P, I,
    NodeReferencePathString,
    Node = ReferencePathString.ToNode<NodeReferencePathString, D>
  > =
    O.Get<Node, "type"> extends "parallel" ? true : false

  type AtomicStatesFromConfiguration<Configuration> =
    L.Filter<{ [J in keyof Configuration]:
      L.Some<{ [K in keyof Configuration]:
        K extends J ? false :
        ReferencePathString.IsAncestor<Configuration[K], Configuration[J]>
      }> extends true
        ? L.Filter.Out
        : Configuration[J]
    }>

  Type.tests([
    Type.areEqual<AtomicStatesFromConfiguration<["", "a.b.c", "a", "a.b", "p.q", "p"]>, ["a.b.c", "p.q"]>()
  ])
}

type P<D> = MachineDefinition.Precomputed.Of<D>
type Ds<D> = MachineDefinition.StateNode.Desugar<D, "">
