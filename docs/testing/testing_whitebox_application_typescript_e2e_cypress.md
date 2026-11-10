---
title: 【IT技術の知見】Cypress＠E2Eテスト
description: Cypress＠E2Eテストの知見を記録しています。
---

# Cypress＠E2E テスト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Cypress とは

E2E テストに必要な機能を提供し、テストを実行する。

```typescript
// cypress/e2e/users.cy.ts
describe("ユーザー一覧画面", () => {
  it("ユーザー一覧の見出しを表示できる", () => {
    // 起動済みのアプリケーションにアクセスする
    cy.visit("http://localhost:3000/users");
    // 画面の表示内容を検証する
    cy.get("h1").should("have.text", "ユーザー一覧");
  });
});
```

```bash
# 指定したファイルのテストを実行する
$ npx cypress run --spec "cypress/e2e/users.cy.ts"
```

<br>

## 02. 文法

### data-cy

Cypress のためだけに UI レンダリングロジックにつける要素のこと。

```tsx
export function SubmitButton() {
  return (
    <button type="submit" data-cy="submit">
      保存
    </button>
  );
}
```

<br>

## 03. E2E テストの設計

### テストスイート内の処理ステップ

テストスイートの最初にDB本体とテーブルを作成する。

各テストケースの最初では `TRUNCATE` 文でテーブル内のデータを掃除し、そのうえでテストケースを順番に実行する。

テストスイートはほかと独立しており、並列できる。

```yaml
E2EテストスイートA（ほかのテストスイートとは独立）
│
├── 初回のみ
│   ├── DB本体を作成
│   └── テーブルを作成（yarn prisma migrate dev）
│
├── テストケース1
│   ├── テーブル内のデータのみを掃除（TRUNCATE文）
│   ├── 初期データを投入（dbSeed.ts）
│   └── テストを実行
│
├── テストケース2
│   ├── テーブル内のデータのみを掃除（TRUNCATE文）
│   ├── 初期データを投入（dbSeed.ts）
│   └── テストを実行
│
└── テストケース3
├── テーブル内のデータのみを掃除（TRUNCATE文）
├── 初期データを投入（dbSeed.ts）
└── テストを実行
```

<br>

### テストスイート、テストケース

`describe()` 関数を使用して、テストスイートを定義できる。

テストスイートは階層的に定義でき、最大２階層まではあってもよい。

```typescript
describe("<パブリックな関数名>", async () => {

  describe("<テストスイートの種別>", async () => {

    test("<テストケース名>", async () => {
    });
  });
});
```

<br>

### テストケースの設計

#### ▼ 正常系、異常系、境界値

正常系、異常系、境界値のテストケースをテストスイートの種別におく。

```typescript
describe("<パブリックな関数名>", async () => {

  describe("<テストスイートの種別>", async () => {

    // 正常系
    test("<テストケース名>", async () => {

    });
    // 異常系
    test("<テストケース名>", async () => {

    });
    // 境界値
    test("<テストケース名>", async () => {

    });
  });
});
```

```typescript
describe("<パブリックな関数名>", async () => {

  describe("<テストスイートの種別>", async () => {

    test("正常系：<テストケース名>", async () => {

    });
    test("異常系：<テストケース名>", async () => {

    });
    test("境界値：<テストケース名>", async () => {

    });
  });
});
```

#### ▼ ファイルの命名


| ファイル名パターン | 用途 |
|---|---|
| `<リソース名>.cy.ts`（単数形） | 単一リソースの詳細表示・作成・編集・削除 |
| `<リソース名>s.cy.ts`（複数形） | 一覧表示・検索・フィルタリング |

```text
cypress/
└── e2e/
    ├── user.cy.ts      # ユーザーの詳細表示・作成・編集・削除
    ├── users.cy.ts     # ユーザーの一覧表示・検索・フィルタリング
    ├── project.cy.ts   # プロジェクトの詳細表示・作成・編集・削除
    └── projects.cy.ts  # プロジェクトの一覧表示・検索・フィルタリング
```

#### ▼ テストケースの命名

`test()` 関数と `it()` 関数は、振る舞いの主語（濁した主語）としての `it` または `test` として見ることができる。

つぎのように命名すると、`it` または `test` がテストケース名の主語になって、振る舞いに着目してる感がでる。

例えば、`<期待される動作> when <入力内容>` で命名する。

```typescript
describe("<テストスイート>", () => {
  // テストケース
  test("should return user when id is valid", () => {});
});
```

Cypress のドキュメントに BDD（振る舞い駆動開発）の記載がある。

> [Writing and organizing Cypress tests \| Cypress Documentation](https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests)

#### ▼ E2Eテストの構成

```typescript
import "../../support/commands";

describe("画面名", () => {
  beforeEach(() => {
    // 事前処理
    // 初期データの投入
    cy.task("resetTestDb");

    // ハイドレーションエラーの抑制
    cy.on("uncaught:exception", (error) => {
      console.log(`${error.message}`);
      return false;
    });

    // 画面操作
    // ログイン
    cy.login();
    
    
    // data-cy を使用して要素を見つけ、画面を操作する
    cy.get("[data-cy=projects]").click();
    
    // 閲覧系：
    // 閲覧画面に遷移 -> 閲覧操作 -> 画面結果と期待値の照合
    //
    // 登録系：
    // 登録画面に遷移 -> 登録操作 -> 登録確定/登録しない -> 画面結果と期待値の照合
    //
    // 更新系：
    // 更新画面に遷移 -> 更新操作 -> 更新確定/更新しない -> 画面結果と期待値の照合
    // 
    // 削除系：
    // 削除画面に遷移 -> 削除操作 -> 削除確定/削除しない -> 画面結果と期待値の照合
  });
});
```

<br>

### パフォーマンス改善

#### ▼ データベースの初期化に DELETE を使う

テストケースごとにデータベースを空にする場合、件数の少ないテストデータでは、テーブルを作り直す `TRUNCATE` より行を削除する `DELETE` の方が速い。

```typescript
// テストデータを投入する前に、全テーブルの行を削除する
async function deleteAllRows() {
  const tables = await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
    SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME != '_prisma_migrations'
  `;

  // SET FOREIGN_KEY_CHECKS はコネクション単位の設定のため、同一トランザクションで実行する
  await prisma.$transaction([
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`,
    // TRUNCATE ではなく DELETE で行を削除する
    ...tables.map(({ TABLE_NAME }) =>
      prisma.$executeRawUnsafe(`DELETE FROM \`${TABLE_NAME}\``)
    ),
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`,
  ]);
}

export async function resetTestDb() {
  await deleteAllRows();
  await dbSeed();
}

// cypress.config.ts
setupNodeEvents: (on, config) => {
  on("task", {
    resetTestDb: async () => {
      await resetTestDb();
      return null;
    },
  });
},

// テストスイート
beforeEach(() => {
  // テストケースごとにデータベースを初期化する
  cy.task("resetTestDb");
});
```

#### ▼ 初期データのパスワードハッシュをキャッシュする

初期データのパスワードは固定のため、重いハッシュ計算をテストケースごとに行わず、プロセス内でキャッシュする。

```typescript
// パスワードごとに、ハッシュ計算の結果を保持する
const hashedPasswordCache = new Map<string, Promise<string>>();

function getHashedPassword(password: string) {
  // 2回目以降は、キャッシュしたハッシュを返す
  const cached = hashedPasswordCache.get(password);
  if (cached) return cached;
  const hashedPassword = hashPassword(password);
  hashedPasswordCache.set(password, hashedPassword);
  return hashedPassword;
}

export async function dbSeed() {
  await prisma.user.create({
    data: {
      email: user1.email,
      // 毎回ハッシュ計算せず、キャッシュを使う
      hashedPassword: await getHashedPassword(user1.password),
    },
  });
}

// テストスイート（resetTestDb タスクの中で dbSeed を実行する）
beforeEach(() => {
  cy.task("resetTestDb");
});
```

#### ▼ 認証アーティファクトを cy.session で使い回す

画面操作でログインせず、`cy.request` でログインして得た認証アーティファクトを `cy.session` で保存し、テストケース間で使い回す。

```typescript
// cypress/support/commands.ts
Cypress.Commands.add("login", () => {
  // 初回だけログインし、2回目以降は保存した認証アーティファクトを復元する
  cy.session([user.email], () => {
    // 画面を操作せず、リクエストでログインする
    cy.request({
      method: "POST",
      url: "/signin",
      form: true,
      body: { email: user.email, password: user.password },
    });
    cy.getCookie("__session").should("exist");
  });
});
```

#### ▼ ハイドレーションの完了を検知して待つ

固定時間の `cy.wait` ではなく、ハイドレーションの完了時にアプリケーションが付与する目印を待つ。

```typescript
// アプリケーション側（ルートコンポーネント）
useEffect(() => {
  // ハイドレーションが完了したら、目印を付ける
  document.documentElement.dataset.hydrated = "true";
}, []);

// Cypress 側
Cypress.Commands.add("waitForHydration", () => {
  // 目印が付くまで待つ
  cy.get("html[data-hydrated=true]");
});

// テストスイート
cy.visit("/");
// 固定時間の cy.wait の代わりに使う
cy.waitForHydration();
```

#### ▼ タイムアウトを短くする

タイムアウトが長すぎると失敗したテストケースが長時間待ち続けるため、CI 環境でも余裕のある範囲で短くする。

```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    // 300秒などの長い値ではなく、30〜60秒にする
    defaultCommandTimeout: 30000,
    execTimeout: 60000,
    taskTimeout: 60000,
    pageLoadTimeout: 60000,
    responseTimeout: 60000,
    requestTimeout: 30000,
  },
});
```

#### ▼ テストファイルをジョブに分けて並列実行する

テストファイルをディレクトリ単位で別々の CI ジョブに分け、並列に実行する。

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      # ディレクトリごとにジョブを作り、並列に実行する
      matrix:
        spec: [auth, project]
    steps:
      - uses: actions/checkout@v4
      # ジョブごとに、担当するディレクトリのテストファイルだけを実行する
      - run: npx cypress run --spec "cypress/e2e/${{ matrix.spec }}/*"
```

#### ▼ 動画とスクリーンショットをリトライ時だけ記録する

初回の実行では動画とスクリーンショットを記録せず、リトライ時だけ記録することで、動画のエンコード時間を省く。

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx cypress run
        env:
          # 再実行（2回目以降）のときだけ true になる
          CYPRESS_CI_VIDEO: ${{ github.run_attempt > 1 }}
```

```typescript
// cypress.config.ts
export default defineConfig({
  // 動画を記録するときも圧縮する
  videoCompression: 10,
  e2e: {
    setupNodeEvents: (on, config) => {
      return {
        ...config,
        // 環境変数が true のときだけ、動画とスクリーンショットを記録する
        video: process.env.CYPRESS_CI_VIDEO === "true",
        screenshotOnRunFailure: process.env.CYPRESS_CI_VIDEO === "true",
      };
    },
  },
});
```

#### ▼ 本番用にビルドしたアプリケーションに対して実行する

開発用サーバーではなく、本番用にビルドしたアプリケーションを起動してテストを実行する。

```json
{
  "scripts": {
    // テストの前に、本番用にビルドする
    "pretest:e2e:run": "npm run build",
    // ビルドしたアプリケーションを起動してから、テストを実行する
    "test:e2e:run": "start-server-and-test start http://localhost:8811 \"npx cypress run\""
  }
}
```

#### ▼ Cypress 本体と依存パッケージをキャッシュする

CI ジョブごとに Cypress 本体と依存パッケージをダウンロードし直さないよう、キャッシュする。

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          # Cypress 本体と依存パッケージをキャッシュする
          path: |
            ~/.cache/Cypress
            node_modules
          # 依存パッケージが変わったときだけ、キャッシュを作り直す
          key: ${{ runner.os }}-cypress-${{ hashFiles('yarn.lock') }}
      - run: yarn install --frozen-lockfile
```

<br>


## 04. 事前処理

### cypress.config.ts

```typescript
// 初期データの事前セットを読み込む
import seed from "fixtures/seed.json";

setupNodeEvents: (on, config) => {

  on("task", {
    dbSeed: async () => {
      const { user1, user2 } = seed.user;

      // 初期データをデータベースに挿入する
      await prisma.user.create({
        data: {
          id: user1.id,
          email: user1.email,
          name: user1.name,
        },
      });

      // 初期データをデータベースに挿入する
      await prisma.user.create({
        data: {
          id: user2.id,
          email: user2.email,
          name: user2.name,
        },
      });
    },
    // ...
  });
}
```

<br>

### fixtures/foo/data.json

テストに使用する初期データ（例；DB 値、リクエストパラメーターなど）を設定する。

`fixtures/expected/foo.json` ファイル（期待値データ）の値と同じになる可能性がある。

```yaml
# 初期データ
{
  "users":
    {
      "user1":
        {
          "email": "user1@gmail.com",
          "name": "testUser1",
          "password": "password",
        },
      "user2":
        {
          "email": "user2@gmail.com",
          "name": "testUser2",
          "password": "password",
        },
      ...,
    },
}
```

<br>

### fixtures/expected/foo.json

テストに使用する期待値データを設定する。

`fixtures/foo/data.json` ファイル（初期データ）の値と同じになる可能性がある。

```yaml
{
  "users":
    {
      "user1":
        {
          "email": "user1@gmail.com",
          "name": "testUser1",
          "password": "password",
        },
      "user2":
        {
          "email": "user2@gmail.com",
          "name": "testUser2",
          "password": "password",
        },
      ...,
    },
}
```

<br>

### ヘルパー

```typescript
Cypress.Commands.add("login", () => {
  // fixture/users/data.jsonファイルを使用する
  cy.fixture("users/data").then((seed) => {
    cy.visit("/");
    // 待機することで、Cypressがハイドレーション前に画面をロードし、エラーが発生することを避ける
    cy.wait(1000);
    // アサーションを実行し、実際値と期待値と一致するかを検証する
    cy.url().should("eq", Cypress.config().baseUrl + "/signup");

    // data-cy="signin" 要素をクリックする
    cy.get("[data-cy=signin]").click();
    // URLの実際値を取得し、期待値と一致するかを検証する
    cy.url().should("eq", Cypress.config().baseUrl + "/signin");

    // 初期データをフォームに入力する
    // データベースに挿入したユーザー情報を使用する
    cy.get("[data-cy=email]").type(seed.user.user1.email);
    cy.get("[data-cy=password]").type(seed.user.user1.password);
    // data-cy="submit" 要素をクリックし、送信する
    cy.get("[data-cy=submit]").click();
    // URLの実際値を取得し、期待値と一致するかを検証する
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // data-cy="profileEmail" 要素をクリックする
    cy.get("[data-cy=profile]").click();

    // data-cy="profileName" 要素から実際値を取得し、実際値と期待値と一致するかを検証する
    cy.get("[data-cy=profileName]").should("have.text", seed.user.user1.name);
    // data-cy="profileEmail" 要素から実際値を取得し、実際値と期待値と一致するかを検証する
    cy.get("[data-cy=profileEmail]").should("have.text", seed.user.user1.email);
  });
});
```

<br>

## 05. テストスイート

テストスイートはテストケース (テスト関数) に分類できる。

```typescript
// テストスイート
describe("ユーザーの一覧を表示するテスト", () => {
  // 各テストケースに共通する処理をテスト
  beforeEach(() => {
    // 基本的な初期データをデータベースに挿入する
    cy.exec("yarn ts-node --require tsconfig-paths/register prisma/seed.ts");
    // cypress.config.ts ファイルで定義したdbSeed関数を実行する
    cy.task("dbSeed");
    // テスト用の初期データをデータベースに挿入する
    cy.exec(
      'yarn ts-node --require tsconfig-paths/register "cypress/seed/users.ts"',
    );

    // エラーハンドリングをイベントリスナーとして登録する
    cy.on("uncaught:exception", (error) => {
      console.log(`${error.message}`);
      return false;
    });

    // ヘルパーを使用してログインする
    cy.login();
    // data-cy="users" 要素をクリックする
    cy.get("[data-cy=users]").click();
  });

  // 正常系テストケース
  test("ユーザーの一覧を表示できる", () => {
    // テストケース固有の初期データ
    // fixture/expected/users.jsonファイルを使用する
    cy.fixture("users/data").then((expected) => {
      // URLの実際値を取得し、期待値と一致するかを検証する
      cy.url().should("eq", Cypress.config().baseUrl + "/users");

      // data-cy="userName" 要素から実際値を取得し、実際値と期待値と一致するかを検証する
      cy.get("[data-cy=userName]")
        .its(0)
        .should("contain.text", expected.user1.name);
      // data-cy="userEmail" 要素から実際値を取得し、実際値と期待値と一致するかを検証する
      cy.get("[data-cy=userEmail]")
        .its(0)
        .should("contain.text", expected.user1.email);
    });
  });

  // 正常系テストケース
  test("ページネーションを実行できる", () => {
    // 汎用的な初期データ
    cy.fixture("dbSeed").then((expected) => {
      // テストケース固有の初期データ
      // fixture/expected/users.jsonファイルを使用する
      cy.fixture("users/data").then((expected) => {
        const {user2} = expected.user;
        cy.wait(1000);

        cy.get("[data-cy=next]").click();
        // URLの実際値を取得し、期待値と一致するかを検証する
        cy.url().should("eq", Cypress.config().baseUrl + "/users/?page=2");
        // data-cy="previous" 要素から実際値を取得し、期待値と一致するかを検証する
        cy.get("[data-cy=userName]").its(0).should("contain.text", user2.name);

        // data-cy="previous" 要素をクリックする
        cy.get("[data-cy=previous]").click();
        // アサーションを実行し、実際値と期待値と一致するかを検証する
        cy.url().should("eq", Cypress.config().baseUrl + "/users/?page=1");

        // data-cy="userName" 要素から実際値を取得し、期待値と一致するかを検証する
        cy.get("[data-cy=userName]")
          .its(0)
          .should("contain.text", expected.user1.name);
      });
    });
  });
});
```

<br>
