// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://vitrine-org.github.io',
	integrations: [
		starlight({
			title: 'Vitrine',
			description: 'Lightweight, interactive desktop widgets for Windows, drawn beneath your icons.',
			logo: { src: './src/assets/vitrine.svg' },
			favicon: '/favicon.svg',
			head: [
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				{ tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#f4f4f3', media: '(prefers-color-scheme: light)' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#161616', media: '(prefers-color-scheme: dark)' } },
			],
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				it: { label: 'Italiano', lang: 'it' },
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/vitrine-org/vitrine' },
			],
			editLink: {
				baseUrl: 'https://github.com/vitrine-org/vitrine-org.github.io/edit/main/',
			},
			components: {
				Header: './src/components/DocsHeader.astro',
			},
			customCss: [
				'@fontsource-variable/schibsted-grotesk',
				'./src/styles/tokens.css',
				'./src/styles/custom.css',
			],
			expressiveCode: {
				styleOverrides: {
					borderRadius: '0.75rem',
					borderColor: 'var(--line)',
					frames: { frameBoxShadowCssValue: 'none' },
				},
			},
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
