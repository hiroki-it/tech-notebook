# 認証情報の保管＠認証情報による分類

## 01. ブラウザのSessionStorage

### ブラウザのSessionStorageとは

ブラウザのストレージ機能であり、ブラウザを閉じると削除される。

<br>

### セッションIDの保存

フロントエンドアーキテクチャがCSRの場合に採用できる。

SSRのアプリケーションはブラウザを操作できないため、ブラウザのLocalStorageをSSRのアプリケーションに渡せない。

セッションIDで認証情報を運搬した場合、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、SessionStorageにセッションIDを保管する。

ブラウザを閉じると、ブラウザはSessionStorageのセッションIDを破棄し、認証はやり直しになる。

```html
<!-- string型で値を設定する必要がある -->
<script>
  window.sessionStorage.setItem("session_id", "*****");
</script>
```

```html
<script>
  const access_token = window.sessionStorage.getItem("session_id");
  const header = new Headers();
  header.set("Cookie", "session_id");
</script>
```

```html
<script>
  window.sessionStorage.removeItem("session_id");
</script>
```

```html
<script>
  window.sessionStorage.clear();
</script>
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage#%E4%BE%8B
> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870
> - https://mizumotok.hatenablog.jp/entry/2021/08/04/114431#%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A7%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%A7%E3%81%8D%E3%82%8B%E5%A0%B4%E6%89%80

<br>

### 場所

**＊例＊**

ローカルマシンがMacOSであれば、Chromeは`~/Library/Application Support/Google/Chrome/<Profile>/Local Storage/`ディレクトリに保管する。

> - https://stackoverflow.com/questions/8634058/where-the-sessionstorage-and-localstorage-stored

<br>

## 02. ブラウザのLocalStorage

### ブラウザのLocalStorageとは

ブラウザのストレージ機能であり、明示的に削除しない限りは保存し続ける。

<br>

### トークンの保存

フロントエンドアーキテクチャがCSRの場合に採用できる。

CSRのアプリケーションはブラウザを操作できるため、ブラウザのLocalStorageにトークンを保存できる。

一方で、SSRのアプリケーションはこれを操作できないため、ブラウザのLocalStorageにトークンを保存できない。

トークン (例：アクセストークン、IDトークンなど) で認証情報を運搬した場合、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、LocalStorageにトークンを保管する。

ブラウザを閉じても、ブラウザはLocalStorageのトークンを破棄せず、認証の成功状態を維持できる。

LocalStorageはSessionStorageと比べて保管期間が長いため、XSSの危険性がより高い。

```html
<script>
  window.localStorage.setItem("access_token", "*****");
</script>
```

```html
<script>
  const access_token = window.localStorage.getItem("access_token");
  const header = new Headers();
  header.set("Authorization", "Bearer " + access_token);
</script>
```

```html
<script>
  window.localStorage.removeItem("access_token");
</script>
```

```html
<script>
  window.localStorage.clear();
</script>
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage#%E4%BE%8B
> - https://qiita.com/masuda-sankosc/items/cff6131efd6e1b5138e6#%E6%A7%8B%E6%96%87

<br>

### 認証後の閲覧履歴の保存

閲覧した情報をLocalStorageに保存しておく。

次回のログイン時に、最近閲覧した情報として表示する。

> - https://webliker.info/web-skill/how-to-use-localstrage/

<br>

### 場所

> - https://developer.chrome.com/docs/devtools/storage/localstorage/
> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870
> - https://mizumotok.hatenablog.jp/entry/2021/08/04/114431#%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A7%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%A7%E3%81%8D%E3%82%8B%E5%A0%B4%E6%89%80

**＊例＊**

ローカルマシンがMacOSであれば、Chromeは`~/Library/Application Support/Google/Chrome/<Profile>/Local Storage/`ディレクトリに保管する。

> - https://stackoverflow.com/a/27612275/12771072

<br>

## 03. ブラウザのCookie

### ブラウザのCookieとは

ブラウザのストレージ機能であり、明示的に削除しない限りは保存し続ける。

> - https://developer.chrome.com/docs/devtools/storage/cookies/

<br>

### トークンの保存

フロントエンドアプリケーションがCSRまたはSSRの場合に採用できる。

CSRまたはSSRのアプリケーションは、`Cookie`ヘッダーを介してブラウザのCookieにトークンを保存できる。

トークン (例：アクセストークン、IDトークンなど) で認証情報を運搬した場合、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、Cookieにトークンを保管する。

ブラウザを閉じても、ブラウザはCookieのトークンを破棄せず、認証の成功状態を維持できる。

> - https://github.com/vercel/next.js/discussions/39915#discussioncomment-3467720
> - https://zenn.dev/link/comments/90928f69712b11
> - https://zenn.dev/marton/articles/67f7ec30cda716

#### ▼ 場所

**＊例＊**

クライアントPCがMacOSであれば、Chromeは`/Users/<ユーザー名>/Library/Application Support/Google/Chrome/Default/Cookies`ディレクトリに`Cookie`ヘッダーの値を保管する。

> - https://qiita.com/EasyCoder/items/8ce7dfd75d05079be9d7#cookie%E3%81%AF%E3%81%A9%E3%81%93%E3%81%AB%E4%BF%9D%E5%AD%98%E3%81%95%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 04. サーバー側のアプリケーションのセッション

フロントエンドアプリケーションがSSRの場合に採用できる。

アプリケーションのセッションファイル上で管理する。

<br>

## 05. サーバー側のセッションストレージツール (例：Redis)

フロントエンドアプリケーションがSSRの場合に採用できる。

> - https://redis.io/solutions/authentication-token-storage/

<br>
