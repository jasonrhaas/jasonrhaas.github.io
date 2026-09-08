---
tags: [tools]
title: "2026: The Year the IDE Died"
layout: post
excerpt: "I started this year in GoLand and ended it in a terminal. Once the
models got good enough to hand a whole task to, the IDE stopped earning its
place on my screen. Here's how the workflow changed, and what I still miss."
draft: false
---

It's time to call it: the IDE is dead, at least for how I work now.

I've always been drawn to lightweight tools. There's a simple elegance to a
plain editor — notepad, vim — where the thing in front of you is the text and
nothing else. Sublime Text is old at this point, but it's C++ under the hood and
fast in a way that still impresses me. JetBrains tools never really appealed to
me for that reason: powerful, batteries included, and slow and cumbersome to sit
in all day. VS Code found the middle ground — quick enough, a mostly
open-source core, good plugins, and it kept pace on AI.

Still, at the start of this year I was in GoLand, because its Go support is
genuinely excellent — deep built-ins, click-through navigation on anything.
Batteries included won out. It had Copilot bolted on, but the AI features always
trailed the frontier by a release or two.

So why am I not using the IDE much anymore? The simple answer: AI agentic
software.

## AI: The autocomplete era (2023 – 2025)

Early GitHub Copilot autocomplete worked, in a narrow way. It was great for
boilerplate: function and class signatures, unit tests, anything repetitive. But
when I was trying to write something from scratch, it got in the way more than
it helped. I turned it off a lot.

Then I saw what Cursor was doing — generating code through chat, letting you
review the diff, iterating from there — and thought, *this is how it's going to
be.* Chat existed elsewhere by then, but nobody had built the loop as well. Once
you get used to working that way, going back feels unbearably slow. VS Code
followed shortly behind. JetBrains was in last place: a heavyweight JVM IDE that
crashed constantly and was consistently behind on the AI stuff. That's where my
frustration started.

Eventually VS Code caught up, with Copilot built right into it. As of this
writing I'd guess most engineers I know are working that way. It became my
default for a while too.

## AI: The small-chunks era (January – March 2026)

The workflow back then was chunking. "First let's do the data model." Review it.
"Now this route for the web API." Run just those tests. Back and forth: *no, try
this approach, do this instead.* You had to keep the pieces small because you
had to review every one of them. That was the reality through the Opus 4.5 and
4.6 generation, and definitely with Sonnet — which is what I started on.

The IDE was genuinely useful for this. The code was right there next to the
chat.

## AI: The full-throttle era (spring 2026 – now)

But as the models got better — from around March, and especially over the
summer — I found I needed the editor less and less. I wasn't editing code
anymore. I was reading diffs, occasionally clicking through to understand what
the agent had done.

The harness got slow. Running several things at once and keeping the context
straight was hard. At some point I realized the IDE wasn't helping me, it was in
my way.

A coworker turned me on to an open-source tool called OpenCode. The appeal: it
runs any model — OpenAI, Anthropic, the Chinese models, and locally hosted ones.
And because it's open source, you can edit the tool, harden it, and make it fit
whatever security requirements you're working under. (Obviously you don't send
anything to servers you don't trust. It has to be a trusted environment.)

I started using it and liked it immediately — but I still wanted the IDE around,
to trick myself into believing I had some control over the code. That I was
still hand-chiseling some of it. I wasn't. And I'd venture that most engineers
working near the frontier of this stuff aren't either.

The real click came when I let go of the small pieces. The models — Opus 4.8
especially — got good enough that you can hand the agent a whole task, and if
you've set things up right, it just runs. It runs the tests. It checks CI. Once
that was true, the IDE had nothing left to do.

## Long live the terminal

On top of that: I love the terminal. It's just a great place to work. Unix-style
commands, vim, the OpenCode color scheme. I move extremely fast there. I can
spin up multiple git worktrees, let them run, and get pinged when something
needs input.

For review I use a diff viewer — GitHub Desktop is great for this, and OpenCode
has one built in too. If I don't like something, I tell the agent, it tweaks it,
I look again.

Sometimes I'll kick off the same problem three different ways in three different
worktrees, then pick the one I want or steer it further and throw the rest away.
Code is disposable now. It's cheap. Don't get attached to it.

The one thing I do miss is the debugger. GoLand — and VS Code to some extent —
have great debugging support and the ability to step through code, and for truly
complex codebases and situations that still has a place. But I've found AI to be
increasingly good at debugging, or at least at pointing a human in the right
direction.

So I'm ready to declare the integrated development environment officially dead.
I can live in the terminal. Vim is never going away. Long live the terminal,
long live vi.
