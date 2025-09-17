---
title: How I discovered this stack
date: 2025-09-17T04:00
---

For the past 10 months or so, I've been working on Orage. A set of tools that allows me to ship AI agents faster.

Orage is built with SvelteKit + Supabase.

One of these tools is an API, and to access this API, I needed API keys.

Back then, the best way I found to get it to work with RLS (Row Level Security) was a technique documented in this [gist](https://gist.github.com/j4w8n/25d233194877f69c1cbf211de729afb2)

The setup was not the easiest, but I eventually got it to work.

A few months later, I received this email from Supabase:

![](/images/blog/supabase-warning.png)

A warning that the tables I used to make these keys would not work anymore. 1 month notice. And reminder: Orage is just a side project. We had paid users relying on this to work. This was stressful.

I was looking for a safer alternative, and around the same time, [Scott Tolinski](https://bsky.app/profile/tolin.ski) was sharing in a [Syntax.fm episode](https://www.youtube.com/watch?v=H2oQgiDmBjc) how cool [Better Auth](https://www.better-auth.com/) is.

I tend to like what Scott likes, so I gave it a try.

---

And I was mind blown by how easy it was. Everything auth was so simple.

Stuff my current company spend quarters implementing (generate API keys, teams...)

Mind... blown...

I never liked auth, and this was just what I wanted, without any pain. It's the kind of documentation you read, and you want to implement EVERYTHING it talks about.

...

And I mean I read everything. Everything under "Plugins > 3rd party". That's where I found out about [autumn](https://useautumn.com/). I had also battled with Stripe for such a long time, that I applied to YC with the idea of making Stripe easy for AI... Oh wait, that's Autumn's punchline.

Well, I was actually relieved to see someone made it. Solving auth or payment stuff is not what I enjoy doing the most.
