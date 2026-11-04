---
title: 【IT技術の知見】デザインパターン＠オブジェクト指向
description: デザインパターン＠オブジェクト指向の知見を記録しています。
---

# デザインパターン＠オブジェクト指向

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. デザインパターン（GoF）とは

先人が考えたオブジェクト指向設計に基づいたコンポーネントのこと。

「Gang of Four」という４人の著者が考えたため、GoFとも呼ばれている。

> - [デザインパターン (ソフトウェア) - Wikipedia](<https://ja.wikipedia.org/wiki/%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3_(%E3%82%BD%E3%83%95%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A2)>)
> - [デザインパターン \| TECHSCORE(テックスコア)](https://www.techscore.com/tech/DesignPattern/)

<br>

## 02. 生成に関するパターン

<br>

## 03. 構造に関するパターン

<br>

## 04. 振る舞いに関するパターン

### コマンドパターン

処理の要求をオブジェクト（コマンド）として表すデザインパターンである。

コマンドの実行者は `Execute` メソッドを呼ぶだけでよく、その要求で何をするのかを知る必要がない

```go
app.command = &LoginCommand{browser: browser, credentials: credentials}

// コマンド経由で、ブラウザでログインさせてトークンを保存させる
app.Run() 
```

<br>

### ミドルウェアパターン（メディエーターパターン）

『メディエイターパターン』ともいう。

GoFでは、『Chain of Responsibility パターン』に近い。

HTTP リクエストを受信する API とこれを処理するハンドラーの間に共通の処理を挟むデザインパターンである。

```go
handler := WithAccessLog(WithAuth(projectListHandler))

http.ListenAndServe(":8080", handler)

func WithAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !verify(r.Header.Get("Authorization")) {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r) // 次のミドルウェアまたはハンドラーに渡す
    })
}
```

すべてと言い切ることはできないが、サービスメッシュではミドルウェアパターンで実装するようなロジックを配布できる。

- アクセスログ記録
- メトリクス記録
- スパン記録
- アクセストークン署名検証（ログイン処理はミドルウェアではなくコントローラーなので注意）
- CORS 対応
- リクエストパラメーターのバリデーション
- リトライ
- 暗号化／復号
- レートリミット

> - https://www.patterns.dev/posts/mediator-pattern
> - https://levelup.gitconnected.com/piping-middleware-pattern-fc519481c2d7
> - [Goのミドルウェアパターン - It Made My Day](https://turbofish.hatenablog.com/entry/2022/03/18/165155)

<br>

## 05. プロセッシングに関するパターン

<br>
