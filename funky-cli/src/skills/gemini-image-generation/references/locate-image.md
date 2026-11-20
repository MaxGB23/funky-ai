# Locating an image the user referred to

The user may refer to an image without giving a path. Never assume it is already on disk.

## Procedure

1. Ask for the absolute path, in one line. One question removes all ambiguity, and it is
   cheaper than every alternative below.
2. If the user cannot give a path, scan a bounded set of folders for image files modified
   in the last 60 minutes, newest first. Do not scan the whole disk.

   ```bash
   for d in "$USERPROFILE/Downloads" "$USERPROFILE/Pictures" "$USERPROFILE/Desktop" \
            "$USERPROFILE/OneDrive" "$TEMP" "${INBOX:-$HOME/inbox}"; do
     [ -d "$d" ] && find "$d" -maxdepth 2 -type f \
       \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.heic' \) \
       -newermt '-60 minutes' -printf '%T@ %p\n' 2>/dev/null
   done | sort -rn | head -10
   ```

3. Exactly one candidate: report its path, size and modification time, and ask the user
   to confirm it is the right image.
4. Several candidates: list the newest five with modification time and size, and ask which
   one.
5. No candidates: say so plainly. Do not substitute an older image, and ask the user to
   provide the file another way. A missing image pauses the run; it never means picking
   something plausible.
6. Never attach an image the user has not confirmed in this session.

## Orca paste artifacts

An image pasted into the session lands as `%TEMP%\orca-paste-<timestamp>-<uuid>.<ext>`.
Treat that pattern as a first-class source:

- It is the file the user just pasted, so it needs no confirmation beyond the path.
- It lives in the OS temp directory, which is cleaned automatically. The path can be dead
  by the next run, and the file picker has no recovery from a dead path.
- Copy it to a stable location (the project `images/` directory or a `mktemp -d`
  directory) and attach the copy.
- The stem carries no meaning. Never derive the output filename from
  `orca-paste-<timestamp>-<uuid>`.

## Formats and size

- Gemini accepts `png`, `jpg`, `jpeg` and `webp` reliably.
- A `.heic` file may be rejected. Say so and ask before converting, since no converter is
  guaranteed on this host.
- Large images (several MB) may take a moment to appear as a chip. Re-read state before
  concluding the attach failed.

## What to report back

The chosen path, how it was found (user-provided, or the folder and timestamp it came
from), whether it was copied out of temp and where, and the confirmation the user gave.
That evidence is what makes a wrong-image mistake detectable after the fact.
