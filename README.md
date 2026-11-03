<<<<<<< HEAD
# Iqra Farah – portfolio

One-page portfolio built with Nuxt 3, Tailwind CSS and GSAP.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # static site in .output/public
```

## Where things are

- `data/profile.json` – name, email, links, headline, about text, experience
- `data/work.json` – the projects (title, year, role, techs, image, link)
- `data/heatmap.json` – the saved contribution graph (live data is fetched from GitHub when possible)
- `data/work-archive.json` – projects that are not shown any more (move one back to `work.json` to show it)
- `public/images/` – project screenshots and company logos
- `components/` – one file per section (LoadingScreen, Hero, Statement, Work, Contact, About drawer)
- `composables/useMotion.ts` – smooth scroll and the slide-up reveals

## Things to replace

The five project pictures are original illustrations (no copyright). Swap them for real screenshots or photos by replacing the files in `public/images/` with the same name and shape (`rooster.jpg` 16:10, `restaurant-gem.jpg` 4:5, `pomodoroplant.jpg` 16:11, `advokat.jpg` square, `creatify.jpg` 16:10).

- the year and link of Restaurant Gem in `data/work.json`
- the role of PomodoroPlant in `data/work.json`

To add a project, add an object to `data/work.json` and drop its image in `public/images/`.

## Company logos

`public/images/logos/bewise.svg` and `sovot.svg` are simple letter tiles. Replace them with the real logos (same file names, square) and they show up next to the jobs in About.
=======
# Showcase-Portfolio
>>>>>>> ad7d0e327dea84dba3593cb7ee279940b576f4b3
