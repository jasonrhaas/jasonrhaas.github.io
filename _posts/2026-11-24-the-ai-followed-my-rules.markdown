---
tags: [tools]
title: "The AI Followed My Rules. That Was the Problem."
layout: post
excerpt: "One PR, about a day, net 2,500 lines gone and no behavior change. The
refactor I'd been putting off for two months turned out to be mostly a
rules problem: the agents wrote exactly the code I told them to write."
draft: false
---

I just merged a PR that touched 69 files: **+1,122 / −3,623**. That's net
2,500 lines gone, 41 files deleted outright, and the API behaves exactly the
same as before.

From first commit to merged took about a day, and most of that was review and
CI.

I've been writing software long enough to remember when a refactor like this
was a *project*. You'd block off days, maybe a couple of weeks. You'd spend
half that time working up the nerve, because touching every handler in a
service is how you break production on a Friday. This time it was one session with Opus 5.5 and a review cycle. I'm still a little floored.

But the speed isn't the most interesting part. The most interesting part is
*why the mess existed in the first place.*

## How we got here

We had just finished porting a big chunk of a pipeline API over to a new Go
service. Several people were moving endpoints over in parallel, and a lot of
that work was AI-assisted.

To keep parallel work from colliding, we gave the agents strict rules. Our
instruction files literally said:

- One file per endpoint.
- Append-only.
- Don't refactor shared files.

That made sense during the port. If five people (and their agents) are all
editing the same shared helper at once, you spend all day resolving merge
conflicts. Isolation kept everyone moving.

Then the port finished. The rules didn't change.

## The agents did exactly what I told them

Every new endpoint got its own ~60-line handler file. Each one did the same
thing: decode the request, tag the logs, check the caller, call the service,
encode the response. About 45 of those 60 lines were identical across every
file. Every endpoint also got its own ~110-line test file, testing the same
missing-caller, bad-body, and service-error cases all over again.

Wiring a new service meant hand-copying it into four different places: the
dependency setup, the server, the routes, and the integration test harness.

Fifteen endpoints in, that's a lot of code that says the same thing fifteen
times. The agents never pushed back on it, because the rules told them not
to. They were following the rules perfectly. **The sprawl wasn't an AI
problem. It was a rules problem.**

## The first attempt

I opened the ticket back in September, and a first PR went up the same day.
It used a small `decodeAndAuthorize` helper and cut about 700 lines. It was
fine. It also sat open for two months, because it only chipped at the
surface and never felt worth the risk of merging.

That's the honest version of how refactors die. Not because they're hard,
but because the payoff of a half-measure never quite beats the fear of
touching everything.

## The second attempt

This time I went for the whole thing, and I fixed the rules in the same PR.

**One generic POST helper.** The decode → tag → check caller → call service →
encode flow now lives in one place. Each endpoint is a ~5-line constructor.
Something like this (names changed, but the shape is the real thing):

```go
// ArchiveWidget handles POST /api/widgets/archive.
func ArchiveWidget(logger *slog.Logger, svc widget.ArchiveService) http.Handler {
	return callerPost(logger, opts[widgetio.ArchiveRequest]{
		tag: func(r widgetio.ArchiveRequest) logTag { return logTag{ID: r.ID} },
	}, svc, widget.ArchiveService.Archive, widgetio.ToArchiveInput, widgetio.FromArchiveResult)
}
```

All fifteen handlers fit in one 175-line file now. The helper itself is 75
lines.

**One service constructor.** Production and the integration harness now build
every service through the same function. Production passes real CI clients,
and the tests pass fakes. Adding an endpoint no longer touches the server or
the harness at all. The harness also stopped quietly building its own extra
copies of shared services, which removes a source of drift between tests and
prod.

**Test the helper once.** Fourteen copies of the same error-case tables became
one test for the helper. The per-endpoint tests only check what's actually
different: how the input maps and what the response looks like. They all use
one generic fake instead of fifteen hand-rolled ones.

Handler test coverage went *up*, from 95.8% to 96.5%, with way less test
code.

**Rewrite the rules.** I deleted the port-era subagents and prompts. I removed
"one file per endpoint, append-only," and added a "Keep it DRY" section to
every instruction file the agents read. The new rule is basically the
opposite of the old one: *consolidate, don't sprawl.*

That last step is the one that matters most. If I'd only fixed the code, the
next fifteen endpoints would have grown right back into fifteen files.

## Keeping it honest

A few things kept this from being a "trust me, the AI did it" PR:

- **The old tests ran first.** Before I consolidated anything, the original
  per-endpoint handler tests ran unchanged against the new helper and passed.
  That's what made a change this size feel safe.
- **The review loop worked.** Our review bot pointed out that a missing
  dependency would only crash on the first request that needed it, not at
  startup. The follow-up commit made service setup fail at startup with an
  error that names exactly what's missing. That's a better design than what we
  had before the refactor.
- **Not everything ran locally.** One set of integration tests needs
  credentials I don't have on my laptop, so CI was their first real run. I said
  that in the PR instead of pretending otherwise.

## What I'm taking away

The speed is real, and I don't want to undersell it. A refactor I would have
budgeted a week or two for, and then avoided for months, went from first
commit to merged in about a day.

Speed comes at a price, though. That same speed is what built the mess.
The agents could stamp out a new 60-line handler file in seconds, so nobody
felt the pain of copy number fifteen. When writing code is nearly free,
duplication is nearly free too, right up until someone has to change all of
it.

And the bill comes due in review. A 69-file diff lands in minutes, but
reading it still takes human time. If I'm not willing to actually understand
what I'm merging, the speed is just a faster way to ship something I can't
explain. The tests running first and the review bot catching a real issue
weren't nice extras. They were what made the speed safe to use.

But the bigger lesson is that **your agent instructions are code, and they
rot like code.** Ours were written for a temporary situation, a parallel port,
and they outlived it. The agents kept following them long after they stopped
making sense, and that's exactly what you want an agent to do. It just means
someone has to go back and change the rules when the situation changes.

That someone is still the human. The AI can delete 3,600 lines in one session.
It's on me to notice that it was told to write them in the first place.
