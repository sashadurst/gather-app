# Gather

Event copy generator for social club organizers — fill out a form, get ready-to-post content for Luma, Partiful, and Instagram in seconds.

## Why I built this

I grew SF Social Cookbook Club to nearly 2,000 members as a solo organizer. Every event meant writing the same information four different ways — a warm Luma description, a casual Partiful invite, an Instagram caption with hashtags, and a run-of-show for the day. It was 30–45 minutes of work before the actual planning even started.

Gather cuts that to under a minute. You fill out one form, pick your tone, and get polished copy for every platform at once.

## What it does

- Accepts event details — club name, vibe, theme, date, location, group size, logistics
- Lets the organizer choose a tone: Warm & cozy, Fun & hype, or Chill & low-key
- Generates platform-specific copy simultaneously: Luma description, Partiful invite, Instagram caption, and event agenda
- Each output appears in its own card with a one-click copy button
- Calls the Anthropic Claude API directly from the browser with a structured prompt that enforces format and voice for each platform

## Tech stack

- **React** + **Vite** — frontend framework and build tool
- **Tailwind CSS** — utility-first styling
- **Anthropic Claude API** (`claude-sonnet-4-6`) — LLM for content generation
- **Vercel** — deployment and hosting

## Live demo

[gather-app-sepia.vercel.app](https://gather-app-sepia.vercel.app)

## Run locally

**Prerequisites:** Node.js 18+, an [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/sashadurst/gather-app.git
cd gather-app
npm install
```

Create a `.env.local` file in the project root:

```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.
