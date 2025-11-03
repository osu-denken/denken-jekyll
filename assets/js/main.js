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

document.addEventListener('DOMContentLoaded', function() {
  applyScrolledClass();
  window.addEventListener('resize', applyScrolledClass);

  applyAutolink();
});
