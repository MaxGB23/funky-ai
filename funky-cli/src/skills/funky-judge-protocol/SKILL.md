---
name: funky-judge-protocol
description: "Trigger: judge the plan, judge the claims, refutar el plan. The discipline every funky-judge run follows: hard rules, framing, adjudication."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

## Activation Contract

These rules are what make a judge an instrument instead of a second opinion. `funky-judge` loads this file in
its step 0 and names the resolved path in every handoff; a judge that never read it is improvising.

Two moments, never one: **a plan before the first source write**, and **a change whose claims are about to be
believed**. Which procedure applies is the router's decision; the flow contracts carry it. This protocol never
reviews a diff for delivery — the native 4R review owns that, and no approval here substitutes for it.

## Hard Rules

1. **Freeze and name the hash.** Commit the artifact or record its `sha256`, and put the hash in every handoff.
   A judge that finds a different hash stops. A correction changes the hash, which tells one round from the
   one before it.
2. **Enumerate. Never ask "is this sound?"** Turn the artifact into numbered claims or questions and demand a
   verdict and an evidence line for each. An unenumerated review returns taste.
3. **A citation you did not read is a hypothesis** — including one in a record, an issue's audit section, a
   memory, or this file. Citations are wrong at the commit they claim, not merely stale: they were never read.
4. **Ask what would falsify the claim.** "Confirm or refute" yields refutations; "review" yields opinions.
5. **A judge that cannot run a gate must not certify it.** Say what it may not run. A judge never certifies an
   exit code, a suite count or a test total it did not execute, and the parent must not repeat that
   certification as if it had.
6. **Findings only.** No fix, no rewrite, no commit. A judge never reviews its own correction, and two judged
   rounds per artifact is the cap — the third is a human decision. The corrections are where the new false
   claims live, so the second round attacks them and nothing else.
7. **Record the adjudication** where the artifact lives: its log, or memory when it has none. When rounds
   disagree, say which finding won, which lost, and the fact that decided it.
8. **A finding is a claim, not evidence.** Before it becomes an issue, a task or a pull request, verify it
   against a test, a run or the code path it names. A judge read the text and reasoned; that is not having
   observed. One campaign opened an issue, a specification and a pull request on a finding the repository's own
   test refuted, and closed all three.
9. **The flow contract carries the procedure; this file carries the discipline.** Do not restate a flow's
   question set here — a rule stated twice drifts, and each copy is edited by someone who did not see the
   other.
10. **The freeze is a commit, or it says why not.** In a repository, record `git show <commit>:<path>` and the
    hash of that blob in a **later** entry — a file cannot contain its own digest, and a hash taken before the
    last edit describes bytes nobody judged. Outside a repository, record `sha256sum <path>` with
    `commit: none`: there is no ancestry to check, and the record says so instead of inventing one.
11. **A judge that returned nothing produced nothing.** A timeout, a model fault, a refused launch or an
    artifact changed mid-read is not a pass and not a finding: record the fault with its evidence, name who
    substituted, and say that the substitute's audit checked only its list. A checkpoint absorbs **two**
    faulted attempts; at the third it escalates to a human. A `PAIR` with one verdict is not a `PAIR`.
12. **A checkpoint leaves a record, and the record has a lifecycle.** One marker before the launch, both verdict
    files written only **after** both judges return, the round number in every filename, and no judge reading
    the verdict directory during its own run. Where the project has version control, they are committed;
    where it has none, they sit beside the artifact. The record proves ordering and nothing else: **it never
    proves that a judge ran**, and no sentence in this skill may claim it does. Nothing here requires the
    project to add a test, a schema or a directory it does not already have.
13. **The question set lives in the verdict, never in the judged body.** A judge reading the questions of the
    artifact it judges loses the blindness that is the whole value. The body is frozen first; the set is
    written into the verdict and repeated in the adjudication that follows the round.
14. **A number in a record is a claim until it is recomputed.** A count, a duration or a hash written from
    memory is the defect this rule exists to stop — including when the record is this skill's own plan.

## Adjudicating two judges

- **They agree.** Treat it as settled unless you can read the fact yourself and refute it. Two independent
  readers reaching the same sentence is the strongest signal this protocol produces.
- **They disagree.** The disagreement **marks the load-bearing sentence** — the one a competent reader can take
  two ways, and therefore the one worth rewriting. Neither judge gets a vote: read the artifact, find the fact
  that decides it, and prefer the **smaller** edit, usually a cross-reference rather than a second statement of
  the same rule.
- **A finding is refuted by a fact you can read.** The fact wins and the finding becomes a lesson instead of
  work. Close what was opened on it, and keep the wording that made it plausible: that wording is usually a
  defect of its own, and it is the part of a false finding that survives.

A disagreement is not a defect in the judges. It is the only cheap instrument for finding the sentence that
carries the argument.

## Scope

- The named rows must be honoured. Changing a different artifact than the one named is allowed only when the
  change is disclosed in the same artifact and the reason is on the record.
- The inverse is not scope creep: when a finding reveals an **unnamed** artifact carrying the **same defect**,
  that is the defect's second instance, not new work.
- A finding that opens a genuinely new question — a decision the artifact deferred — becomes a named owner
  decision, never a silent task and never a silent omission.

## Output Contract

Per claim: verdict (`confirmed` / `refuted` / `partial` / `unverifiable`), severity, evidence class
(`deterministic` / `inferential`), and the evidence as `path:line` or command output. Then the adjudication,
then the gaps: what no judge could check.

Every verdict also opens with `protocol_read: <path>` and `claims_answered: <n>/<m>`, carries the
`checkpoint`, `freeze` and `questions` it answered, and closes with `boundary: what I read, what I did not`. A
verdict missing the first line is a judge that skipped step 0; one missing the last overstates its own
coverage.

## Glossary — one term, one meaning

| Term | Means | Is not |
|---|---|---|
| `checkpoint` | `J1`/`J2`/`J3` in a feature document | a harness phase (`authoring`, `exploring`, …) |
| `round` | one execution of judges over one frozen hash | a checkpoint (a checkpoint may hold two rounds) |
| `mode` | `PAIR` or `SINGLE`, fixed by the routing table | severity, and not a choice |
| `modifier` | `+VERIFY`, decided before the launch | a mode |
| `finding` | a judge's claim, never evidence | an issue, a task, a defect |
| `adjudication` | which finding won, which lost, and the fact that decided it | a summary of the verdict |
| `freeze` | the commit and the blob hash, or `sha256sum` outside a repository | a hash written inside the file it describes |
| `claim` | a sentence a reader would believe without running it | the spec, which is normative |
| `gate` | one of three: a routing row, one piece of evidence, or the delivery preflight | the others, unqualified |
| `flow` | a file under `references/` | a reproduction run |
| `evidence class` | `deterministic` or `inferential`, per finding, emitted by the judge | a self-assessment of rigour |
| `severity` | the finding's weight, from the output contract | the mode, or the priority of the work |

## Limits

This skill does not review diffs for delivery, does not replace a gate it did not run, does not certify a
count it did not execute, and does not decide whether a feature ships. **It does not claim a judge ran**: a
checkpoint leaves a record and an ordering anchor, and that is all the record can sustain — two verdict files
written by hand satisfy every mechanical check.

## Not settled yet

Whether the parent should judge premises or leave every premise to a reproduction flow. What to do when a claim
cannot be decided without running the suite — the one thing a judge may not produce and an argument often
needs. How many judges a plan needs before the marginal one stops finding anything; two is observed, not
proven.
