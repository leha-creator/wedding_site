[← Начало работы](getting-started.md) · [Назад в README](../README.md) · [Деплой →](deployment.md)

# Конфигурация

Все настройки задаются через переменные окружения. Файл `.env` в корне проекта загружается автоматически (dotenv).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `PORT` | `3000` | Порт HTTP-сервера |
| `DB_PATH` | `./data/submissions.db` | Путь к файлу SQLite |
| `ADMIN_USER` | — | Логин для админ-панели (Basic Auth) |
| `ADMIN_PASSWORD` | — | Пароль для админ-панели |
| `TELEGRAM_BOT_TOKEN` | — | Токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | — | ID чата для уведомлений о заявках |
| `LOG_LEVEL` | `info` | Уровень логов: `debug`, `info`, `warn`, `error` |
| `GOOGLE_SHEETS_CREDENTIALS` | — | (зарезервировано) |
| `GOOGLE_SHEET_ID` | — | (зарезервировано) |

## Админ-панель

Для доступа к `/admin` и `/api/admin` обязательно задайте:

```env
ADMIN_USER=admin
ADMIN_PASSWORD=ваш_секретный_пароль
```

Альтернатива — `ADMIN_CREDENTIALS=user:password` в одном поле.

## Telegram

Если указаны `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`, при каждой новой или обновлённой анкете в указанный чат отправляется сообщение.

- Токен: создайте бота через [@BotFather](https://t.me/BotFather)
- Chat ID: ID чата или группы (например, через @userinfobot)

## База данных

SQLite создаётся автоматически при первом запуске. Каталог `./data/` создаётся, если его нет. Для Docker используйте volume (см. [Деплой](deployment.md)).

## See Also

- [Деплой](deployment.md) — настройка `.env` на сервере
- [API](api.md) — публичные и защищённые эндпоинты
