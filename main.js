const grid = document.getElementById('grid');
const search = document.getElementById('search');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close');
const fullscreenBtn = document.getElementById('fullscreen');
const frame = document.getElementById('frame');
const meta = document.getElementById('meta');
const tagbar = document.getElementById('tagbar');

let games = [];
let activeTags = new Set();

async function loadGames() {
  try {
    const res = await fetch('refer.json');
    games = await res.json();
    renderGrid();
    renderTags();
  } catch (err) {
    console.error('Failed to load refer.json:', err);
  }
}

function renderGrid() {
  const query = search.value.trim().toLowerCase();
  const filtered = games.filter(game => {
    const matchesQuery =
      !query ||
      game.title.toLowerCase().includes(query) ||
      game.tags.some(tag => tag.toLowerCase().includes(query));
    const matchesTags =
      activeTags.size === 0 ||
      [...activeTags].every(tag => game.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
    return matchesQuery && matchesTags;
  });

  grid.innerHTML = filtered.map(gameCardHTML).join('');
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openGame(card.dataset.id));
  });
}

function gameCardHTML(game) {
  const tagsHTML = game.tags.map(tag => `<span class="chip">${tag}</span>`).join('');
  return `
    <article class="card" data-id="${game.id}" tabindex="0">
      <img src="${game.thumb}" alt="${game.title}" loading="lazy" />
      <div class="info">
        <div class="title">${game.title}</div>
        <div class="tags">${tagsHTML}</div>
      </div>
    </article>
  `;
}

function renderTags() {
  const tagCounts = new Map();
  games.forEach(game => {
    game.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  tagbar.innerHTML = topTags.map(([tag]) =>
    `<button class="tag ${activeTags.has(tag) ? 'active' : ''}" data-tag="${tag}">${tag}</button>`
  ).join('');

  tagbar.querySelectorAll('.tag').forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }
      renderTags();
      renderGrid();
    });
  });
}

function openGame(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;
  frame.src = game.iframeSrc;
  meta.textContent = game.description || '';
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  frame.src = 'about:blank';
  overlay.classList.add('hidden');
}

function enterFullscreen() {
  if (frame.requestFullscreen) {
    frame.requestFullscreen();
  } else if (frame.webkitRequestFullscreen) {
    frame.webkitRequestFullscreen();
  } else if (frame.msRequestFullscreen) {
    frame.msRequestFullscreen();
  }
}

closeBtn.addEventListener('click', closeOverlay);
fullscreenBtn.addEventListener('click', enterFullscreen);
search.addEventListener('input', renderGrid);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
    closeOverlay();
  }
});

loadGames();
