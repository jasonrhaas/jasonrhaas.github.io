---
tags: [tools]
title: "The AI Followed My Rules. That Was the Problem."
layout: post
excerpt: "One PR, about a day, net 2,500 lines gone and no behavior change. The
refactor I'd been putting off for two months turned out to be mostly a
rules problem: the agents wrote exactly the code I told them to write."
draft: false
---

![A smiling robot woodworker planing an endless supply of identical dovetail
blocks, stacked to the ceiling, next to a clipboard of rules reading "One file
per endpoint, Append-only, Don't refactor" and a stamp marked "Followed
exactly"]({{ site.url }}/assets/ai-followed-my-rules.jpg)

I just merged a PR that touched 69 files: **+1,122 / −3,623**. That's net
2,500 lines gone, 41 files deleted outright, and the API behaves exactly the
same as before.

From first commit to merged took about a day, and most of that was review and
CI.

| | Before | After |
|---|---|---|
| Handler files | 15 | 1 |
| Lines per endpoint | ~60 | ~5 |
| Places to wire a new service | 4 | 1 |
| Handler test coverage | 95.8% | 96.5% |

I've been writing software long enough to remember when a refactor like this
was a *project*. You'd block off days, maybe a couple of weeks. You'd spend
half that time working up the nerve, because touching every handler in a
service is how you break production on a Friday. This time it was one session with Opus 5.5 and a review cycle. I'm still a little floored.

What I keep thinking about is *why the mess existed in the first place.*

## How we got here

We had just finished porting a big chunk of a pipeline API over to a new Go
service. Several people were moving endpoints over in parallel, and a lot of
that work was AI-assisted.

To keep parallel work from colliding, we gave the agents strict rules. Our
instruction files literally said:

> One file per endpoint. Append-only. Don't refactor shared files.

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
to. They were following the rules perfectly.

> **The rules caused the sprawl.**

## The first attempt

I opened the ticket back in September, and a first PR went up the same day.
It used a small `decodeAndAuthorize` helper and cut about 700 lines. It was
fine. It also sat open for two months, because it only chipped at the
surface and never felt worth the risk of merging.

That's how a lot of refactors die. The payoff of a half-measure never quite
beats the fear of touching everything.

## The second attempt

This time I went for the whole thing, and I fixed the rules in the same PR.

**One generic POST helper.** The decode → tag → check caller → call service →
encode flow now lives in one place. Each endpoint is a ~5-line constructor.
Here's a simplified version with made-up names. The real one has a few more
knobs, but this is the idea:

```go
// Before: 15 handlers like this (the real ones also did logging and auth)
func CancelBuild(w http.ResponseWriter, r *http.Request) {
	var req CancelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := builds.Cancel(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(result)
}

// After: one shared helper, one line per endpoint
var CancelBuild = handlePost(builds.Cancel)
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
opposite of the old one:

```diff
- One file per endpoint. Append-only. Don't refactor shared files.
+ Keep it DRY. Consolidate, don't sprawl.
```

That last step is the one that matters most. If I'd only fixed the code, the
next fifteen endpoints would have grown right back into fifteen files.

## Keeping it honest

A few things kept this from being a "trust me, the AI did it" PR:

- **The old tests ran first.** Before I consolidated anything, the original
  per-endpoint handler tests ran unchanged against the new helper and passed.
  That's what made a change this size feel safe.
- **The review loop worked.** Our review bot pointed out that a missing
  dependency would only crash on the first request that needed it. The follow-up commit made service setup fail at startup with an
  error that names exactly what's missing. That's a better design than what we
  had before the refactor.
- **Not everything ran locally.** One set of integration tests needs
  credentials I don't have on my laptop, so CI was their first real run. I called
  that out in the PR.

## What I'm taking away

The speed is real. A refactor I'd have budgeted two weeks for, then dodged
for months, merged in a day.

But speed has a price. It's what built the mess in the first place: when code
is free to write, copy number fifteen is free too. And a 69-file diff that
lands in minutes still needs a human to actually read it.

> **Your agent instructions are code, and they rot like code.**

The agents will keep following them long after they stop making sense, so
someone has to go back and change them when the situation changes.

Once I did, Opus 5.5 deleted 3,600 lines in one session.
