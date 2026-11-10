---
title: 【IT技術の知見】３章
description: ３章の知見を記録しています。
---

# ３章

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter3 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter3)

<br>

## 01. エンティティとは

ドメイン上で意味をもち、同一性（識別子によって区別される性質）をもつオブジェクトがある。

これをモデリングし、ドメインオブジェクトとして実装したものをエンティティという。

- User：ユーザーID と関連処理（例：氏名変更、メールアドレス変更など）を状態・振る舞いとして表現
- Order：注文 ID と関連処理（例：商品追加、合計金額計算など）を状態・振る舞いとして表現
- Product：商品 ID と関連処理（例：在庫更新、価格変更など）を状態・振る舞いとして表現
- Project：プロジェクト ID と関連処理（例：進捗更新、メンバー追加など）を状態・振る舞いとして表現
- Payment：決済 ID と関連処理（例：支払い完了、返金処理など）を状態・振る舞いとして表現
- MonitoringAlert：アラート ID と関連処理（例：通知送信、ステータス変更など）を状態・振る舞いとして表現

<br>

## 02. エンティティの実装方法（関数型）

### 識別子を持つ

ほかのエンティティと区別できる識別子 (例：DB のオートインクリメント ID、UUID など) をもつ。

同じデータをもっていても、ID が異なれば別のエンティティである。

識別子にはドメインルールを持たせないほうがよいため、ドメインルール上の識別子（例：書籍の ISBN）はエンティティの識別子にしないほうがいい。

=== "Go"

    ```go title="Go の場合の実装例"
    type UserId string

    type User struct {
    	Id    UserId
    	Name  string
    	Email string
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export type UserId = string;

    export type User = {
      id: UserId;
      name: string;
      email: string;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final readonly class UserId
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    final readonly class User
    {
        public function __construct(
            public UserId $id,
            public string $name,
            public string $email,
        ) {
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    func createUser(id UserId, name string, email string) (User, error) {
    	if id == "" || email == "" {
    		return User{}, errors.New("IDとメールは必須です")
    	}
    	return User{Id: id, Name: name, Email: email}, nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const createUser = (id: UserId, name: string, email: string): User | Error => {
      if (!id || !email) return new Error("IDとメールは必須です");
      return Object.freeze({id, name, email});
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    function createUser(UserId $id, string $name, string $email): User
    {
        if ($id->value === "" || $email === "") {
            throw new InvalidArgumentException("IDとメールは必須です");
        }
        return new User(id: $id, name: $name, email: $email);
    }
    ```

<br>

### ID で等価性バリデーションできる

値オブジェクトとは異なり、ID で等価性バリデーションができる。

「〇はすでに存在しています」のエラーで役立つ。

=== "Go"

    ```go title="Go の場合の実装例"
    type UserId string

    type User struct {
    	Id    UserId
    	Name  string
    	Email string
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export type UserId = string;

    export type User = {
      id: UserId;
      name: string;
      email: string;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final readonly class UserId
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    final readonly class User
    {
        public function __construct(
            public UserId $id,
            public string $name,
            public string $email,
        ) {
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    func EqualsUser(a User, b User) bool {
    	return a.Id == b.Id
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export const equalsUser = (a: User, b: User): boolean => {
      return a.id === b.id;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    function equalsUser(User $a, User $b): bool
    {
        return $a->id->value === $b->id->value;
    }
    ```

<br>

### 処理のなかで状態が変化する

処理のなかで状態が更新されても ID は変わらず、オブジェクトとしての等価性は保たれる。

=== "Go"

    ```go title="Go の場合の実装例"
    type UserId string

    type User struct {
    	Id    UserId
    	Name  string
    	Email string
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export type UserId = string;

    export type User = {
      id: UserId;
      name: string;
      email: string;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final readonly class UserId
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    final readonly class User
    {
        public function __construct(
            public UserId $id,
            public string $name,
            public string $email,
        ) {
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // 処理の途中で状態を変更できる
    func ChangeUserName(user User, newName string) User {
    	user.Name = newName
    	return user
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 処理の途中で状態を変更できる
    export const changeUserName = (user: User, newName: string): User => {
      return Object.freeze({...user, name: newName});
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    // 処理の途中で状態を変更できる
    function changeUserName(User $user, string $newName): User
    {
        return new User(id: $user->id, name: $newName, email: $user->email);
    }
    ```

<br>

### ライフサイクル

作成から削除までのライフサイクルがある。

=== "Go"

    ```go title="Go の場合の実装例"
    type UserId string

    type User struct {
    	Id    UserId
    	Name  string
    	Email string
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export type UserId = string;

    export type User = {
      id: UserId;
      name: string;
      email: string;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final readonly class UserId
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    final readonly class User
    {
        public function __construct(
            public UserId $id,
            public string $name,
            public string $email,
        ) {
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // 削除
    func CreateUser(
    	id UserId,
    	name string,
    	email string,
    ) (User, error) {
    	if id == "" || name == "" || email == "" {
    		return User{}, errors.New("全ての値は必須です")
    	}
    	return User{Id: id, Name: name, Email: email}, nil
    }

    // 作成
    func DeleteUser(id UserId) bool {
    	return db.Delete(id)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 削除
    export const createUser = (
      id: UserId,
      name: string,
      email: string,
    ): User | Error => {
      if (!id || !name || !email) return new Error("全ての値は必須です");
      return Object.freeze({id, name, email});
    };

    // 作成
    export const deleteUser = (id: UserId): boolean => {
      return db.delete(id);
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    // 削除
    function createUser(
        UserId $id,
        string $name,
        string $email,
    ): User {
        if ($id->value === "" || $name === "" || $email === "") {
            throw new InvalidArgumentException("全ての値は必須です");
        }
        return new User(id: $id, name: $name, email: $email);
    }

    // 作成
    function deleteUser(UserId $id): bool
    {
        global $db;

        return $db->delete($id);
    }
    ```

<br>

## 03. エンティティで実装するべきロジックの見つけ方

### CRUD 系関数の対象

CRUD 系関数（`create`、`find`、`update`、`delete`）の対象となるオブジェクトはエンティティの可能性がある。

<br>

### 業務フローのなかにある

入庫 → 検査 → 販売 → 返品 というような業務フローのなかで処理される。

<br>
