# DeskFit

DeskFit is a 2D desk setup planner built with Next.js, TypeScript, Tailwind CSS, Zustand, and React Konva.

Live demo: https://deskfit-app.vercel.app/

Users can customize desk dimensions, add common desk items, drag, rotate, resize, lock, duplicate, validate fit, apply templates, save locally, and export the setup as a PNG.

## Features

- Landing page with product overview
- 2D top-view planner canvas
- Desk size, color theme, grid, and snap controls
- Add monitors, laptops, keyboards, mouse, mousepads, speakers, lamp, PC case, headphone stand, and desk shelf
- Drag, select, rotate, resize, lock, duplicate, and delete items
- Fit validation for outside bounds, overlapping items, used area, free space, and Desk Fit Score
- Smart setup feedback
- Setup templates
- localStorage save/load/reset
- PNG export
- 3D preview beta with camera presets and 3D PNG export

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Zustand
- React Konva
- Three.js
- React Three Fiber
- Drei

## Roadmap

- Supabase auth and cloud saves
- Shareable setup links
- Multiple saved setups dashboard
- Alignment tools
- More templates and item presets
