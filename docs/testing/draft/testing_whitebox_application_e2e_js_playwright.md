---
title: 【IT技術の知見】Playwright＠E2Eテスト
description: Playwright＠E2Eテストの知見を記録しています。
---

# Playwright＠E2Eテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### JavaScriptの場合

```bash
# npm を使う場合
$ npm init playwright@latest

# yarn を使う場合
$ yarn create playwright

# pnpm を使う場合
$ pnpm create playwright
```

> - https://playwright.dev/docs/intro#installing-playwright
> - https://zenn.dev/cloud_ace/articles/5024fa2fefcb9f#playwright-%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

<br>

### Pythonの場合

```bash
$ pip install pytest-playwright
```

> - https://playwright.dev/python/docs/intro

<br>

## 02. 設定ファイル

`playwright.config.ts`ファイルに設定する。

> - https://zenn.dev/cloud_ace/articles/5024fa2fefcb9f#playwright-%E3%81%AE%E4%BD%BF%E3%81%84%E6%96%B9

<br>

## 03. シナリオ

### JavaScriptの場合

実際のユーザーを模した一連の操作をJavaScriptのコードで表現する。

```javascript
import {test, expect} from "@playwright/test";

test("Home ページレンダリンテスト", async ({page}) => {
  // Home ページにアクセス
  await page.goto("http://localhost:3000");

  // 'All'タブがアクティブになっていることを確認
  await expect(page.locator(".post__navigation--active")).toHaveText("All");

  // 'All'タブをクリック該当ページに遷移
  await page.locator(".post__navigation--active").click();

  // 各ページに遷移したことを確認
  const postLinks = await page.locator(".post__box a").all();

  // 各 post のリンクをクリックして、post ページに遷移
  for (const link of postLinks) {
    await link.click();

    // post ページに遷移したことを確認
    await expect(page.locator(".post__title")).toHaveText(
      "Lorem ipsum dolor sit amet",
    );

    // ブラウザの戻るボタンをクリックして、Home ページに戻る
    await page.goBack();
  }

  // Footer のリンクをクリックして、該当ページに遷移
  await page.locator('footer a:has-text ("write")').click();
  await expect(page).toHaveURL("http://localhost:3000/posts/new");

  await page.goBack();
  await page.locator('footer a:has-text("posts")').click();
  await expect(page).toHaveURL("http://localhost:3000/posts");

  await page.goBack();
  await page.locator('footer a:has-text("profile")').click();
  await expect(page).toHaveURL("http://localhost:3000/profile");
});

test("PostDetail ページレンダリン", async ({page}) => {
  // PostDetail ページにアクセス
  await page.goto("http://localhost:3000/posts/0");

  // Expect post__detail クラス名を持つ要素が存在することを確認
  const postDetailElement = await page.locator(".post__detail").first();
  expect(await postDetailElement.isVisible()).toBe(true);

  // post__title クラス名を持つ要素を取得
  const postTitleElement = await page.locator(".post__title").first();

  // post__author-name クラス名を持つ要素が存在することを確認
  expect(await postTitleElement.isVisible()).toBe(true);

  // post__author-name クラス名を持つ要素を取得
  const authorNameElement = await page.locator(".post__author-name").first();

  // post__author-name クラス名を持つ要素が存在することを確認
  expect(await authorNameElement.isVisible()).toBe(true);
});

test("Post タイトルと作成者確認", async ({page}) => {
  // PostDetail ページにアクセス add
  await page.goto("http://localhost:3000/posts/0");

  // posto__title クラス名を持つ要素のテキストを取得
  const postTitle = await page.textContent(".post__title");

  // post__author-name クラス名を持つ要素のテキストを取得
  const authorName = await page.textContent(".post__author-name");

  // post__title クラス名を持つ要素のテキストが正しいことを確認
  expect(postTitle).toContain("Lorem ipsum dolor sit amet");
  expect(authorName).toContain("kim");
});
```

> - https://zenn.dev/cloud_ace/articles/5024fa2fefcb9f#playwright-%E3%81%A7%E3%83%86%E3%82%B9%E3%83%88%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E4%BD%9C%E6%88%90-(%E5%AE%9F%E8%B7%B5)

<br>

### Pythonの場合

実際のユーザーを模した一連の操作をPythonのコードで表現する。

```python
import re
from playwright.sync_api import Page, expect

def test_has_title(page: Page):
    page.goto("https://playwright.dev/")

    expect(page).to_have_title(re.compile("Playwright"))

def test_get_started_link(page: Page):
    page.goto("https://playwright.dev/")

    page.get_by_role("link", name="Get started").click()

    expect(page.get_by_role("heading", name="Installation")).to_be_visible()
```

> - https://playwright.dev/python/docs/intro

<br>
