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
- **Backend:** Node.js + Express — serves static files, POST /api/submit for form
- **Database:** None — form data sent to API, forwarded to Telegram chat; Google Sheets planned
- **Build:** None — no bundler
- **Assets:** Images (JPG, PNG), audio (MP3)

## Structure

```
pavel-maria/
├── server.js           # Express server entry point
├── package.json        # express, dotenv
├── src/
│   ├── routes/submit.js    # POST /api/submit
│   └── services/          # telegram.js, sheets.js (placeholders)
├── index.html          # Single HTML file, inline scripts
├── css/index.css       # Styles
├── assets/             # Images
└── *.mp3, *.jpg       # Media in root
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
- **Deployment:** Can be served as static files (GitHub Pages, Netlify, etc.)
