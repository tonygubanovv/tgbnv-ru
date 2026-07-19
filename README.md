# t-gubanov.ru

React + TypeScript static site for GitHub Pages.

## Stack

- Vite
- React 19
- TypeScript
- Static HTML prerender for SEO
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

## Editing

Edit page content directly in React/TypeScript:

- `src/ui/App.tsx` for page layout and visible text
- `src/content/site.ts` for site metadata, contacts, and navigation

## Global HTML Inserts

- `src/injections/head.html` is inserted before `</head>` on every page.
- `src/injections/body-start.html` is inserted right after `<body>` on every page.
