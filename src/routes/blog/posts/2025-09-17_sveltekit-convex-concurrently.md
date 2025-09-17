---
title: Run SvelteKit and Convex dev servers together with concurrently.
date: 2025-09-17T14:00
---

If you're running Convex and SvelteKit, you might want to run both

`pnpm dev`

And

`pnpx convex dev`

For convenience, I made the following setup:

Install concurrently `pnpm add concurrently -D`

In package.json

Change

```
		"dev": "vite dev --host",
```

To

```
		"dev": "concurrently --names 'svelte,convex' --prefix-colors \"#f96743,#F3B01C\" \"vite dev --host\" \"pnpx convex dev\"",,
		"dev:vite": "vite dev --host",
		"dev:convex": "pnpx convex dev",
```

Tadaam, now I just need to run `pnpm dev` to get both SvelteKit and Convex to run in a single terminal window.

PS: Used Svelte's Orange and Convex's yellow
