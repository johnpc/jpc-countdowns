# jpc.countdowns

A dead-simple app for tracking what's coming up next in your life. Live at
[countdowns.jpc.io](https://countdowns.jpc.io); on the
[App Store](https://apps.apple.com/us/app/jpc-countdown/id6689494969). Ships as a
web app (Amplify Hosting) and a native iOS app (Capacitor) with a Home Screen
widget.

## How we work together (read this first)

The person directing you owns the **product** — they define **WHAT** (features,
intent, acceptance scenarios). **You own the HOW**: architecture, code quality,
testing, and every technical decision below.

- **Never ask them to make a technical call.** Don't surface coverage numbers,
  CRAP, lint, file-length, or library choices as questions. Decide them
  yourself, to the standards in this file, silently.
- **Only escalate genuine _product_ questions** — ambiguous behavior, scope,
  copy, what a screen should do. Everything technical is yours.
- The standards here are non-negotiable defaults. Apply them; you don't need
  permission to enforce them. When a gate fails, **fix the code, never weaken
  the gate.**

## Stack

- **Client:** React 18 + TypeScript (strict), Vite, `@aws-amplify/ui-react`.
- **Native:** Capacitor 6 (iOS via **CocoaPods + `.xcworkspace`**). A WidgetKit
  extension (`JpcCountdownsWidget`) reads shared state through
  `capacitor-widgetsbridge-plugin` (App Group `group.com.johncorser.countdowns.prefs`).
- **Backend:** AWS Amplify Gen2 — Cognito auth + AppSync (GraphQL) + DynamoDB,
  in `amplify/`. The `Countdown` model is owner-authorized (`allow.owner()`),
  default auth mode `userPool`.

## Architecture

- **`src/entities.ts`** is the single data-access layer: typed wrappers over the
  Amplify client (`listCountdowns`, `create/update/deleteCountdown`) plus the
  realtime `*Listener` subscriptions. Components never touch the Amplify client
  directly.
- **Logic lives in hooks and helpers, not components.** Components under
  `src/components/` only render. Stateful orchestration is a `useX` hook
  (`useCountdowns`, `useCountdownForm`); pure logic is a plain helper
  (`countdownSync`, `countdownForm`, `majorHolidays`, `autoLogin`) so it stays
  unit-testable and under the line limit.
- **`persistCountdowns` is the one sync funnel.** Every mutation to the list
  flows through it: sort → drop past → write `localStorage` → push to the iOS
  widget. Don't duplicate that sequence inline.

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

Hard gates. **Enforce them yourself without asking** — when one fails, fix the
code, never the gate.

- **No `any`, ever.** ESLint `@typescript-eslint/no-explicit-any: error`.
- **Every `.ts`/`.tsx` logic file ≤ 100 lines** (`npm run check:lines`). Over →
  extract a tested helper or split the file. **Never raise the limit.** Tests,
  `.d.ts`, and Amplify `resource.ts`/`backend.ts` are exempt.
- **≥ 80% coverage** (statements/branches/functions/lines) via Vitest. Fix by
  **writing tests**, never by adding exclusions or `istanbul ignore`.
- **CRAP ≤ 15 per function** (`scripts/check-crap.js`, runs after coverage).
- **Format clean** — Prettier (`npm run format:check`); run `npm run format`
  before committing.
- **Build must pass** (`npm run build` = `tsc -b` + Vite).
- **Acceptance tests are Gherkin** (`.feature` files + steps in `e2e/`), run via
  Playwright + playwright-bdd. Never raw spec code.

## Definition of done

1. `npm run lint && npm run format:check && npm run check:lines && npm run test:coverage && npm run build` green locally.
2. Gherkin acceptance scenarios + colocated unit tests added and passing.
3. Backend deployed if any Amplify model changed.
4. Conventional commit, branch pushed, PR open, **CI green** (CI blocks merge).

## Conventions

- **Conventional commits** (`feat:`, `fix:`, `chore:`, `ci:`, `docs:` …).
- Keep logic out of view components — hooks/helpers hold logic.
- Throwaway scripts go in `/tmp`, not the repo.

## Commands

```bash
npm run dev            # Vite dev server
npm run test:coverage  # unit tests + coverage (80% floor) + CRAP
npm run check:lines    # file-length gate (≤100 lines)
npm run format         # Prettier write (run before committing)
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run build          # tsc -b + Vite production build
npm run prod-config    # pull amplify_outputs.json from the deployed main backend
npm run ios            # prod-config + build + cap sync + open Xcode
```

## CI / deploy

- **`.github/workflows/ci.yml`** runs on every PR + push to `main`: lint,
  format check, file-length, coverage + CRAP, build, then Playwright e2e. Blocks
  PR merge.
- **`.github/workflows/ios-deploy.yml`** triggers on CI success on `main` (or
  manual dispatch): pulls the prod backend, builds web, `cap sync ios`, archives
  via the `.xcworkspace`, auto-bumps the build number (and the marketing version
  on an "already exists" conflict), and uploads to TestFlight. Serialized via a
  concurrency group so manual + auto triggers queue instead of double-uploading.

## Key facts

- **Repo:** `johnpc/jpc-countdowns`.
- **Amplify app id:** `d1letrbu1eg8la`, region `us-west-2`, AWS profile
  `personal`, branch `main`.
- **iOS bundle id:** `com.johncorser.countdowns` (widget:
  `com.johncorser.countdowns.JpcCountdownsWidget`). Xcode scheme: `App`,
  workspace `ios/App/App.xcworkspace`.
- **CI/deploy repo secrets:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
  `AWS_REGION`, `E2E_USERNAME`, `E2E_PASSWORD`, and for iOS deploy:
  `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_CONTENT`, `TEAM_ID`.
