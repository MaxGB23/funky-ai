packages:
  - "demos/*"

# PNPM 10 hardening knobs used by the recording material.
# minimumReleaseAge is expressed in minutes: 3 days = 4320 minutes.
minimumReleaseAge: 4320

# Keep dependency build scripts explicit. The demo repo should not trust package
# lifecycle scripts by default.
onlyBuiltDependencies: []
ignoredBuiltDependencies: []
strictDepBuilds: true

# trustPolicy: no-downgrade and blockExoticSubdeps are discussed in the video
# as emerging/registry-policy ideas, but are intentionally not enabled here
# unless your local PNPM version documents them for workspace YAML.
