---
title: 【IT技術の知見】21章＠ドメイン駆動設計実践入門
description: 21章＠ドメイン駆動設計実践入門の知見を記録しています。
---

# 21章＠ドメイン駆動設計実践入門

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 概要

- 21-1. イベントソーシングの定義
- 21-2. ステートソーシングとイベントソーシングの違い
- 21-3. ステートソーシングの課題
- 21-4. イベントソーシングの課題と使用場面
- 21-5. レビュー機能をイベントソーシングで設計してみる
- 21-7. イベントソーシングの課題をスナップショット処理で解決
- 21-8. イベントソーシングの課題を CQRS パターンで解決

## 21-1 イベントソーシングとは

イベントソーシングとは、現在の状態ではなく、状態変化を引き起こしたイベントの連続を保存する手法である。

- 起きた事実をすべて記録として残す
- 起きた事実の記録から現在や過去の状態を導出する

これにより、状態に至る過程を追跡できる。

## 21-2 イベントソーシングの本質

### 21-2-1 ステートベースとイベントベースの比較

ステートベース（≒ ステートソーシング）とイベントベース（≒ イベントソーシング）の違いは、以下のとおりである。

イベントソーシングでは、イベントを真のデータとして扱う。

| 観点               | ステートベース               | イベントベース                   |
| ------------------ | ---------------------------- | -------------------------------- |
| **保存対象**       | 現在の状態                   | 状態の変更を表すイベント         |
| **更新時の扱い**   | 前の状態は上書きされる       | イベントが追記される             |
| **現在状態の取得** | 保存済みの状態をそのまま読む | イベントを順番に適用して導出する |

```typescript
// 解説を補足するために長谷川で追加

type Review = {
  reviewId: string;
  bookId: string;
  rating: number;
  comment: string;
};

// ステートソーシングに基づいてモデリング
const review: Review = {
  reviewId: "REV001",
  bookId: "B001",
  rating: 5,
  comment:
    "実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします",
};
```

```typescript
// 解説を補足するために長谷川で追加

type ReviewEvent =
  | {
      type: "ReviewCreated";
      payload: {
        reviewId: string;
        bookId: string;
        rating: number;
        comment: string;
      };
    }
  | {type: "ReviewCommentEdited"; payload: {comment: string}}
  | {type: "ReviewRatingChanged"; payload: {rating: number}};

// イベントソーシングに基づいてモデリング
const reviewEvents: ReviewEvent[] = [
  {
    type: "ReviewCreated",
    payload: {
      reviewId: "REV001",
      bookId: "B001",
      rating: 4,
      comment: "実践的な内容で良かったです",
    },
  },
  {
    type: "ReviewCommentEdited",
    payload: {
      comment: "実践的な内容で良かったです。ただし初心者には少し難しいかも",
    },
  },
  {
    type: "ReviewCommentEdited",
    payload: {
      comment:
        "実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします",
    },
  },
  {
    type: "ReviewRatingChanged",
    payload: {
      rating: 5,
    },
  },
];
```

### 21-2-2 レビューの例（現在の状態 vs イベントの記録）

ステートソーシングでは、レビューの現在状態だけを保存する。

| レビューID | 書籍ID | 投稿者名   | 評価 | コメント                                                                                                                               | 抽出されたRecommendedBook              |
| ---------- | ------ | ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `REV001`   | `B001` | `山田太郎` | `5`  | `実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします` | `["HTML/CSS 入門", "JavaScript 基礎"]` |

一方、イベントソーシングではレビューの変化そのものを記録する。

| イベントID | レビューID | ドメインイベント種別  | イベント内容                                                                                                                                     | 発生日時     |
| ---------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `E001`     | `REV001`   | `ReviewCreated`       | `評価:4, コメント: 実践的な内容で良かったです`                                                                                                   | `2023-01-01` |
| `E002`     | `REV001`   | `ReviewCommentEdited` | `コメント: 実践的な内容で良かったです。ただし初心者には少し難しいかも`                                                                           | `2023-01-03` |
| `E003`     | `REV001`   | `ReviewCommentEdited` | `コメント: 実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします` | `2023-01-05` |
| `E004`     | `REV001`   | `ReviewRatingChanged` | `評価:5`                                                                                                                                         | `2023-01-07` |

イベント履歴があると、各時点の状態を取得できる。

- 2023-01-01 時点: 評価 4、RecommendedBook なし
- 2023-01-03 時点: 評価 4、RecommendedBook なし
- 2023-01-05 時点: 評価 4、RecommendedBook `["HTML/CSS 入門", "JavaScript 基礎"]`
- 2023-01-07 時点: 評価 5、RecommendedBook `["HTML/CSS 入門", "JavaScript 基礎"]`

現在状態だけでなく、変化の過程にも価値がある。

### 21-2-3 Git のコミット履歴の例

イベントソーシングの例として、Git がある。

Git では、ファイルの最新状態だけではなく、変更履歴と変更意図をコミットとして保持する。

```text
commit 87a56139b3a4f2e5d8e6d9b5b7a5a4c3
Author: Tom Johnson <tom@example.com>
Date:   Mon Jan 4 14:23:45 2023 +0900

    不要なコードを削除

commit 72c41d59f288a1b2c3d4e5f6a7b8c9d0
Author: Tom Johnson <tom@example.com>
Date:   Sun Jan 3 10:15:30 2023 +0900

    ログイン機能を追加
```

## 21-3 現状の課題：データの二重管理

前章の Outbox パターンには、次の課題がある。

- 集約の状態とドメインイベントの両方を永続化する必要がある
- ビジネスデータの保存とドメインイベント保存で同じ情報を二重管理する
- 2 種類のデータストアを管理する必要があり、開発と運用が複雑になる

イベントソーシングでは、ドメインイベントを唯一の情報源にすることで、この二重管理を避ける。

## 21-4 イベントソーシングのデメリットと課題

### 21-4-1 実装の複雑性

イベントソーシングでは、各イベント種別ごとに状態変更ロジックが必要である。

また、イベントソーシングでは Review 集約の現在状態そのものは保存せず、起きた出来事の履歴を保存する。

そのため、オブジェクトの最新の状態を得るにはその履歴を順番にたどる必要があり、履歴数が多くなるほど性能問題に影響する。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

async function getReview(reviewId: ReviewId): Promise<ReviewState> {
  // オブジェクトの最新の状態を得るには、そのReview集約に紐づく過去の履歴をすべてたどる必要がある
  const events = await eventStore.findByAggregateId(reviewId);

  let state = ReviewState.initial();

  // 取得したイベントを古い順に適用してオブジェクトの最新の状態を取得する必要があり、イベント種別が増えるほどこの分岐も増えていく
  for (const event of events) {
    switch (event.type) {
      case "ReviewCreated":
        state = state.create(event.payload);
        break;
      case "ReviewCommentEdited":
        state = state.editComment(event.payload.comment);
        break;
      case "ReviewRatingChanged":
        state = state.changeRating(event.payload.rating);
        break;
    }
  }

  return state;
}
```

### 21-4-2 クエリの複雑性とパフォーマンスの問題

イベントソーシングでが、異なる集約を横断する処理では負荷が大きくなる。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

async function findTop3RecommendedBooks(bookId: BookId): Promise<string[]> {
  const reviewIds = await reviewLocator.findByBookId(bookId);

  // 対象Bookに紐づく全Reviewをたどってそれぞれのイベントを読み出し、各オブジェクトの最新の状態を取得しているため、異なる集約を横断する処理ではコストが大きくなりやすい
  const reviews = await Promise.all(
    reviewIds.map(async (reviewId) => {
      const events = await eventStore.findByAggregateId(reviewId);
      return replay(events);
    }),
  );

  return aggregateRecommendedBooks(reviews).slice(0, 3);
}
```

### 21-4-3 開発チームの学習コスト

イベントソーシングは、新しい概念（イベント設計、状態再構築、イベントスキーマ管理など）の理解が必要であり、学習コストが高い。

| 観点               | ステートソーシング | イベントソーシング   |
| ------------------ | ------------------ | -------------------- |
| **設計対象**       | 状態設計           | イベント設計         |
| **状態再構築方式** | 状態読取           | 状態再構築           |
| **スキーマ管理**   | 状態スキーマ管理   | イベントスキーマ管理 |

### 21-4-4 適用判断の重要性

まずはステートソーシングで設計する。

任意時点の状態再現や後からの再分析が必要になった場合は、イベントソーシングの導入を検討する。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

type Review = {
  reviewId: string;
  bookId: string;
  rating: number;
  comment: string;
};

// まずはステートソーシングでReview集約を設計する
const review: Review = {
  reviewId: "REV001",
  bookId: "B001",
  rating: 5,
  comment:
    "実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします",
};
```

```typescript
// イベントソーシングを導入したくなったら、Review集約をイベント列で表現する
type ReviewEvent =
  | {
      type: "ReviewCreated";
      payload: {
        reviewId: string;
        bookId: string;
        rating: number;
        comment: string;
      };
    }
  | {type: "ReviewCommentEdited"; payload: {comment: string}}
  | {type: "ReviewRatingChanged"; payload: {rating: number}};

const reviewEvents: ReviewEvent[] = [
  {
    // 初回作成時点の状態をイベントとして残す
    type: "ReviewCreated",
    payload: {
      reviewId: "REV001",
      bookId: "B001",
      rating: 4,
      comment: "実践的な内容で良かったです",
    },
  },
  {
    // コメント変更を上書きではなくイベントとして追加する
    type: "ReviewCommentEdited",
    payload: {
      comment: "実践的な内容で良かったです。ただし初心者には少し難しいかも",
    },
  },
  {
    // さらにコメント変更をイベントとして追加する
    type: "ReviewCommentEdited",
    payload: {
      comment:
        "実践的な内容で良かったです。ただし初心者には少し難しいかも。『HTML/CSS 入門』『JavaScript 基礎』を読んでから読むことをおすすめします",
    },
  },
  {
    // 評価変更もイベントとして追加する
    type: "ReviewRatingChanged",
    payload: {
      rating: 5,
    },
  },
];
```

## 21-5 レビュー集約でのイベントソーシング適用

### 21-5-1 多様な状態導出による価値創出

蓄積されたイベント履歴から、後から定義した新しい観点や指標で状態を取得し分析できる。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

// 新しい機能として、信頼性スコア関数を追加できる
async function calculateTrustScoreAt(
  reviewId: ReviewId,
  at: Date,
): Promise<number> {
  const events = await eventStore.findUntil(reviewId, at);
  const review = replay(events);

  let score = 100;

  if (review.commentEditCount >= 3) score -= 20;
  if (review.ratingChangeCount >= 2) score -= 30;
  if (review.comment.length < 20) score -= 10;

  return score;
}
```

### 21-5-2 変更の透明性と監査性の確保

レビュー編集や削除も含めて、起きた事実をすべて記録するため、誰がいつ何を変更したかの履歴が残る。

| EventId  | ReviewId | EventType             | OperatorId | OccurredAt            | Payload                                                                     |
| -------- | -------- | --------------------- | ---------- | --------------------- | --------------------------------------------------------------------------- |
| `EVT001` | `REV001` | `ReviewCreated`       | `USER001`  | `2023-01-01 10:00:00` | `{"rating": 4, "comment": "実践的な内容で良かったです"}`                    |
| `EVT002` | `REV001` | `ReviewCommentEdited` | `USER001`  | `2023-01-03 12:00:00` | `{"comment": "実践的な内容で良かったです。ただし初心者には少し難しいかも"}` |
| `EVT003` | `REV001` | `ReviewRatingChanged` | `USER001`  | `2023-01-05 09:30:00` | `{"rating": 5}`                                                             |
| `EVT004` | `REV001` | `ReviewDeleted`       | `ADMIN001` | `2023-01-07 15:00:00` | `{"reason": "policy violation"}`                                            |

## 21-6 イベントソーシング適用の戦略的判断

### 21-6-1 問題の本質を見極める

「データの履歴が欲しい」だけで採用せず、単純な変更ログで十分なのか、任意時点の完全な状態再現が必要なのかを見極める。

例えば、次のような変更ログテーブル設計ではイベントソーシングを使用していない。

| log_id   | review_id | action   | operator_id | occurred_at           | changed_fields                                                              |
| -------- | --------- | -------- | ----------- | --------------------- | --------------------------------------------------------------------------- |
| `LOG001` | `REV001`  | `CREATE` | `USER001`   | `2023-01-01 10:00:00` | `{"rating": 4, "comment": "実践的な内容で良かったです"}`                    |
| `LOG002` | `REV001`  | `UPDATE` | `USER001`   | `2023-01-03 12:00:00` | `{"comment": "実践的な内容で良かったです。ただし初心者には少し難しいかも"}` |
| `LOG003` | `REV001`  | `UPDATE` | `USER001`   | `2023-01-05 09:30:00` | `{"rating": 5}`                                                             |

### 21-6-2 段階的な意思決定プロセス

イベントソーシングを段階的に導入する。

1. イベントストーミングでドメインイベントを洗い出す
2. 価値が高いと判断した集約で小規模に試す
3. 投資対効果を評価する

### 21-6-3 成功への現実的なアプローチ

導入初期は、ビジネス的に重要で、技術的には比較的シンプルな集約から始める。

従来方式とのハイブリッドアプローチも有効である。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

type AggregatePersistencePolicy = {
  aggregate: string;
  persistence: "state-based" | "event-sourcing";
};

// 同じシステム内で、集約ごとに保存方式を使い分ける
const aggregatePolicies: AggregatePersistencePolicy[] = [
  // Review集約は履歴の価値が高いためイベントソーシングを採用
  {aggregate: "Review集約", persistence: "event-sourcing"},

  // Book集約は現在状態を扱えれば十分なためステートソーシングを採用
  {aggregate: "Book集約", persistence: "state-based"},
];
```

## 21-7 パフォーマンスとスケーラビリティ

### 21-7-1 スナップショットの基本概念

イベントソーシングではオブジェクトの現在の状態を保存していないため、最新の状態を取得する際に過去の履歴をたどる必要があり、これは性能問題につながる可能性がある。

この課題はスナップショット処理で緩和できる。

スナップショットとは、特定時点の集約状態を保存したものである。

たとえば 1000 件のイベントがある集約でも、あらかじめ 800 件目時点の状態を保存しておけば、オブジェクトの最新の状態を取得する際には残り 200 件の履歴だけを適用すればよい。

![software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-7-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-7-1.png)

### 21-7-2 スナップショットの作成タイミング

| 戦略               | 内容                                                |
| ------------------ | --------------------------------------------------- |
| イベント数ベース   | 一定数（例: 100件）のイベントが蓄積されるたびに作成 |
| 時間ベース         | 定期的（例: 1日1回の深夜）に作成                    |
| 特定イベント発生時 | 重要な状態変更（例: 注文確定時）の際に作成          |
| ハイブリッド戦略   | 上記を組み合わせて使用                              |

### 21-7-3 イベント数ベースのスナップショット作成例

![software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-7-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-7-2.png)

### 21-7-4 スナップショットの導入検討

イベントソーシングの課題よって性能に問題が起こった後から、スナップショットの導入を検討する。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

function needsSnapshot(metrics: {
  replayLatencyMs: number;
  eventCount: number;
}): boolean {
  return metrics.replayLatencyMs > 200 || metrics.eventCount > 1000;
}
```

## 21-8 多様な状態導出とビジネス価値の創出

### 21-8-1 イベントソーシングの実装課題

イベント履歴だけでは、横断的な読み取り要求をうまく扱えない。

```typescript
// 現在の実装（ステートソーシング）
export class BookRecommendationDomainService {
  constructor(private reviewRepository: IReviewRepository) {}

  private async getTrustworthyReviews(bookId: BookId): Promise<Review[]> {
    // 特定の BookID に紐づくすべてのレビューを取得
    const bookReviews = await this.reviewRepository.findAllByBookId(bookId);

    // 信頼性の閾値に基づいて信頼できるレビューのみをフィルタリング
    return bookReviews.filter((review) => review.isTrustworthy());
  }

  async calculateTopRecommendedBooks(
    bookId: BookId,
    maxCount: number = 3,
  ): Promise<string[]> {
    // 信頼できるレビューを取得してRecommendedBookを集計
    // ...
  }
}
```

### 21-8-2 書き込みと読み取りの異なる要求

書き込み側は単一集約の正確な状態変更記録に、読み取り側は横断検索や集計に最適化したい。

このズレを解決するのがクエリモデルである。

```typescript
interface BookReviewsQueryModel {
  // プロパティ
}
```

### 21-8-3 CQRS

CQRS は、書き込みと読み取りの責務を分離するパターンである。

イベントソーシングではオブジェクトの現在の状態を保存していないため、最新の状態を取得する際に過去の履歴をたどる必要があり、これは性能問題につながる可能性がある。

この課題は、CQRS によって読み取り側のデータ構造を分けることで緩和できる。

イベントソーシングと組み合わせると、整合性を維持しつつ、後から新しいクエリモデルを構築できる。

### 21-8-4 BookRecommendation のためのクエリモデル設計

BookRecommendation を取得するためのクエリモデル設計例として、2 つの方法がある

```typescript
// 方法1: BookIDごとのレビューリストモデル
interface BookReviewsQueryModel {
  readonly bookId: string;
  readonly reviews: readonly {
    readonly reviewId: string;
    readonly name: string;
    readonly rating: number;
    readonly comment: string;
    readonly recommendedBooks: readonly string[];
    readonly lastUpdated: Date;
  }[];
}
```

```typescript
// 方法2: 事前集計されたRecommendedBookモデル
interface BookRecommendationQueryModel {
  readonly bookId: string;
  readonly recommendedBooks: readonly string[];
}
```

### 21-8-5 イベントからクエリモデルを構築する仕組み

1. イベントストアに新しいイベントが追加される
2. 変更通知を受け取る
3. イベントから必要情報を抽出する
4. クエリモデルを更新する

![software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-8-5](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software_application_architecture_backend_domain_driven_design_practice_domain_event_sourcing_21-8-5.png)

### 21-8-6 クエリサイドのデータストアの選択

CQRS で使用できるデータストアは次のとおりである。

- RDBMS: 関係性の強いデータ、SQL による柔軟な検索や集計に向く
- Elasticsearch: 全文検索や複雑検索に向く
- MongoDB: スキーマ変更が多い場合や柔軟なデータ構造に向く

### 21-8-7 CQRS による結果整合性

CQRS では、コマンドサイドとクエリサイドの間に時間差が生じるため、結果整合性を採用する必要がある。

```typescript
// 書籍中にはないコードブロックで、具体例を理解するために長谷川が追加

async function addReview(command: AddReviewCommand): Promise<void> {
  // コマンドサイドではイベントストアにレビュー作成イベントを書き込む
  await eventStore.append({
    type: "ReviewCreated",
    id: command.reviewId,
    payload: {
      bookId: command.bookId,
      rating: command.rating,
      comment: command.comment,
    },
  });
}

async function updateBookReviewsQueryModel(event: DomainEvent): Promise<void> {
  // この更新はコマンド処理とは別タイミングで行われるため、この間はクエリモデルがまだ古い可能性がある
  // ここでコマンドサイドとクエリサイドの間に結果整合性が生じる
  // クエリサイドでは、後からイベントを受け取って読み取り用データを更新する
  await bookReviewsQueryModelRepository.addReview({
    bookId: event.payload.bookId,
    reviewId: event.id,
    rating: event.payload.rating,
    comment: event.payload.comment,
  });
}
```

## 21-9 実装の詳細

https://github.com/yamachan0625/hands-on-ddd-introduction/blob/main/chapter-21/impl.md を参照すること。

## 21-10 まとめ

イベントソーシングは、状態をイベントの連続として管理する手法である。
起きた事実の記録から状態を導出することで、任意時点の状態を扱ったり、後から新しい観点で分析したりできる。

また、横断的な読み取り要件には CQRS との組み合わせが有効である一方で、採用は技術トレンドではなくビジネス価値で判断する必要がある。

## Column Outbox テーブルとイベントストアの設計判断

設計上の論点は、Outbox テーブルとイベントストアを同一管理するか、分離するかである。

- 同一テーブルで管理すれば実装はシンプルになるが、責務が混在する
- 分離すれば責務は明確になるが、実装と運用の複雑性が増す
