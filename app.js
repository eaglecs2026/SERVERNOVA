
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

function filterServers() {
  const term = document.getElementById('serverSearch').value.toLowerCase().trim();
  const game = document.getElementById('gameFilter').value;
  const status = document.getElementById('statusFilter').value.toLowerCase();
  const country = document.getElementById('countryFilter').value.toLowerCase();

  const gameAliases = {
    'Counter-Strike 1.6': ['cs 1.6', '1.6'],
    'Condition Zero': ['condition zero'],
    'Counter-Strike: Source': ['cs: source', 'counter-strike: source'],
    'Counter-Strike 2': ['cs2', 'counter-strike 2']
  };

  let visible = 0;

  document.querySelectorAll('.server-row').forEach(row => {
    const haystack = (
      row.innerText + ' ' + (row.dataset.search || '')
    ).toLowerCase();

    const gameMatch = !game ||
      gameAliases[game].some(alias => haystack.includes(alias));

    const countryMatch = !country || haystack.includes(country);

    // لا نعتبرش بيانات DEMO حالة اتصال حقيقية
    const rowStatus = (row.dataset.status || '').toLowerCase();
    const statusMatch = !status || rowStatus === status;

    const searchMatch = haystack.includes(term);
    const show = searchMatch && gameMatch && countryMatch && statusMatch;

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

document.querySelectorAll('.chat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chat-tab').forEach(item => {
      item.classList.remove('active');
    });

    tab.classList.add('active');
  });
});

filterServers();
