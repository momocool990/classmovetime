const grid = document.getElementById('grid');
const search = document.getElementById('search');
const overlay = document.getElementById('overlay');
const player = document.getElementById('player');
const frame = document.getElementById('frame');
const meta = document.getElementById('meta');
const playerTitle = document.getElementById('playerTitle');
const closeBtn = document.getElementById('close');
const fullscreenBtn = document.getElementById('fullscreen');
const tagbar = document.getElementById('tagbar');

let games = [];
let activeTags = new Set();

async function loadGames() {
  const res = await fetch('refer.json');
  games = await res.json();
  renderGrid();
  renderTags();
}
loadGames();

function renderGrid() {
  const q = search.value.trim().toLowerCase();
  const filtered = games.filter(g => {
    const matchesQuery =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q));
    const matchesTags =
      activeTags.size === 0 ||
      [...activeTags].every(t => g.tags.map(x => x.toLowerCase()).includes(t.toLowerCase()));
    return matchesQuery && matchesTags;
  });

  grid.innerHTML = filtered.map(cardHTML).join('');
  grid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => openGame(el.dataset.id));
  });
}

function cardHTML(g) {
  const tags = g.tags.map(t => `<span class="chip">${t}</span>`).join('');
  const badge = g.badge ? `<span class="badge">${g.badge}</span>` : '';
  return `
    <article class="card" data-id="${g.id}" tabindex="0">
      <img src="${g.thumb}" alt="${g.title}" loading="lazy" />
      <div class="body">
        <div class="title-row">
          <div class="title">${g.title}</div>
          ${badge}
        </div>
        <div class="desc">${g.description || ''}</div>
        <div class="tags">${tags}</div>
      </div>
    </article>
  `;
}

function renderTags() {
  const tagCounts = new Map();
  games.forEach(g => g.tags.forEach(t => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
  const sorted = [...tagCounts.entries()].sort((a,b) => b[1]-a[1]).slice(0, 10);
  tagbar.innerHTML = sorted.map(([t]) =>
    `<button class="tag ${activeTags.has(t)?'active':''}" data-tag="${t}">${t}</button>`
  ).join('');
  tagbar.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tag;
      if (activeTags.has(t)) activeTags.delete(t); else activeTags.add(t);
      renderTags(); renderGrid();
    });
  });
}

function openGame(id) {
  const g = games.find(x => x.id === id);
  if (!g) return;
  playerTitle.textContent = g.title;
  meta.textContent = g.description || '';
  frame.src = g.iframeSrc;
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  frame.src = 'about:blank';
  overlay.classList.add('hidden');
}

function enterFullscreen() {
  if (player.request
