---
tags: [tools]
title: "Stop Prompting. Start Building a Runbook."
layout: post
excerpt: "What it actually takes to get useful work out of coding agents in a
50k-line Go service — and why almost none of it turned out to be prompting."
draft: false
---

The interesting work was never the prompting. It's building the scaffolding
that makes an agent's output *verifiable* and its mistakes *cheap*. Everything
else below is downstream of that one idea.

## What we were building

The service is a Go HTTP API — a build queue and dispatcher, a few hundred
files, on the order of 50,000 lines of code, more than half of that test
code. We were in the middle of absorbing a legacy TypeScript service into it:
porting endpoints over one at a time, with behavioral parity as the whole
game. Return a 500 where the old service returned a 409 and you've broken a
caller in production.

That combination — an existing service with strong conventions, a CI/CD setup
that already ran unit, integration, and end-to-end tests on every PR, and a
legacy implementation that doubled as a source of truth for correct behavior
— turned out to be close to the ideal shape of task for an agent. Low
ambiguity, high volume. Worth naming explicitly, because it's not the same
claim as "agents solve greenfield design." They don't, or at least not this
kind of agent, not yet.

Measured against how this work went before:

| Work category      | Before        | With AI       | Impact       |
|---------------------|---------------|---------------|--------------|
| Chore-sized tasks    | 1–2 days      | ~1 hour       | 8–10x faster |
| Complex tasks        | ~1 week       | 2–3 days      | 2–3x faster  |
| Well-scoped projects | baseline pace | AI-assisted   | 3–5x faster  |

The gains showed up most on repetitive, decomposable, clearly scoped work —
which is a real result, but it's also a specific one. It's not "AI makes
everything faster," it's "AI changes the unit economics of a particular kind
of engineering work."

## The one idea underneath everything

Part of the team worked in VS Code with Copilot, I mostly worked in
OpenCode. Nobody wanted two sets of rules quietly drifting apart. So the
actual content — rules, scoped conventions, reusable commands, subagent
definitions — lived in one shared location, version controlled like any
other code, and each tool got a thin adapter that pointed at it.

| Artifact              | Source of truth                                | OpenCode                          | VS Code / Copilot          |
|-----------------------|--------------------------------------------------|------------------------------------|------------------------------|
| Repo-wide rules        | `AGENTS.md`, `.github/copilot-instructions.md`  | read automatically                | read automatically           |
| Scoped conventions     | `.github/instructions/*.instructions.md`        | matched by an instructions glob   | matched by an `applyTo` glob |
| Subagents              | `.github/agents/*.agent.md`                     | referenced from `opencode.json`   | read automatically           |
| Reusable commands      | `.github/prompts/*.prompt.md`                   | a one-line stub in `.opencode/command/*.md` | read automatically as `/name` |
| MCP servers (issue tracker, wiki) | —                                     | `opencode.json`                   | `.vscode/mcp.json`           |

The content itself lives under `.github/`, and each tool's adapter is a few
lines at most. `.opencode/command/lint.md`, for example, is nothing but a
stub that captures its arguments and pulls in the real prompt from
`.github/prompts/lint.prompt.md` — Copilot reads that same shared file
natively as `/lint`. One playbook, two front doors.

## Rules written as scars, not aspirations

Every rules file I've seen looks like a wish list by default. Ours read more
like a runbook — the standard I held it to was: if you can't name the
incident behind a rule, cut it.

A few examples, paraphrased: handlers decode, call the service layer, and
encode — no business logic in the handler. Use the shared test-database
harness for anything touching persistence, not a hand-rolled one per test
file. Don't add error handling for conditions that can't actually occur. Each
of those exists because something specific went wrong once, not because it
sounded like good practice in the abstract. And when a newer model shows up,
it's worth going back and asking whether the rule is still earning its place
— some of it was scaffolding for a weaker model that a better one doesn't
need anymore.

## Commands: the autonomy dial isn't one setting

The most useful command in the whole setup takes a ticket and walks it end to
end: read the ticket, cut a fresh worktree (never work in one that's already
there, even if it looks clean), classify and route the work, get a
parity sign-off if it's a port, then ship it — commit, push, open the PR,
comment the link back on the ticket. The line that actually makes it work is
the one telling it not to stop and ask permission between steps: read out
what's coming, then keep going all the way to an opened PR, and only stop for
a genuine blocker.

> You can always throw away a worktree. You can't get back the twenty
> minutes you spent typing "yes, continue."

Compare that to the linting command, which is almost the opposite
philosophy on purpose. Mechanical, reversible fixes — formatting, an
unchecked deferred `Close()`, an unused assignment — get auto-fixed.
Anything that needs judgment — a nil context where a real one was in scope,
a dead check, a coincidental type conversion — gets reported, not touched.
Never chase a green exit code for its own sake; if a "fix" would make the
code worse, don't make it. The point isn't that one command is more trusted
than the other. It's that the autonomy dial should be set by how expensive
and how reversible a mistake would be, not by a blanket feeling about the
model.

## Four narrow subagents, not one helpful one

Instead of one general assistant, the actual work was split across a small
number of narrowly scoped subagents:

| Subagent          | Job                              | Write access          |
|-------------------|-----------------------------------|------------------------|
| porter            | Port a single endpoint            | edit                   |
| test-parity       | Write the parity tests for it     | edit                   |
| parity-reviewer   | Read-only gate before a PR goes up | none — diff/log/test/lint only |
| spike-researcher  | Investigate, write up findings    | docs only              |

None of them are allowed to assume a path. If a subagent can't locate
something with a quick directory scan, it asks rather than guesses. Small
rule, but it eliminates a whole category of confidently-wrong behavior.

## The verification surface is the whole trick

Nothing in this setup calls a raw test runner directly. Every check is a
named target that both your laptop and CI run identically:

```
make lint        make test
make vuln        make cover
make integration-local
make api-smoke
```

The agent isn't a special case that needs a separate trust model. It's a
third user of an interface that already existed for humans. You're not
asking "do I trust the model." You're asking "does it pass the gates" — the
same question you already ask of a human's PR.

The strongest version of this: on every PR, CI also runs the *old* service's
own end-to-end test suite against the *new* one. The thing being replaced
grades its replacement. That's why the test-to-source ratio here is over
1:1 — the port is only worth doing if the safety net is denser than the code
it's protecting.

## Two war stories

**The guardrail that did nothing.** I tried to tidy up permission
configuration by moving it from one place into what looked like a cleaner,
more idiomatic location. Nicer diff. Except one of the two tools only parses
that configuration from a specific file format in a specific location — and
silently ignored the version I'd moved, running the "read-only" agent with
full default permissions instead. I only found out because I went and
actively probed it: gave the agent a task that should have been blocked and
watched it not get blocked.

> A safety setting you've never tested is a safety setting you don't
> actually have.

**The test that passed doing nothing.** A test meant to verify every route
was documented in the API spec lived in the wrong package for months. It
still ran. It still passed. It just wasn't testing anything, because it
was importing the wrong set of routes entirely. A green test that verifies
nothing is worse than no test, because it buys you confidence you didn't
earn — and it's the exact same failure mode as trusting a model's output
because the output *looked* plausible. The signal looked right, so nobody
looked closer.

## Running several agents means solving a concurrency problem

Once you're cutting a fresh worktree per task, running several agents at once
is mechanically possible — until they collide on something shared. In our
case it was a local dev stack bound to fixed ports: two agents both trying to
run the full service locally at once was a bad afternoon. The fix was the
same fix you'd reach for with any shared mutable resource — eliminate it.
Default parallel work to unit and integration tests against an ephemeral,
per-run database instead of the shared stack. A few extra seconds of boot
time per run bought effectively unlimited concurrency.

The other resource that turned out to be scarce was context. A large design
document was getting pulled into every task's context window whether or not
the task had anything to do with it. Worth a section of its own in the rules
file: lazy-load it, don't preload it. Spend context on the task in front of
you, not on documents that merely might be relevant.

## Five things worth stealing

1. Put the actual content in one place and give each tool a thin adapter.
   Don't maintain two brains.
2. Every verification step should be a named target that CI runs identically.
   This is most of the trick.
3. Write rules as scars, not aspirations. If you can't name the incident, cut
   the rule.
4. Set the autonomy dial per task, not per tool — same repo, same model,
   opposite settings depending on how expensive a mistake would be.
5. Test your guardrails the same way you test your code. A restriction you've
   never verified is not a restriction.
