// Store page: fetches the catalogue, renders pack cards, search, tag filters and the pack dialog.
// The catalogue lists third-party packs, so every string goes through textContent and every URL is checked.

const STORE = 'https://vitrine-org.github.io/store/';
const INDEX = `${STORE}index.json`;

interface Widget {
	id: string;
	name: string;
	description?: string;
	size: { default: [number, number]; min?: [number, number]; max?: [number, number] };
	interactive?: boolean;
	permissions?: string[];
	preview?: string;
}
interface Pack {
	id: string;
	name: string;
	version: string;
	author?: string;
	description?: string;
	homepage?: string;
	repo: string;
	license?: string;
	tags?: string[];
	official?: boolean;
	minEngine?: string;
	published?: string;
	download: string;
	size?: number;
	sha256?: string;
	widgets: Widget[];
	locales?: Record<string, { name?: string; description?: string; widgets?: Record<string, { name?: string; description?: string }> }>;
}

const T = JSON.parse(document.getElementById('store-text')!.textContent!);
const $ = <E extends Element = HTMLElement>(s: string) => document.querySelector<E>(s)!;
const grid = $('[data-packs]');
const state = $('[data-state]');
const countEl = $('[data-count]');
const tagsEl = $('[data-tags]');
const search = $<HTMLInputElement>('[data-search]');
const dialog = $<HTMLDialogElement>('[data-dialog]');
const detail = $('[data-detail]');
const updated = $('[data-updated]');

let packs: Pack[] = [];
let tag = '';
let opener: HTMLElement | null = null;

/* ── helpers ─────────────────────────────────────────────────────────── */

function el<K extends keyof HTMLElementTagNameMap>(tagName: K, cls?: string, text?: string) {
	const e = document.createElement(tagName);
	if (cls) e.className = cls;
	if (text != null) e.textContent = text;
	return e;
}
const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
const plural = (pair: [string, string], n: number) => (n === 1 ? pair[0] : fill(pair[1], { n }));
const dips = (n: number) => n * 64 + (n - 1) * 8;
const safeUrl = (u: unknown, prefix: string) => (typeof u === 'string' && u.startsWith(prefix) ? u : null);
const previewUrl = (p?: string) => (p && /^previews\/[\w.-]+\/[\w.-]+\.png$/.test(p) ? STORE + p : null);

/** The localised field, matched loosely by language (it, it-IT…), falling back to English. */
function loc(pack: Pack) {
	const tables = pack.locales ?? {};
	const key = Object.keys(tables).find((k) => k.toLowerCase().split('-')[0] === T.lang);
	return key ? tables[key] : undefined;
}
const packName = (p: Pack) => loc(p)?.name || p.name;
const packDesc = (p: Pack) => loc(p)?.description || p.description || '';
const widgetName = (p: Pack, w: Widget) => loc(p)?.widgets?.[w.id]?.name || w.name;
const widgetDesc = (p: Pack, w: Widget) => loc(p)?.widgets?.[w.id]?.description || w.description || '';

function permLabel(perm: string) {
	if (perm.startsWith('net:')) return fill(T.perm.net, { host: perm.slice(4) });
	return T.perm[perm] ?? perm;
}
function packPerms(p: Pack) {
	return [...new Set(p.widgets.flatMap((w) => w.permissions ?? []))];
}
function bytes(n?: number) {
	if (!n) return '—';
	const f = new Intl.NumberFormat(T.locale, { maximumFractionDigits: 1 });
	return n >= 1048576 ? `${f.format(n / 1048576)} MB` : `${f.format(Math.max(1, Math.round(n / 1024)))} KB`;
}
function date(iso?: string) {
	if (!iso) return '—';
	const d = new Date(iso);
	return isNaN(+d) ? '—' : new Intl.DateTimeFormat(T.locale, { dateStyle: 'long' }).format(d);
}

/* ── mosaic: shelf-pack widget previews into a 720 × 450 DIP desktop ──── */

function layout(items: { pw: number; ph: number }[], W: number, H: number) {
	const PAD = W * 0.05, GAP = 12;
	const rows: { items: number[]; w: number; h: number }[] = [];
	let used = 0;
	items.forEach((it, i) => {
		const row = rows[rows.length - 1];
		if (row && row.w + GAP + it.pw <= W - 2 * PAD) {
			const grow = Math.max(0, it.ph - row.h);
			if (used + grow > H - 2 * PAD) return;
			row.items.push(i);
			row.w += GAP + it.pw;
			row.h += grow;
			used += grow;
		} else if (it.pw <= W - 2 * PAD && used + (rows.length ? GAP : 0) + it.ph <= H - 2 * PAD) {
			used += (rows.length ? GAP : 0) + it.ph;
			rows.push({ items: [i], w: it.pw, h: it.ph });
		}
	});
	return { rows, used, count: rows.reduce((n, r) => n + r.items.length, 0), GAP };
}

/** Widget previews on a soft desktop: the smallest zoom that shows up to five widgets. */
function mosaic(p: Pack, eager = false) {
	const box = el('div', 'mosaic');
	box.setAttribute('aria-hidden', 'true');
	const items = p.widgets
		.filter((w) => previewUrl(w.preview) && w.size?.default)
		.slice(0, 5)
		.map((w) => ({ w, pw: dips(w.size.default[0]), ph: dips(w.size.default[1]) }));
	let W = 720, H = 450, L = layout(items, W, H);
	for (const z of [1.3, 1.6]) {
		if (L.count === items.length) break;
		const L2 = layout(items, 720 * z, 450 * z);
		if (L2.count > L.count) (W = 720 * z), (H = 450 * z), (L = L2);
	}
	let y = (H - L.used) / 2;
	for (const row of L.rows) {
		let x = (W - row.w) / 2;
		for (const i of row.items) {
			const it = items[i];
			const img = el('img');
			img.src = previewUrl(it.w.preview)!;
			img.alt = '';
			img.decoding = 'async';
			if (!eager) img.loading = 'lazy';
			img.width = it.pw * 2;
			img.height = it.ph * 2;
			img.style.left = `${(x / W) * 100}%`;
			img.style.top = `${((y + (row.h - it.ph) / 2) / H) * 100}%`;
			img.style.width = `${(it.pw / W) * 100}%`;
			img.onerror = () => img.remove();
			box.append(img);
			x += it.pw + L.GAP;
		}
		y += row.h + L.GAP;
	}
	return box;
}

/* ── cards ───────────────────────────────────────────────────────────── */

function badge() {
	const b = el('span', 'badge', T.official);
	return b;
}

function card(p: Pack, i: number) {
	const a = el('a', 'pack');
	a.href = `#${p.id}`;
	a.dataset.id = p.id;
	a.setAttribute('aria-label', fill(T.open, { name: packName(p) }));
	a.append(mosaic(p, i < 2));
	const body = el('div', 'pack-body');
	const head = el('div', 'pack-head');
	head.append(el('h2', '', packName(p)));
	if (p.official) head.append(badge());
	body.append(head);
	if (p.author) body.append(el('p', 'pack-author', `${T.by} ${p.author}`));
	body.append(el('p', 'pack-desc', packDesc(p)));
	body.append(el('p', 'pack-meta', `${plural(T.widgets, p.widgets.length)} · v${p.version}`));
	a.append(body);
	return a;
}

function matches(p: Pack, q: string) {
	if (tag && !(p.tags ?? []).includes(tag)) return false;
	if (!q) return true;
	const hay = [packName(p), p.name, packDesc(p), p.author, ...(p.tags ?? []), ...p.widgets.flatMap((w) => [widgetName(p, w), widgetDesc(p, w)])]
		.join(' ')
		.toLowerCase();
	return q.split(/\s+/).every((word) => hay.includes(word));
}

function render() {
	const q = search.value.trim().toLowerCase();
	const shown = packs.filter((p) => matches(p, q));
	grid.replaceChildren(...shown.map(card));
	grid.setAttribute('aria-busy', 'false');
	countEl.textContent = plural(T.count, shown.length);
	if (!shown.length && packs.length) {
		const box = el('div', 'empty');
		box.append(el('p', '', T.none));
		const b = el('button', 'button glass', T.all);
		b.type = 'button';
		b.onclick = () => {
			search.value = '';
			setTag('');
		};
		box.append(b);
		state.replaceChildren(box);
		state.hidden = false;
	} else state.hidden = true;
}

function setTag(next: string) {
	tag = next;
	for (const b of tagsEl.querySelectorAll('button')) b.setAttribute('aria-pressed', String((b.dataset.tag ?? '') === tag));
	render();
}

function buildTags() {
	const counts = new Map<string, number>();
	for (const p of packs) for (const tg of p.tags ?? []) counts.set(tg, (counts.get(tg) ?? 0) + 1);
	const list = ['', ...[...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b))];
	tagsEl.replaceChildren(
		...list.map((tg) => {
			const b = el('button', 'tag', tg || T.all);
			b.type = 'button';
			b.dataset.tag = tg;
			b.setAttribute('aria-pressed', String(tg === tag));
			b.onclick = () => setTag(tg === tag ? '' : tg);
			return b;
		}),
	);
}

/* ── detail dialog ───────────────────────────────────────────────────── */

function metaRow(dl: HTMLElement, label: string, value: string | Node) {
	const row = el('div');
	row.append(el('dt', '', label));
	const dd = el('dd');
	dd.append(value);
	row.append(dd);
	dl.append(row);
}

function openPack(id: string) {
	const p = packs.find((x) => x.id === id);
	if (!p) return;
	opener = document.querySelector<HTMLElement>(`.pack[data-id="${CSS.escape(id)}"]`) ?? (document.activeElement as HTMLElement);
	const frag = document.createDocumentFragment();

	const close = el('button', 'dialog-close');
	close.type = 'button';
	close.setAttribute('aria-label', T.close);
	close.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
	close.onclick = () => dialog.close();
	frag.append(close);

	frag.append(mosaic(p, true));
	const head = el('header', 'dialog-head');
	const title = el('div', 'pack-head');
	const h = el('h2', '', packName(p));
	h.id = 'pack-title';
	title.append(h);
	if (p.official) title.append(badge());
	head.append(title);
	if (p.author) head.append(el('p', 'pack-author', `${T.by} ${p.author}`));
	head.append(el('p', 'dialog-desc', packDesc(p)));

	const dl_ = safeUrl(p.download, 'https://github.com/');
	const actions = el('div', 'dialog-actions');
	if (dl_) {
		const a = el('a', 'button primary');
		a.href = dl_;
		a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" class="icon"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
		a.append(T.download);
		actions.append(a);
	}
	actions.append(el('p', 'install-hint', T.install));
	head.append(actions);
	frag.append(head);

	const meta = el('dl', 'dialog-meta');
	metaRow(meta, T.version, p.version);
	metaRow(meta, T.size, bytes(p.size));
	metaRow(meta, T.licence, p.license || '—');
	metaRow(meta, T.published, date(p.published));
	if (p.minEngine) metaRow(meta, T.needs, `≥ ${p.minEngine}`);
	const repo = /^[\w.-]+\/[\w.-]+$/.test(p.repo) ? `https://github.com/${p.repo}` : null;
	if (repo) {
		const a = el('a', '', p.repo);
		a.href = repo;
		metaRow(meta, T.repo, a);
	}
	frag.append(meta);

	const perms = packPerms(p);
	const ps = el('section', 'dialog-perms');
	ps.append(el('h3', '', T.permissions));
	if (perms.length) {
		const ul = el('ul', 'perm-list');
		for (const x of perms) {
			const li = el('li', '', permLabel(x));
			li.title = x;
			ul.append(li);
		}
		ps.append(ul);
	} else ps.append(el('p', 'muted', T.noPermissions));
	frag.append(ps);

	const ws = el('section', 'dialog-widgets');
	ws.append(el('h3', '', `${T.widgetsHeading} · ${p.widgets.length}`));
	const list = el('ul', 'widget-list');
	for (const w of p.widgets) {
		const li = el('li', 'widget');
		const fig = el('div', 'widget-preview');
		const src = previewUrl(w.preview);
		if (src) {
			const img = el('img');
			img.src = src;
			img.loading = 'lazy';
			img.decoding = 'async';
			img.alt = fill(T.preview, { name: widgetName(p, w) });
			const [cw, ch] = w.size.default;
			img.width = dips(cw) * 2;
			img.height = dips(ch) * 2;
			img.style.aspectRatio = `${dips(cw)} / ${dips(ch)}`;
			img.style.width = `${Math.min(100, (dips(cw) / 352) * 100)}%`;
			fig.append(img);
		}
		li.append(fig);
		const txt = el('div', 'widget-text');
		txt.append(el('h4', '', widgetName(p, w)));
		const d = widgetDesc(p, w);
		if (d) txt.append(el('p', '', d));
		const [cw, ch] = w.size.default;
		const facts = [fill(T.cells, { w: cw, h: ch })];
		if (w.interactive) facts.push(T.interactive);
		txt.append(el('p', 'widget-facts', facts.join(' · ')));
		if (w.permissions?.length) {
			const ul = el('ul', 'perm-list small');
			for (const x of w.permissions) {
				const pl = el('li', '', permLabel(x));
				pl.title = x;
				ul.append(pl);
			}
			txt.append(ul);
		}
		li.append(txt);
		list.append(li);
	}
	ws.append(list);
	frag.append(ws);

	detail.replaceChildren(frag);
	document.title = `${packName(p)} · ${document.title.split(' · ').pop()}`;
	if (!dialog.open) dialog.showModal();
	detail.scrollTop = 0;
	close.focus();
}

const baseTitle = document.title;
dialog.addEventListener('close', () => {
	document.title = baseTitle;
	if (location.hash) history.replaceState(null, '', location.pathname + location.search);
	opener?.focus();
});
// A click on the backdrop (outside the inner panel) closes the dialog.
dialog.addEventListener('click', (e) => {
	if (e.target === dialog) dialog.close();
});

function fromHash() {
	const id = decodeURIComponent(location.hash.slice(1));
	if (id && packs.some((p) => p.id === id)) openPack(id);
	else if (dialog.open) dialog.close();
}
window.addEventListener('hashchange', fromHash);

/* ── load ────────────────────────────────────────────────────────────── */

function showError() {
	grid.replaceChildren();
	grid.setAttribute('aria-busy', 'false');
	const box = el('div', 'error');
	box.setAttribute('role', 'alert');
	box.append(el('p', 'error-title', T.error));
	if (!navigator.onLine) box.append(el('p', 'muted', T.offline));
	const b = el('button', 'button glass', T.retry);
	b.type = 'button';
	b.onclick = () => load();
	box.append(b);
	state.replaceChildren(box);
	state.hidden = false;
	countEl.textContent = '';
}

async function load() {
	state.hidden = true;
	try {
		const res = await fetch(INDEX, { cache: 'no-cache' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		if (!Array.isArray(data?.packs)) throw new Error('bad catalogue');
		packs = (data.packs as Pack[])
			.filter((p) => p && typeof p.id === 'string' && Array.isArray(p.widgets))
			.sort((a, b) => Number(!!b.official) - Number(!!a.official) || (a.id === 'dev.vitrine.essentials' ? -1 : b.id === 'dev.vitrine.essentials' ? 1 : 0) || a.name.localeCompare(b.name));
		buildTags();
		render();
		if (data.generated) updated.textContent = `${T.updated}: ${date(data.generated)}`;
		fromHash();
	} catch {
		showError();
	}
}

let typing = 0;
search.addEventListener('input', () => {
	clearTimeout(typing);
	typing = window.setTimeout(render, 80);
});
window.addEventListener('online', () => {
	if (!packs.length) load();
});

load();
