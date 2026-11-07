---
title: 【IT技術の知見】５章＠ドメイン駆動設計入門ボトムアップ
description: ５章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ５章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter5 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter5)

<br>

## 01. リポジトリとは

リポジトリとは、ドメインオブジェクト（エンティティや値オブジェクト）を外部（DB、サードパティ API）から取得し、またこれに永続化するロジックをもつオブジェクトである。

<br>

## 02. リポジトリの実装方法（関数型）

### インターフェースリポジトリ

=== "Go"

    ```go title="Go の場合の実装例"
    type UserRepositoryInterface interface {
    	FindById(id UserId) (*User, error)
    	Save(user *User) error
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    type UserRepositoryInterface = {
      findById: (id: UserId) => Promise<User>;
      save: (user: User) => Promise<void>;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    interface UserRepositoryInterface
    {
        public function findById(UserId $id): ?User;

        public function save(User $user): void;
    }
    ```

<br>

### 実装リポジトリ

=== "Go"

    ```go title="Go の場合の実装例"
    import (
    	"database/sql"
    	"errors"

    	"example.com/app/domain"
    )

    // 依存性注入
    type UserRepositoryDI struct {
    	pool *sql.DB
    }

    func FindById(
    	userRepositoryDI UserRepositoryDI,
    	id domain.UserId,
    ) (*domain.User, error) {
    	query := `SELECT id, name FROM users WHERE id = ? LIMIT 1`
    	row := userRepositoryDI.pool.QueryRow(query, string(id))

    	var recordId, recordName string
    	if err := row.Scan(&recordId, &recordName); err != nil {
    		if errors.Is(err, sql.ErrNoRows) {
    			return nil, errors.New("User not found")
    		}
    		return nil, err
    	}

    	return domain.NewUser(domain.UserIdFrom(recordId), domain.NewUserName(recordName)), nil
    }

    func Save(
    	userRepositoryDI UserRepositoryDI,
    	user *domain.User,
    ) error {
    	query := `
        INSERT INTO users (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name)
      `
    	_, err := userRepositoryDI.pool.Exec(query, string(user.Id), user.Name.String())
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {Pool} from "mysql2/promise";
    import {User} from "../domain/user";
    import {UserId} from "../domain/userId";
    import {UserName} from "../domain/userName";

    // 依存性注入
    export type UserRepositoryDI = Readonly<{
      pool: Pool;
    }>;

    export const findById = async (
      userRepositoryDI: UserRepositoryDI,
      id: UserId,
    ): Promise<User> => {
      const sql = `SELECT id, name FROM users WHERE id = ? LIMIT 1`;
      const [rows] = await userRepositoryDI.pool.query(sql, [
        id as unknown as string,
      ]);
      const row = (rows as any[])[0];

      if (!row) {
        throw new Error("User not found");
      }

      return new User(UserId.from(row.id), new UserName(row.name));
    };

    export const save = async (
      userRepositoryDI: UserRepositoryDI,
      user: User,
    ): Promise<void> => {
      const sql = `
        INSERT INTO users (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name)
      `;
      await userRepositoryDI.pool.query(sql, [
        user.id as unknown as string,
        user.name.toString(),
      ]);
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    use App\Domain\User;
    use App\Domain\UserId;
    use App\Domain\UserName;

    // 依存性注入
    final readonly class UserRepositoryDI
    {
        public function __construct(
            public PDO $pool,
        ) {
        }
    }

    function findById(
        UserRepositoryDI $userRepositoryDI,
        UserId $id,
    ): User {
        $sql = "SELECT id, name FROM users WHERE id = ? LIMIT 1";
        $statement = $userRepositoryDI->pool->prepare($sql);
        $statement->execute([(string) $id]);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        if ($row === false) {
            throw new RuntimeException("User not found");
        }

        return new User(UserId::from($row["id"]), new UserName($row["name"]));
    }

    function save(
        UserRepositoryDI $userRepositoryDI,
        User $user,
    ): void {
        $sql = "
        INSERT INTO users (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name)
      ";
        $statement = $userRepositoryDI->pool->prepare($sql);
        $statement->execute([
            (string) $user->id,
            $user->name->toString(),
        ]);
    }
    ```

<br>

### インメモリリポジトリ

=== "Go"

    ```go title="Go の場合の実装例"
    type userRepositoryInMemory struct {
    	store map[UserId]*User
    }

    func createUserRepositoryInMemory() UserRepositoryInterface {
    	return &userRepositoryInMemory{
    		store: map[UserId]*User{},
    	}
    }

    func (r *userRepositoryInMemory) FindById(id UserId) (*User, error) {
    	return r.store[id], nil
    }

    func (r *userRepositoryInMemory) Save(user *User) error {
    	r.store[user.Id] = user
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const createUserRepositoryInMemory = (): UserRepositoryInterface => {
      const store = new Map<UserId, User>();

      return {
        async findById(id: UserId): Promise<User | null> {
          return store.get(id) ?? null;
        },
        async save(user: User): Promise<void> {
          store.set(user.id, user);
        },
      };
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    function createUserRepositoryInMemory(): UserRepositoryInterface
    {
        return new class () implements UserRepositoryInterface {
            /** @var array<string, User> */
            private array $store = [];

            public function findById(UserId $id): ?User
            {
                return $this->store[(string) $id] ?? null;
            }

            public function save(User $user): void
            {
                $this->store[(string) $user->id] = $user;
            }
        };
    }
    ```

### DTO

#### ▼ DTO とは

ORM のデータモデルをエンティティそのままに使用する場合、ドメイン層がインフラストラクチャ層に依存してしまう。

エンティティと ORM のデータモデルを分離し、ORM のデータモデルをエンティティに詰め替える必要がある

別の方法として、リポジトリで DTO に相当するロジックを実装してもよい。

#### ▼ DTO を使用しない場合

```typescript title="TypeScript の場合の実装例"
import {PrismaClient} from "@prisma/client";
import {User} from "../domain/user";
import {UserId} from "../domain/userId";
import {UserName} from "../domain/userName";

// 依存性注入
export type UserRepositoryDI = Readonly<{
  prisma: PrismaClient;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const record = await userRepositoryDI.prisma.user.findUnique({
    where: {id: id as unknown as string},
  });

  if (!record) {
    throw new Error("User not found");
  }

  // 取得時はORMのデータモデルをエンティティに変換する
  return new User(UserId.from(record.id), new UserName(record.name));
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  const record = {
    id: user.id as unknown as string,
    name: user.name.toString(),
  };

  // 保存時はエンティティをORMのデータモデルに変換する
  await userRepositoryDI.prisma.user.upsert({
    where: {id: record.id},
    create: {id: record.id, name: record.name},
    update: {name: record.name},
  });
};
```

#### ▼ DTO を使用する場合

```typescript title="TypeScript の場合の実装例"
import {PrismaClient} from "@prisma/client";

import {User} from "../domain/user";
import {UserId} from "../domain/userId";
import {UserName} from "../domain/userName";

// 依存性注入
export type UserRepositoryDI = Readonly<{
  prisma: PrismaClient;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const record = await userRepositoryDI.prisma.user.findUnique({
    where: {id: id as unknown as string},
  });
  if (!record) {
    throw new Error("User not found");
  }

  // 取得時はORMのデータモデルをエンティティに変換する
  return UserDTO.toDomain({
    id: record.id,
    name: record.name,
  });
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  // 保存時はエンティティをORMのデータモデルに変換する
  const record = UserDTO.toRecord(user);
  await userRepositoryDI.prisma.user.upsert({
    where: {id: record.id},
    create: {id: record.id, name: record.name},
    update: {name: record.name},
  });
};
```

<br>

### 注意点

#### ▼ よろしくない実装（リポジトリに Update 系メソッドを多く書く）

User オブジェクトに実装するべき振る舞いのビジネスロジックを、永続化の役割を持つ Repository へ実装することになってしまう。

=== "Go"

    ```go title="Go の場合の実装例"
    type UserRepositoryInterface interface {
    	FindbyId(id UserId) (*User, error)
    	UpdateName(name UserName) error
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    type UserRepositoryInterface = {
      findbyId: (id: UserId) => Promise<User>;
      updateName: (name: UserName) => Promise<void>;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    interface UserRepositoryInterface
    {
        public function findbyId(UserId $id): ?User;

        public function updateName(UserName $name): void;
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    user, err := userRepository.FindById(userId)
    if err != nil {
    	return err
    }
    if err := userRepository.UpdateName(getName(user)); err != nil { // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = await userRepository.findById(userId);
    await userRepository.updateName(getName(user)); // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    $user = $userRepository->findById($userId);
    $userRepository->updateName(getName($user)); // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
    ```

#### ▼ よりよい実装（リポジトリに Save を書く）

User オブジェクトが振る舞いのビジネスロジックをもち、Repository は永続化ロジックをもつので、責務を区別できている

責務さえ区別できていれば、名前は Save や Store、それこそ Update でもよい

=== "Go"

    ```go title="Go の場合の実装例"
    type UserRepositoryInterface interface {
    	FindById(id UserId) (*User, error)
    	Save(user *User) error
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    type UserRepositoryInterface = {
      findById: (id: UserId) => Promise<User>;
      save: (user: User) => Promise<void>;
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    interface UserRepositoryInterface
    {
        public function findById(UserId $id): ?User;

        public function save(User $user): void;
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    user, err := userRepository.FindById(userId)
    if err != nil {
    	return err
    }
    updatedUser := changeName(user, newName)                 // ユーザーオブジェクトが自分でユーザー名の状態を変更する
    if err := userRepository.Save(updatedUser); err != nil { // リポジトリは、状態の変更されたユーザーオブジェクトを保存するだけ
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = await userRepository.findById(userId);
    const updatedUser = changeName(user, newName); // ユーザーオブジェクトが自分でユーザー名の状態を変更する
    await userRepository.save(updatedUser); // リポジトリは、状態の変更されたユーザーオブジェクトを保存するだけ
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    $user = $userRepository->findById($userId);
    $updatedUser = changeName($user, $newName); // ユーザーオブジェクトが自分でユーザー名の状態を変更する
    $userRepository->save($updatedUser); // リポジトリは、状態の変更されたユーザーオブジェクトを保存するだけ
    ```

<br>

## 03. リポジトリで実装するべきロジックの見つけ方

- DB に関するロジック（例：DB 操作、ファイル操作）
- 外部 API に関するロジック（例：HTTP ハンドラー）

<br>
