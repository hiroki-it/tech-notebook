---
title: 【IT技術の知見】Prisma＠SQLパッケージ
description: Prisma＠SQLパッケージの知見を記録しています。
---

# Prisma＠SQLパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prismaの仕組み

PrismaClient (JavaScriptパッケージ) は、クエリエンジン (バイナリ) に接続リクエストを送信する。

クエリエンジンは接続プールを作成し、プール内の接続を使用してDBに接続する。

接続が維持されている間、これを再利用して複数のクエリを実行する。

PrismaClientは、クエリエンジンに切断リクエストを送信する。

クエリエンジンは、DBとの接続を破棄する。

もし接続プール上の接続が全て使用されてしまった場合、いずれかの接続が解放されるまで待機する必要がある。

この時に、送信されたリクエストは待機キューで解放を待つ。

![architecture_prisma](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_prisma.png)

> - https://www.prisma.io/docs/orm/more/under-the-hood/engines
> - https://zenn.dev/cloudbase/articles/65b9f6e4f9ae05#%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3

<br>

## 02. セットアップ

### アップグレード

`@prisma/client`パッケージと`prisma`パッケージの両方をアップグレードする必要がある。

```bash
$ yarn upgrade @prisma/client@<バージョン>

$ yarn upgrade prisma<バージョン>
```

> - https://github.com/prisma/prisma/issues/6372#issuecomment-812998403

<br>

## 02. コマンド

### generate

Prismaスキーマからクライアントを作成する。

クライアントを使用して、DBに接続できる。

マイグレーションや初期データを挿入前に必要である。

```bash
$ yarn prisma generate

✔ Generated Prisma Client (4.16.2 | library) to ./node_modules/@prisma/client in 177ms
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

> - https://learningift.com/blogs/h0gbL56h1iq/%E3%80%90%E5%88%9D%E5%BF%83%E8%80%85%E7%94%A8%E3%80%91prisma%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6#part5

<br>

### migrate

#### ▼ dev

ローカルマシン用のマイグレーションを実行し、また差分を埋めるSQLファイルを発行する。

```bash
$ prisma migrate dev
```

マイグレーションを実行せず、差分を埋めるSQLファイルのみを発行する。

```bash
$ prisma migrate dev --create-only
```

#### ▼ deploy

本番環境用のマイグレーションを実行し、また差分を埋めるSQLファイルを発行する。

```bash
$ prisma migrate deploy
```

> - https://tech-blog.s-yoshiki.com/entry/315

#### ▼ reset

初期の状態まで、全てロールバックする。

`--force`オプションで警告を無視できる。

```bash
$ prisma migrate reset --force
```

> - https://tech-blog.s-yoshiki.com/entry/315

#### ▼ rollback

prismaには、rollbackのコマンドがなく、ロールバック用のSQLを実行する必要がある。

```bash
$ prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > rollback.sql
```

```sql
-- rollback.sqlの例
-- DropForeignKey
ALTER TABLE `UserDetail` DROP FOREIGN KEY `UserDetail_userId_fkey`;

-- DropTable
DROP TABLE `UserDetail`;
```

> - https://qiita.com/ore88ore/items/d09b9035af75ff4e9456#%E9%81%A9%E7%94%A8%E3%81%97%E3%81%9F%E3%83%9E%E3%82%A4%E3%82%B0%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E3%83%AD%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF%E3%81%99%E3%82%8B

<br>

### db

#### ▼ seed

ローカルマシン用の初期データを挿入する。

`seed.ts`ファイルにある`seed`関数を実行する。

```bash
$ yarn prisma db seed
```

<br>

## 03. スキーマ

### datasource

#### ▼ datasourceとは

DB情報を設定する。

#### ▼ url

プロトコル名として、`mysql`や`postgresql`を設定できる。

```javascript
datasource db {
  provider = "<プロトコル名>"
  // 例：mysql://user:password@<AWS Auroraクラスターのリーダーエンドポイント>:3306/foo
  url      = "<プロトコル名>://<DBユーザー>:<DBパスワード>@<DBホスト>:<ポート番号>/<DB名>?schema=public&connection_limit=30&pool_timeout=60"
}
```

注意点として、Prismaの仕様で、DBパスワードに特殊記号が含まれている場合にはURLエンコードする必要がある。

```bash
$ alias urldecode='python3 -c "import sys, urllib.parse as ul; \
    print(ul.unquote_plus(sys.argv[1]))"'

$ urldecode 'q+werty%3D%2F%3B'
q werty=/;
```

```bash
$ alias urlencode='python3 -c "import sys, urllib.parse as ul; \
    print (ul.quote_plus(sys.argv[1]))"'

$ urlencode 'q werty=/;'
q+werty%3D%2F%3B
```

> - https://www.prisma.io/docs/orm/reference/connection-urls
> - https://unix.stackexchange.com/a/159254

#### ▼ urlパラメーター

URLのパラメーターとして、以下などを設定できる。

- コネションプールの接続上限数 (`connection_limit`)
- 接続プール内の接続が解放されるまでキューで待機する時間 (`pool_timeout`)

> - https://zenn.dev/cloudbase/articles/65b9f6e4f9ae05#prismaclient%E3%81%AB%E6%B8%A1%E3%81%99datasource-url%E3%81%AE%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF
> - https://dev.classmethod.jp/articles/prisma-engines-connection-pooling-parameters/#pool_timeout

<br>

### generator

```javascript
generator client {
  provider   = "prisma-client-js"
  engineType = "library"
}
```

<br>

## 04. PrismaClient

### $transaction

#### ▼ $transaction

複数のクエリ処理を実行するトランザクションを定義する。

トランザクション内に含まれる一連の処理（トランザクション開始、コミット、ロールバック）を管理してくれる。

```typescript
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

function transfer(from: string, to: string, amount: number) {
  // トランザクション
  return prisma.$transaction(async (tx) => {
    // 1つ目のCRUD処理
    const sender = await tx.account.update({
      data: {
        balance: {
          decrement: amount,
        },
      },
      where: {
        email: from,
      },
    });

    if (sender.balance < 0) {
      throw new Error(`${from} doesn't have enough to send ${amount}`);
    }

    // 2つ目のCRUD処理
    const recipient = await tx.account.update({
      data: {
        balance: {
          increment: amount,
        },
      },
      where: {
        email: to,
      },
    });

    return recipient;
  });
}

async function main() {
  // $transaction関数の実行をtry-catchで囲む
  try {
    await transfer("alice@prisma.io", "bob@prisma.io", 100);
    await transfer("alice@prisma.io", "bob@prisma.io", 100);
  } catch (err) {}
}

main();
```

> - https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions

#### ▼ オプション

```typescript
import {PrismaClient} from '@prisma/client'

// トランザクションのオプションはトランザクション全体で統一する
let prismaClientOption = {
  // データを取得するまでのタイムアウト時間 (デフォルトは2000ms)
  transactionOptions: {
    // 他のトランザクションによる排他制御ロックが解除されるまでの待機時間 (デフォルトは2000ms)
    maxWait: 5000,
    // ロールバックを含めて全体が完了するまでのタイムアウト時間 (デフォルトは5000ms)
    timeout: 10000,
    // トランザクションの分離レベル
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
}

// Prismaクライアントに設定する
const prisma = new PrismaClient(prismaClientOption)

function transfer(...) {

  return prisma.$transaction(
      async (tx) => {
        // CRUD処理
      })
}

async function main() {

  try {
    await transfer(...)
  } catch (err) {

  }
}

main()
```

```javascript
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

let prismaClientOption = {
  // データを取得するまでのタイムアウト時間 (デフォルトは2000ms)
  transactionOptions: {
    // 他のトランザクションによる排他制御ロックが解除されるまでの待機時間 (デフォルトは2000ms)
    maxWait: 5000,
    // ロールバックを含めて全体が完了するまでのタイムアウト時間 (デフォルトは5000ms)
    timeout: 10000,
    // トランザクションの分離レベル
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
}

function transfer(...) {

  return prisma.$transaction(
      async (tx) => {
        // CRUD処理
      },
      // トランザクションに個別に設定する
      prismaClientOption
  )
}

async function main() {

  try {
    await transfer(...)
  } catch (err) {

  }
}

main()
```

> - https://www.prisma.io/docs/orm/prisma-client/queries/transactions#transaction-options

<br>

## 05. Seed

### Seedとは

`yarn prisma db`コマンドでDBに挿入できる初期データである。

開発環境、CI環境のユニットテストやE2Eテスト、ステージング環境の動作確認で使用できる。

本番環境では基本的に使用しない。

ただし、roleテーブルのようなレコードが今後滅多に増えず、変わらないテーブルであれば、テーブルの初期構築時にレコードを楽して用意するために使用することはある。

<br>

### seed.ts

初期データの定義と挿入を実装する。

```typescript
const users = [
  {
    email: "foo@gmail.com",
    name: "foo",
    hashedPassword: "password",
    roleName: "Administrator",
  },
  {
    email: "bar@gmail.com",
    name: "bar",
    hashedPassword: "password",
    roleName: "Operator",
  },
];

const roles = [
  {
    name: "Administrator",
    scope: "All",
  },
  {
    name: "Operator",
    scope: "ReadOnly",
  },
];

async function seed() {
  // 開発環境とCI環境の両方で初期データを挿入する
  await Promise.all(roles.map((user) => prisma.user.create({data: {...user}})));

  await Promise.all(
    policies.map((role) => prisma.role.create({data: {...role}})),
  );

  // 開発環境でのみ初期データを挿入する
  if (process.env.NODE_ENV === "development") {
    // ここで、開発環境でのみ一部の初期データを挿入する
  }

  logger.info("初期データの挿入に成功しました");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

<br>

## 06. エラー

### Prisma

Prismaは、トランザクションが何らかの理由で失敗した場合に、固有のエラーを返却する。

エラーをキャッチし、開発者向けの例外としてスローする必要がある。

また、より上のレイヤーに伝播し、ユーザーインターフェースのレイヤーでは、ユーザー向けのエラーメッセージとして吸収する。

<br>

### エラーのフィールド

いずれのエラーも以下のすべて／一部のフィールドを持つ。

- code
- meta
- message
- clientVersion

> - https://www.prisma.io/docs/orm/reference/error-reference

<br>

### PrismaClientKnownRequestError

#### ▼ PrismaClientKnownRequestErrorとは

Prisma Client がDBに対してトランザクションを実行しエラーが発生したとする。

それが想定内の何らかのエラーの場合は、PrismaClientKnownRequestErrorに含まれる。

> - https://www.prisma.io/docs/orm/reference/error-reference#prismaclientknownrequesterror

#### ▼ インフラストラクチャレイヤーで`try-catch`を実行する

```typescript
// ユースケースレイヤー
import {PrismaClient, Prisma} from "@prisma/client";

class UserUseCase {
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  // ユーザーを作成する
  public async createUser(email: string, name: string) {
    try {
      const newUser = await prisma.user.create({
        data: {
          email: email,
          name: name,
        },
      });
      return newUser;
    } catch (e) {
      // 例外が PrismaClientKnownRequestError であるかチェックする
      // さまざまなエラーコード (P2002, P2025など) になる可能性がある
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          `[Prisma Error] Code: ${e.code}, Message: ${
            e.message
          }, Meta: ${JSON.stringify(e.meta)}`,
        );
        throw new Error("データベース処理中に不明なエラーが発生しました");

        // エラーコードのない例外の場合、PrismaClientUnknownRequestErrorになる
      } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
        console.error(
          `[Prisma Error] Message: ${e.message}, Meta: ${JSON.stringify(
            e.meta,
          )}`,
        );
        throw new Error("データベース処理中に不明なエラーが発生しました");
      } else {
        // それ以外の場合、予期せぬエラーとして例外をスローする
        console.error(
          `[Prisma Error] Message: ${e.message}, Meta: ${JSON.stringify(
            e.meta,
          )}`,
        );
        throw new Error("システムエラーが発生しました");
      }
    } finally {
      // 接続を閉じる
      await prisma.$disconnect();
    }
  }
}
```

#### ▼ インフラストラクチャレイヤーより上位のレイヤーで`try-catch`を実行する

```typescript
// インフラストラクチャレイヤー
import {PrismaClient, Prisma} from "@prisma/client";

class UserUseCase {
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  public async createUser(email: string, name: string) {
    try {
      user = this.repository.createUser(email, name);
      return user;
    } catch (e) {
      // 例外が PrismaClientKnownRequestError であるかチェックする
      // さまざまなエラーコード (P2002, P2025など) になる可能性がある
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        console.error(
          `[Prisma Error] Code: ${e.code}, Message: ${
            e.message
          }, Meta: ${JSON.stringify(e.meta)}`,
        );
        throw new Error("データベース処理中に不明なエラーが発生しました");

        // エラーコードのない例外の場合、PrismaClientUnknownRequestErrorになる
      } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
        console.error(
          `[Prisma Error] Message: ${e.message}, Meta: ${JSON.stringify(
            e.meta,
          )}`,
        );
        throw new Error("データベース処理中に不明なエラーが発生しました");
      } else {
        // それ以外の場合、予期せぬエラーとして例外をスローする
        console.error(
          `[Prisma Error] Message: ${e.message}, Meta: ${JSON.stringify(
            e.meta,
          )}`,
        );
        throw new Error("システムエラーが発生しました");
      }
    }
  }
}
```

```typescript
// リポジトリ
import {PrismaClient, Prisma} from "@prisma/client";

class UserRepository {

  public prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  // ユーザーを作成する
  async function createUser(email: string, name: string) {

    const user = await this.prisma.user.create({
      data: {
        email: email,
        name: name,
      },
    });

    return user;
  }
}
```

<br>
