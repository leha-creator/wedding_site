[← API](api.md) · [Назад в README](../README.md)

# Архитектура

## Обзор

Проект — одностраничный сайт (SPA) с Express-бэкендом. Статика отдаётся из корня, API — под префиксом `/api`. Админка защищена HTTP Basic Auth.

## Структура каталогов

```
pavel-maria/
├── server.js              # Точка входа, инициализация БД, маршруты
├── index.html             # Главная страница (приглашение + анкета)
├── admin.html             # Страница админ-панели
├── package.json
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── db/                # SQLite
│   │   ├── index.js        # Инициализация, getDb
│   │   └── schema.js       # Таблица submissions
│   ├── routes/
│   │   ├── submit.js       # POST /api/submit
│   │   ├── form.js         # GET/DELETE /api/form/:userId
│   │   └── admin.js        # /api/admin/submissions, export
│   ├── services/
│   │   ├── submissions.js  # CRUD для анкет
│   │   └── telegram.js     # Уведомления в Telegram
│   └── middleware/
│       └── auth.js        # Basic Auth для /admin
├── js/
│   ├── user-id.js         # localStorage/cookie — анонимный ID
│   └── admin.js           # Таблица, пагинация, экспорт
├── css/
│   ├── index.css
│   └── admin.css
├── assets/                # Изображения, аудио
└── data/                  # submissions.db (создаётся при запуске)
```

## Слои и зависимости

| Слой | Зависит от | Описание |
|------|------------|----------|
| `routes/` | `services/`, `middleware/` | HTTP-обработчики |
| `services/submissions` | `db/` | Бизнес-логика анкет |
| `services/telegram` | — | Внешний API |
| `db/` | — | SQLite, схема |

## Маршруты

| Путь | Метод | Auth | Назначение |
|------|-------|------|------------|
| `/` | GET | нет | index.html |
| `/admin` | GET | Basic | admin.html |
| `/api/submit` | POST | нет | Отправка анкеты |
| `/api/form/:userId` | GET, DELETE | нет | CRUD анкеты по user_id |
| `/api/admin/submissions` | GET | Basic | Список анкет |
| `/api/admin/submissions/export` | GET | Basic | Экспорт CSV/Excel |

## База данных

SQLite, таблица `submissions`:

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | INTEGER | PK |
| `user_id` | TEXT UNIQUE | UUID пользователя |
| `guests` | TEXT | JSON-массив ФИО |
| `transport` | INTEGER | 0/1 |
| `created_at`, `updated_at` | TEXT | ISO8601 |

Индексы: `user_id`, `updated_at`.

## Идентификация пользователей

Без регистрации. Анонимный UUID:
1. Генерируется при первом визите
2. Сохраняется в `localStorage` (ключ `wedding_user_id`)
3. Fallback в cookie при недоступности localStorage
4. Передаётся в каждом запросе анкеты

## Поток данных

1. Гость открывает сайт → получает/создаёт `user_id` (js/user-id.js)
2. Заполняет анкету → POST /api/submit с `user_id`, `guests`, `transport`
3. Сервер: сохраняет в SQLite (upsert по user_id) → отправляет в Telegram
4. При повторном визите: GET /api/form/:userId → форма подставляется из ответа
5. Админ: Basic Auth → GET /api/admin/submissions → таблица + экспорт

## See Also

- [API](api.md) — описание эндпоинтов
- [Конфигурация](configuration.md) — переменные окружения
