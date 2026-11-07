---
title: 【IT技術の知見】関数型
description: 関数型の知見を記録しています。
---

# 関数型

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 副作用

同じ入力であっても出力が異なっていたり、外部の状態に依存するロジックのこと。

- ファイルやデータベースへの書き込み
- HTTP リクエストや外部 API との通信
- DOM の操作や画面描画
- グローバル変数や外部スコープの変更
- ログ出力や例外のスロー

関数型では、副作用のないロジックを持つ関数を定義する必要がある。

<br>

## 02. 関数の引数

### 一覧

<table>
  <thead>
    <tr>
      <th>観点</th>
      <th style="text-align:center">プリミティブ型を渡すべき場合</th>
      <th style="text-align:center">オブジェクトを渡すべき場合</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>純粋性を保ちたい</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>汎用性・再利用性を高めたい</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>関数の責務を絞りたい</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>ドメインロジックが値単体に基づく</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>複数プロパティ間の相互作用がある</td>
      <td style="text-align:center"></td>
      <td style="text-align:center">✅</td>
    </tr>
  </tbody>
</table>

<br>

### プリミティブ型

=== "Go"

    ```go title="Go の場合の実装例"
    package main

    import "fmt"

    type User struct {
    	// 状態
    	name string
    	age  int
    }

    // 振る舞い
    func isAdultAge(age int) bool {
    	return age >= 18
    }

    func main() {
    	// オブジェクトの状態を設定する
    	u := User{name: "Alice", age: 20}

    	fmt.Println(isAdultAge(u.age)) // true
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    type User = {
      // 状態
      name: string;
      age: number;
    };

    // 振る舞い
    function isAdultAge(age: number): boolean {
      return age >= 18;
    }

    // オブジェクトの状態を設定する
    const u: User = {name: "Alice", age: 20};

    console.log(isAdultAge(u.age)); // true
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class User
    {
        public function __construct(
            // 状態
            public readonly string $name,
            public readonly int $age,
        ) {
        }
    }

    // 振る舞い
    function isAdultAge(int $age): bool
    {
        return $age >= 18;
    }

    // オブジェクトの状態を設定する
    $u = new User(name: "Alice", age: 20);

    echo var_export(isAdultAge($u->age), true); // true
    ```

<br>

### オブジェクト

=== "Go"

    ```go title="Go の場合の実装例"
    package main

    import "fmt"

    type User struct {
    	// 状態
    	name string
    	age  int
    }

    // 振る舞い
    func isAdult(user User) bool {
    	return user.age >= 18
    }

    func main() {
    	// オブジェクトの状態を設定する
    	u := User{name: "Alice", age: 20}
    	fmt.Println(isAdult(u)) // true
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    type User = {
      // 状態
      name: string;
      age: number;
    };

    // 振る舞い
    function isAdult(user: User): boolean {
      return user.age >= 18;
    }

    // オブジェクトの状態を設定する
    const u: User = {name: "Alice", age: 20};
    console.log(isAdult(u)); // true
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class User
    {
        public function __construct(
            // 状態
            public readonly string $name,
            public readonly int $age,
        ) {
        }
    }

    // 振る舞い
    function isAdult(User $user): bool
    {
        return $user->age >= 18;
    }

    // オブジェクトの状態を設定する
    $u = new User(name: "Alice", age: 20);
    echo var_export(isAdult($u), true); // true
    ```

<br>
