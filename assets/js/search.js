(function () {
  const input = document.getElementById('search-input');
  if (!input) return;

  const baseurl = input.dataset.baseurl || '';
  const defaultList = document.getElementById('default-list');
  const pagers = document.querySelectorAll('.pagination');
  const resultList = document.getElementById('search-results');
  const emptyMsg = document.getElementById('search-empty');
  const hint = document.getElementById('search-hint');

  let posts = null;
  let loading = false;

  function loadIndex() {
    if (posts || loading) return Promise.resolve();
    loading = true;
    return fetch(baseurl + '/search.json')
      .then(res => res.json())
      .then(data => { posts = data; })
      .catch(() => { posts = []; })
      .finally(() => { loading = false; });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      // 検索していないときは通常の一覧を表示
      if (defaultList) defaultList.hidden = false;
      pagers.forEach(p => (p.hidden = false));
      if (hint) hint.hidden = false;
      resultList.hidden = true;
      resultList.innerHTML = '';
      emptyMsg.hidden = true;
      return;
    }

    if (defaultList) defaultList.hidden = true;
    pagers.forEach(p => (p.hidden = true));
    if (hint) hint.hidden = true;

    const terms = q.split(/\s+/).filter(Boolean);
    const matches = (posts || []).filter(post => {
      const haystack = (
        post.title + ' ' + (post.tags || []).join(' ') + ' ' + post.content
      ).toLowerCase();
      return terms.every(t => haystack.includes(t));
    });

    resultList.hidden = false;
    if (matches.length === 0) {
      resultList.innerHTML = '';
      emptyMsg.hidden = false;
      return;
    }

    emptyMsg.hidden = true;
    resultList.innerHTML = matches.map(post => {
      const excerpt = post.content.length > 50
        ? post.content.slice(0, 50) + '…'
        : post.content;
      return (
        '<li class="carditem">' +
          '<a href="' + escapeHtml(post.url) + '">' +
            '<span class="card-title">' + escapeHtml(post.title) + '</span>' +
            '<p class="card-excerpt">' + escapeHtml(excerpt) + '</p>' +
            '<span class="card-date">' + escapeHtml(post.date) + '</span>' +
          '</a>' +
        '</li>'
      );
    }).join('');
  }

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      loadIndex().then(() => render(input.value));
    }, 150);
  });

  // フォーカス時に先読みしておく
  input.addEventListener('focus', loadIndex, { once: true });

  // URL の ?q= を初期クエリとして反映(トップページから飛んできたとき)
  const initialQuery = new URLSearchParams(location.search).get('q');
  if (initialQuery) {
    input.value = initialQuery;
    loadIndex().then(() => render(initialQuery));
  }
})();
