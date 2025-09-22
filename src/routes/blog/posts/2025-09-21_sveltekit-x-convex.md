---
title: 'SvelteKit & Convex: A Love Letter and a Dream'
date: 2025-09-21T23:00
---

_Disclaimer: I adore both SvelteKit AND Convex. This is about making them even better together._

## The Two-Server Tango

I started working with Convex about a month ago, and it took me longer than I'd like to admit to wrap my head around one fundamental truth: Convex is already a server. And if my SvelteKit app needs to be both server and client, then I'm suddenly juggling two servers.

I've been binging the Convex YouTube channel (seriously, that [edge video](https://www.youtube.com/watch?v=_tU0U-sS6uc)? Chef's kiss), and one thing became crystal clear: Convex considers itself "the backend for React." And you know what? They're not trying to hide it. The useQuery hooks, the authentication patterns that expect client-side readiness – it all screams React-first design.

## The Authentication Dance

Here's where it gets a bit awkward for us SvelteKit folks. In my usual flow, authentication happens server-side through cookies, and by the time the page loads, everything's ready. No flicker, no "waiting for auth" state. It just works.

With Convex, I'm back to client-side auth checks. Is it slower? Maybe not. Does it feel like a step backward? Absolutely. That little rendering glitch while auth loads? It keeps me up at night.

## I have a dream

Five days into this hackathon, and I can't stop dreaming about something: A SvelteKit adapter for Convex.
Imagine this:

- Your `+page.server.ts` files actually run on Convex's blazing-fast Rust V8 engine
- Your load functions become Convex queries
- Your form actions transform into mutations or actions
- SvelteKit hooks pass context seamlessly
- And here's the kicker – your server-side data magically becomes reactive state on the frontend through `useQuery` and SvelteKit's [Transport](https://svelte.dev/docs/kit/hooks#Universal-hooks-transport).

No more two-server tango. Just pure, performant, reactive bliss.

## The Vision

Picture writing SvelteKit code exactly how you're used to, but with all of Convex's superpowers:

- Real-time reactivity? Check.
- Type-safe database queries? Check.
- Authentication that feels native to SvelteKit? Double check.

Yes, it would be opinionated. Yes, we'd lose some Node.js features. But imagine the performance gains. Imagine the developer experience.

## The Reality Check

I don't know Vite well enough. I don't know Convex deeply enough (yet). But I know exactly what this adapter should feel like. Every pain point I'm hitting now is a feature request for this hypothetical future.

The Convex team has already done amazing work making their platform accessible to SvelteKit developers. We're not left out, and that matters. But I can't help thinking: with the right adapter, SvelteKit could be THE best way to use Convex.

## A Call to Action (Or Maybe Just Daydreaming Out Loud)

If anyone from the Convex team stumbles upon this during the hackathon judging – hi! 👋 This isn't a complaint. It's a love letter. You've built something incredible, and I'm obsessed with making it even better for the Svelte community.

And if any Vite wizards or Convex gurus want to collaborate on making this adapter real? My DMs are open. I'll bring the passion and the use cases. You bring the deep technical knowledge. Together, we could build something beautiful.

Until then, I'll keep building with both tools, documenting the friction points, and dreaming of a world where SvelteKit and Convex feel like they were made for each other.

Because honestly? They kind of were. They just don't know it yet.

_P.S. – Don't get me wrong, the current integration works. But "works" and "feels magical" are two very different things. I'm shooting for magical._
