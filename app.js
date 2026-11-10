
const navLinks = document.querySelectorAll('[data-view]');
const views = document.querySelectorAll('.view');
const pageName = document.getElementById('pageName');
const sidebar = document.querySelector('.sidebar');

function showView(name) {
  views.forEach(view => {
    view.classList.toggle('active-view', view.id === name);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === name);
  });

  pageName.textContent = (name || 'home').replace('-', ' ').toUpperCase();
  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    const target = link.dataset.view;
    if (!target) return;

    event.preventDefault();
    showView(target);

    if (link.dataset.game) {
      document.getElementById('gameFilter').value = link.dataset.game;
      filterServers();
    }
  });
});

document.getElementById('mobileMenu').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Server search and filters
function filterServers() {
  const term = document.getElementById('serverSearch').value.toLowerCase().trim();
  const game = document.getElementById('gameFilter').value;
  const status = document.getElementById('statusFilter').value.toLowerCase();
  const country = document.getElementById('countryFilter').value.toLowerCase();

  const aliases = {
    'Counter-Strike 1.6': ['cs 1.6', '1.6'],
    'Condition Zero': ['condition zero'],
    'Counter-Strike: Source': ['cs: source', 'counter-strike: source'],
    'Counter-Strike 2': ['cs2', 'counter-strike 2']
  };

  let visible = 0;

  document.querySelectorAll('.server-row').forEach(row => {
    const haystack = (row.innerText + ' ' + row.dataset.search).toLowerCase();

    const gameMatch = !game ||
      aliases[game].some(alias => haystack.includes(alias));

    const countryMatch = !country || haystack.includes(country);

    // Demo entries are not live Online/Offline data.
    const statusMatch = !status;

    const show = haystack.includes(term) &&
      gameMatch && countryMatch && statusMatch;

    row.style.display = show ? 'grid' : 'none';

    if (show) visible++;
  });

  document.getElementById('resultCount').textContent =
    `${visible} demo entries · not live data`;
}

['serverSearch', 'gameFilter', 'statusFilter', 'countryFilter'].forEach(id => {
  const element = document.getElementById(id);
  element.addEventListener('input', filterServers);
  element.addEventListener('change', filterServers);
});

document.getElementById('searchBtn').addEventListener('click', filterServers);

// Server details window
const detailStyle = document.createElement('style');
detailStyle.textContent = `
.server-row { cursor:pointer; transition:background .2s; }
.server-row:hover { background:rgba(120,255,70,.07); }
.server-modal {
  position:fixed; inset:0; z-index:9999;
  background:rgba(0,0,0,.82); display:none;
  align-items:center; justify-content:center;
  padding:20px;
}
.server-modal.open { display:flex; }
.server-modal-box {
  width:100%; max-width:520px;
  background:#101619; border:1px solid #34443b;
  border-radius:16px; padding:25px;
  color:#edf4f3; position:relative;
  box-shadow:0 20px 70px #000;
}
.server-modal-box h2 { margin:8px 0 5px; font-size:27px; }
.server-modal-sub { color:#9aa9a3; margin-bottom:22px; }
.server-detail-grid {
  display:grid; grid-template-columns:1fr 1fr;
  gap:10px; margin:18px 0;
}
.server-detail-item {
  background:#18211e; border:1px solid #293a31;
  border-radius:9px; padding:13px;
}
.server-detail-item small {
  display:block; color:#8b9c92; margin-bottom:7px;
}
.server-detail-item b { overflow-wrap:anywhere; }
.server-modal-actions {
  display:flex; flex-wrap:wrap; gap:10px; margin-top:20px;
}
.server-modal-actions button {
  border:1px solid #405349; border-radius:8px;
  padding:11px 15px; cursor:pointer;
  background:#1a2620; color:#edf4f3;
}
.server-modal-actions button.primary {
  background:#8cff55; color:#071007; border-color:#8cff55;
  font-weight:800;
}
.server-modal-close {
  position:absolute; right:17px; top:13px;
  background:none; border:0; color:#fff;
  font-size:25px; cursor:pointer;
}
.server-modal-note {
  color:#9aa9a3; font-size:12px; margin-top:17px;
}
@media(max-width:480px) {
  .server-detail-grid { grid-template-columns:1fr; }
  .server-modal-box { padding:20px; }
}
`;
document.head.appendChild(detailStyle);

const modal = document.createElement('div');
modal.className = 'server-modal';
modal.innerHTML = `
  <div class="server-modal-box">
    <button class="server-modal-close" aria-label="Close">×</button>
    <div class="eyebrow">SERVER DETAILS</div>
    <h2 id="detailName">Server name</h2>
    <div class="server-modal-sub" id="detailAddress"></div>
    <div class="server-detail-grid">
      <div class="server-detail-item"><small>GAME</small><b id="detailGame"></b></div>
      <div class="server-detail-item"><small>MAP</small><b id="detailMap"></b></div>
      <div class="server-detail-item"><small>PLAYERS</small><b id="detailPlayers"></b></div>
      <div class="server-detail-item"><small>COUNTRY</small><b id="detailCountry"></b></div>
      <div class="server-detail-item"><small>STATUS</small><b>DEMO — NOT VERIFIED</b></div>
      <div class="server-detail-item"><small>NETWORK</small><b>Preview entry</b></div>
    </div>
    <div class="server-modal-actions">
      <button class="primary" id="copyServerIP">COPY IP</button>
      <button id="favoriteServer">☆ ADD TO FAVORITES</button>
    </div>
    <div class="server-modal-note">
      Sample information for the design preview. Live status and player counts
      will be connected later.
    </div>
  </div>
`;
document.body.appendChild(modal);

let selectedIP = '';
let selectedFavoriteKey = '';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('servernova-favorites') || '[]');
  } catch {
    return [];
  }
}

function updateFavoriteButton() {
  const favorites = getFavorites();
  const saved = favorites.includes(selectedFavoriteKey);
  const button = document.getElementById('favoriteServer');

  button.textContent = saved ? '★ SAVED FAVORITE' : '☆ ADD TO FAVORITES';
}

function openServerDetails(row) {
  const name = row.querySelector('b')?.textContent.trim() || 'Unknown server';
  const addressText = row.querySelector('small')?.textContent.trim() || 'IP unavailable';
  const addressMatch = addressText.match(/\d{1,3}(?:\.\d{1,3}){3}:\d+/);

  selectedIP = addressMatch ? addressMatch[0] : '';
  selectedFavoriteKey = selectedIP || name;

  const gameInfo = row.children[1]?.innerText.split('\n') || [];
  const players = row.children[2]?.innerText.trim() || 'Not available';
  const country = addressText.split('·').pop()?.trim() || 'Unknown';

  document.getElementById('detailName').textContent = name;
  document.getElementById('detailAddress').textContent = addressText;
  document.getElementById('detailGame').textContent = gameInfo[0] || 'Unknown';
  document.getElementById('detailMap').textContent = gameInfo[1] || 'Unknown';
  document.getElementById('detailPlayers').textContent = players;
  document.getElementById('detailCountry').textContent = country;

  updateFavoriteButton();
  modal.classList.add('open');
}

document.getElementById('serverRows').addEventListener('click', event => {
  const row = event.target.closest('.server-row');
  if (row) openServerDetails(row);
});

modal.querySelector('.server-modal-close').addEventListener('click', () => {
  modal.classList.remove('open');
});

modal.addEventListener('click', event => {
  if (event.target === modal) modal.classList.remove('open');
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') modal.classList.remove('open');
});

document.getElementById('copyServerIP').addEventListener('click', async () => {
  if (!selectedIP) {
    alert('No valid IP address is available for this demo entry.');
    return;
  }

  try {
    await navigator.clipboard.writeText(selectedIP);
    document.getElementById('copyServerIP').textContent = 'COPIED!';
  } catch {
    alert('Copy is not available in this browser.');
  }
});

document.getElementById('favoriteServer').addEventListener('click', () => {
  const favorites = getFavorites();
  const index = favorites.indexOf(selectedFavoriteKey);

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(selectedFavoriteKey);
  }

  localStorage.setItem('servernova-favorites', JSON.stringify(favorites));
  updateFavoriteButton();
});

// Community preview tabs
document.querySelectorAll('.chat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chat-tab').forEach(item => {
      item.classList.remove('active');
    });

    tab.classList.add('active');
  });
});

filterServers();

