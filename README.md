# Metals Analytics Dashboard (Open Source)

This is a static GitHub Pages dashboard that shows live gold (XAU) and silver (XAG) prices, supports multiple currencies, and includes simple AI-powered insights (news sentiment and a rule-based gold/silver ratio signal) — all using free/open-source services and GitHub Actions.

## Features
- Gold & Silver prices via [Metals-API](https://metals-api.com/) (free tier).
- Currency conversions (USD, INR, EUR, GBP, JPY).
- News headlines (NewsAPI) + sentiment analysis via Hugging Face Inference API (pretrained model).
- Rule-based Gold/Silver ratio signal (no training required).
- Auto-updates via GitHub Actions (every 6 hours).
- Hosted on GitHub Pages (free).

## Setup
1. Fork or create a repo and push this project.
2. In the repo, go to **Settings → Secrets → Actions** and add:
   - `METALS_API_KEY` (from metals-api.com)
   - `NEWS_API_KEY` (from newsapi.org)
   - `HF_API_KEY` (from huggingface.co) — optional but recommended for stable inference.
3. Enable **GitHub Pages**: Settings → Pages → Source: `main` branch, root.
4. Trigger the workflow manually (Actions → Update Metals Data + AI Insights → Run workflow) or wait for the scheduled run.
5. After the workflow runs, `data/metals.json`, `data/news.json`, and `data/sentiment.json` will be present and the site will display them.

## Notes & limitations
- Hugging Face Inference API has rate limits on the free tier. If you hit limits, consider batching or using less frequent updates.
- Metals-API free tier may have limits; check their usage policy.
- This project stores retrieved JSON inside the Git repository to keep the frontend fully static (no server).
- For enhanced AI features (summarization, forecasts, chatbot), you can extend the GitHub Action to call other APIs or run small Python inference scripts — no training required.

## License
MIT License — see LICENSE file.
