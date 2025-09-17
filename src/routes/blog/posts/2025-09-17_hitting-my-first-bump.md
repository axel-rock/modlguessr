---
title: Hitting my first bump
date: 2025-09-17T17:00
---

A few hours in, I hit my first bump.

[Convex works well with SvelteKit](https://docs.convex.dev/quickstart/svelte).
[Convex works well with Better Auth](https://convex-better-auth.netlify.app/).
[Better Auth works well with SvelteKit when SvelteKit is the server](https://www.better-auth.com/docs/integrations/svelte-kit).

But the combo of Convex x Better Auth x SvelteKit is more complicated. I already managed to make it work a few days ago thanks this amazing repo: [convex-better-auth-svelte](https://github.com/mmailaender/convex-better-auth-svelte). This integration is a niche within a niche.

Even with that package and tutorial, it was not easy.

The mental model of having Convex and SvelteKit server being two different things is quite new to me. And this "triple integration" is not documented, whereas, as usual, it's much better for React and Next.

I scrathed my head a little with the environment variables. SvelteKit has its own way of importing them. But you can't use this within your `convex` folder.

Where I'd usually do:

```
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public'
```

I'm currently doing:

```
const PUBLIC_GOOGLE_CLIENT_ID = process.env.PUBLIC_GOOGLE_CLIENT_ID as string
```

As I'm writing this, Convex released a new version of their Better Auth package. And this is not smooth either.

I have 2 options:

1. Use a previous combo of versions that work together
2. Find a way to solve the problem at the source

> Insert "2 hours later" meme

I made it work. Not even sure which part was breaking, but it's back on track. Definitely the least fun part of this, but now I should be on track to start making the fun stuff.
