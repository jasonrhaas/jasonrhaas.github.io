---
title: How I'm Saving $15K on Our Kitchen Reno
layout: post
excerpt: "My wife and I are doing a kitchen renovation, and the cabinet quotes came
back between $10,000 and $20,000. So I decided to build them myself — and I used
Claude Code to plan the whole thing instead of SketchUp. Here's what worked and
what didn't."
draft: false
---

My wife and I are doing a kitchen renovation with a general contractor — new
countertops, new sinks, and a water line plumbed in for the fancy new espresso
machine. The last piece was the cabinets. Everything is stark white right now and
we're just over it. We wanted to warm it up: white oak to replace the cabinet
doors, plus drawers in the lower bays so pots and pans are easier to grab.

Then we started getting quotes. Custom cabinet work came in at $10,000 and ran as
high as $20,000 depending on how custom we wanted to go.

That's when my wife said: why don't you just do it?

### Some background

I'm a software engineer — an engineer at heart — who picked up woodworking as a
hobby during COVID and studied under the illustrious Steve Ramsey on YouTube. I
got really into it, learned the fundamentals, and have been steadily leveling up
ever since. There have been a lot of little projects along the way.

This is easily the biggest thing I've taken on. If you've done cabinets before,
you know there are a hundred small decisions to make, and the dimensions have to
be dead-on. We're doing full overlay, so the reveals are tiny. Any imprecision
and things don't fit.

### Trying Claude Code instead of SketchUp

I'm proficient in SketchUp, and normally I'd draw the whole thing up there, model
it out from the front, and confirm everything fits before cutting anything.

I use AI constantly — Claude Code, Opus, the chat apps — for work and for random
personal stuff. For this project I'd been asking a lot of questions in the chat
UI. It holds context well, but I wanted more precision, a durable record of what
I'd decided, and everything in one place.

So I figured I'd use Claude Code:

- specs and notes in markdown files
- a running log
- actual software that verifies the design and outputs cut lists and build steps

I started the planning phase in Fable and described the problem without
specifying a language or framework — deliberately. I just said: you figure it
out.

What came back was a Python tool. (Python seems to be the default when you don't
ask for anything else.) A TOML file holds all the dimensions and specs, Python
checks that everything fits, and the output is markdown — cut list and bill of
materials included.

### From markdown files to something I can use in the shop

Markdown worked well at first. I usually prefer plain text over anything else:
readable, easy to see what changed. But I kept wanting to check the cut list and
exact dimensions while I was standing in the shop, on my phone, without walking
back to the laptop.

So I told it: build me a web interface and publish it. It needs to be readable
and easy to navigate on a phone. And after every instruction, commit, push to
GitHub, and publish the update.

Here's what that turned into:
**[Kitchen Reno Shop Book](https://claude.ai/code/artifact/0a43f2da-8a57-4fdc-b51c-c45c4405f2a5)**

I wasn't reviewing code here. This isn't production code, so I wasn't
scrutinizing the implementation — I needed to quality-check the numbers, not the
internals. Git lets me roll back, and the artifact has its own version history.
So: just ship it. It stood up an artifact hosted on claude.ai, and I never had to
think about hosting at all.

The first pass was solid. A full cut list with plywood dimensions optimized to
minimize waste, plus some basic 3D drawings — just boxes, nothing crazy, but
useful.

### What it did well

I could hand it the cabinet measurements, the door measurements, tell it I wanted
full overlay with 2-inch face frames, all the boring dimensions — then talk
through what I wanted, what wood, what sizes. It would scope the whole thing out
and immediately run the math: dimensions, cut list, the works.

For this specific kind of task it was excellent. Figuring out the optimal way to
cut sheets of plywood is exactly what AI should be doing. I used to use a
SketchUp plugin for that, and it worked fine, but this is so much easier.
Dimensional math, checking that things fit, running the verification code — great
at all of it.

Publishing to a site I can pull up on my phone is the other big win. I used to
just take notes in Apple Notes, which works, but having the numbers and the
images right there, always current, is a real upgrade. 10 out of 10.

### What it didn't do well

The frustration was spatial reasoning. When I asked about cut procedures or how
handles should be oriented, it got mixed up and didn't really seem to know what
it was talking about. It has a decent grasp of woodworking, but nowhere near the
level it's at with code. (This was mostly Opus 4.5 and 5, with the planning phase
in Fable.)

I went back and forth on this more times than I can count — QA it, tell it to fix
it, QA it again, tell it to fix it again. Sometimes it got hardware counts wrong.
I'd say I want 30 hinges, two or three per door, and it would do it and then
forget. Little things like that meant a lot of time spent checking output.

That was the bulk of my time on this project, honestly. Not QA'ing code — QA'ing
output.

### So did it save me time?

The jury's still out. It might have been faster to mock the whole thing up in
SketchUp, or even to work out of an Apple Note and a spreadsheet. (Excel can do
the math too, to be fair.)

But this was my first attempt at working this way. On the next project I'll know
where the strengths and the weak spots are, and I expect it to go a lot faster.
