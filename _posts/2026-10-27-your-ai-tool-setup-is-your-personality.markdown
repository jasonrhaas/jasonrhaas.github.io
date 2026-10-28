---
tags: [tools]
title: "Your AI Tool Setup Is Your Personality"
layout: post
excerpt: "Everyone's trying to build the one-size-fits-all AI workflow for the
whole engineering org. Standardize the floor, not the style — your agent
configuration is you, and setting it up is the engineering."
draft: false
---

![An illustrated engineer happily dressing up his retro computer with a cowboy
hat, oversized glasses, a mustache, and stickers, while a plain undecorated
computer at the next desk looks on
unimpressed]({{ site.url }}/assets/ai-tool-setup-personality.jpg)

AI agents are now built into almost every tool I touch in a day. In software,
it's very nearly agents all the way down. Which raises the obvious question:
*what is the role of the engineer now?* Or more broadly, *what is the role of
the human?*

My answer: **the human is the configuration.** Here's what I mean.

## Tests matter more, not less

I see a lot of effort going into frameworks, harnesses, and gates that make AI
output more deterministic. I get why, and the intentions are good.

A strong testing story is more essential than ever: CI, CD, and especially
end-to-end tests. Visibility and logging have always mattered. But we're
farther from the low-level code than we've ever been, so those signals are now
how we know the thing actually works.

## One size fits nobody

The problem is when that same impulse spreads past the guardrails. People are
building workflows meant to be one-size-fits-all: the same prompts, the same
agent config, the same flow for a whole team or a whole engineering org.

That takes the human out of it. The baseline is already high: a lightly worded
request will get an agent to dig through an unfamiliar codebase and explain it
back to you. Putting everyone on identical prompts doesn't raise that baseline
much. It just sands off the part that was actually yours.

Because here's the point: **your AI configuration is you.** It's your judgment,
your taste, and your way of working, written down. That's what you bring to the
table.

## Standardize the floor, not the style

So isn't that a contradiction? Guardrails good, standardization bad?

Not really. Orgs standardize for real reasons: security, auditability,
onboarding, consistency. I work in DevSecOps; I'm not going to argue against
any of that. The trick is knowing which layer you're standardizing.

**The floor belongs to the org.** What gets checked, not how it gets written:

- Tests, CI gates, and required reviews
- Security scanning, secrets handling, and which tools agents can touch
- Attribution, so it's always clear when an agent wrote something

**The style belongs to the engineer.** How you get there:

- How the agent writes, comments, and explains
- How you break down problems and what you delegate
- Your prompts, your instructions, your workflow

The floor guarantees the output is safe and correct. Above the floor, let
people work the way they think. If the tests pass and the review holds up, I
don't care how your agent was configured to get there, and you shouldn't care
about mine.

## What that looks like for me

I'm pretty heavily integrated with [OpenCode](https://opencode.ai/). It handles
Jira, writes PR descriptions, comments on PRs, drafts Confluence docs, and
thinks problems through with me.

But it does all of that in my style, because I told it how. My global
`AGENTS.md` is a little over 400 lines at this point. Here's a slice:

```markdown
## Voice & writing style
- Write in MY voice: playful, casual, human. Contractions, a little
  personality/humor. Like a teammate in Slack, NOT a formal changelog.
- Lead with the point, then explain.
- Don't be a sycophant. Skip "Great question!" and validation fluff.

## JIRA ticket style (keep them SHORT)
- Whole description: ~80 words.
- Never in a ticket: log excerpts, code blocks, how you found it.

## Code comments: SUCCINCT
- One line. If it's longer than the code it describes, cut it.
- Say WHY, not what. The code already says what.

## Comments posted on my behalf
Any comment you post under my account ends with this line on its own:
`_written by opencode on behalf of Jason Haas_`
```

That last rule matters. It isn't written by me, but I directed it, and I'm
accountable for it. Anyone reading it should know both of those things.

None of this is a framework someone handed me. It's how I like to work and
communicate, written down, and the agent carries it out.

## That's the engineering

So, back to the question: what's the role of the human?

It's this. That customization isn't busywork you do before the real work
starts. It *is* the engineering. It's the creative act.

Keep the floor strict. Give people the room above it. Setting up your agentic
workflows to produce great results, in your own voice, is software engineering
in 2026.
