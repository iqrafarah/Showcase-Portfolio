import work from './data/work.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  nitro: {
    prerender: { routes: work.map((project) => `/work/${project.slug}`) },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    // Set NUXT_APP_BASE_URL=/your-repo/ when deploying to a sub-path (e.g. GitHub Pages)
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      script: [
        {
          innerHTML:
            "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('no-loader')},9000)",
        },
      ],
      htmlAttrs: { lang: 'en' },
      title: 'Iqra Farah — Web designer & developer',
      meta: [
        {
          name: 'description',
          content:
            'Portfolio of Iqra Farah, an ICT student at Fontys Tilburg and a frontend developer who also knows full-stack, with a focus on UI design. Projects from internships, school and free time.',
        },
        { name: 'theme-color', content: '#efeee9' },
        {
          property: 'og:title',
          content: 'Iqra Farah — Web designer & developer',
        },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@300..600&display=swap',
        },
      ],
    },
  },
});
