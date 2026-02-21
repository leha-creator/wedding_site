[← Деплой](deployment.md) · [Назад в README](../README.md) · [Архитектура →](architecture.md)

# API Reference

Базовый URL: `http://localhost:3000` (или домен в продакшене).

## Публичные эндпоинты

### POST /api/submit

Отправка анкеты гостя.

**Тело запроса (JSON):**

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `user_id` | string (UUID) | да | Анонимный ID пользователя (из localStorage) |
| `guests` | string[] | да | Массив ФИО гостей |
| `transport` | boolean | нет | Нужен ли транспорт |

**Пример:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "guests": ["Иванов Иван Иванович", "Иванова Мария"],
  "transport": true
}
```

**Успех (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "guests": ["Иванов Иван Иванович", "Иванова Мария"],
    "transport": true,
    "created_at": "2026-02-22T12:00:00.000Z",
    "updated_at": "2026-02-22T12:00:00.000Z"
  }
}
```

**Ошибки:** 400 (валидация), 502 (ошибка Telegram).

### GET /api/form/:userId

Получить сохранённую анкету пользователя.

**Параметры:** `userId` — UUID.

**Успех (200):** JSON с полями `user_id`, `guests`, `transport`, `created_at`, `updated_at`.

**Ошибки:** 400 (неверный UUID), 404 (анкета не найдена).

### DELETE /api/form/:userId

Удалить анкету пользователя.

**Параметры:** `userId` — UUID.

**Успех (200):**

```json
{ "success": true }
```

**Ошибки:** 400 (неверный UUID).

---

## Админ-панель (Basic Auth)

Все эндпоинты `/admin` и `/api/admin/*` требуют HTTP Basic Auth (логин и пароль из `ADMIN_USER`/`ADMIN_PASSWORD`). При отсутствии заголовка возвращается 401.

### GET /api/admin/submissions

Список всех анкет с пагинацией и поиском.

**Query-параметры:**

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| `page` | 1 | Номер страницы |
| `limit` | 20 | Записей на страницу (макс. 100) |
| `sort` | `updated_at` | Сортировка: `user_id`, `created_at`, `updated_at` |
| `order` | `desc` | Направление: `asc`, `desc` |
| `search` | — | Поиск по guest и user_id |

**Пример ответа (200):**

```json
{
  "items": [
    {
      "id": 1,
      "user_id": "550e8400-...",
      "guests": ["Иванов Иван"],
      "transport": true,
      "created_at": "2026-02-22T12:00:00.000Z",
      "updated_at": "2026-02-22T12:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### GET /api/admin/submissions/export

Экспорт в CSV или Excel.

**Query-параметры:**

| Параметр | Описание |
|----------|----------|
| `format` | `csv` или `xlsx` |
| `limit` | Макс. записей (по умолчанию 10000) |
| `search` | Фильтр по поиску (как в /submissions) |

**Ответ:** файл (Content-Disposition: attachment).

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверный запрос (валидация) |
| 401 | Требуется авторизация (админ) |
| 404 | Ресурс не найден |
| 502 | Ошибка внешнего сервиса (Telegram) |

## See Also

- [Конфигурация](configuration.md) — ADMIN_*, TELEGRAM_*
- [Архитектура](architecture.md) — схема маршрутов
