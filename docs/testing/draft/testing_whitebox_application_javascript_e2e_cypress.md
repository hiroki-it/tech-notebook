---
title: 【IT技術の知見】Cypress＠E2Eテスト
description: Cypress＠E2Eテストの知見を記録しています。
---

# Cypress＠E2Eテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 事前処理

### cypress.config.ts

```typescript
// テストデータの事前セットを読み込む
import seed from "fixtures/seed.json";

setupNodeEvents: (on, config) => {

  on("task", {
    dbSeed: async () => {
      const { user1, user2 } = seed.user;

      // テストデータをデータベースに投入する
      await prisma.user.create({
        data: {
          id: user1.id,
          email: user1.email,
          name: user1.name,
        },
      });

      // テストデータをデータベースに投入する
      await prisma.user.create({
        data: {
          id: user2.id,
          email: user2.email,
          name: user2.name,
        },
      });
    },
    ...
  });
}
```

<br>

### fixtures/foo/data.json

テストに使用する初期データ（例；DB値、リクエストパラメーターなど）を設定する。

`fixtures/expected/foo.json`ファイル（期待値データ）の値と同じになる可能性がある。

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

`fixtures/foo/data.json`ファイル（初期データ）の値と同じになる可能性がある。

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
    // データベースに投入したユーザー情報を使用する
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

## 02. テストスイート

テストスイートはテストケース (テスト関数) に分類できる。

```typescript
// テストスイート
describe("ユーザーの一覧を表示するテスト", () => {
  // 各テストケースに共通する処理をテスト
  beforeEach(() => {
    // 基本的な初期データをデータベースに投入する
    cy.exec("yarn ts-node --require tsconfig-paths/register prisma/seed.ts");
    // cypress.config.ts ファイルで定義したdbSeed関数を実行する
    cy.task("dbSeed");
    // テスト用の初期データをデータベースに投入する
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
  it("ユーザーの一覧を表示できる", () => {
    // テストケース固有のテストデータ
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
  it("ページネーションを実行できる", () => {
    // 汎用的なテストデータ
    cy.fixture("dbSeed").then((expected) => {
      // テストケース固有のテストデータ
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
