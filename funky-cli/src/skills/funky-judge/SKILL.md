---
name: funky-judge
description: "Trigger: funky judge, second opinion, review this RFC, review this issue draft, find this bug. Route one artifact to the cheapest sufficient review."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.2"
---

## Activation Contract

Load when the human says `funky judge` or explicitly asks for a review of one named artifact: RFC or plan, issue draft, diff or commit, or a bug hunt.

Resolve exactly one artifact and one question before launching anything. Two artifacts means two runs.

Use it when the artifact **asserts** something. A diff goes to the native 4R review, a fact to `explore`/`verify`, and a measurement is a claim set that gets the claim audit. It is also the artifact-level pre-flight: load it unprompted before a plan with two or more work units is executed, so an inconsistency is found before the work, not after.

This skill routes. It does not replace `judgment-day`, the native 4R review, or the issue-creation process.

## Hard Rules

1. Freeze the target first: commit it or copy it. A reviewer reading a moving file judges a ghost. If a correction changes it, freeze again and say what changed; a judge never reviews its own correction, and two judged rounds is the cap — the third is a human decision.
2. Pass the artifact and the criteria, never your conclusion or suspected cause.
3. Facts go to `explore`/`verify` with `path:line`. Consistency and judgment go to blind judges. Never ask one mechanism for both.
4. The artifact starts wrong. Phrase every handoff as "assume this is noise or unsound; refute or confirm each claim", never as a second opinion.
5. A fact you did not read is a hypothesis: anything inherited from a subagent, a worker or an earlier message is unverified until sourced. No judge catches it; the claim audit must.
6. Declare the sweep budget in the handoff: one exhaustive read-only sweep unless the mode allows two.
7. Start at the default mode. Escalate only when the default gate fails.
8. Findings only. No fix, commit, push, PR, or publication unless separately authorized.
9. Contribution-policy compliance is checked against the repo, never by the judges: templates, required fields, labels, and routing belong to the parent via `gentle-ai-issue-creation`. Tell the judges to ignore form and policy compliance explicitly.

## Decision Gates

Pick the row, then run its default mode.

| Artifact | Default | Mechanism | Escalate to DEEP when |
|---|---|---|---|
| Bug, cause unknown | LIGHT | Reproduce first, then `explore` by hypothesis | 3+ hypotheses disproved |
| Diff or commit | LIGHT | Native 4R review when RDD is on, else `verify` | >400 lines, or auth/payments/data/security |
| Issue draft | STANDARD | `explore` (duplicates, upstream, repo policy), then 2 blind judges | Never |
| Issue comment or follow-up | LIGHT | One blind judge, one sweep | It introduces a new root cause or changes the issue's direction |
| RFC or plan | STANDARD | Premise check, then 2 blind judges, discovery-only | Giant or cross-cutting feature |
| Question or doc | LIGHT | One read-only reviewer | — |
| Measurement or a set of factual claims | STANDARD | Claim audit: `explore`/`verify` sources each assertion, then one judge attacks the interpretation | Two or more claims stay unsourced |
| Anything that leaves the repo (issue, disclosure, public comment) | STANDARD | Disclosure gate first — channel, policy, tone — then two blind judges on the publishable artifact | Never |

Mode budgets: LIGHT = one pass, one reviewer. STANDARD = two blind judges, one sweep each. DEEP = one fact-check pass, then two sweeps per judge.
Sweep budget: at most ~15 tool calls and `curl -m 10`; report gaps instead of chasing.

Never run `judgment-day` and the 4R review on the same target at once.

## Execution Steps

1. State the artifact, the question, and the chosen mode with its budget.
2. Freeze the target and record the exact path plus commit or hash.
3. Run the artifact's pre-gate: reproduction for bugs, premises against code for RFCs, duplicates, upstream version, and the target repo's contribution workflow for issues. For a claim set, source every assertion first — file:line, API or measurement — and mark the ones you cannot. For an artifact that leaves the repo, confirm channel and policy before any judge reads it: a true artifact in the wrong channel is a finding about the channel.
   **Outside the session clone** (`%TEMP%`, a sibling checkout): `gentle-ai-explore`
   cannot read those paths; dispatch `funky-lakra` read-only with `Tier: inspect` and
   the absolute paths.
   The two judges stay `jd-judge-*`: tell them to read the artifact by absolute path
   with `bash`, as data. A web/API-only pre-gate (duplicates, upstream, policy) may
   still use `gentle-ai-explore` when it does not need the local file.
4. Launch reviewers concurrently with identical criteria. Frame the reader's role and prior knowledge (for example: a maintainer opening this artifact for the first time). Judges stay blind to each other and to your conclusion.
5. Canonicalize findings and drop anything the pre-gate already disproved.
6. Return findings. Do not fix, publish, or commit.

## Output Contract

Return: artifact and frozen target, mode and why, pre-gate result, then one row per finding with location, severity, evidence class (`deterministic` or `inferential`), and a one-line claim. For a claim set, one row per claim with its source or `UNSOURCED`. End with the gaps: what was not checked. Never return a publication verdict.

## References

- `../judgment-day/SKILL.md` — blind dual review, frozen rows, two-round limit.
- `../skill-creator/SKILL.md` — skill format rules.
- `gentle-ai-skill-improver` (package skill) — audit and upgrade of this skill's own rules.
- `gentle-ai-issue-creation` (package skill) — duplicate search, forms, privacy scan, publication gates.
