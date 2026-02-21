[← Конфигурация](configuration.md) · [Назад в README](../README.md) · [API →](api.md)

# Деплой

## Требования

- Docker и Docker Compose на сервере
- Файл `.env` с настройками

## Первый запуск

1. Скопировать проект на сервер (например, `git clone`).

2. Создать `.env` в корне:
   ```bash
   cp .env.example .env
   ```
   Заполнить: `PORT`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ADMIN_USER`, `ADMIN_PASSWORD`.

3. Запустить:
   ```bash
   docker compose up -d
   ```

## Обычный запуск

```bash
cd /path/to/pavel-maria
docker compose up -d
```

Приложение будет:
- работать в фоне;
- перезапускаться при падении;
- перезапускаться после перезагрузки сервера.

## Полезные команды

| Действие | Команда |
|----------|---------|
| Запуск | `docker compose up -d` |
| После изменений кода | `docker compose up -d --build` |
| Просмотр логов | `docker compose logs -f` |
| Остановка | `docker compose down` |
| Перезапуск | `docker compose restart` |

## Порт

По умолчанию приложение слушает 3000. Маппинг задаётся в `docker-compose.yml`:

```yaml
ports:
  - "${PORT:-3000}:${PORT:-3000}"
```

Для доступа по домену на порт 80:

```yaml
ports:
  - "80:${PORT:-3000}"
```

Тогда в `.env` задайте нужный порт приложения, снаружи будет порт 80.

## База данных

SQLite хранится в `./data/submissions.db`. В Docker используется volume:

```yaml
volumes:
  - ./data:/app/data
environment:
  - DB_PATH=/app/data/submissions.db
```

Данные сохраняются между перезапусками контейнера.

## Локальная разработка

```bash
npm run dev
```

Сервер перезапускается при изменении `server.js` и файлов в `src/`. После `git pull` на сервере используйте `docker compose up -d --build` для пересборки.

## Типовые проблемы

### Сайт не открывается из браузера

1. **Firewall** (если включён):
   ```bash
   sudo ufw allow 3000
   sudo ufw reload
   ```

2. **Проверка, что порт слушается**:
   ```bash
   sudo ss -tlnp | grep 3000
   ```

3. **Проверка внутри сервера**:
   ```bash
   curl http://localhost:3000
   ```
   Если отвечает — приложение работает, проблема в firewall или DNS.

### DNS

A-запись домена должна указывать на IP сервера.

## See Also

- [Конфигурация](configuration.md) — все переменные
- [Начало работы](getting-started.md) — локальный запуск
