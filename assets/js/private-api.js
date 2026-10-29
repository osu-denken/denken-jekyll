// 非公開記事は web-api が認証と権限を確認してから返す。静的サイトには含まれない
const PRIVATE_API_BASE = 'https://api.osudenken4dev.workers.dev';

// 非公開記事のURL。スラッグはクエリで渡す
function privatePostUrl(slug) {
  return '/blog/private/?page=' + encodeURIComponent(slug);
}

// ログインし直したあとに戻ってくる先。公式サイトのログイン処理が ?i= を見る
function redirectToLogin() {
  const returnTo = window.location.pathname.replace(/^\//, '') + window.location.search;
  window.location.href = 'https://osu-denken.github.io/?i=' + encodeURIComponent(returnTo) + '#login';
}

/**
 * refreshToken で idToken を取り直す。
 * ブログは公式サイトと同一オリジンなので、トークンをそのまま読み書きできる
 * @returns 新しい idToken、失敗時は null
 */
async function refreshIdToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch(PRIVATE_API_BASE + '/user/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refreshToken })
  });

  const data = await res.json();
  if (!data.idToken || !data.refreshToken) return null;

  localStorage.setItem('idToken', data.idToken);
  localStorage.setItem('refreshToken', data.refreshToken);

  return data.idToken;
}

function privateRequest(path, body, idToken) {
  return fetch(PRIVATE_API_BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + idToken
    },
    body: JSON.stringify(body || {})
  });
}

/**
 * 認証つきで web-api を叩く。401 なら idToken を取り直して一度だけ再試行する
 * @param loginOnExpire 取り直せなかったときにログインへ送るか。
 *   一覧は公開ページに載るので、読みに来ただけの人を追い出さないよう送らない
 * @returns 成功した本文、権限が無ければ null
 */
async function fetchPrivate(path, body, loginOnExpire) {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return null;

  let res = await privateRequest(path, body, idToken);

  if (res.status === 401) {
    const newIdToken = await refreshIdToken();
    if (!newIdToken) {
      if (loginOnExpire) redirectToLogin();
      return null;
    }

    res = await privateRequest(path, body, newIdToken);
  }

  // 権限が足りない、または記事が無い。どちらも非公開記事を見せない扱いにする
  if (!res.ok) return null;

  const data = await res.json();
  return data && data.success ? data : null;
}
