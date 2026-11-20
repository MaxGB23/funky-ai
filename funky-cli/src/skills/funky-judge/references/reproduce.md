# Flow contract — a bug whose cause nobody has established

**Provenance: derived, not observed.** No judge has yet run this flow as a judge. It was written from one
refuted finding — a hypothesis that the repository's own test already answered — and from how the parent
hunted causes during two release campaigns. The order below is advice with a reason behind it, not a
procedure that has caught anything in the field.

This is the only flow where the artifact is a **symptom**. There is no plan to refute and no claims to
compare; there is a report that something happens, and the judge's job is to establish whether it happens,
then whether the cause named for it is the cause.

## Reproduce first, and reproduce their way

A bug report is refuted or confirmed by running the case it describes, not by reading the code that would
have to be wrong for it to be true. If the report says "the second run prints a smaller number", the first
observation is a second run — not a grep.

Reproduce in the state the reporter described, not in a state that is convenient. A report produced on a
branch, a platform, a version or a fixture is a claim about **that** state, and a reproduction elsewhere
proves something about somewhere else.

## When the report and the tree disagree, that is the finding

The interesting outcome is not "reproduced" or "not reproduced". It is the difference: the report says the
line prints after the path ran it, and the code prints it in both states for different reasons; the report
says six of twelve rules never ran, and the count belongs to the rules that did.

Say which one is wrong and what observation decides it. "Cannot reproduce" alone is the least useful verdict
in the vocabulary, because it leaves the reporter with a symptom and no next step.

## Instrument before theorising

A cause is a hypothesis until something observes it. The cheap order: run the case, print the state at the
boundary, then read the code that produces it. Reading first produces a theory of the code, and the theory
usually survives the reading — that is what makes it dangerous.

Two habits that keep a hunt honest:

- **Distinguish "looks wrong" from "observed wrong".** The first is a reading of the source; the second is a
  run. Only the second is evidence, and only the second belongs in a finding's evidence line.
- **A dashboard is not a measurement.** A count in a report, a status in a UI, a line in a log — each is a
  renderer of a fact, and the renderer can be the defect. Chase the fact.

## A finding refuted by the repository is closed, not implemented

When a hypothesis says the closing commit cannot be reached, and the repository already carries a test that
demonstrates it is reached, the finding is **refuted** and the work is zero. One campaign opened an issue, a
specification and a pull request on exactly that, and had to close all three.

The check costs one `grep` and one run. Before a finding becomes an issue, a task or a pull request, run the
case it names.

## What this flow does not do

It does not fix. A judge reports the cause, the observation that establishes it, and the smallest change that
would settle it — then stops. The fix is a separate decision with its own authority, and a judge that fixes
its own finding cannot tell you whether the finding was right.
