# Contributing Guidelines

Contributions to this package are most welcome!

There is a test site in the solution (`src/Umbraco.Community.RecentMediaPicker.TestSite`) to make working
with this repository easier. It is configured to do an unattended install - check `appsettings.json` for
the login details.

## Formatting

All code must pass `dotnet format --verify-no-changes` - this is enforced in CI (`.github/workflows/ci.yml`)
and PRs that fail it will be rejected. Run `dotnet format` locally before committing.

## Commit messages

This repository uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by
[semantic-release](https://semantic-release.gitbook.io/) to compute the next version and generate GitHub
Releases automatically - **no version number is ever hand-edited** anywhere in this repo.

| Commit type | Version bump |
|---|---|
| `feat` | minor |
| `fix`, `chore`, `refactor`, `style`, `test`, `build`, `ci`, `docs(README)`, `perf`, `deps` | patch |
| Any type with a `BREAKING CHANGE:` footer | major |

## Branching model

This package uses a git-flow-style branch pair per supported Umbraco major version. Today that's just
Umbraco 17 (`v1`) and Umbraco 18 (`v2`):

| Branch | Purpose |
|---|---|
| `develop/v1` | Integration branch for Umbraco 17 work. Prerelease tag: `-alpha.N`. |
| `release/v1` | Stable releases for Umbraco 17. Prerelease tag: none (or `-beta.N` via `beta/v1`). |
| `beta/v1` | Pre-release staging for Umbraco 17. Prerelease tag: `-beta.N`. |
| `feature/v1/<name>` | Branch off `develop/v1`, PR back into `develop/v1`. |
| `hotfix/v1/<name>` | Branch off `release/v1`, PR back into `release/v1`, then auto-merged back into `develop/v1` by `.github/scripts/merge-to-develop.sh` after release. |

`develop/v2`/`release/v2` is the Umbraco 18 line (package `2.x`). It only ever receives changes via
`git merge develop/v1` (never `git cherry-pick` or a direct feature branch). After any change lands on
`develop/v1`, `cd` into the v2 worktree, `git merge develop/v1`, rebuild the client if `Client/src/**` changed,
and push `develop/v2` (push `develop/v1` first). `release/v2` is promoted from `develop/v2` only when cutting a
v2 release; the first v2 commit carries a `BREAKING CHANGE:` footer so semantic-release starts the line at
`2.0.0`. `.github/workflows/*.yml` are shared (not `merge=ours`) - edit them on `develop/v1` and keep them
working for both majors. See the `merge=ours` files
declared in `.gitattributes` (`Directory.Packages.props`, `Directory.Build.props`, `.releaserc`,
`src/Umbraco.Community.RecentMediaPicker/Client/package.json` and `package-lock.json`), which are expected
to diverge permanently between the two lines. Run `git config merge.ours.driver true` once per clone/worktree
before working across both branch lines. Prefer `git worktree add` over `git checkout` when switching
between major-version lines - a plain checkout leaves stale `node_modules`, `bin`/`obj`, and a
wrong-major local SQLite DB behind.

### Setting up and using the v2 worktree

One-time setup, from the `develop/v1` clone:

```bash
git fetch origin
git worktree add ../Umbraco.Community.RecentMediaPicker-v2 develop/v2
cd ../Umbraco.Community.RecentMediaPicker-v2
git config merge.ours.driver true            # per worktree - required before the first merge
cd src/Umbraco.Community.RecentMediaPicker/Client && npm ci
```

Generated output (`Client/src/api/**` and the built bundle under `src/Umbraco.Community.RecentMediaPicker/wwwroot/`)
is gitignored, so **each worktree builds its own**: start the TestSite (`dotnet run` in
`src/Umbraco.Community.RecentMediaPicker.TestSite`), then run `npm run generate-client && npm run build` in the Client
folder. The v1 and v2 copies differ in their OpenAPI discovery route (Umbraco 17 vs 18), so regenerate in each worktree
rather than copying generated files between them. The generated SDK names are the same on both lines (the Umbraco 17
composer reuses Umbraco's own `OperationIdHandler` naming, scoped by `[MapToApi]`).

Day to day:

1. Make and push the change on `develop/v1` as normal.
2. `cd ../Umbraco.Community.RecentMediaPicker-v2 && git pull && git merge develop/v1` (never cherry-pick).
3. If the merge touched `Client/src/**`, regenerate and rebuild the client there (against a running v2 TestSite).
4. Push `develop/v2` - always after `develop/v1` has been pushed.

Things to know:

- A branch can only be checked out in **one** worktree at a time, so `git checkout develop/v2` in the v1 clone will
  refuse. Don't try to work around it - `cd` to the other worktree instead.
- Each worktree has its own `bin`/`obj`, `node_modules` and local SQLite database, so they never interfere with
  each other. Open each folder in its own editor window.
- Both TestSites use `https://localhost:44333`, so run one at a time (or start the second with `--urls`).
- The `merge=ours` files keep each branch's own version during a merge. If you change one deliberately (for example a
  new `.releaserc` rule), apply the change on **both** branches by hand - the merge will not carry it across.
- Useful: `git worktree list`; `git worktree remove <path>` (must be clean); `git worktree prune` after deleting a
  worktree folder by hand.

## Anti-patterns to avoid

- Don't commit code that fails `dotnet format`.
- Don't hand-edit version numbers anywhere - `PackageVersion`/`Version`/`InformationalVersion` in the
  `.csproj` are all `$(PackageVersion)`, injected by CI from semantic-release at pack time.
- Don't hand-edit `Client/src/api/**` - it's generated by `npm run generate-client` against the package's
  own Swagger doc and is gitignored. Regenerate it whenever a controller/model changes.
- Don't use real credentials or organization names in examples/docs.
- Don't add features without updating documentation.
- Don't ignore logger warnings.
- **When renaming a manifest alias or `EditorUIAlias`, remember uSync config files don't retroactively
  update Data Types already imported into a database.** A Data Type created from a uSync `.config` file
  with a custom `EditorUIAlias` can also silently fall back to core's default UI on first import even
  without a rename - if that happens, open the Data Type in the backoffice, re-select the correct
  property editor UI via "Change", and save once; uSync then re-exports the correct alias.

## License

By contributing, you agree that your contributions will be licensed under this project's [MIT license](../LICENSE).
