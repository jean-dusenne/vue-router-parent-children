# Tasks

## 1. Skill skeleton

- [x] 1.1 Rename `.github/skills/vue-domain-structure/` to `.github/skills/vue-workflow-structure/` and set the `SKILL.md` frontmatter `name: vue-workflow-structure` with a `description` stating when it applies (adding, moving or reviewing Vue code of any workflow, including new ones); verify the frontmatter parses as valid YAML, matches the format of the other skills in `.github/skills/`, and the old directory no longer exists.

## 2. Structure and rules

- [x] 2.1 Document the target tree (`src/workflows/{stock,refill}/{components,composables,stores,views,router}`, `src/shared/{components,composables,stores}`, `src/router/index.ts`) and the "create folders only when needed" rule; verify against the "Workflow-based source layout" and "Standard Vue folders per workflow" requirements.
- [x] 2.2 Add a placement table (kind of code → folder, including routed pages in `views/` vs building blocks in `components/`); verify each folder named in the spec appears in the table.
- [x] 2.3 Document the dependency rules (workflow → shared only, no workflow → workflow, no shared → workflow) and the promotion-on-second-use rule with the "refill needs a stock helper" scenario; verify against the "Shared area", "Promotion" and "No imports between workflows" requirements.
- [x] 2.4 Document route ownership (each workflow exports its routes and guards; `src/router/index.ts` only aggregates) and the import style (`@/` across layers, relative within a workflow); verify against the "Routes owned by each workflow" and "Import style" requirements.

## 3. Worked examples

- [x] 3.1 Add examples taken from this repo, labelled as target state: `stock-id-guard.ts` moving next to the stock routes, and the navigation-error logic of `StockLayout.vue` extracted into a stock composable that is promoted to `shared/` only when refill needs it; verify every referenced current path exists with `git ls-files`.
- [x] 3.2 State in the skill that existing code is migrated by a later change and that the structure applies to new code and to code being touched; verify the sentence is present.
- [x] 3.3 State in the skill that stock and refill are not an exhaustive list and describe how to add a new workflow; verify the "Adding a new workflow" section is present.

## 4. Final check

- [x] 4.1 Run `openspec validate add-vue-workflow-structure-skill --strict` and verify it passes; re-read `SKILL.md` against `specs/vue-workflow-structure/spec.md` and verify each requirement is covered, that the word "domain" no longer appears in the skill, and that no file under `src/` was modified (`git status`).
