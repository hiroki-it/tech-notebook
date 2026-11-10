---
title: 【IT技術の知見】Rust＠言語
description: Rust＠言語の知見を記録しています。
---

# Rust＠言語

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Rust とは

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>メモリの安全性</td>
      <td>所有権と借用の仕組みにより、解放済みのメモリの参照や二重解放などのバグをコンパイル時に検出する。これらのバグはクラッシュやセキュリティ脆弱性の原因になるため、バグが許されない基盤部分に適している。</td>
    </tr>
    <tr>
      <td>ガベージコレクションがない</td>
      <td>メモリの解放をガベージコレクションに任せず、所有者がスコープを抜けた時点で解放する。そのため、実行時にガベージコレクションの処理コストがかからず、C 言語並みに高速である。</td>
    </tr>
    <tr>
      <td>型付けの厳格さと型推論</td>
      <td>型付けルールが厳しい一方で、型推論で型付けの実装を省略できる。そのため、型付けの実装を減らしつつ、静的型付けのメリットを享受できる。</td>
    </tr>
    <tr>
      <td>null と例外がない</td>
      <td>値がない可能性を <code>Option</code> 型で、失敗する可能性を <code>Result</code> 型で表す。それぞれの場合の処理を書かないとコンパイルできないため、null 参照やエラー処理の漏れを防げる。</td>
    </tr>
    <tr>
      <td>安全な並行処理</td>
      <td>所有権の仕組みを並行処理にも適用し、スレッド間のデータ競合をコンパイル時に検出する。</td>
    </tr>
    <tr>
      <td>クラスや継承がない</td>
      <td>Go と同様に、思想としてクラスや継承を廃止している。トレイトによって、型の間で振る舞いを共有する。</td>
    </tr>
    <tr>
      <td>単一のバイナリファイル</td>
      <td>ビルドすると単一のバイナリファイルになり、実行環境にランタイムをインストールする必要がない。そのため、CLI ツールの配布に向いている。</td>
    </tr>
  </tbody>
</table>

<br>

## 02. セットアップ

### インストール

#### ▼ rustup から

rustup は、Rust のバージョンを管理する公式のツールである。

`rustc` コマンド、`cargo` コマンド、標準ライブラリをまとめてインストールする。

```bash
# rustup、rustc、cargo をインストールする
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# インストールされたことを確認する
$ rustc --version
$ cargo --version
```

> - [Rust をインストール - Rust プログラミング言語](https://www.rust-lang.org/ja/tools/install)

<br>

### `rust-toolchain.toml` ファイル

リポジトリのルートに `rust-toolchain.toml` ファイルを置くと、そのディレクトリで使う Rust のバージョンを固定できる。

rustup は、`cargo` コマンドの実行時に指定のバージョンへ自動で切り替え、必要であればダウンロードもする。

```toml
[toolchain]
# 使用する Rust のバージョン
channel = "1.99.0"
# Lint ツールとフォーマッターも合わせてインストールする
components = ["clippy", "rustfmt"]
```

> - [Overrides - The rustup book](https://rust-lang.github.io/rustup/overrides.html#the-toolchain-file)

<br>

### Dockerfile

#### ▼ CLI ツールの場合

マルチステージビルドにより、ビルドステージで作ったバイナリファイルだけを実行ステージにコピーする。

Rust のバイナリファイルはランタイムを必要としないため、実行ステージのイメージを小さくできる。

```dockerfile
#===================
# Global ARG
#===================
ARG RUST_VERSION=1.99

#===================
# Build Stage
#===================
FROM rust:${RUST_VERSION}-bookworm AS build

WORKDIR /app

# 依存クレートのダウンロードのキャッシュを活用するため、先にコピーしておく
COPY Cargo.toml Cargo.lock rust-toolchain.toml ./

# 依存クレートだけを先にビルドするため、空の main.rs ファイルを作る
RUN mkdir src \
  && echo 'fn main() {}' > src/main.rs \
  && cargo build --release --locked \
  && rm -rf src

COPY src ./src

# 空の main.rs ファイルのビルド結果を使わないよう、更新日時を新しくしてからビルドする
RUN touch src/main.rs \
  && cargo build --release --locked

#===================
# Production Stage
#===================
FROM debian:bookworm-slim

# ビルドしたバイナリファイルだけをコピーする
COPY --from=build /app/target/release/foo /usr/local/bin/foo

CMD ["foo"]
```

<br>

### アップグレード

#### ▼ rustup から

`rustup update` コマンドで、インストール済みの Rust を最新の安定版にアップグレードする。

`rust-toolchain.toml` ファイルでバージョンを固定している場合、`channel` キーの値を新しいバージョンに書き換える。

```bash
# 最新の安定版にアップグレードする
$ rustup update

# 新しいバージョンになっていることを確認する
$ rustc --version
```

#### ▼ 依存クレート

`cargo update` コマンドで、`Cargo.toml` ファイルで指定した範囲内で依存クレートをアップグレードし、`Cargo.lock` ファイルを更新する。

範囲を超えてメジャーバージョンを上げる場合、`Cargo.toml` ファイルのバージョン指定を書き換える。

```bash
# Cargo.lock ファイルの依存クレートのバージョンを更新する
$ cargo update

# 特定の依存クレートだけを更新する
$ cargo update serde
```

> - [cargo update - The Cargo Book](https://doc.rust-lang.org/cargo/commands/cargo-update.html)

<br>

## 03. ディレクトリ構成規約

### アプリケーションの場合

Cargo は、ディレクトリ構成の規約にしたがってファイルを自動で見つける。

規約どおりに配置すれば、`Cargo.toml` ファイルにファイルの場所を書かなくてよい。

```yaml
rust-repository/
├── Cargo.toml # パッケージの設定と依存クレートを定義する
├── Cargo.lock # 依存クレートの実際のバージョンを固定する
├── rust-toolchain.toml # 使用する Rust のバージョンを固定する
├── src/
│   ├── main.rs # エントリーポイントの main 関数を定義する
│   ├── foo.rs # foo モジュール
│   ├── bar.rs # bar モジュール
│   ├── bar/ # bar モジュールのサブモジュールを配置するディレクトリ
│   │   └── baz.rs
│   │
│   └── bin/ # 2 個目以降のバイナリファイルの main 関数を配置するディレクトリ
│       └── qux.rs
│
├── tests/ # 結合テストを配置するディレクトリ
│   └── integration_test.rs
│
├── benches/ # ベンチマークを配置するディレクトリ
├── examples/ # 使用例を配置するディレクトリ
└── target/ # ビルドのアーティファクトを配置するディレクトリ
```

> - [Package Layout - The Cargo Book](https://doc.rust-lang.org/cargo/guide/project-layout.html)

#### ▼ `src`

コードを配置するディレクトリ。

`main.rs` ファイルで `mod` を宣言したファイルだけが、コンパイルの対象になる。

#### ▼ `tests`

結合テストを配置するディレクトリ。

単体テストは、テスト対象と同じファイルに `#[cfg(test)]` 属性のモジュールとして定義する。

#### ▼ `target`

`cargo build` コマンドでビルドしたアーティファクトを配置するディレクトリ。

数 GB になることもあるため、`.gitignore` ファイルに追加しておく。

<br>

### パッケージの場合

パッケージ (ライブラリクレート) の場合、`main.rs` ファイルは不要である。

その代わりに、`lib.rs` ファイルを定義し、他のクレートに公開するモジュールを宣言する。

```yaml
rust-repository/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── lib.rs # 公開するモジュールを宣言する
│   ├── foo.rs
│   └── bar.rs
│
└── tests/
    └── integration_test.rs
```

`Cargo.lock` ファイルは、アプリケーションでもパッケージでもコミットしておく。

これにより、誰がビルドしても同じバージョンの依存クレートを使う。

> - [Cargo.toml vs Cargo.lock - The Cargo Book](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html)

<br>

### ワークスペースの場合

ワークスペースは、複数のパッケージを 1 個のリポジトリでまとめて管理する仕組みである。

ワークスペース内のパッケージは、`Cargo.lock` ファイルと `target` ディレクトリを共有する。

```yaml
rust-repository/
├── Cargo.toml # members キーでワークスペースのパッケージを列挙する
├── Cargo.lock # ワークスペース全体で共有する
├── foo-cli/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
│
└── foo-core/
    ├── Cargo.toml
    └── src/
        └── lib.rs
```

> - [Workspaces - The Cargo Book](https://doc.rust-lang.org/cargo/reference/workspaces.html)

<br>

## 04. ファイルの要素

### mod

モジュールを宣言する。

`mod foo;` と書くと、同じディレクトリの `foo.rs` ファイルをモジュールとして読み込む。

```rust
// src/foo.rs をモジュールとして読み込む
mod foo;

// ファイルを分けずに、同じファイル内でモジュールを定義する
mod bar {
    pub fn baz() {}
}
```

<br>

### use

他のモジュールや外部クレートの要素を、短い名前で呼べるようにする。

同じクレート内のモジュール同士は互いに `use` し合えるが、クレート同士は循環して依存できない。

```rust
// 外部クレートの要素を読み込む
use anyhow::{Context, Result};

// 自分のクレート内の要素を読み込む
use crate::foo::Foo;
```

<br>

### fn

関数を定義する。

`pub` を付けた関数だけがモジュールの外から見え、付けない関数は private になる。

```rust
// モジュールの外に公開する関数
pub fn new_foo() {}

// モジュールの中だけで使う関数
fn do_something() {}
```

<br>

### struct、enum、type

`struct` で構造体を、`enum` で列挙型を定義する。

`type` はデータ型に別名を付けるだけで、新しい型は作らない。

```rust
// 構造体
pub struct Foo {
    pub name: String,
}

// 列挙型
pub enum Bar {
    A,
    B { value: i32 },
}

// 既存の型の別名
type Baz = Vec<String>;
```

<br>

### impl

`impl` で、構造体や列挙型にメソッドを定義する。

`impl トレイト名 for 型名` と書くと、その型にトレイトを実装する。

```rust
// Foo 構造体にメソッドを定義する
impl Foo {
    // インスタンスを作る関連関数
    pub fn new(name: String) -> Self {
        Self { name }
    }
}

// Foo 構造体に Display トレイトを実装する
impl std::fmt::Display for Foo {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.name)
    }
}
```

<br>

### 文の区切り

Rust では、文をセミコロンで区切る。

Go と異なりセミコロンは補完されないが、ブロックの最後の式にセミコロンを付けないと、その値がブロックの値になる。

```rust
fn add(a: i32, b: i32) -> i32 {
    // セミコロンで区切った文
    let sum = a + b;
    // セミコロンを付けないため、この式の値が戻り値になる
    sum
}
```

<br>

## 05. 命名規則

### Rust API Guidelines による規則

Rust の命名規則は、Rust API Guidelines に記載されている。

命名規則に違反すると、コンパイラが警告を出す。

> - [Naming - Rust API Guidelines](https://rust-lang.github.io/api-guidelines/naming.html)

<br>

### クレート名

ケバブケースまたはスネークケースで命名する。

コード内では、ハイフンがアンダースコアに置き換わった名前で参照する。

```toml
[package]
# Cargo.toml ファイルではハイフンで書く
name = "foo-cli"
```

```rust
// コード内ではアンダースコアで参照する
use foo_cli::Foo;
```

<br>

### モジュール名、ファイル名

小文字一単語またはスネークケースで命名する。

モジュール名とファイル名は一致させる。

```rust
// src/user_repository.rs を読み込む
mod user_repository;
```

<br>

### 関数名、変数名

スネークケースで命名する。

```rust
fn resolve_origin() {}

let default_url = "https://example.com";
```

<br>

### 型名、トレイト名

構造体、列挙型、トレイトなどの型は、アッパーキャメルケースで命名する。

`HTTP` などの略語も、`Http` のように先頭だけを大文字にする。

```rust
struct HttpClient;

enum Command {}

trait Repository {}
```

<br>

### 定数名

`const` や `static` で定義する定数は、スクリーミングスネークケースで命名する。

```rust
const DEFAULT_TIMEOUT_SECS: u64 = 300;
```

<br>

### 変換メソッド名

型を変換するメソッドは、変換のコストや所有権の扱いに応じて、`as_`、`to_`、`into_` を接頭辞にする。

利用者は、メソッド名だけで変換のコストと所有権の扱いがわかる。

```rust
let url: Option<String> = Some("https://example.com".to_string());

// as_ は、コストなしに借用したまま変換する
let url_ref: Option<&str> = url.as_deref();

// to_ は、コストをかけて新しい値を作る
let name: String = "foo".to_string();

// into_ は、所有権を受け取って変換する
let bytes: Vec<u8> = name.into_bytes();
```

<br>

### ゲッター名

フィールドの値を返すメソッドに、`get_` を接頭辞として付けない。

```rust
impl Foo {
    // get_name ではなく name とする
    pub fn name(&self) -> &str {
        &self.name
    }
}
```

<br>

### 未使用の変数名

使わない変数は、`_` を接頭辞にする。

接頭辞を付けないと、コンパイラが未使用の変数として警告を出す。

```rust
// 2 つ目の要素は使わないため、_ を接頭辞にする
let (origin, _token) = saved_token()?;
```

<br>

## 06. プログラミングパラダイム

### オブジェクト指向型

振る舞いは内部に状態を持つ。

副作用はあってもなくともよい。

状態・振る舞いが結合している。

ほかの型と共存できる。

```rust
struct User {
    name: String,
    age: u32,
}

impl User {
    // 振る舞い
    fn is_adult(&self) -> bool {
        // 状態
        self.age >= 18
    }
}
```

<br>

### 関数型

振る舞いは状態を持たず、外部から状態を注入する。

副作用をなくす必要がある。

状態・振る舞いが分離している。

ほかの型と共存できる。

```rust
struct User {
    name: String,
    age: u32,
}

// 振る舞い
fn is_adult(user: &User) -> bool {
    user.age >= 18
}

fn main() {
    // オブジェクトの状態を設定する
    let user = User { name: "Alice".to_string(), age: 20 };
    println!("{}", is_adult(&user)); // true
}
```

Rust は、イテレータやクロージャを標準で備えており、関数型のプログラミングパラダイムとも相性がよい。

```rust
// 成人のユーザー名だけを集める
let adult_names: Vec<&str> = users
    .iter()
    .filter(|user| is_adult(user))
    .map(|user| user.name.as_str())
    .collect();
```

<br>

## 07. その他のお作法

### 関数の返り値を意図的に無視

`Result` 型の返り値を使わないと、コンパイラが警告を出す。

返り値を使わないことを意図的に伝える場合、`_` に代入する。

```rust
use std::fs::File;
use std::io::Write;

fn write_log(file: &mut File) {
    // 書き込みのエラーを処理しない場合は _ に代入する
    let _ = file.write_all(b"log");
}
```

<br>

### コメントの書式

`///` でドキュメントコメントを書き、Markdown の記法を使える。

`cargo doc` コマンドで、ドキュメントコメントから HTML のドキュメントを生成できる。

````rust
/// トークンの有効期限が切れているかどうかを返す。
///
/// # Examples
///
/// ```
/// assert!(!is_expired("opaque-token", 100));
/// ```
pub fn is_expired(token: &str, now: u64) -> bool {
    // ...
}
````

> - [How to write documentation - The rustdoc book](https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html)

<br>

### フォーマットと Lint

`cargo fmt` コマンドで、公式のスタイルにフォーマットする。

`cargo clippy` コマンドで、バグになりやすい書き方や非効率な書き方を検出する。

```bash
# フォーマットが崩れていたら失敗させる
$ cargo fmt --check

# 警告もエラーとして扱い、失敗させる
$ cargo clippy --all-targets -- -D warnings
```

> - [GitHub - rust-lang/rust-clippy](https://github.com/rust-lang/rust-clippy)

<br>

### unwrap を避ける

`unwrap` メソッドは、`None` や `Err` のときにプログラムを強制終了させる。

アプリケーションのコードでは `?` 演算子でエラーを呼び出し元に返し、テストコードでは `unwrap` メソッドを使ってもよい。

```rust
// None のときに強制終了してしまう
let token = creds.token_for(&origin).unwrap();

// None をエラーに変換し、呼び出し元に返す
let token = creds.token_for(&origin).context("not logged in")?;
```

<br>

### イミュータブルが標準

Go と異なり、Rust の変数はデフォルトでイミュータブルである。

値を変更する変数だけに `mut` を付けるため、変更される変数がひと目でわかる。

```rust
// イミュータブルな変数
let cli = Cli::parse();

// ミュータブルな変数
let mut creds = Credentials::load(&path)?;
```

> - [Variables and Mutability - The Rust Programming Language](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html)

<br>
