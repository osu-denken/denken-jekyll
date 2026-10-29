// 本文は部員が書いた Markdown。生の HTML を許すため、描画前に必ずサニタイズする
function renderPrivatePost(post) {
  document.title = post.title;

  const heading = document.getElementById('private-title');
  heading.textContent = post.title;

  const meta = document.getElementById('private-meta');
  meta.textContent = 'UpdatedAt: ' + post.updatedAt.slice(0, 10) + ' by ' + post.authorName;

  const body = document.getElementById('private-body');
  body.innerHTML = DOMPurify.sanitize(marked.parse(post.content));
}

function showPrivateMessage(message) {
  document.getElementById('private-body').textContent = message;
}

async function applyPrivateView() {
  const slug = new URLSearchParams(window.location.search).get('page');
  if (!slug) {
    showPrivateMessage('記事が指定されていません。');
    return;
  }

  if (!localStorage.getItem('idToken')) {
    showPrivateMessage('この記事を読むにはログインが必要です。');
    return;
  }

  const data = await fetchPrivate('/private-posts/get', { slug: slug }, true);
  if (!data) {
    showPrivateMessage('この記事は存在しないか、閲覧する権限がありません。');
    return;
  }

  renderPrivatePost(data.post);
}

document.addEventListener('DOMContentLoaded', function () {
  applyPrivateView().catch(function (e) {
    console.error('Failed to load private post:', e);
    showPrivateMessage('記事の取得に失敗しました。');
  });
});
