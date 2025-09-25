# ModlGuessr

This game is my submission for the [Modern Stack Hackathon](https://www.convex.dev/hackathons/modernstack)

ModlGuessr is a game where you need to find which Large Language Model you're talking with. Inspired by GeoGuessr.

I was looking for a fun idea to built with [Convex](https://convex.dev/referral/AXELRO9828), [Better Auth](https://www.better-auth.com/) and [Autumn](https://useautumn.com/)

## Gameplay (WIP)

This is an overall gameplay idea, everything is subject to change.

You enter a chat room
Maybe there is a pre-defined message or theme
You can chat with the LLM, now knowing which one it is.
The more questions you ask, or the longer you take to find which one it is, the less points you get
There are a couple of rounds
In the end, you get a score and enter a leaderboard

## Ideas, potential caviats

These ideas all need to be explored and validated.

Have a score starting at a certain number. Each seconds that passes, the scores lower a bit
With each message, the score lowers even more
A failed attempt divides the score by 2, 4, or 10
Go like that for a few rounds. Maybe 7. Tune it so that it's neither too short, or too long
Base game mode: Just a chat, a set of models to pick from (maybe 2 in easy mode, 4 in medium, all the models availaible in hard mode)
Have leaderboard per difficulty level
Scores should be smart. Sheer luck should give you very little chance to be top 1 (maybe leaderboard is an average if X games? Maybe there is just enough games so that it's impossible to get a full streak?)
Be aware that it may be not fun at all

## Business model

This is a hackathon project, not a very serious business idea. But, maybe it'll be fun enough, and most of all, I want to implement Autumn and see how it works in a real situation.

So here is the planned model:

- Freemium, with a few free games (ie: 3) initally
- 1 free game per day
- Small subscription plan (price TBD) for more games per day, week or month
- Maybe a one time payment, higher price, for some unlimited mode (maybe yearly, just in case)

## Features to implement

As the main goal is to explore the stack, here are some features we can implement because the tools make it easy.

### Convex

- Real time leaderboard
- Real time display of total games / messages / tokens ever used, all users combined, with an aggregate
- See other players games
- Complex aggregates to see stats like: Which model is the most recognized

### Better Auth

- Basic login
- Show last login method
- Admin system (maybe see moderation)

### Autumn

- Use features to define if user can play
- Paid plan
- Referal program (get free games)

### Resend

- Send email for the referal program
- Email confirmation

## Roadmap

- [x] Setup SvelteKit
- [x] Setup Convex
- [x] Setup Better Auth
  - [x] Google Auth
  - [-] Username plugin
  - [ ] Find out and implement other relevant providers
- [-] Setup Autumn
  - [x] Define plans
  - [x] Show and track feature (tickets to play a game)
  - [ ] Implement and test payment
- [ ] CD Pipeline
  - [ ] Deploy on Vercel
  - [ ] Auth is working
  - [ ] Convex prod is used
  - [ ] Autumn prod is used
- [x] Create a blog to document learnings
- [ ] Gameplay with AI SDK
  - [x] Find fun game loops
  - [x] Create game rounds
  - [x] Save messages
  - [x] Display result and score
  - [x] Move to next round
  - [ ] Save final game score
  - [ ] Enter data in leaderboard
  - [ ] Suggest next-game
  - [ ] Different difficulty level
- [ ] Leaderboard
- [ ] Analytics
- [ ] Homepage
- [ ] Referral program (Autumn + Resend)
- [ ] Share
- [ ] Multiplayer
- [ ] i18n

## License

Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg
