# Нотатки+

«Нотатки+» — Next.js застосунок для персональних нотаток із Better Auth, PostgreSQL, Redis cache-aside та BullMQ worker.

## Запуск

```powershell
Copy-Item .env.example .env.local
docker compose up --build
```

Відкрийте [http://localhost:3000](http://localhost:3000). Для зупинки: `docker compose down`.

## Перевірки

```powershell
npm test
npm run typecheck
npm run build
docker compose up --build --wait
```

## E2E чекліст

1. Зареєструйте User A, створіть і відредагуйте нотатку.
2. Зареєструйте User B і перевірте, що URL нотатки User A повертає 404.
3. Зупиніть Redis: активний список має читатися з Postgres без 500.
4. Перемістіть нотатку в кошик та відновіть її.
5. Створіть прострочену trash-нотаткy, запустіть worker і перевірте purge.
