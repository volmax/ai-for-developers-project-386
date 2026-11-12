# TypeSpec Contracts

Design-first API contracts using TypeSpec.

## Структура

- `main.tsp` — описание API (модели, операции)
- `tspconfig.yaml` — конфигурация эммитеров
- `package.json` — зависимости и скрипты
- `generated/openapi/` — сгенерированный OpenAPI 3.0 (коммитить в git)
- `generated/client/` — сгенерированные TypeScript-типы (коммитить в git)

## Команды

```bash
npm run compile          # генерация OpenAPI 3.0 из TypeSpec
npm run generate-client  # генерация TypeScript-типов из OpenAPI
npm run check            # полная проверка: генерация + git diff
```

## CI

Проверка сгенерированных файлов запускается через:

```bash
mise run check:contract
```

Эта команда входит в общий `mise run check` и CI-пайплайн.
