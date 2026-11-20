---
name: funky-judge
description: "Trigger: funky judge, second opinion, judge the plan, review this RFC, review this issue draft, claim audit. Route one artifact to the cheapest sufficient review."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

## Activation Contract

This skill **routes**, and it also says *when*. It does not judge and it never issues a verdict.

A judge is a second reader whose only product is findings, answering one question: *is any of this false?*
It is not agreement, not a style review, and never a substitute for the native 4R review of a diff — that
review is the only delivery gate here.

**The trigger is the state, not the phrase.** Any of these fires without being asked, and none of them needs
the word "judge":

- `J1` — an ODD feature document exists (`odd/tasks/<feature>.md`) and the work it describes has not started.
  If source landed first, the checkpoint still runs and its row says so in words: *the plan was written after
  the first source write*.
- `J2` — the commit about to merge touches `docs/`, `odd/tasks/` or `docs/decisions.md`, or its pull-request
  body quotes a number, an exit code or a message.
- `J3` — every `T*` row of the feature is `landed` and its `J3` row is still `pending`.

**Two different things, and only one of them is a row.** A **checkpoint** (`J1`–`J3`) belongs to a feature: it
lives in that feature's `## Tasks` table, so the next session inherits it rather than the parent's memory. A
**round** is one execution of judges over any artifact — an issue draft, a pull request body, a comment, a set
of measurements — and it leaves **no checkpoint row**, because it is not a phase of a feature. Most judged
artifacts in a week are rounds, not checkpoints; the table below decides which.

Where the artifact has no home in a repository (a draft, a message, a file outside version control), the record
of the round is the verdict itself, kept where the reader will look for it. Nothing in this skill asks a project
for a test, a schema or a directory it does not already have.

## Step 0 — load the procedure before dispatching

A judge dispatched from this file alone is a weaker instrument: the rules live in the protocol, and a pointer
at the bottom of a file is a suggestion, not a step.

1. **Resolve** the paths this run will use with `_shared/skill-resolver.md`, and pass them in the handoff.
2. **Read** `../funky-judge-protocol/SKILL.md` — hard rules, question framing, adjudication, output contract.
3. **Read one** flow contract from the table. Never all four.

## Instruments

| Work | Agent | Why that one |
|---|---|---|
| Two blind judges on one artifact | `jd-judge-a` and `jd-judge-b`, launched in the same turn | neither sees the other or your defence, which is the whole value |
| One judge | `jd-judge-a` | one pass, findings only |
| A claim audit needing a fresh pair | `jd-judge-b` | read-only, with a shell for the runs it may not certify |
| A claim audit, when its admission allows | `gentle-ai-verify` | read-only; it refuses a launch that names neither a risk item nor a spec line — that refusal is not a finding |
| Gathering the evidence a claim needs | `gentle-ai-explore` | read-only **and without a shell**: it reads, it does not run. A claim about behaviour needs a run, so the parent runs it |
| A round that fixes, then re-judges | `jd-fix-agent`, and the correction goes to someone else | a judge never reviews its own correction |

## Decision Gates

| Artifact | Mode | Flow contract | `+VERIFY` when |
|---|---|---|---|
| **A whole feature**: plan, each claim-bearing change, then the closing audit | `J1` `PAIR` · `J2` `PAIR` · `J3` `SINGLE` | `references/before-code.md`, then `references/open-change.md` | any checkpoint's artifact carries a number, a record or an exit code |
| Plan, ODD task list, RFC, spec | `PAIR`, two blind | `references/before-code.md` | it introduces a contract, an exit code or a stored format |
| Open pull request, or any claim set about a change | `PAIR`; `SINGLE` for one work unit | `references/open-change.md` | a gate sentence is the only evidence |
| Bug whose cause is unknown | `SINGLE`, one reproduce pass | `references/reproduce.md` | report and tree disagree on what happens |
| Issue draft | `SINGLE` | `references/outbound-text.md` | it asserts behaviour nobody ran |
| Comment, follow-up, review reply | `SINGLE` | `references/outbound-text.md` | it answers a maintainer's decision |
| Question or teaching document | `SINGLE` | `references/outbound-text.md` | it pastes a capture, quotes an exit code or reproduces a message: **the parent re-runs what was quoted and pastes the diff**, and when the quoted command needs the network or an install it says so instead of running it. "A reader would act on it" is the weaker condition and no longer the only one |
| Measurement or factual claim set | `PAIR` | `references/open-change.md` | one number decides the outcome |
| A diff or commit, as such | **no judge** | — | it belongs to the native 4R review. A **spec** change is not "a diff as such": it is an artifact, and it takes the plan's row. |

The **class picks the mode, never the size**. A plan is `PAIR` however small it looks; a feature that spans a spec, a
code change and a record is *a whole feature* even when it is one sentence per file. `SINGLE` is for one work unit —
one commit, one page, one claim — which is a fact about the artifact, not about how much work it felt like.

## Modes

Two, and the table above picks one — the parent classifies the artifact, it does not choose a mode.

**`PAIR`** — two blind judges, identical enumerated questions, neither sees the other or your defence.
**`SINGLE`** — one judge, one pass, findings only.

`+VERIFY` is a modifier, not a mode. It is decided **before the launch**, from the table's last column and the
artifact — never from a verdict, which does not exist yet. The verdict may **add** it when a deterministic
claim appears; it never removes it. The pass is run by the **parent**, never by a judge (a judge certifies no
gate it did not run), and the command is recorded.

The cap is protocol rule 6, and the third finding becomes a row with an owner rather than a third pass.
The cap **here** counts judged rounds per artifact. `judgment-day` carries its own two counters — fix rounds
and scoped re-judgments — and the two budgets never share: a feature that uses both runs them in sequence.

## The handoff frame

```
Artifact: <absolute path>, sha256 <hash>, <n> lines. If the hash differs, stop and say so.
Class: <plan | claims of a change | outbound text | bug | measurement>
Verify: <the +VERIFY decision taken before the launch: the condition that was read, whether it was met,
        and the command the parent ran — or `not met`, or `met, not runnable here: <why>`>
Read first: <resolved paths of funky-judge-protocol and the flow contract>
Answer: C1..Cn — verdict, severity, evidence class, path:line for each.
Boundaries: read anything, run read-only commands; never commit, push or open anything.
            Certify no gate you did not run; "corroborated by reading" is the honest verdict.
Findings only, no fixes, <n> words.
```

The `Verify` line is the frame's other half, and it exists because of a measured failure: a modifier that was
never applied and never recorded leaves nothing to read afterwards, so the question "did it fire?" can only be
answered from memory. The decision is taken before the launch and written down with the launch, whether it fired
or not.

The hash is the frame's point: a judge that reads a different artifact stops, and a correction changes the
hash so one round is never mistaken for another.

## References

- [`../funky-judge-protocol/SKILL.md`](../funky-judge-protocol/SKILL.md) — the discipline every judge follows.
- [`references/before-code.md`](references/before-code.md) — premises before the first source write.
- [`references/open-change.md`](references/open-change.md) — a change's claims against the tree.
- [`references/reproduce.md`](references/reproduce.md) — a bug whose cause nobody established.
- [`references/outbound-text.md`](references/outbound-text.md) — anything leaving the repository.
- [`../judgment-day/SKILL.md`](../judgment-day/SKILL.md) — when the loop continues past findings.

## Not settled yet

Whether a router plus a second skill beats one file under the body budget. Nothing enforces step 0 beyond the
rule itself, and a judge that skips it produces findings that look identical to the ones that followed it.
