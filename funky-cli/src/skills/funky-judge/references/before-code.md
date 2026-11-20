# Flow contract — before the first source write

The artifact is a plan: a task list, an RFC, a specification, or a design that someone is about to implement.
There is no diff to read, so **the premises are the artifact**. A plan whose premises are false produces
confident work on the wrong thing, and no later review catches it, because each individual change is fine.

## What is being judged

Not whether the plan is good. Whether any of it is **false**: a citation that does not say what the plan
claims, a requirement nobody stated, a task that cannot close, an ordering that breaks, a fact asserted
about a third party that nobody measured.

A plan is also a promise about work. Every task in it is a claim that the change is possible as described,
so a task whose acceptance cannot be demonstrated is a finding, not a detail.

## The question set

Enumerate. A judge asked "is this sound?" returns taste; a judge asked to confirm or refute C1..Cn returns
refutations. Take the claims from these places, which is where they hide:

| Source | The claim hiding there |
|---|---|
| Every citation | the line number, the quote, the file — read each at the commit the plan names. A citation wrong at that commit is not stale, it was never read |
| Every quoted line | read it in the direction it prints. A printed count can belong to the complement of what the sentence around it says |
| Every number | carry its noun. A quantity and its unit are one claim, and they fail apart from each other |
| Every sweep | "every occurrence", "nothing else does this", "only these" — an un-run sweep is the claim, not its conclusion |
| Every absence | "no behaviour change", "nothing else moves", "unchanged" |
| Every substitution | the plan names one file and the work lands in another |
| Every premise about a third party | what a tool, a registry or a platform does — a plausible sentence about someone else's software is a hypothesis until this repository has measured it |
| Every task's acceptance | what would demonstrate it, and whether that thing is reachable from where the task stands |

## Hand the judge the frozen artifact

Hash it and put the hash in the handoff. A plan revised after the judge was dispatched is a different
artifact, and the hash is the only cheap way to know which one came back. If the hash differs, the judge
stops rather than reviews the wrong text.

Tell the judge what it may not do: it may read anything and run read-only commands, and it may not write,
commit, push or open anything. It also may not certify a gate — a suite, a pack check, a scan — that it did
not run itself. "Corroborated by reading" is the honest verdict, and it is worth more than a borrowed green.

## What the round produces

Findings only, severity order, each with a verdict, an evidence class and `path:line`. Then the adjudication
belongs in the artifact's own log, not in the conversation: the next reader of that plan needs to know which
finding won and which fact decided it.

Two things a plan judge must not do: rewrite the artifact, and judge its own correction. The one who fixes
never reviews the fix.

## When the plan is a record that will land

A plan that ships inside the change it describes gets read later as if it were current. If its tasks still
read `Commit: —` while their commits are ancestors of the pull request carrying it, the record lies by
omission. Name the commits, or say plainly that the record is a snapshot.
