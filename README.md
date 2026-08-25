# Нотатки+

Персональний застосунок нотаток на Next.js 16 з Better Auth, PostgreSQL, Redis cache-aside та BullMQ worker. Дані кожного користувача ізольовані на сервері.

## Що потрібно

- Docker Desktop із увімкненим Linux engine;
- Node.js 22+ і npm — лише для локальної розробки та запуску тестів.

## Швидкий запуск

```powershell
Copy-Item .env.example .env
docker compose up --build -d
```

Відкрийте [http://localhost:3000](http://localhost:3000). Реєстрація створює нового користувача; сторінка нотаток відкривається після входу.

Перевірити стан контейнерів і застосунку:

```powershell
docker compose ps
curl.exe http://localhost:3000/api/health
```

Очікувана відповідь при доступних PostgreSQL і Redis:

```json
{"status":"ok","db":true,"redis":true}
```

Зупинка застосунку: `docker compose down`. Дані Postgres зберігаються у Docker volume.

## Змінні середовища

| Змінна | Призначення |
| --- | --- |
| `POSTGRES_PASSWORD` | Пароль локального PostgreSQL контейнера |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `BETTER_AUTH_SECRET` | Секрет Better Auth, щонайменше 32 символи |
| `BETTER_AUTH_URL` | Публічна URL-адреса вебзастосунку |
| `TRASH_TTL_DAYS` | Скільки днів нотатка зберігається в кошику |
| `CRON_PURGE_SCHEDULE` | Cron-розклад BullMQ cleanup job |
| `PORT` | Порт Next.js, за замовчуванням `3000` |

Docker Compose вимагає `POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET` і `BETTER_AUTH_URL` зі змінних середовища. Для будь-якого не локального середовища використовуйте секрет-менеджер, а не versioned `.env` файл.

## Архітектура і гарантії

- FSD: `app` лише маршрутизує, доменна логіка лежить у `entities`, UI — у `pages-flat`, `widgets` і `features`.
- `userId` береться тільки з серверної Better Auth-сесії. Доступ до чужої нотатки завжди повертає `404`, а не `403`.
- DTO проходять сувору Zod-валідацію; зайві поля на кшталт `userId` або `deletedAt` відхиляються.
- Redis працює за cache-aside. Падіння або timeout Redis не ламає `/api/notes`: запит читає Postgres. `/api/health`, навпаки, чесно повертає `503`, якщо недоступна БД або Redis.
- Видалення — soft delete. Worker остаточно видаляє лише записи старші за `TRASH_TTL_DAYS`, дедуплікує користувачів і очищає їхній cache key.

## Команди розробки та тестування

```powershell
npm test                 # Усі unit, integration та E2E тести
npm run test:unit        # Ізольовані unit-тести
npm run test:integration # Healthcheck та інші integration-тести
npm run test:e2e         # Docker-backed E2E (потрібен docker compose up -d)
npm run typecheck        # TypeScript strict check
npm run build            # Next standalone + worker bundle
npm run worker           # Запуск зібраного worker локально
```

E2E перевіряють IDOR для User A/B, soft-delete/restore, Redis cache warming і фізичний purge простроченої нотатки. Purge-сценарій тимчасово створює тестовий запис у Docker Postgres та запускає реальну job у одноразовому контейнері.

## Перевірка Redis fallback вручну

```powershell
docker compose stop redis
# У браузері відкрийте /notes: дані мають залишитися доступними з Postgres.
docker compose start redis
```

Поки Redis вимкнений, `/api/health` повинен показувати `503`; це очікувана поведінка і не означає падіння API нотаток.

## Структура сервісів Docker

`postgres` → `redis` → `migrate` (one-shot) → `web` + `worker`.

`web` використовує Next standalone image. `worker` запускається окремим процесом з окремим BullMQ Redis-клієнтом і коректно завершується на `SIGINT`/`SIGTERM`.
