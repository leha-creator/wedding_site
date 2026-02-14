# Implementation Plan: Wedding Invitation Updates (task/task.md)

Branch: none (direct task)
Created: 2026-02-14

## Settings
- Testing: no
- Logging: minimal (countdown JS: optional console for debug)

## Commit Plan
- **Commit 1** (after tasks 1-5): "feat: update texts, quote, details, questionnaire, coordinator"
- **Commit 2** (after tasks 6-9): "feat: styling – LOVE, font, music, location gap"
- **Commit 3** (after tasks 10-12): "feat: location restructure, timing, countdown"

## Tasks

### Phase 1: Content & Text Changes

- [x] **Task 1: Replace header quote with Ruth 1:16**
  - Replace «Не существует шести или семи чудес в мире. Есть только одно: это любовь.» with Руфь 1:16: «…я не оставлю тебя и не вернусь. ведь куда твой путь — туда и мой, где твое пристанище — там и мое, твой народ будет моим народом, твой Бог — моим Богом.»
  - Files: `index.html` (`.photo-quote`)

- [x] **Task 2: Update guest invitation text**
  - Replace intro: «Дорогие и близкие! Приглашаем вас разделить с нами трогательный и важный момент нашей жизни - день нашей свадьбы.»
  - Remove «Этот день настал — мы женимся!», «Приглашаем Вас разделить с нами радость этого особенного дня.»
  - Files: `index.html` (`.guest-invitation .section-text`)

- [x] **Task 3: Rewrite Details section**
  - Remove paragraph «Мы догадываемся, что после получения приглашения у вас может появиться ряд вопросов.»
  - Add 2 items:
    1. No heading: «Мы создали телеграмм канал для гостей, будем рады видеть там ваши фото и видео. присоединяйтесь!»
    2. Heading «Сюрпризы.»: «Мы всегда ценим и любим креатив, поэтому если у вас возникло желание сделать что-то особенное для нас, вы можете обратиться к нашему организатору для воплощения своих идей.» + контакты: Олег Соболев +7 (917) 121 44 70
  - Files: `index.html` (`.details-section`)

- [x] **Task 4: Add coordinator Matvey block**
  - Insert after Details section, before FAQs: block «организатор-координатор Матвей» (keep existing Matvey Zagvozdkin contacts if needed, or use as coordinator)
  - Files: `index.html` (between `.details-section` and `.faqs-section`)

- [x] **Task 5: Update questionnaire section**
  - Add text: «Если вы будете не один, укажите всех, включая детей»
  - Add photo below (placeholder path or existing asset; clarify with user if specific photo required)
  - Files: `index.html` (`.questionnaire-section`)

### Phase 2: Styling & Assets

- [x] **Task 6: Enlarge LOVE letters to edge**
  - Increase `.love-text` font-size so LO/VE spans full viewport width (edge to edge)
  - Adjust letter-spacing, line-height if needed; may use `clamp()` or `vw` units
  - Files: `css/index.css` (`.love-text`, `.love-feature`)

- [x] **Task 7: Add custom font FoglihtenNo06_076**
  - Add `@font-face` for `assets/FoglihtenNo06_076.otf`
  - Apply as primary/trial font to key elements (e.g. headings, couple names) — «на пробу»
  - Files: `css/index.css`

- [x] **Task 8: Remove gap between location and next section**
  - Reduce margin/gap between `.location-section` and `.dresscode-section` (or following image block)
  - Files: `css/index.css` (`.location-section`, `.wedding-container` gap, or section margins)

- [x] **Task 9: Change background music**
  - Update `<audio>` source to `Nat_King_Cole_-_L-O-V-E_(Multilingual_Version.mp3` (path: `assets/` or root; file exists in assets)
  - Files: `index.html`

### Phase 3: Location, Timing & Countdown

- [x] **Task 10: Restructure Location section**
  - Replace current single location with two blocks:
    - **Церемония венчания:** ул. Бородина, 23, Ульяновск + photo (church) + link: https://yandex.ru/maps?ol=geo&text=улица%20Бородина,%2023&…
    - **Праздничный банкет:** Своя ферма, Виноградная ул., 11/1, рабочий посёлок Ишеевка + photo (farm) + link: https://yandex.ru/maps/org/svoya_ferma/158080245915?…
  - Use structure: «Церемония венчания пройдет по адресу:» + address + photo + «открыть карту»; same for банкет
  - **Note:** User must provide photos for church and farm (or use placeholders)
  - Files: `index.html`, `css/index.css`, `assets/` (add church/farm images)

- [x] **Task 11: Add timing section**
  - Create new section with brown/terra cotta background (like `task/timing-example.png`)
  - Content: 12:00 венчание | 15:00 сбор гостей | 16:00 начало банкета | 22:00 окончание торжества
  - Style: light text on warm brown, similar to example
  - Position: after location (or as decided)
  - Files: `index.html`, `css/index.css`

- [x] **Task 12: Add wedding countdown**
  - «До свадьбы осталось: X дней Y часов» (or days only)
  - Target date: 24.07.2025 (or 2026 if task implies)
  - Implement with vanilla JS, update on load and optionally on interval
  - LOGGING: Optional `console.log` for debug (target date, calculated diff)
  - Files: `index.html` (new block + inline script or `js/script.js`)

---

## Dependencies
- Task 4 may reference contacts from Task 3.
- Task 10 requires church/farm photos — use placeholders or confirm paths with user.
- Task 12 date: confirm 24.07.2025 vs 24.07.2026 from invitation.

## Notes
- Font and LOVE sizing: «на пробу» — may need iteration.
- Questionnaire photo: clarify with user if specific image needed.
