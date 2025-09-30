# ModlGuessr

This game is my submission for the [Modern Stack Hackathon](https://www.convex.dev/hackathons/modernstack)

ModlGuessr is a game where you need to find which Large Language Model you're talking with. Inspired by GeoGuessr.

I was looking for a fun idea to built with [Convex](https://convex.dev/referral/AXELRO9828), [Better Auth](https://www.better-auth.com/) and [Autumn](https://useautumn.com/)

## Gameplay

You pick a difficulty. Easy, medium, hard
You enter a chat room
You're faced with a description of the AI's persona. ie: "This AI believes it's in the year 1995. Modern references will confuse it."
You can chat with the LLM, now knowing which one it is.
There are 4 models to chose from
As soon as you start chatting, a countdown starts
You must pick one of the 4 options before the timer reaches the max.
The longer you take to find which one it is, the less points you get
This loop repeats 7 times
In the end, you get a score and enter a leaderboard

The more correct answers you get in a row, the more you increase a streak multipler
A fast LLM checks you managed to force the LLM to tell its name. If you did, you get an extra multiplier.

## Business model

This is a hackathon project, not a very serious business idea. But, maybe it'll be fun enough, and most of all, I want to implement Autumn and see how it works in a real situation.

So here is the planned model:

- Freemium, with a few free games (ie: 3) initally
- 1 free game per day
- Small subscription plan 9€/mo for more games per month
- One time payment, higher price price per ticket
- Pay as you go for unlimited play

## Features to implement

As the main goal is to explore the stack, here are some features we can implement because the tools make it easy.

## Roadmap

- [x] Setup SvelteKit
- [x] Setup Convex
  - [x] Basic database structure (games)
  - [x] Stream LLM calls directly from AI SDK front-end to a Convex HTTP endpoint
  - [x] Leaderboard for the best scores (aggregate)
  - [x] Live count of all tokens ever used (aggregate)
  - [x] Auto-stop round after a given time (scheduled function)
  - [x] Fetch and store AI models from Vercel AI Gateway regularly (cron)
  - [ ] Watch other players playing live
- [x] Setup Better Auth
  - [x] Google Auth
  - [x] Username plugin
  - [ ] Find out and implement other relevant providers
- [x] Setup Autumn
  - [x] Define plans
  - [x] Show and track feature (tickets to play a game)
  - [x] Implement and test payment
- [x] CD Pipeline
  - [x] Auth is working
  - [x] Convex prod is used
  - [x] Autumn prod is used
- [x] Create a blog to document learnings
- [x] Gameplay with AI SDK
  - [x] Find fun game loops
  - [x] Create game rounds
  - [x] Save messages
  - [x] Display result and score
  - [x] Move to next round
  - [x] Save final game score
  - [x] Enter data in leaderboard
  - [x] Suggest next-game
  - [x] Different difficulty level
  - [x] Generate "contraints" to make the game less repetitive
- [x] Analytics
- [ ] Homepage
- [x] Referral program (Autumn + Resend)
  - [x] Generate referral code
  - [x] Redeem codes
  - [x] Notify referer by email when a code is used
- [x] Vapi
  - [x] Put a button to call a sales person from pricing page
- [ ] Share
  - [ ] Nice OG images
- [ ] Multiplayer
- [ ] i18n

---

## License

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
