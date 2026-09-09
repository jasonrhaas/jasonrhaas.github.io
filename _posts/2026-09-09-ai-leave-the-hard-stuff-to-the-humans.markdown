---
tags: [tools]
title: "AI: Leave the Hard Stuff to the Humans"
layout: post
excerpt: "AI took all the easy work off my plate, which is exactly what I wanted.
The problem is what's left. Ten agents running in parallel don't hand you ten
easy questions — they hand you ten hard ones, and they hand them to you fast."
draft: false
---

AI was supposed to make the work easier. And it did — it took the easy work.
What I didn't see coming is that a day made entirely of hard problems is a
harder day than one with a bunch of busywork mixed in.

I finished today more tired than I've been in a long time, and I barely wrote
any code.

## Farm out everything you can

The premise is simple and I still believe it: there's little reason to spend
your own time on a task an AI can do reliably. Boilerplate, migrations, test
scaffolding, the fourth CRUD endpoint that looks like the other three — hand it
over. If the reliability is there, doing it yourself is a hobby, not a job.

Follow that premise to its conclusion and you don't hand over one task. You
hand over all of them, at the same time.

So I changed how I run a task. It used to be a conversation: do this piece, let
me look, okay now this piece. Now the instruction is closer to *go as far as you
can and only stop if you have to.* Ticket to branch to PR to CI to deploy. Don't
check in with me at every step. Check in when you're actually stuck.

Today I had no fewer than ten workspaces open, each with Opus running in it at
various points. Ten worktrees, ten agents, ten tasks in flight. On paper that's
ten times the throughput.

## What's left when the easy stuff is gone

Here's the part I didn't think through.

When an agent runs until it can't run anymore, the thing that stops it is, by
definition, the thing it couldn't figure out. Every time one of those ten
workspaces comes back to me, it's carrying a genuinely hard problem: an
ambiguous requirement, a design decision with real tradeoffs, a failure mode
that isn't in the code I can see.

And the failure mode is worse when it *doesn't* stop. Sometimes it makes its
best guess, keeps going, and produces something that looks complete. You only
find out in review that the output is bad — and now you're not answering a
question, you're reverse-engineering a wrong assumption made forty commits ago.

Scale the parallelism up and this is all that's left. You've filtered your day
through a sieve that catches only the difficult decisions. The easy work isn't
gone from your day because you got faster at it. It's gone because someone else
is doing it, and what's in front of you is the residue.

## Ten pings, no easy answers

I use a tool called `herd` to manage this. It dings when an agent is waiting on
me, which is exactly the interface you want — I'm not babysitting terminals, I'm
responding to interrupts.

What it also does is set the pace, and the pace is not mine. Ding: workspace
three wants to know if we should break the API contract or add a compatibility
shim. Ding: workspace seven found the test suite depends on ordering and wants
to know if that's the bug or the feature. Ding: workspace nine has two ways to
do the migration and neither one is clean.

None of those have a fast answer. Some of them I want to sit with for twenty
minutes. But there are nine other pings queued behind it, so I speed-process:
skim the context, make the call, move on. Which is fine for a while, and then
it isn't. Some of them I just leave blocked — not because I'm waiting on
anything, but because I don't know yet and I'm not going to figure it out in the
ninety seconds I've allotted myself.

A blocked workspace used to feel like a failure of the tooling. Now I think it's
mostly an honest signal that a human hasn't had time to think.

## The new bottleneck is decision fatigue

AI makes the easy stuff fast, and then it throws hard problems at you at rapid
fire.

The thing that's actually limited isn't my typing speed, and it isn't tokens.
It's the number of good hard decisions I can make in a day. That number is not
large, it doesn't scale with parallelism, and I have no idea how to increase it.
Ten agents will happily generate more consequential decisions per hour than I
can make well.

I don't have a clean answer yet, but a few things have helped:

- **Cap the parallelism below the max.** Ten was too many. The ceiling isn't
  how many agents I can run, it's how many hard questions I can hold at once,
  and that's a much smaller number.
- **Let blocked mean blocked.** If I don't know, the answer is "I don't know
  yet," not a coin flip dressed up as a decision. A wrong call gets built on
  immediately now, which makes guessing more expensive than it used to be.
- **Batch the thinking.** Speed-processing ten decisions in ten interrupts is
  worse than sitting down with all ten at once. Same work, less thrash.
- **Front-load the ambiguity.** Half the pings are questions I could have
  answered before starting if I'd written the ticket properly. The better my
  input, the further it runs, the fewer interrupts I eat.

Still, I think this is the shape of the job now. We spent years automating away
the parts of the work that were tedious, and it turns out the tedious parts were
also the parts that let you coast for twenty minutes. What's left is the stuff
that requires taste, context, and judgment — which is the good part of the job,
and also the expensive part.

Leave the hard stuff to the humans. Just know that when you do, the hard stuff
is all that's left.
