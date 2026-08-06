# Demo hardening defaults. Keep installs boring and predictable.
ignore-scripts=true
audit=true
fund=false
engine-strict=true

# PNPM 10: wait 3 days before accepting newly published package versions.
minimum-release-age=4320

# NPM support for a similar minimum age key can vary by version. Prefer the
# PNPM key above for this repo instead of adding an unsupported npm-only key.

# Block git dependencies where the package manager supports this policy.
allow-git=none
