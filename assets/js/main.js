// サイズに基づいてスクロールの調整
function applyScrolledClass() {
  if (document.documentElement.scrollHeight > window.innerHeight) {
    document.body.classList.add('scrolled');
  } else {
    document.body.classList.remove('scrolled');
  }
}

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
    localStorage.removeItem("displayName");
    window.location.reload();
  });
  loginLink.textContent = 'ログアウト';

  const newLink = join.getElementsByTagName('a')[0];
  newLink.href = '/portal/blog/?action=new';
  newLink.textContent = '新しく投稿';  
}



// 全体読み込み後に初期化する
document.addEventListener('DOMContentLoaded', function() {
  applyScrolledClass();
  window.addEventListener('resize', applyScrolledClass);

  applyAutolink();

  const token = localStorage.getItem("idToken");
  if (token) {
    applyUserNav();
  }
});