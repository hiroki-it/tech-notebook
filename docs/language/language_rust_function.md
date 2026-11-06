---
title: 【IT技術の知見】Rust＠関数
description: Rust＠関数の知見を記録しています。
---

# Rust＠関数

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. モジュール

### `mod`

`mod xxx;` と書くと、同じディレクトリの `xxx.rs` ファイルをモジュールとして読み込む。

`main.rs` で `mod` を宣言しないファイルは、コンパイルの対象にならない。

```rust
// src/credentials.rs をモジュールとして読み込む
mod credentials;
// src/organizations.rs をモジュールとして読み込む
mod organizations;
```

<br>

### `use`

`use` は、他のモジュールやクレートの名前を短く呼べるようにする。

`{A, B}` と書くと、複数の名前をまとめて取り込める。

```rust
// 外部クレートの anyhow から複数の名前をまとめて取り込む
use anyhow::{Context, Result, bail};
// 自分の credentials モジュールの型を取り込む
use credentials::Credentials;
```

<br>

### `pub`

`pub` を付けた要素だけが、モジュールの外から見える。

何も付けない要素は、デフォルトで private になる。

```rust
// 構造体をモジュールの外に公開する
pub struct Organization {
    // フィールドも個別に公開する必要がある
    pub name: String,
}

// 関数をモジュールの外に公開する
pub fn fetch(origin: &str, token: &str) -> Result<Vec<Organization>> {
    // ...
}
```

<br>

### コメント

`///` はすぐ下の要素のドキュメントで、`//!` はファイル (モジュール) 自体のドキュメントである。

clap パッケージは、`///` のドキュメントを `--help` の説明文として使う。

```rust
//! モジュールのファイル自体のドキュメント

/// すぐ下の要素のドキュメント
pub fn fetch() {}

// 普通のコメント
```

<br>

## 02. 構造体・列挙型・属性

### `struct`

`struct` は、複数のフィールドを持つ型 (構造体) を定義する。

インスタンスは、`Organization { name: ..., role_name: ..., current: ... }` のように全フィールドの値を指定して作る。

```rust
// 構造体を定義する
pub struct Organization {
    // フィールド名: 型
    pub name: String,
    pub role_name: String,
    pub current: bool,
}
```

<br>

### `derive` 属性

`#[derive(...)]` 属性は、型に機能を自動で実装する (例：`Debug` は `{:?}` での表示、`PartialEq` は `==` での比較、`Deserialize` は JSON からの変換) 。

`#[serde(rename_all = "camelCase")]` 属性は、JSON の `roleName` キーを `role_name` フィールドに対応づける。

```rust
// {:?} での表示、JSON からの変換、== での比較を自動で実装する
#[derive(Debug, Deserialize, PartialEq)]
// JSON のキーをキャメルケースとして扱う
#[serde(rename_all = "camelCase")]
pub struct Organization {
    pub name: String,
    // JSON の roleName キーに対応する
    pub role_name: String,
}
```

<br>

### `enum`

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

## 03. 関数と変数

### 最後の式が戻り値

`->` の後ろに戻り値の型を書き、最後の式にセミコロンを付けないと、その値が戻り値になる。

`return` は、関数を途中で抜けたいときにだけ使う。

```rust
// 戻り値の型は u64 である
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        // セミコロンがないため、この式の値が戻り値になる
        .unwrap_or(0)
}
```

<br>

### `let` と `let mut`

`let` で宣言した変数は、デフォルトで変更できない。

値を変更する変数には `let mut` と書く。

```rust
// 変更できない変数
let cli = Cli::parse();
// 変更できる変数
let mut creds = Credentials::load(&path)?;
// mut を付けたため、中身を変更できる
creds.set_token(&origin, token);
```

<br>

### `::` と `.`

`型::関数()` は、型に紐づく関数 (関連関数、静的メソッド相当) を呼び出す。

`変数.メソッド()` は、インスタンスのメソッドを呼び出す。

```rust
// 型に紐づく関連関数を呼び出す
let cli = Cli::parse();
// インスタンスのメソッドを呼び出す
creds.save(&path)?;
```

<br>

## 04. 所有権と借用

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

## 05. エラーハンドリング

### `Option` と `Result`

Rust には `null` も例外もなく、値がない可能性は `Option<T>` (`Some(値)` または `None`) で表す。

失敗する可能性は `Result<T, E>` (`Ok(値)` または `Err(エラー)`) で表す。

```rust
// トークンがあれば Some(トークン)、なければ None を返す
fn token_for(&self, origin: &str) -> Option<&str> { /* ... */ }
// 成功すれば Ok(パス)、失敗すれば Err(エラー) を返す
fn default_path() -> Result<PathBuf> { /* ... */ }
```

<br>

### `?` 演算子

`?` 演算子は、`Err` ならその場でエラーを返して関数を抜け、`Ok` なら中身を取り出す。

`?` 演算子を使う関数は、戻り値の型が `Result` である必要がある。

```rust
// ? 演算子を使うため、戻り値の型を Result にする
fn main() -> Result<()> {
    // Err ならここで main 関数を抜け、Ok なら中身を path に代入する
    let path = credentials::default_path()?;
    // ...
    // 成功を返す
    Ok(())
}
```

<br>

### `with_context` と `bail!`

anyhow パッケージの `with_context` メソッドは、`None` や `Err` をメッセージ付きのエラーに変換する。

`bail!` マクロは、指定したメッセージのエラーをその場で返す (`return Err(anyhow!(...))` の短縮形) 。

```rust
// None をメッセージ付きのエラーに変換し、? 演算子で返す
let token = creds.token_for(&origin).with_context(|| {
    format!("not logged in to {origin}")
})?;

if is_expired(token, now()) {
    // このメッセージのエラーをその場で返す
    bail!("the token for {origin} has expired");
}
```

<br>

## 06. パターンマッチ

### `match` による列挙型の分岐

`match` は強化版の `switch` であり、バリアントのなかのフィールドをその場で変数として取り出せる。

すべてのケースを網羅しないとコンパイルエラーになるため、分岐の書き忘れを防げる。

```rust
match cli.command {
    // Login バリアントのフィールドを変数として取り出す
    Command::Login { url, no_browser, port, timeout } => { /* ... */ }
    // Token バリアントの url を取り出す
    Command::Token { url } => { /* ... */ }
    // 1 つでもバリアントの分岐が欠けると、コンパイルエラーになる
    Command::Organizations { url } => { /* ... */ }
}
```

<br>

### 値によるマッチ

パターンには `403` のような具体的な値を書け、上から順に評価される。

そのため、具体的なパターンを先に書き、`status` や `err` のようにすべてを受け取るパターンを後に書く。

```rust
match ureq::get(&url).call() {
    // 成功したときのレスポンスを取り出す
    Ok(mut response) => { /* ... */ }
    // ステータスコードが 403 のときだけマッチする
    Err(ureq::Error::StatusCode(403)) => bail!("invalid token"),
    // 403 以外のステータスコードを status に代入する
    Err(ureq::Error::StatusCode(status)) => bail!("returned {status}"),
    // 上記以外の全てのエラーを err に代入する
    Err(err) => Err(err).context("failed to request"),
}
```

<br>

### タプルの分割代入

`let (a, b) = ...` と書くと、タプルの要素を変数に分割して代入できる。

`_` は、使わない値を受け取って捨てる。

```rust
// タプルの 1 つ目の要素は捨て、2 つ目の要素を token に代入する
let (_, token) = saved_token(url.as_deref(), &creds)?;
```

<br>

## 07. クロージャとイテレータ

### クロージャ

`|引数| 式` はクロージャ (無名関数) である。

クロージャは、定義した場所の外側の変数を参照できる。

```rust
// organization を引数に取り、名前の文字数を返すクロージャ
.map(|organization| organization.name.chars().count())
```

<br>

### イテレータ

`iter` メソッドで要素を 1 つずつ取り出し、`map` や `max` などのメソッドをチェーンして処理する。

Rust のイテレータは遅延評価であり、`max` や `collect` などを呼ぶまで実際の処理は実行されない。

```rust
let width = organizations
    // 要素を 1 つずつ取り出す
    .iter()
    // 各要素を名前の文字数に変換する
    .map(|organization| organization.name.chars().count())
    // 最大値を Option で返し、ここで初めて処理が実行される
    .max()
    // 要素が空で None のときは 0 にする
    .unwrap_or(0);
```

<br>

### `collect`

`collect` メソッドは、イテレータの要素をコレクションにまとめる。

まとめる先の型は戻り値の型から推論され、この例では各行がつながった 1 つの `String` になる。

```rust
// 戻り値の型が String であるため、collect の結果は String になる
pub fn format(organizations: &[Organization]) -> String {
    organizations
        .iter()
        // 各要素を 1 行の文字列に変換する
        .map(|organization| format!("{}\n", organization.name))
        // 各行をつなげて 1 つの String にまとめる
        .collect()
}
```

<br>

### `if` 式

Rust の `if` は式であり、値を返せるため三項演算子の代わりになる。

`'*'` のようにシングルクォートで囲むと `char` 型 (1 文字) になり、ダブルクォートで囲むと文字列になる。

```rust
// current が true なら '*'、false なら ' ' を marker に代入する
let marker = if organization.current { '*' } else { ' ' };
```

<br>

## 08. マクロ

### マクロとは

名前の後ろに `!` が付くものは、関数ではなくマクロである。

マクロは、可変個の引数を受け取るなど、関数ではできない処理を実現できる。

```rust
// ! が付いているため、関数ではなくマクロである
println!("{token}");
eprintln!("Logged in to {origin}");
```

<br>

### 書式指定

`{変数名}` と書くと変数を直接埋め込め、式は `{}` に対応する引数として後ろに渡す。

`{:<width$}` は、変数 `width` の幅で左寄せする書式指定である。

```rust
// 変数 origin を直接埋め込む
format!("{origin}/openapi/v1/organizations");
// 式の値を {} に埋め込む
format!("Token saved to {}", path.display());
// organization.name を変数 width の幅で左寄せして埋め込む
format!("{marker} {:<width$}  {}\n", organization.name, organization.role_name);
```

<br>

### `println!` と `eprintln!`

`println!` マクロは標準出力に、`eprintln!` マクロは標準エラー出力に書き込む。

`$(foo token)` のようにコマンドの出力を変数へ代入する場合、メッセージ類を標準エラー出力に出すと、標準出力をきれいに保てる。

```rust
// 標準出力に書き込む
println!("{token}");
// 標準エラー出力に書き込む
eprintln!("Logged in to {origin}");
```

<br>

## 09. ライフタイム

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

## 10. テスト

### `#[cfg(test)]` と `#[test]`

`#[cfg(test)]` 属性を付けたモジュールは `cargo test` コマンドの実行時だけコンパイルされ、`#[test]` 属性を付けた関数がテストになる。

Rust では、テスト対象と同じファイルにテストを書き、`use super::*` で親モジュールの要素を取り込むことが多い。

```rust
// cargo test コマンドの実行時だけコンパイルする
#[cfg(test)]
mod tests {
    // テスト対象である親モジュールの要素を全て取り込む
    use super::*;

    // この関数をテストとして実行する
    #[test]
    fn format_returns_empty_for_no_organizations() {
        // 2 つの値が等しくなければテストを失敗させる
        assert_eq!(format(&[]), "");
    }
}
```

<br>

### raw 文字列

`r#"..."#` は raw 文字列であり、中の `"` をエスケープせずに書ける。

JSON をテストデータとして書くときに便利である。

```rust
// " をエスケープせずに JSON を書ける
let body = r#"[{"name":"org-a","roleName":"Administrator","current":true}]"#;
```

<br>

### `move` クロージャ

`move` を付けたクロージャは、外側の変数 (例：`server`) の所有権をクロージャのなかへ移動させる。

別スレッドで変数を使う場合、元のスレッドより長く生きる可能性があるため `move` が必要になる。

```rust
// 別スレッドを起動し、server の所有権をクロージャへ移動させる
let handle = thread::spawn(move || {
    // 移動した server をスレッドのなかで使う
    let request = server.recv().unwrap();
    // ...
});
```

<br>
