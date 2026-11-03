// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://vitrine-widgets.github.io',
	integrations: [
		starlight({
			title: 'Vitrine',
			description: 'Lightweight, interactive desktop widgets for Windows, drawn beneath your icons.',
			logo: { src: './src/assets/vitrine.svg' },
			favicon: '/favicon.svg',
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				it: { label: 'Italiano', lang: 'it' },
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/vitrine-widgets/vitrine' },
			],
			editLink: {
				baseUrl: 'https://github.com/vitrine-widgets/vitrine-widgets.github.io/edit/main/',
			},
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Getting started',
					translations: { it: 'Per iniziare' },
					items: [
						{ slug: 'docs/introduction' },
						{ slug: 'docs/roadmap' },
					],
				},
				{
					label: 'Concepts',
					translations: { it: 'Concetti' },
					items: [{ slug: 'docs/architecture' }],
				},
			],
		}),
	],
});
