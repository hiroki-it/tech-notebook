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

ローカル環境用のマイグレーションを実行する。

```bash
$ prisma migrate dev
```

#### ▼ deploy

本番環境用のマイグレーションを実行する。

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

<br>

### db

#### ▼ seed

ローカル環境用の初期データを挿入する。

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

注意点として、DBパスワードに特殊記号が含まれている場合、URLエンコードする必要がある。

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

```typescript
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

function transfer(from: string, to: string, amount: number) {
  // トランザクション
  return prisma.$transaction(async (tx) => {
    // CRUD処理
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

    // CRUD処理
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
  // $transaction関数の実行をtry-catchブロックで囲む
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

## 05. エラー

### エラーのフィールド

いずれのエラーも以下のすべて／一部のフィールドをもつ。

- code
- meta
- message
- clientVersion

> - https://www.prisma.io/docs/orm/reference/error-reference

<br>

### PrismaClientKnownRequestError

Prisma Client がDBに対してクエリを実行してエラーが発生した場合に、それが想定内の何らかのエラーの場合は、PrismaClientKnownRequestErrorに含まれる。

```typescript
// PrismaClient と Prisma 名前空間をインポートする
import {PrismaClient, Prisma} from "@prisma/client";

const prisma = new PrismaClient();

// ユニーク制約違反 (P2002) を発生・ハンドリングする非同期関数
async function createUser(name: string, email: string) {
  console.log(`\n--- ユーザー作成を試行中 (メール: ${email}) ---`);
  try {
    // Prisma 操作を実行する（既に存在するメールアドレスで作成を試みることを想定）
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email, // このメールアドレスが既に存在する場合、P2002 エラーが発生する
      },
    });
    console.log("ユーザー作成成功:", newUser);
    return newUser;
  } catch (error) {
    // キャッチしたエラーが PrismaClientKnownRequestError であるかチェックする
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Known Error が発生した:");
      console.error("エラーコード:", error.code);
      // エラーメタ情報には、違反したフィールドなどの詳細が含まれる場合がある
      console.error("エラーメタ情報:", error.meta);

      // エラーコードが P2002 (ユニーク制約違反) であるかチェックする
      if (error.code === "P2002") {
        // 違反したフィールド名を取得する（meta に含まれる場合）
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(", ")
          : error.meta?.target;
        console.error(
          `ユニーク制約違反が発生した: フィールド "${target}" は既に使用されている`,
        );
        // ユーザーに対するエラーを例外としてスローする
        throw new Error(
          `入力された${target ? target + " " : ""}は既に使用されている`,
        );
      } else {
        // Prismaの他のエラーの場合はそのままスローする
        console.error(
          `未ハンドリングの Prisma Known Error (${error.code}):`,
          error.message,
        );
        throw new Error("データベース操作中に予期しないエラーが発生した");
      }
    } else {
      // Prismaのエラーではない場合、予期せぬエラーとして例外をスローする
      console.error("予期しないエラーが発生した:", error);
      throw new Error("システムエラーが発生した");
    }
  } finally {
    // 接続を閉じる
    await prisma.$disconnect();
  }
}

// 例の実行 (同じメールアドレスを複数回実行すると P2002 が発生する)
// prisma migrate reset などでデータベースをリセットしない限り、2回目以降の実行でエラーになる
// createUser('Alice', 'alice@example.com');
// createUser('Bob', 'alice@example.com'); // P2002 エラーが発生する
```

> - https://www.prisma.io/docs/orm/reference/error-reference#prismaclientknownrequesterror

<br>
