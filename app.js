const navLinks = document.querySelectorAll('[data-view]');
const views = document.querySelectorAll('.view');
const pageName = document.getElementById('pageName');
const sidebar = document.querySelector('.sidebar');

function showView(name) {
  views.forEach(view => view.classList.toggle('active-view', view.id === name));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === name));
  pageName.textContent = (name || 'home').replace('-', ' ').toUpperCase();
  sidebar.classList.remove('open');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
navLinks.forEach(link => link.addEventListener('click', event => {
  const target = link.dataset.view;
  if (target) {
    event.preventDefault();
    showView(target);
    if (link.dataset.game) {
      document.getElementById('gameFilter').value = link.dataset.game;
      filterServers();
    }
  }
}));
document.getElementById('mobileMenu').addEventListener('click', () => sidebar.classList.toggle('open'));

function filterServers() {
  const term = document.getElementById('serverSearch').value.toLowerCase().trim();
  const game = document.getElementById('gameFilter').value.toLowerCase();
  const status = document.getElementById('statusFilter').value.toLowerCase();
  const country = document.getElementById('countryFilter').value.toLowerCase();
  let visible = 0;
  document.querySelectorAll('.server-row').forEach(row => {
    const haystack = (row.innerText + ' ' + row.dataset.search).toLowerCase();
    const gameMatch = !game || haystack.includes(game.replace('counter-strike:', '').replace('counter-strike ', '').replace('condition zero','condition zero'));
    const countryMatch = !country || haystack.includes(country);
    const statusMatch = !status || status === 'offline' || status === 'online'; // demo rows have no live status
    const show = haystack.includes(term) && gameMatch && countryMatch && statusMatch;
    row.style.display = show ? 'grid' : 'none';
    if (show) visible++;
  });
  document.getElementById('resultCount').textContent = `${visible} demo entries · not live data`;
}
['serverSearch','gameFilter','statusFilter','countryFilter'].forEach(id => {
  document.getElementById(id).addEventListener('input', filterServers);
  document.getElementById(id).addEventListener('change', filterServers);
});
document.getElementById('searchBtn').addEventListener('click', filterServers);
document.querySelectorAll('.chat-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.chat-tab').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
}));
