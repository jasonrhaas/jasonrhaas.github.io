---
tags: [tools]
title: "AI. Leave the Hard Stuff to the Humans."
layout: post
excerpt: "I let five AI sessions run in parallel with almost no upfront
planning, just to see how far they'd get. They got further than I expected —
and then stopped, one after another, on the exact same kind of problem: the
one only I could decide."
draft: false
---

![A hooded figure at a desk of glowing terminal windows in a rain-lit
cyberpunk city, one screen reading "I'm blocked: how should I proceed?" and
another noting hard problems require human
judgment]({{ site.url }}/assets/ai-blocked.jpg)

The pitch for AI coding tools has always been the same: automate the boring
parts, free you up for the interesting problems. I agree with that pitch. I
just didn't expect it to mean I'd spend my whole day doing nothing *but* the
interesting problems, back to back, with no boring ones left in between to
catch my breath.

## How I normally work with it

Most of the time I scope things narrowly. Add this API endpoint to this
feature. Use this format, this architecture style, follow the pattern two
files over. I already know what the thing is supposed to do, and AI is
excellent at that — it can follow a pattern I hand it all day long.

A few days ago I decided to try something different: speedrun a chunk of my
backlog and see how far I could get with as little upfront planning as
possible.

## The experiment

The idea was simple. Pull the next five tasks off Jira. Spin up a separate
git worktree for each one. Point an agent at each and just let it go — all the
way through to a pull request — without me writing careful prompts or
checking first whether the task was even something AI could reasonably
finish. I wanted to see how far it would get on its own.

I ran all five sessions at once, using a session manager called herdr to
manage them and ping me when one needed something. Model of choice: Opus 5.

Because none of the five tasks were narrowly scoped, they were a real
grab-bag — research one of them turned into, a production deploy question on
another, a small feature here, a genuinely complex one there. A couple of
them touched things AI plainly didn't have access to.

## Where it kept getting stuck

Every session made real progress. It would work through as much as it could
figure out on its own — and it turns out that's a lot — and then stop, not
because it was wrong, but because it didn't have enough information to keep
going without me. It needed what I'd call a hard decision: something with
real tradeoffs, something that touched other people, something with no
obviously correct answer sitting in the codebase or the docs waiting to be
found.

So I'd stop, think it through, make the call, and hand it back. And almost
immediately the next session would need me for the same reason. Multiply
that by five or six running at once, and it stops feeling like supervising
AI and starts feeling like an all-day rotation of hard calls with no
breathing room in between.

## The part nobody mentions

"Automate the boring stuff" is a fine mantra and I believe in it. I don't
want to spend my time on something AI can handle competently, and increasingly
that's most things. But that's exactly the catch: if AI is taking every task
it can see end-to-end from the codebase and the docs, what's left over is,
by definition, the stuff it *couldn't* see end-to-end. The ambiguous calls.
The judgment calls. The ones with no clear winner.

Run five or six agents in parallel and you're not doing a mix of easy and
hard work anymore. You're doing hard problem, hard problem, hard problem,
one after another, with the easy layer stripped out from underneath you.

I moved a lot faster that day. I also finished it more drained than I have in
a long time. It's not as simple as "AI makes everyone more productive." It
makes the repetitive, boring parts of the job nearly free — genuinely great —
but it does that by concentrating everything hard onto the person left
holding the decisions. Do that without pacing yourself, and it's a pretty
direct route to burnout.
