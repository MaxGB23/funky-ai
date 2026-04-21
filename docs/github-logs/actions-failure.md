I'll retrieve the job logs to identify the failure and help you find a solution.The job is failing due to a lockfile mismatch. The package.json specifies vitest as 4.1.4 (exact version), but the lockfile has ^4.1.4 (caret version). This causes the dependency resolution to fail.

Solution:

Update your package.json to match the lockfile specifier. Change the vitest dependency from 4.1.4 to ^4.1.4:

JSON
{
  "devDependencies": {
    "vitest": "^4.1.4"
  }
}
Why this happens:

The caret ^ allows patch and minor version updates (e.g., 4.1.4, 4.2.0, but not 5.0.0)
The exact version 4.1.4 is more restrictive
When lockfiles and manifests don't match, dependency managers reject the mismatch to ensure consistency
To fix it:

Open package.json
Find the vitest dependency
Change "vitest": "4.1.4" to "vitest": "^4.1.4"
Run npm install or pnpm install (depending on your package manager) to update the lockfile
Commit both files
This will align your manifest with the lockfile and resolve the CI failure.