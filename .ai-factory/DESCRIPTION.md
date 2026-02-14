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
- **Database:** None — form data is logged to console only
- **Build:** None — no bundler or package.json
- **Assets:** Images (JPG, PNG), audio (MP3)

## Structure

```
pavel-maria/
├── index.html          # Single HTML file, inline scripts
├── css/index.css       # Styles
├── js/script.js        # (currently empty)
├── assets/             # Images
└── *.mp3, *.jpg       # Media in root
```

## Architecture Notes

- Single `index.html` with inline scripts for envelope, music toggle, modal
- Questionnaire form submits via JS (`e.preventDefault()`), data logged to console — no backend
- Accessibility: ARIA attributes, keyboard support (Enter/Space on envelope, Escape on modal)
- Russian locale (`lang="ru"`)

## Non-Functional Requirements

- **Accessibility:** ARIA labels, keyboard navigation
- **Mobile:** Responsive layout (viewport meta)
- **Deployment:** Can be served as static files (GitHub Pages, Netlify, etc.)
