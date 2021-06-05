# The foundation

If you've read some bits of the code, you'll notice this pattern...

```typescript
type Of<
  Definition extends A.Object,
  Implementations extends A.Object,
  Path extends A.ReadonlyTuple<PropertyKey>,
  Cache extends A.Object,
  Self = O.Path<Definition, Path>
>
```

This is the beginning of pretty much all types. Even if you understand let's see how did it even get to this.

It started with this [stackoverflow answer](https://stackoverflow.com/a/54666233/9591609) to David's question.

```typescript
declare const createMachine: <S, K extends keyof S>(config: { initial: K, states: S }) => void
```

Now it may seem trivial to you but the mental model here is "Write the type as you wish it to be, use generics to fill gaps or fill places you want to infer". I have to tell you it works really well, we do it all the time like...

```typescript
declare const useState: <T>(v: T) => [T, (v: T) => void]
```

See? not bad huh? As a matter of fact this is even how xstate types work, a bunch of generics `TContext`, `TEvent`, `TAction`, etc in place where you want to fill gaps.

I was like huh, let's try. And it ended up like [this](https://github.com/devanshj/txstate/commit/a1eeb03cb2845339612bcaefc8a549719c646f91#diff-b7708c13e1ab73fb37cefab331ab7fae98a97e0979fea3dc71213d9f83193d53). This is the first commit of txstate, how naive isn't it? I don't even know if it works btw xD

Well it didn't seem stupid as such at that time I was ready to experiment with what works. I said to myself "Well yeah you need so many generics coz there are so many gaps to fill, duh. We're doing some complex shit here it's gonna look ugly"

I don't remember exactly why but this idea just miserably failed, like even writing so many generics didn't work. I went back to the piece of code that started it...

```typescript
declare const createMachine: <S, K extends keyof S>(config: { initial: K, states: S }) => void
```

I don't remember what went through my head but I was like what if we write it like this...

```typescript
declare const createMachine: <C extends { initial: keyof C["states"], states: C["states"] }>(config: C) => void
```

I caught something and I rewrote to make it apparent...

```typescript
declare const createMachine: <C extends Config<C>>(config: C) => void
type Config<C> = { initial: keyof Prop<C, "states">, states: Prop<C, "states"> }

type Prop<T, K> = K extends keyof T ? T[K] : never;
```

`C extends Config<C>` caught my eye... It was something weirdly special, like even you see it right? a type constraint by a derivative of itself how in the world does that even work. I wrote a little more...

```typescript
declare const createMachine: <N extends StateNode<N>>(config: C) => void
type StateNode<N> = {
  initial: keyof Prop<N, "states">,
  states: {
    [S in keyof Prop<N, "states">>]: StateNode<Prop<Prop<N, "states">, S>
  }
}

type Prop<T, K> = K extends keyof T ? T[K] : never;
```

At this point I was like whoa... this is weirdly recursive and it works! A little more rewrite...

```typescript
declare const createMachine: <N extends StateNode<N>>(config: C) => void
type StateNode<N> = {
  initial: keyof Prop<N, "states">,
  states: States<Prop<N, "states">>
}
type States<S> = {
  [K in keyof S]: Node<Prop<S, K>
}

type Prop<T, K> = K extends keyof T ? T[K] : never;
```

Can you see something here? Let me show you...

```typescript
declare const createMachine: <N extends StateNode<N>>(config: C) => void
type StateNode<Self> = {
  initial: keyof Prop<Self, "states">,
  states: States<Prop<Self, "states">>
}
type States<Self> = {
  [K in keyof Self]: StateNode<Prop<Self, K>
}

type Prop<T, K> = K extends keyof T ? T[K] : never;
```

Each piece receives it's own "self" and reconstructs it with constraints... I tried to make this pattern work for initial too but...

```typescript
declare const createMachine: <N extends StateNode<N>>(config: C) => void
type StateNode<Self> = {
  initial: Initial<Prop<Self, "initial">>,
  states: States<Prop<Self, "states">>
}
type Initial<Self> = ??? // how to get keyof states here?
type States<Self> = {
  [K in keyof Self]: StateNode<Prop<Self, K>
}

type Prop<T, K> = K extends keyof T ? T[K] : never;
```

I realized this shortcoming of this technique... Then I don't remember what happened but I came up with this... Also btw let me tell you the journey was not so simple or linear at all, heck I don't even remember how it was, so what I'm saying is probably 60% of how it happened but nonetheless I think it's working for the story telling xD... Okay yeah back to what I came up with...

```typescript
declare const createMachine: <N extends StateNode<N, []>>(config: N) => void

type StateNode<Root, Path, Self = OPath<Root, Path>> =
  { initial: Initial<Root, LAppend<Path, "initial">>
  , states: States<Root, LAppend<Path, "states">>
  }

type Initial<Root, Path, Self = OPath<Root, Path>> =
  keyof OPath<Root, LAppend<LPopped<Path>, "states">>

type States<Root, Path, Self = OPath<Root, Path>> =
  { [K in keyof Self]: StateNode<Root, LAppend<Path, K>> }

type OPath<O, P> = P extends [] ? O : OPath<Prop<O, LHead<P>>, LShifted<P>>
type LHead<L> = L extends [infer H, ...any[]] ? H : never;
type LShifted<L> = L extends [any, ...infer Shifted] ? Shifted : never;
type LPopped<L> = L extends [...infer Popped, any] ? Popped : never;
type LAppend<L, X> = [...Cast<L, any[]>, X];
type Cast<T, U> = T extends U ? T : U;
type Prop<T, K> = K extends keyof T ? T[K] : never;
```

Got it? Yep, instead of passing `Self` we pass the `Root` and `Path` to `Self`. In this way, the type can access itself, can access anything in the whole tree and anything relative to itself.

This struck a chord so hard, I decided this is it, there's no way things get any better than this. [I deleted everything](https://github.com/devanshj/txstate/commit/d94d05336db080c2f356ef2ff9c30de9253ccf1e), [built a foundation on this](https://github.com/devanshj/txstate/commit/d7aadd7ef800888fc91efb65ad33b78b41f26503) and [updated the readme that txstate is no longer in R&D, enough experimentation now it was time to work](https://github.com/devanshj/txstate/commit/412c3b260c7339549e2988b37e8f146cbc57bf22).

If you've seen the recent updates of txstate, you might think running the machine on type level, computing entry types must be the hardest. But you know what that's literally the easiest part in the whole journey of txstate. I'm not even exaggerating, I took me an hour or two to come up with those sophisticated entry types but a full month for the code above.

As a matter of fact after this foundation was led, the work after that was really boring that's probably the reason I took so long as I was avoiding it because it was mundane xD Finally the after getting the machine to run on type-level, things are still not a really challenge for me but at least they result into some mind-blowing things.

Look I know I didn't dig too much into the codebase but I hope you have some context on how things work and at least can make a little more sense of it. I wanted to write an "overview" but got so indulged into this storytelling that dived way too less into the code and renamed this to "foundation" xD

But hey, I want you to take away some wisdom. You know why it took a month just get to this foundation? Well, a variety of reasons, of which this is one - "Write the type as you wish it to be, use generics to fill gaps or fill places you want to infer"

Yep, that's a lie. What's good is it works for 95% time, so it's a good lie. But do you want one which works 100% of times? It's something like this "Make what is generic _in principal_, generic".

Look I had no intentions to have just one generic on `createMachine` but the developments just organically led me to that. You know why? Because it's principally correct, we truly have just one generic - the whole machine definition - because well it's "generic" it's up to the user what they write, isn't it?

When you stumble upon something great, it probably has an even greater foundation.
