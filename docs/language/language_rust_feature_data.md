---
title: 【IT技術の知見】データ・型＠Rust
description: データ・型＠Rustの知見を記録しています。
---

# データ・型＠Rust

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. `enum`

Rust の `enum` は、バリアントごとに異なるデータを持たせられる。

各バリアントは、`Command::Login { ... }` のように `列挙型名::バリアント名` で指定する。

```rust
// 列挙型を定義する
enum Command {
    // Command::Login バリアントは url と no_browser を持つ
    Login { url: Option<String>, no_browser: bool },
    // Command::Token バリアントは url だけを持つ
    Token { url: Option<String> },
}
```

<br>

## 02. 所有権と借用

### 借用 (`&`)

`&` を付けて渡すと値を借用 (参照) するだけなので、呼び出し元は引き続きその変数を使える。

C 言語のようにメモリを手動で解放する言語は高速だが、「解放済みのメモリの参照」や「二重解放」などのバグが起こりやすい。

これらのバグは、プログラムのクラッシュやセキュリティ脆弱性の原因になる。

Java や Go のようにガベージコレクションを使う言語ではこれらのバグを防げるが、実行時にガベージコレクションの処理コストがかかる。

Rust では、所有権と借用という仕組みによって、「解放済みのメモリの参照」や「二重解放」などをコンパイル時に検出する。

```rust
// 借用する場合

// 引数 creds は Credentials の値の所有権を持たず、借用するだけである
fn resolve_origin(url: Option<&str>, creds: &Credentials) -> Result<String> {
    // ...
}

// Credentials の値を作り、creds 変数がその値の所有権を持つ
let creds = Credentials::load(&path)?;

// & を付けて渡すため、呼び出し後も creds 変数が Credentials の値の所有権を持ち、creds を使える
resolve_origin(None, &creds);
creds.save(&path)?;
```

`&` を付けずに渡すと所有権が移動 (move) し、呼び出し元ではその変数を使えなくなる。

```rust
// 借用しない場合

// 引数の型に & を付けないため、引数 creds が Credentials の値の所有権を持つ
fn resolve_origin(url: Option<&str>, creds: Credentials) -> Result<String> {
    // ...
}

// Credentials の値を作り、creds 変数がその値の所有権を持つ
let creds = Credentials::load(&path)?;

// & を付けずに渡すため、resolve_origin 関数の引数 creds が Credentials の値の所有権を持つ
resolve_origin(None, creds);

// creds 変数は Credentials の値の所有権を持たないため、コンパイルエラーになる
// コンパイル時に、「解放済みのメモリの参照」や「二重解放」などを防ぐ
creds.save(&path)?;
```

<br>

### `String` と `&str`

`String` は自分で所有する伸縮可能な文字列で、`&str` は他の場所にある文字列を借りて見ているだけの参照である。

引数は `&str` で受け取り、新しく作った文字列は `String` で返すことが多い。

```rust
// 引数は借用した文字列の &str で受け取り、新しく作った文字列の String を返す
fn resolve_origin(url: Option<&str>, creds: &Credentials) -> Result<String> {
    // ...
}
```

<br>

### `as_deref`

`as_deref` メソッドは、`Option<String>` を `Option<&str>` に変換する。

中身の所有権を移動させずに、借用の形で関数へ渡せる。

```rust
// 所有権を持つ文字列を Option で包む
let url: Option<String> = Some("https://example.com".to_string());
// Option<String> を Option<&str> に変換して渡す
resolve_origin(url.as_deref(), &creds);
```

<br>

## 03. ライフタイム

### `'a`

`'a` はライフタイムであり、「戻り値の参照は、`creds` が生きている間だけ有効である」とコンパイラに伝える。

コンパイラはライフタイムを使い、解放済みのデータへの参照 (ダングリング参照) をコンパイル時に防ぐ。

```rust
// 戻り値の &'a str は、&'a Credentials 型の引数 creds が生きている間だけ有効である
fn saved_token<'a>(url: Option<&str>, creds: &'a Credentials) -> Result<(String, &'a str)> {
    // ...
}
```

<br>

### `'static`

`&'static str` は、プログラムの終了までずっと有効な文字列を表す。

ソースコードに直接書いた文字列リテラルは `'static` になる。

```rust
// body には、文字列リテラルなど、プログラムの終了まで有効な文字列だけを渡せる
fn serve_once(status: u16, body: &'static str) {
    // ...
}
```

<br>

## 04. raw 文字列

`r#"..."#` は raw 文字列であり、中の `"` をエスケープせずに書ける。

JSON をテストデータとして書くときに便利である。

```rust
// " をエスケープせずに JSON を書ける
let body = r#"[{"name":"org-a","roleName":"Administrator","current":true}]"#;
```

<br>

