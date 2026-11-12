# AGENTS.md — Правила для AI-агентов

## Быстрый старт

```bash
mise run install    # backend: mvn dependency:go-offline, frontend: npm install
mise run build      # backend: mvn package -DskipTests, frontend: tsc -b && vite build
mise run test       # backend: mvn test, frontend: vitest run
mise run check      # полный lint/typecheck/format/security перед коммитом
mise run fix        # авто-исправление: spotless:apply + oxfmt
```

Запуск сервисов: `mise run start:backend` и `mise run start:frontend` (или `mise daemon`).

## Структура

- **backend/** — Spring Boot 4.1.2, Java 21, H2. Точка входа: `AiForDevelopersProject386Application.java`. Health-эндпоинт: `GET /api/health`.
- **frontend/** — React 19, Vite 6, TypeScript 5, Tailwind CSS 3. Точка входа: `src/main.tsx`. Алиас `@` → `./src`.
- **docker-compose.yml** — `backend` (8080) + `frontend` (80, nginx, проксирует `/api` → backend).

## Неочевидные команды

- `mise run check` запускает ~12 шагов: hadolint (оба Dockerfile), spotless:check, maven compile, oxlint, oxfmt, knip, jactionlint, typos, betterleaks, 4 проверки JSON-схем, 2 osv-scanner. **Это gate — должен проходить.**

## НЕ трогать

- `.github/workflows/hexlet-check.yml` — автогенерация Hexlet. Не менять и не удалять.
- `.github/workflows/ci.yml` — обновляется через jactionlint. Не менять напрямую.
- `.env` — в `.gitignore`, никогда не коммитить.

## Коммиты

Формат: `<type>[scope]: <description>`

| Тип | Что делает | SemVer |
|-----|-----------|--------|
| `feat` | новая функция | MINOR |
| `fix` | исправление бага | PATCH |
| `refactor` | рефакторинг (без новых фич/багов) | — |
| `perf` | улучшение производительности | — |
| `test` | тесты | — |
| `docs` | документация | — |
| `chore` | рутина (deps, конфиги) | — |

- `fix:` → PATCH, `feat:` → MINOR.
- Breaking change: `BREAKING CHANGE: ...` в body или footer (MAJOR).
- Scope в скобках: `feat(auth): add login`.
- Описание — краткое, в повелительном наклонении, без точки в конце.

## Инструменты

- Всё зафиксировано в `mise.toml`

## Agent skills

### Issue tracker

Issues tracked as GitHub issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `GLOSSARY.md` at root, `docs/adr/` for ADRs. See `docs/agents/domain.md`.

### TypeSpec

Контрактная цепочка: `typespec/`. Пinned-версии в `typespec/package.json` —
читать перед `npm install`. Lockfile `typespec/package-lock.json` — canonical
source, использовать `npm ci` или `npm install --package-lock-only`.

Документация: https://typespec.io/docs

Важно: синтаксис TypeSpec v1.x. Query-параметры с дефолтом — optional
(например, `@query() skip?: int32 = 0`).
