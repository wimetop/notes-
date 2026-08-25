# Нотатки+ — технічний дизайн

## Мета та межі

«Нотатки+» — вебзастосунок для персональних нотаток з email/password
авторизацією, активним списком, редагуванням, кошиком і автоматичним
остаточним очищенням прострочених записів. Система складається з Next.js
вебзастосунку та окремого BullMQ-воркера, що спільно використовують Postgres
і Redis. У межі першої версії не входять OAuth, підтвердження email,
відновлення пароля, спільний доступ до нотаток та вкладення.

## Технології та запуск

- Next.js 16 App Router з TypeScript у strict mode та
  `noUncheckedIndexedAccess`.
- Drizzle ORM і PostgreSQL.
- Better Auth з email/password та Drizzle adapter.
- ioredis для cache-aside і BullMQ для фонових задач.
- TanStack Query, React Hook Form, Zod і `zodResolver` для клієнтського стану
  та форм.
- Vitest для unit-тестів.
- Docker Compose для Postgres, Redis, одноразових міграцій, web і worker.

`next build` працює з `output: "standalone"`. Воркер компілюється окремо
через tsup у `dist/worker`; фінальний образ не містить tsx.

## Шари та залежності FSD

`src/app` є routing facade: route handlers, `page.tsx` і `layout.tsx` лише
компонують або делегують у public API інших модулів. Решта коду розміщується у
`src/pages-flat`, `widgets`, `features`, `entities` і `shared`.

Допустимий напрямок залежностей: `app -> pages-flat -> widgets -> features ->
entities -> shared`. Кожен модуль експортує споживаний контракт через
`index.ts`; імпорти внутрішніх файлів між шарами заборонені. `shared` містить
лише перевикористовувану інфраструктуру та UI-примітиви, без доменної логіки.

## Дані та авторизація

Drizzle визначає Better Auth таблиці `user`, `session`, `account`,
`verification`, а також `notes`:

- `id uuid primary key`;
- `user_id`, що належить авторизованому користувачу;
- `title`, `body`;
- `deleted_at`, `created_at`, `updated_at`.

Для `notes` існують індекси `notes_user_id_idx` на `user_id` і
`notes_deleted_at_idx` на `deleted_at`. Другий забезпечує ефективне фонове
очищення soft-deleted записів.

Сервер отримує ідентичність тільки з валідованої Better Auth сесії через
`requireAuthSession()`. Дані `userId` з path, query або body не приймаються.
Будь-яка відсутня або чужа нотатка повертає однаковий `404 Not Found`, щоб не
допустити IDOR та перебору ідентифікаторів.

## Валідація та API

Zod-схеми — єдине джерело істини для DTO. Route handlers викликають
`schema.strict().parse(...)`; UI-форми використовують ті самі схеми через
`zodResolver`.

`createNoteSchema`: непорожній `title` до 120 символів і необов'язковий
`body` до 5000 символів. `updateNoteSchema` дозволяє часткове оновлення цих
полів. Query `q` проходить окрему схему, а ID — UUID-валідацію.

Маршрути:

- `GET/POST /api/notes` — список/пошук і створення;
- `GET/PATCH/DELETE /api/notes/[id]` — читання, редагування, переміщення в
  кошик;
- `POST /api/notes/[id]/restore` — відновлення;
- `GET /api/health` — перевірка Postgres і Redis;
- `/api/auth/[...all]` — Better Auth handler.

Доменний серверний сервіс у `entities/note` інкапсулює всі запити до нотаток
та перетворює відсутній результат на доменну помилку `NoteNotFoundError`.

## Кешування та деградація

Некешований пошук виконується напряму в Postgres через `ilike`; кешується лише
активний список без пошукового запиту. Ключ: `notes:v1:list:${userId}`, TTL —
60 секунд.

Усі доступи до Redis виконуються тільки через `safeRedis`. Його `get` повертає
`null` при помилці, а `set`, `del` і `delPattern` логують проблему та не
переривають запит. ioredis створюється з `lazyConnect: true`,
`maxRetriesPerRequest: 1` і безпечним error listener. Після створення,
редагування, soft-delete, restore та purge інвалідується ключ користувача.

`/api/health` навмисно не використовує graceful fallback: паралельно виконує
`SELECT 1` і Redis `PING`, повертаючи 200 лише коли обидві залежності доступні;
інакше повертає 503.

## UI та стан клієнта

`QueryClientProvider` має `staleTime: 30_000` і
`refetchOnWindowFocus: false`. `entities/note` постачає query hooks для
активного списку та кошика, а mutation hooks виконують оптимістичні оновлення
і завжди інвалідують query key `['notes']`.

Екрани: login, register, список нотаток зі створенням і debounced-пошуком,
деталі/редагування та кошик. Features відповідають за auth, create, edit,
delete і restore. Форми мають доступні повідомлення про помилки через
`aria-invalid` та `aria-describedby`, блокують повторну відправку і показують
стан завантаження.

## Воркер і очищення

BullMQ запускається окремим процесом командою `npm run worker`, із власним
Redis-з'єднанням. Repeatable job `trash:purge` використовує
`CRON_PURGE_SCHEDULE`. Вона атомарно видаляє нотатки з `deleted_at`, старшим за
`TRASH_TTL_DAYS`, через `DELETE ... RETURNING user_id`, дедуплікує user IDs і
безпечним чином інвалідує їхній кеш. Операція ідемпотентна: повторний запуск
не знаходить уже видалених рядків.

На `SIGTERM` і `SIGINT` воркер припиняє прийом задач, очікує поточну задачу,
закриває BullMQ та Redis-з'єднання, потім завершується. Вебпроцес не керує
життєвим циклом воркера.

## Конфігурація й контейнери

`shared/config/env.ts` валідує `DATABASE_URL`, `REDIS_URL`,
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TRASH_TTL_DAYS`,
`CRON_PURGE_SCHEDULE` і `PORT` за допомогою Zod ще під час старту процесу.

Multi-stage Dockerfile на `node:22-alpine` має stages deps, builder і runner.
Runner використовує non-root користувача `nextjs:nodejs`, standalone output,
static/public assets і `dist/worker`. Compose чекає healthchecks Postgres і
Redis, запускає `migrate` один раз, а `web` та `worker` залежать від його
успішного завершення. `web` має healthcheck на `/api/health`; воркер не
експонує порти.

## Перевірка якості

Unit-тести покривають Zod DTO, побудову cache key і обчислення прострочення
кошика. Перед поставкою виконуються typecheck, lint, unit tests, production
build та Docker Compose smoke check. Ручний/E2E чекліст перевіряє реєстрацію,
ізоляцію між User A/User B, cache hit, fallback при зупиненому Redis,
soft-delete/restore, purge і healthcheck.
