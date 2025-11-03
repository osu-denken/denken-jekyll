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
  const urlPattern = /(https?:\/\/[^\s<>"']+)/g;
  const internalLinkPattern = new RegExp(`^https?://${window.location.host}`); // 内部リンク用パターン

  const pageContent = document.querySelector('.page-content');
  if (!pageContent) return;

  pageContent.innerHTML = pageContent.innerHTML.replace(urlPattern, function(url) {
    const isInternal = internalLinkPattern.test(url);
    return `<a href="${url}"` + isInternal ? `` : ` target="_blank"` + ` rel="noopener noreferrer">${url}</a>`;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  applyScrolledClass();
  window.addEventListener('resize', applyScrolledClass);

  applyAutolink();
});
