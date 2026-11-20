# Flow contract — the claims of a change

The artifact is a change described in prose: a pull request body, a claim set in a message, a release note,
a report that says what shipped. It may have a diff beside it and it may not — the flow is the same, because
what is judged is the **description**, and the description is where reviews stop reading.

## A claim set is not its summary

Take the claims from where they fail, not from the paragraph that introduces them. These seven sources are
the ones that keep producing false claims:

| Source | The claim hiding there |
|---|---|
| Every gate sentence | "the suite passes", "the pack check is green", "CI is happy" — a judge cannot certify these, and a body that states them as evidence is asking to be believed about a thing nobody in the room ran |
| Every record cited | the record number says something adjacent to what is asserted |
| Every sweep | "every occurrence", "nothing else moves", "only these three" — the sweep that was never run |
| Every absence | "no behaviour change", "no golden moved", "unchanged" — the strongest claim in the body and the least checked |
| Every substitution | one file named, another edited; one test claimed, another changed |
| Every number | with its noun. A counter labelled with the wrong unit reads as true and is false; a count over three examples presented as four |
| Every quoted output | copied from the run, never reconstructed. A body that quotes a test's message from memory quotes a message the test does not print |

A quoted line is read in the direction it prints. Two of the longest-lived errors in this repository's
history were a printed count read as its complement, in a body, a log and a specification — three times, and
three times a judge refuted it.

**Before comparing anything against the program, compare the artifact against itself.** Take every quotation in
the diff and read them against each other and against the prose around them: a page that states a fact twice, or
states a fact and pastes the output that contradicts it, refutes itself without a run. This is the cheapest
finding in a round and the one most often skipped — a whole page set once shipped with two sentences refuted by a
capture pasted two pages earlier, and a third that contradicted the capture on its own page. When the diff is one
slice of a set, say which comparisons you could not make and let the closing read make them.

## What the judge does with the diff

It reads it, and it checks the **correspondence**: does every file the body claims moved, and does every
file that moved appear in the body. A file that moved silently is the same finding as a file the body
invents.

What it does not do is issue the diff verdict. That belongs to the native 4R review, which has its own
authority and its own lifecycle. A judge's approval here is a statement about the prose.

## Two questions that find most of it

1. **What would falsify this?** For each claim, name the observation that would make it false, then check
   whether the body offers that observation or only the assertion.
2. **What did this body not say?** The comparison that was not run, the case that was not built, the
   behaviour nobody marked as changed — omissions are claims too, and they are invisible to a reader who
   only verifies what is written.

## The smaller the change, the more it pays

A documentation pull request about a count found a defect nobody had reported: a verdict line counting
findings while labelling them rules. The audit was not looking for it. That is the mode to run by default:
the cheap audit is the one that finds the defect nobody was looking for.

## Two rounds

The first round finds findings. The second attacks the corrections, and only the corrections — that is where
the useful second round lives. A third round is a human decision, and a corrected artifact is judged by
someone other than the one who corrected it.
