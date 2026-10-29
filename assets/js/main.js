// .page-content内のURLを検出してリンクを有効化
function applyAutolink() {
  const urlPtn = /(https?:\/\/[^\s<>"']+)/g;
  const internalPtn = new RegExp(`^https?://${window.location.host}`);
  const pageContent = document.querySelector('.page-content');
  if (!pageContent) return;

  
  const tw = document.createTreeWalker(pageContent, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ( node = tw.nextNode()) nodes.push(node);

  for (const node of nodes) {
    const text = node.nodeValue;
    if (!text.match(urlPtn)) continue;
    urlPtn.lastIndex = 0;

    const replaced = text.replace(urlPtn, function(url) {
      return `<a href="${url}"` + (internalPtn.test(url) ? '' : ' target="_blank"')
       + ' rel="noopener noreferrer">' + url + '</a>';
    });

    const tmp = document.createElement('span');
    tmp.innerHTML = replaced;
    node.parentNode.replaceChild(tmp, node);
    tmp.replaceWith(...tmp.childNodes);
  }
}

// テーマ切り替え（初期値は head.html のインラインスクリプトで設定済み）
function applyThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', function() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
  });

  // 明示的に選択していない場合のみOSの設定に追従する
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', function(e) {
    let saved = null;
    try {
      saved = localStorage.getItem('theme');
    } catch (err) {}
    if (saved === 'light' || saved === 'dark') return;
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  });
}

// 編集画面のURL。非公開記事はブログとは別のエディタで扱う
function editHref() {
  const path = window.location.pathname;

  if (path.startsWith('/blog/private')) {
    const slug = new URLSearchParams(window.location.search).get('page');
    return slug ? '/portal/private/?page=' + encodeURIComponent(slug) : null;
  }

  let pagename = path.replace(/^\/blog\//, '');

  if (pagename.endsWith('.html')) {
    pagename = pagename.replace(/\//g, '-').replace(/\.html$/, '');
  } else {
    pagename = '_' + pagename;
  }

  return '/portal/blog/?action=edit&page=' + encodeURIComponent(pagename);
}

// ログインしているときの処理
function applyUserNav() {
  const login = document.getElementById('nav-login');
  const join = document.getElementById('nav-join');

  // ナビバーの書き換え
  const loginLink = login.getElementsByTagName('a')[0];
  loginLink.href = '#logout';
  loginLink.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("displayName");
    window.location.reload();
  });
  loginLink.textContent = 'ログアウト';

  if (!window.location.pathname.endsWith('/blog/') && !window.location.pathname.endsWith('/blog/index.html')) {
    const editLink = join.getElementsByTagName('a')[0];
    const href = editHref();

    // スラッグの無い非公開記事のページには編集するものがない
    if (!href) {
      join.remove();
      return;
    }

    editLink.href = href;
    editLink.textContent = '✎';
    editLink.title = 'このページを編集';
    return;
  } else {
    const newLink = join.getElementsByTagName('a')[0];
    newLink.href = '/portal/blog/?action=new';
    newLink.textContent = '＋';
    newLink.title = '新しく投稿';
  }
}



// 全体読み込み後に初期化する
document.addEventListener('DOMContentLoaded', function() {
  applyAutolink();

  applyThemeToggle();

  const token = localStorage.getItem("idToken");
  if (token) {
    applyUserNav();
  }
});