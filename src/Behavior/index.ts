import { SCXML, UnknownEvent } from "..";

export interface Behavior<E extends UnknownEvent, T>
  { transition:
      ( state: T
      , event: E | LifecycleSignal
      , context: ActorContext<E, T>
      ) => T
  , initialState: T
  , start?: (actorContext: ActorContext<E, T>) => T
  , subscribe?: (observer: Observer<T>) => Subscription | undefined
  }

export interface UnknownBehavior
  extends Behavior<UnknownEvent, unknown> {}

export type LifecycleSignal = StartSignal | StopSignal
export interface StartSignal { type: typeof startSignalType }
declare const startSignalType: unique symbol
export interface StopSignal { type: typeof stopSignalType }
declare const stopSignalType: unique symbol

export interface ActorContext<E extends UnknownEvent, T>
  { parent?: UnknownActorRef
  , self: ActorRef<E, T>
  , name: string
  , observers: Set<Observer<T>>
  , _event: SCXML.Event<E>
  }

export interface ActorRef<E extends UnknownEvent, T>
  extends Subscribable<T>
  { name: string
  , send: (event: E) => void
  , start?: () => void
  , getSnapshot: () => T | undefined
  , stop?: () => void
  , toJSON?: () => unknown
  }

export interface UnknownActorRef
  extends ActorRef<UnknownEvent, unknown> {}

export interface Subscribable<T>
  { subscribe:
    { ( observer: Observer<T>
      ): Subscription;

      ( next: (value: T) => void
      , error?: (error: unknown) => void
      , complete?: () => void
      ): Subscription;
    }
  }

export interface Observer<T>
  { next?: (value: T) => void
  , error?: (err: any) => void
  , complete?: () => void
  }

export interface Subscription
  { unsubscribe: () => void
  }
