import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const root = document.documentElement;
const motion = root.classList.contains('anim');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* Live clocks, date and meters. */
const pad = (n: number) => String(n).padStart(2, '0');
const dateEl = $('[data-date]');
const trayTime = $('[data-tray-time]');
const trayDate = $('[data-tray-date]');
const deskLocale = $('[data-locale]')?.dataset.locale;
const hmPart = $('[data-part="hm"]');
const secPart = $('[data-part="s"]');
let lastHm = '';

function flash(el: HTMLElement | null) {
	if (!el || !motion) return;
	el.classList.remove('flash');
	void el.offsetWidth;
	el.classList.add('flash');
}

const colon = '<span class="colon">:</span>';
const fmt = (...parts: string[]) => parts.join(colon);

function tick() {
	const d = new Date();
	const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
	const s = pad(d.getSeconds());
	const hh = pad(d.getHours());
	const mm = pad(d.getMinutes());
	for (const el of $$('[data-clock="hm"]')) el.textContent = hm;
	for (const el of $$('[data-clock="hms"]')) el.innerHTML = fmt(hh, mm, s);
	if (hmPart && secPart) {
		secPart.innerHTML = colon + s;
		flash(secPart);
		if (hm !== lastHm) {
			hmPart.innerHTML = fmt(hh, mm);
			if (lastHm) flash(hmPart);
		}
	}
	if (hm !== lastHm) {
		if (trayTime) trayTime.textContent = d.toLocaleTimeString(deskLocale, { hour: '2-digit', minute: '2-digit' });
		if (trayDate) trayDate.textContent = d.toLocaleDateString(deskLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });
	}
	if (dateEl && hm !== lastHm) {
		dateEl.textContent = d.toLocaleDateString(dateEl.dataset.lang, { weekday: 'long', day: 'numeric', month: 'long' });
	}
	lastHm = hm;
}

tick();
setTimeout(() => {
	tick();
	setInterval(tick, 1000);
}, 1000 - (Date.now() % 1000));

if (motion) {
	setInterval(() => {
		for (const m of $$('[data-meter]')) {
			const v = parseFloat(m.style.getPropertyValue('--v')) || 0.4;
			const next = Math.min(0.85, Math.max(0.15, v + (Math.random() - 0.5) * 0.16));
			m.style.setProperty('--v', next.toFixed(3));
		}
	}, 2200);
}

/* Light that follows the cursor on glass panels. */
if (finePointer) {
	let current: HTMLElement | null = null;
	document.addEventListener(
		'pointermove',
		(e) => {
			const el = (e.target as Element).closest<HTMLElement>('.glass, .acrylic');
			if (el !== current) {
				current?.style.setProperty('--glow', '0');
				current = el;
			}
			if (!el) return;
			const r = el.getBoundingClientRect();
			el.style.setProperty('--mx', `${e.clientX - r.left}px`);
			el.style.setProperty('--my', `${e.clientY - r.top}px`);
			el.style.setProperty('--glow', '1');
		},
		{ passive: true },
	);
	document.addEventListener('pointerleave', () => current?.style.setProperty('--glow', '0'));
}

if (motion) {
	gsap.registerPlugin(ScrollTrigger);

	/* Page load: text, then the desktop rises and its widgets settle in. */
	const intro = $$('[data-intro]');
	const stage = $('[data-intro-stage]');
	const widgets = $$('[data-widget]');
	const icons = $$('.dicon');
	gsap.set(intro, { autoAlpha: 0, y: 18 });
	gsap.set(stage, { autoAlpha: 0, y: 70, rotationX: 16, transformPerspective: 1600, transformOrigin: '50% 100%' });
	gsap.set(widgets, { autoAlpha: 0, scale: 0.92, y: 12 });
	gsap.set(icons, { autoAlpha: 0 });
	root.classList.add('ready');

	gsap
		.timeline({ defaults: { ease: 'power3.out' } })
		.to(intro, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 })
		.to(stage, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.3 }, 0.3)
		.to(icons, { autoAlpha: 1, duration: 0.5, stagger: 0.05 }, 0.9)
		.to(widgets, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)' }, 1.0);

	/* Mouse: the desktop tilts and its layers separate by depth. */
	if (finePointer) {
		const desk = $('[data-tilt]');
		const rx = gsap.quickTo(desk, 'rotationX', { duration: 0.9, ease: 'power3' });
		const ry = gsap.quickTo(desk, 'rotationY', { duration: 0.9, ease: 'power3' });
		const layers = $$('[data-depth]').map((el) => ({
			d: parseFloat(el.dataset.depth || '1'),
			x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }),
			y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }),
		}));
		window.addEventListener(
			'pointermove',
			(e) => {
				const nx = (e.clientX / innerWidth - 0.5) * 2;
				const ny = (e.clientY / innerHeight - 0.5) * 2;
				rx(-ny * 4);
				ry(nx * 6);
				for (const l of layers) {
					l.x(-nx * l.d * 9);
					l.y(-ny * l.d * 6);
				}
			},
			{ passive: true },
		);
	}

	/* Scroll: text of each feature. */
	for (const el of $$('[data-reveal]')) {
		gsap.from(el.children, {
			autoAlpha: 0,
			y: 22,
			duration: 0.8,
			stagger: 0.08,
			ease: 'power3.out',
			scrollTrigger: { trigger: el, start: 'top 82%' },
		});
	}

	/* Layers pull apart as you scroll. */
	const stack = $('[data-stack]');
	if (stack) {
		const tl = gsap.timeline({
			scrollTrigger: { trigger: stack, start: 'top 85%', end: 'center 45%', scrub: 0.6 },
		});
		tl.fromTo('.pw-0', { yPercent: 0 }, { yPercent: 22, ease: 'none' }, 0)
			.fromTo('.pw-2', { yPercent: 0 }, { yPercent: -22, ease: 'none' }, 0)
			.fromTo('.plane-label', { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', stagger: 0.05 }, 0.3);
	}

	/* Widgets snap into their cells. */
	const board = $('[data-board]');
	if (board) {
		const offsets = [
			{ x: -50, y: -36, rotation: -6 },
			{ x: 60, y: -44, rotation: 4 },
			{ x: 36, y: 50, rotation: 3 },
		];
		$$('[data-tile]', board).forEach((tile, i) => {
			gsap.from(tile, {
				...offsets[i],
				autoAlpha: 0,
				duration: 0.9,
				delay: i * 0.12,
				ease: 'back.out(1.5)',
				scrollTrigger: { trigger: board, start: 'top 75%' },
			});
		});
		gsap.from('.handle', {
			scale: 0,
			duration: 0.4,
			delay: 0.7,
			ease: 'back.out(3)',
			scrollTrigger: { trigger: board, start: 'top 75%' },
		});
	}

	/* Code appears line by line, then the widget it renders. */
	const code = $('[data-code]');
	if (code) {
		gsap
			.timeline({ scrollTrigger: { trigger: code, start: 'top 78%' } })
			.from($$('.ln', code), { autoAlpha: 0, x: -10, duration: 0.5, stagger: 0.06, ease: 'power2.out' })
			.from($('.mini', code), { autoAlpha: 0, y: 20, scale: 0.9, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.2');
	}

	document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
