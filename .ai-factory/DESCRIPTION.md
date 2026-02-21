# Project: Wedding Invitation — Pavel & Maria

## Overview

A single-page wedding invitation website. Guests open an animated envelope to reveal the invitation, explore sections (location, dress code, details, FAQ), and fill out a guest questionnaire. The site is in Russian and features background music and a responsive layout.

## Core Features

- **Envelope intro** — Animated envelope that users click to "open" and reveal the main content
- **Music player** — Toggle for background wedding music (Billie Jean)
- **Location** — Villa Arcobaleno, Moscow Oblast (with map button)
- **Dress code** — Photo section for dress code
- **Details & FAQ** — Information about gifts, toasts, flowers, children policy, photos
- **Guest questionnaire** — Modal form: FIO (multiple guests), transport needed, deadline 15.04.2026
- **Organizer contact** — Matvey Zagvozdkin, phone & Telegram (placeholders)

## Tech Stack

- **Language:** HTML, CSS, JavaScript (vanilla)
- **Framework:** None — static site
- **Backend:** Node.js + Express — serves static files, POST /api/submit, form CRUD, admin API
- **Database:** SQLite (better-sqlite3) — submissions stored in `./data/submissions.db`
- **Build:** None — no bundler
- **Assets:** Images (JPG, PNG), audio (MP3)

## Structure

```
pavel-maria/
├── server.js           # Express server entry point
├── admin.html          # Admin dashboard (Basic Auth)
├── package.json        # express, dotenv, better-sqlite3, xlsx
├── src/
│   ├── db/             # SQLite init, schema
│   ├── routes/         # submit, form, admin
│   ├── services/       # telegram, submissions
│   └── middleware/     # Basic Auth for admin
├── js/                 # user-id.js, admin.js
├── index.html          # Single HTML file, inline scripts
├── css/index.css       # Styles
├── assets/             # Images
└── data/               # submissions.db (created at runtime)
```

## Architecture Notes

- Express serves static files from project root
- Questionnaire form submits via fetch to /api/submit (guests, transport)
- Telegram: new submissions sent to configured chat via Bot API (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
- Future: Google Sheets write
- Accessibility: ARIA attributes, keyboard support (Enter/Space on envelope, Escape on modal)
- Russian locale (`lang="ru"`)

## Non-Functional Requirements

- **Accessibility:** ARIA labels, keyboard navigation
- **Mobile:** Responsive layout (viewport meta)
- **Deployment:** Docker (Dockerfile + docker-compose); `docker compose up -d` on server; restart: always
