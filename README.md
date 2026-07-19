# t-gubanov.ru

React + TypeScript static site for GitHub Pages.

## Stack

- Vite
- React 19
- TypeScript
- Static HTML generation on build
- GitHub Pages deployment

## Local work

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Production build

```powershell
npm run build
```

The build creates static pages in `dist/`.

## Project Structure

- `src/app/` - app entry and route list.
- `src/pages/` - pages where sections are connected.
- `src/sections/` - large page sections with editable content.
- `src/components/` - reusable layout and UI components.
- `src/config/site.ts` - site name, contacts, navigation.
- `src/styles/` - separated CSS files.
- `src/injections/head.html` - global HTML before `</head>`.
- `src/injections/body-start.html` - global HTML right after `<body>`.

## Editing Content

Main page content lives in `src/sections/home/`.

Services page content lives in `src/pages/ServicesPage.tsx` and `src/sections/services/ServicesListSection.tsx`.

There is no blog, admin panel, Markdown, JSON content, RSS, robots file, sitemap, or Open Graph image in the current base.
