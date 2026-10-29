// 一覧の先頭に非公開記事を差し込む。公開記事より新しいとは限らないが、
// ページネーションの対象外なので混ぜずに前へ置く
function createPrivateCard(post) {
  const item = document.createElement('li');
  item.className = 'carditem carditem-private';

  const link = document.createElement('a');
  link.href = privatePostUrl(post.slug);

  const title = document.createElement('span');
  title.className = 'card-title';

  const lock = document.createElement('iconify-icon');
  lock.className = 'card-lock';
  lock.setAttribute('icon', 'fa6-solid:lock');
  lock.setAttribute('aria-hidden', 'true');
  lock.title = '非公開記事';

  title.appendChild(lock);
  title.appendChild(document.createTextNode(post.title));

  // 本文は取りに行かないので、抜粋の代わりに非公開である旨を出す
  const excerpt = document.createElement('p');
  excerpt.className = 'card-excerpt';
  excerpt.textContent = '(非公開記事)';

  const date = document.createElement('span');
  date.className = 'card-date';
  date.textContent = post.updatedAt.slice(0, 10);

  link.appendChild(title);
  link.appendChild(excerpt);
  link.appendChild(date);
  item.appendChild(link);

  return item;
}

async function applyPrivatePosts() {
  const list = document.querySelector('.cardlist');
  if (!list) return;

  const data = await fetchPrivate('/private-posts/list');
  if (!data || !data.posts.length) return;

  const fragment = document.createDocumentFragment();
  for (const post of data.posts) fragment.appendChild(createPrivateCard(post));

  list.prepend(fragment);
}

document.addEventListener('DOMContentLoaded', function () {
  applyPrivatePosts().catch(function (e) {
    console.error('Failed to load private posts:', e);
  });
});
