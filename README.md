# WeatherUp

A small static weather site built with HTML, CSS, and JavaScript. It shows current conditions, a five-day outlook, and an hourly strip for the next day. Weather data is served through a small proxy at [https://weather-api.andrii-prykhodko.com](https://weather-api.andrii-prykhodko.com).

## Features

- **Landing page** (`index.html`) — time-of-day styling (light/dark) via `scripts/index-page/stylesheet-selector.js`
- **Weather** (`home.html`) — search by city, optional browser geolocation, Celsius/Fahrenheit toggle, carousels for hourly and daily forecasts
- **About** and **Contact** — `about-us.html`, `contact-us.html` with shared navbar and footer

## Requirements

- A modern browser

The frontend requests from `WEATHER_API_BASE` in [`scripts/home-page/main.js`](scripts/home-page/main.js), which defaults to the hosted proxy URL. For your own deployment, point that constant at a compatible backend that stores an [OpenWeatherMap](https://openweathermap.org/appid) key server-side (or adapt the paths to your API). Do not commit API keys or embed them in client-side code.

## Run locally

Pages load `navbar.html` and `footer.html` with `fetch()`, so open the site over **HTTP**, not as `file://` URLs.

From the project root, for example:

```bash
npx --yes serve .
```

Then open the URL shown in the terminal (often `http://localhost:3000`) and start at `index.html`.

Any static file server works (Python `http.server`, VS Code Live Server, etc.) as long as the repo root is the web root.

## Project layout

| Path | Role |
|------|------|
| `index.html` | Landing |
| `home.html` | Weather UI |
| `about-us.html`, `contact-us.html` | Other pages |
| `navbar.html`, `footer.html` | Included by `scripts/navbar.js` |
| `scripts/` | Page-specific and shared JS |
| `style/` | CSS by page/section |

## Deployment

The project is automatically deployed to Cloudflare. The live site is at [https://weather-up.andrii-prykhodko.com/](https://weather-up.andrii-prykhodko.com/).

## License

This project is released under the [MIT License](LICENSE).
