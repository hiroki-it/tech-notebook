---
title: 【IT技術の知見】11章＠ドメイン駆動設計実践入門
description: 11章＠ドメイン駆動設計実践入門の知見を記録しています。
---

# 11章＠ドメイン駆動設計実践入門

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 11-1 集約とは

集約とは、関連するオブジェクト群（エンティティ、値オブジェクト）のグループである。

※ 集約オブジェクトはルートエンティティ（書籍には出てきていない言葉）ともいう。

『集約に含まれるエンティティや値オブジェクトの状態を変更するためには、集約を操作しなければならない』という実装にすることで、集約がオブジェクト群の状態の整合性を守る範囲になる。

まず『本に関するものを全部 `Book` 集約（≒ Bookルートエンティティ）に入れてしまう』設計の問題を通して、集約境界の考え方を説明する。

この実装は一見わかりやすく見えるが、`Book` 集約、`Review` 集約、`Publisher` 集約、`Stock` 集約という異なる集約を1つの集約に押し込めている。

その結果、集約が大きくなり、状態の整合性を守る範囲が広くなってしまっている。

```typescript
class Book {
  constructor(
    public bookId: BookId, // ID値オブジェクト
    public title: Title, // タイトル値オブジェクト
    public author: Author, // 著者値オブジェクト
    public price: Price, // 価格値オブジェクト

    // いろんな集約
    public reviews: Review[], // レビューエンティティ（本来は別集約にすべき)
    public publisher: Publisher, // 出版社エンティティ（本来は別集約にすべき)
    public stock: Stock, // 在庫エンティティ（本来は別集約にすべき)
  ) {}
  // (省略) 本に関するあらゆる操作がここに混在する可能性がある
}
```

## 11-2 集約の設計上の指針

### 11-2-1 集約は小さくする

状態の整合性を守る範囲が広くなると、操作するオブジェクトが増えて処理やDBの性能問題が起こったり、ほかの集約と範囲が重なってDBで競合する可能性があるため、集約をできるだけ小さく保つ必要がある。

#### ▼ 集約をどこで区切るか

- 集約がどんなドメインルールを扱っているのか、というモデリングに戻って考える。オブジェクトの状態の整合性を保つ必要があるかどうかで集約の境界を決めるべきである。例えば『`Book` 集約と `Review` 集約は関連しているから同じ集約にする』という考え方は誤りである。重要なのは、`Book` 集約と `Review` 集約の状態について一貫性を保つ必要があるかどうかである。レビューの追加や更新は、書籍の基本情報の更新とは独立して行われるため、異なる集約として判断できる。
- 集約を操作するときに一部のオブジェクトが大量に含まれる場合、そのオブジェクトを異なる集約として切り分ける。
  - ドメインモデリングではなく、性能問題を起点として集約を設計
- 変更頻度が高いオブジェクトを異なる集約として切り分ける。
  - ドメインモデリングではなく、リリースのしやすさを起点として集約を設計

### 11-2-2 集約間は識別子（たとえばエンティティのIDオブジェクト）でコールする

集約が他の集約を直接コールし、さらにその内部状態を直接変更する例である。

この実装では、`Book` 集約が `Review` 集約のメソッドを直接コールしている。

これでは `Review` 集約側が守るべき整合性の範囲を `Book` 集約が侵食してしまい、集約の結合度が高くなってしまう。

識別子にはドメインルールを持たせないほうが良いため、ドメインルール上の識別子（例：書籍のISBN）はエンティティの識別子にしないほうがいい。

```typescript
// アンチパターン: 集約が他の集約を直接コールする
class Book {
  constructor(
    public bookId: BookId,
    public title: Title,
    public price: Price,
    public reviews: Review[], // Review集約のインスタンスを直接保持
  ) {}

  // Book集約からReview集約に関わる操作
  antiPatternMethod() {
    if (this.reviews.length > 0) {
      this.reviews[0].updateRating(new Rating(4));
    }
  }
}
```

`Review` 集約が `Book` 集約そのものを保持するのではなく、BookIdを保持する例が次の実装である。

この形にすることで、`Review` 集約は `Book` 集約の内部構造を知らずに済む。

これが『集約間は識別子でコールする』という指針の具体例である。

```typescript
class Review {
  constructor(
    public reviewId: ReviewId, // ID値オブジェクト
    public bookId: BookId,
    public name: Name, // 投稿者名値オブジェクト
    public rating: Rating, // 評価値オブジェクト
    public comment: Comment, // コメント値オブジェクト（任意）
  ) {}
  // (省略)
}
```

`Book` 集約側がReviewIdのリストを持つパターンもある。

このパターンでは、`Book` 集約と複数の `Review` 集約の関係を表現しつつ、`Review` 集約そのものを直接抱え込まずに済む。

```typescript
class Book {
  constructor(
    public bookId: BookId,
    public title: Title,
    public price: Price,
    public reviewIds: ReviewId[], // Review集約のID （値オブジェクト）のリストを保持
  ) {}
  // (省略)
}
```

### 11-2-3 デメテルの法則に従う

デメテルの法則（≒ オブジェクト内部のオブジェクトをチェーンでコールすることは避けるべきという法則）に違反する例である。

`Book` 集約から `Review` 集約を取り出し、さらに `Review` 集約内にもアクセスできてしまう。

```typescript
// 冒頭の悪い例
class Book {
  constructor(
    public bookId: BookId,
    public title: Title,
    public reviews: Review[], // publicになっているため外部から直接アクセス可能
    // ...
  ) {}

  // (省略) 本に関するあらゆる操作がここに混在する可能性がある
}

// この構造だと外部コードは以下のようなアクセスが可能になる
const book = new Book(bookId, title, reviews, ...);

// book.reviewsを直接参照できる
const firstReview = book.reviews[0];

// さらにReviewの内部構造にもアクセスできてしまう
const reviewRating = firstReview.rating;
```

それに対して、デメテルの法則に従う設計では、オブジェクト内部のオブジェクトをチェーンでコールしない

`Review` 集約から `review.extractRecommendedBooks()` をコールする。

```typescript
// 書籍の基本情報に焦点を当てた集約
class Book {
  constructor(
    private readonly bookId: BookId,
    private readonly title: Title,
    private readonly author: Author,
    private price: Price,
  ) {}

  // 価格変更のメソッド
  changePrice(newPrice: Price): void {
    this.price = newPrice;
  }
}

// レビュー管理に焦点を当てた集約
class Review {
  constructor(
    private readonly reviewId: ReviewId,
    private readonly bookId: BookId,
    private readonly rating: Rating,
    private readonly comment?: Comment,
  ) {}

  // 推薦書籍抽出のロジックを集約内にカプセル化
  extractRecommendedBooks(): string[] {
    if (!this.comment) return [];

    // 推薦本を抽出する正規表現パターン（実装の詳細は集約内に隠蔽）
    // 書籍名の後30文字以内に推薦キーワードがあるものを抽出
    const pattern =
      /[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)/g;

    const matches = this.comment.extractMatches(pattern);
    return Array.from(new Set(matches));
  }
}

// デメテルの法則に従った使用例
// レビューから推薦書籍を抽出
const recommendedBooks = review.extractRecommendedBooks();
```

### 11-2-4 集約の外部では結果整合性を用いる

異なる集約の状態の整合性を保ちたい場合、これらの集約を統合するのではなく、結果整合性を採用することで集約間の整合性を保つように妥協することも重要である。

`Book` 集約のなかに `Review` 集約を含め、状態の整合性を保とうとするとすると次のような設計になる。

この実装は『1冊につきレビューは100件まで』というBook集約とReview集約間の状態の整合性を保ちやすくなる一方、`Book` 集約が肥大化し、`Review` 集約の更新のたびに `Book` 集約全体を巻き込んでしまっている

```typescript
class Book {
  constructor(
    public bookId: BookId,
    // ...
  ) {}

  public reviews: Review[]; // レビューを直接含める

  // レビューを追加するメソッド
  addReview(review: Review): void {
    // レビュー数の制約を集約内で強制できる
    if (this.reviews.length >= 100) {
      throw new Error("レビュー数が上限に達しています");
    }
    this.reviews.push(review);
  }
}
```

それに対し、`Book` 集約と `Review` 集約を分けたまま、状態の結果整合性を保つ。

この設計では、`Book` 集約と `Review` 集約を疎結合にしている。BookリポジトリでBooks集約の状態を取得し、Reviewリポジトリで取得した `Review` 集約に渡している。

```typescript
// Book集約 - 基本情報管理に特化
class Book {
  constructor(
    private readonly bookId: BookId,
    private readonly title: Title,
    private readonly author: Author,
    private price: Price
  ) {}

  // 書籍の基本情報に関する機能のみを提供
  changePrice(newPrice: Price): void {
    this.price = newPrice;
  }
}

// Review集約 - レビュー分析という差別化ロジックに特化
class Review {
  constructor(
    private readonly reviewId: ReviewId,
    private readonly bookId: BookId, // 書籍IDで参照
    private readonly rating: Rating,
    private readonly comment?: Comment
  ) {}

  // 差別化ロジック: レビューからの推薦書籍抽出
  extractRecommendedBooks(): string[] {
    // レビューからの推薦書籍抽出ロジック
    // これは競合他社にはない独自の機能
  }
}

// レビュー作成時に整合性を確認
function createReview(bookId: string, rating: number, comment?: string): Promise<void> {
  // 書籍の存在確認
  const book = await bookRepository.findById(bookId); // DBから書籍を取得
  if (!book) {
    throw new Error("対象の書籍が存在しません");
  }

  // レビュー数の確認（一時的な不整合の可能性あり）
  const reviewCount = await reviewRepository.countByBookId(book.bookId);
  if (reviewCount >= 100) {
    throw new Error("レビュー数が上限に達しています");
  }

  // レビューを作成
  ...
}
```

## 11-3 複数の集約による実装

### 11-3-1 設計指針に基づいた実装アプローチ

ここでは、『集約は小さくする』『集約間は識別子で参照する』『デメテルの法則に従う』『集約の外部では結果整合性を用いる』という4つの原則を守って、集約を実装する。

| 集約       | 属性                                                      |
| ---------- | --------------------------------------------------------- |
| Book集約   | ・BookId、Title、Author、Priceという属性を持つ            |
| Review集約 | ・ReviewId、BookId、Name、Rating、Commentという属性を持つ |

### 11-3-2 Review集約の実装

実際の `Review` 集約の実装は次のとおりである。

この実装では、`Review` 集約が書籍ID（`BookId`）などの状態を持ち、また信頼性評価（`isTrustworthy()`）、推薦本抽出（`extractRecommendedBooks()`）、名前変更（`updateName()`）、評価変更（`updateRating()`）、コメント編集（`editComment()`）という振る舞いを持つ。

`Review` 集約が `Book` 集約を参照するときは、`BookId` を使うだけである。

`Review` 集約と `Book` 集約は疎結合になっている。

```typescript
import {BookId} from "../Book/BookId/BookId";
import {Comment} from "./Comment/Comment";
import {Name} from "./Name/Name";
import {Rating} from "./Rating/Rating";
import {ReviewId} from "./ReviewId/ReviewId";
import {ReviewIdentity} from "./ReviewIdentity/ReviewIdentity";

export class Review {
  private constructor(
    private readonly _identity: ReviewIdentity,
    private readonly _bookId: BookId,
    private _name: Name,
    private _rating: Rating,
    private _comment?: Comment,
  ) {}

  static create(
    identity: ReviewIdentity,
    bookId: BookId,
    name: Name,
    rating: Rating,
    comment?: Comment,
  ): Review {
    return new Review(identity, bookId, name, rating, comment);
  }

  static reconstruct(
    identity: ReviewIdentity,
    bookId: BookId,
    name: Name,
    rating: Rating,
    comment?: Comment,
  ): Review {
    return new Review(identity, bookId, name, rating, comment);
  }

  /**
   * このレビューが信頼できるかを判断
   * @param threshold 信頼性閾値（0.0～1.0）
   * @returns 信頼できる場合はtrue
   */
  isTrustworthy(threshold: number = 0.6): boolean {
    // コメントがない場合は評価のみで判断
    if (!this._comment) {
      return this._rating.getQualityFactor() >= threshold;
    }

    // 評価とコメントの係数を組み合わせる
    const ratingFactor = this._rating.getQualityFactor();
    const commentFactor = this._comment.getQualityFactor();

    // 評価の重みを0.7、コメントの重みを0.3とする
    const combinedFactor = ratingFactor * 0.7 + commentFactor * 0.3;
    return combinedFactor >= threshold;
  }

  /**
   * コメントから推薦本を抽出する
   * @returns 推薦本のタイトル配列
   */
  extractRecommendedBooks(): string[] {
    if (!this._comment) return [];

    // 書籍名の後30文字以内に推薦キーワードがあるものを抽出
    const pattern =
      /[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)/g;

    const matches = this._comment.extractMatches(pattern);
    return Array.from(new Set(matches));
  }

  /**
   * 別のレビューと同一かどうかを判定
   * @param other 比較対象のレビュー
   * @returns 同一の場合はtrue
   */
  equals(other: Review): boolean {
    return this._identity.equals(other._identity);
  }

  get reviewId(): ReviewId {
    return this._identity.reviewId;
  }

  get bookId(): BookId {
    return this._bookId;
  }

  get name(): Name {
    return this._name;
  }

  get rating(): Rating {
    return this._rating;
  }

  get comment(): Comment | undefined {
    return this._comment;
  }

  updateName(name: Name): void {
    this._name = name;
  }

  updateRating(rating: Rating): void {
    this._rating = rating;
  }

  editComment(comment: Comment): void {
    this._comment = comment;
  }
}
```

### 11-3-3 Book集約の実装

`Book` 集約は書籍ID（`BookId`）、タイトル（`Title`）、著者（`Author`）、価格（`Price`）という状態を持ち、また価格変更（`changePrice()`）という振る舞いを持つ。

`Book` 集約が `Review` 集約をコールすることはない。

`Review` 集約と `Book` 集約は疎結合になっている。

```typescript
import {Author} from "./Author/Author";
import {BookId} from "./BookId/BookId";
import {BookIdentity} from "./BookIdentity/BookIdentity";
import {Price} from "./Price/Price";
import {Title} from "./Title/Title";

export class Book {
  constructor(
    private readonly _identity: BookIdentity,
    private _price: Price,
  ) {}

  static create(identity: BookIdentity, price: Price): Book {
    return new Book(identity, price);
  }

  static reconstruct(identity: BookIdentity, price: Price): Book {
    return new Book(identity, price);
  }

  /**
   * 別の書籍と同一かどうかを判定
   * @param other 比較対象の書籍
   * @returns 同一の場合はtrue
   */
  equals(other: Book): boolean {
    return this._identity.equals(other._identity);
  }

  get bookId(): BookId {
    return this._identity.bookId;
  }

  get title(): Title {
    return this._identity.title;
  }

  get author(): Author {
    return this._identity.author;
  }

  get price(): Price {
    return this._price;
  }

  changePrice(price: Price): void {
    this._price = price;
  }
}
```

## 11-4 集約のテスト

### 11-4-1 集約テストの役割

集約のテストでは、状態を正常に変更できるか、ドメインルールに違反する操作を正常にバリデーションできるか、そしてドメインイベントなどの副作用が適切に発生するかをユニットテストする。

### 11-4-2 Review集約のテスト

サンプルコードでは、次のコマンドでユニットテストを実行できる。

```bash
npx jest src/Domain/models/Review/Review.test.ts
```

`Review` 集約のテストでは、次をユニットテストしている。

- `Review` 集約の作成（`"create"`）
- `Review` 集約の再作成（`"reconstruct"`）
- `Review` 集約の同一性判定（`"equals"`）
- レビューの信頼性判定（`"isTrustworthy"`）
- 推薦本抽出（`"extractRecommendedBooks"`）
- レビュアーの名前変更（`"updateName"`）、評価変更（`"updateRating"`）
- レビュアーのコメント編集（`"editComment"`）

```typescript
import {BookId} from "../Book/BookId/BookId";
import {Comment} from "./Comment/Comment";
import {Name} from "./Name/Name";
import {Rating} from "./Rating/Rating";
import {Review} from "./Review";
import {ReviewId} from "./ReviewId/ReviewId";
import {ReviewIdentity} from "./ReviewIdentity/ReviewIdentity";

describe("Review", () => {
  const reviewId = new ReviewId();
  const reviewIdentity = new ReviewIdentity(reviewId);
  const bookId = new BookId("9784798126708");
  const name = new Name("山田太郎");
  const rating = new Rating(4);
  const comment = new Comment(
    "とても面白かったです。『実践ドメイン駆動設計』を読んだ後にこの本を読むと理解しやすいです。",
  );

  // 正常系
  describe("create", () => {
    it("レビューを正しく作成できる", () => {
      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      expect(review.reviewId.equals(reviewId)).toBeTruthy();
      expect(review.bookId.equals(bookId)).toBeTruthy();
      expect(review.name.equals(name)).toBeTruthy();
      expect(review.rating.equals(rating)).toBeTruthy();
      expect(review.comment?.equals(comment)).toBeTruthy();
    });
  });

  // 正常系
  describe("reconstruct", () => {
    it("レビューを正しく再構築できる", () => {
      const review = Review.reconstruct(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );

      expect(review.reviewId.equals(reviewId)).toBeTruthy();
      expect(review.bookId.equals(bookId)).toBeTruthy();
      expect(review.name.equals(name)).toBeTruthy();
      expect(review.rating.equals(rating)).toBeTruthy();
      expect(review.comment?.equals(comment)).toBeTruthy();
    });
  });

  describe("equals", () => {
    // 正常系
    it("同一のレビューは等しいと判定される", () => {
      const review1 = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      const review2 = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      expect(review1.equals(review2)).toBeTruthy();
    });

    // 正常系
    it("異なるレビューは等しくないと判定される", () => {
      const review1 = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      const newReviewId = new ReviewId();
      const newReviewIdentity = new ReviewIdentity(newReviewId);
      const review2 = Review.create(
        newReviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      expect(review1.equals(review2)).toBeFalsy();
    });
  });

  describe("isTrustworthy", () => {
    it("コメントありの場合、評価とコメントの品質を組み合わせて信頼性を判断する", () => {
      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );

      // モックを使って特定の品質係数を返すように設定
      jest.spyOn(review.rating, "getQualityFactor").mockReturnValue(0.75);
      jest.spyOn(review.comment!, "getQualityFactor").mockReturnValue(0.3);

      // 評価の重み0.7、コメントの重み0.3で計算すると
      // 0.75 * 0.7 + 0.3 * 0.3 = 0.525 + 0.09 = 0.615
      // 閾値0.6に対して信頼できると判定されるはず
      expect(review.isTrustworthy(0.6)).toBeTruthy();

      // 閾値0.7に対しては信頼できないと判定されるはず
      expect(review.isTrustworthy(0.7)).toBeFalsy();
    });

    it("コメントなしの場合、評価の品質のみで信頼性を判断する", () => {
      const review = Review.create(reviewIdentity, bookId, name, rating);

      // モックを使って特定の品質係数を返すように設定
      jest.spyOn(review.rating, "getQualityFactor").mockReturnValue(0.5);

      // 評価の品質係数が0.5なので、閾値0.6に対して信頼できないと判定されるはず
      expect(review.isTrustworthy(0.6)).toBeFalsy();

      // 閾値0.4に対しては信頼できると判定されるはず
      expect(review.isTrustworthy(0.4)).toBeTruthy();
    });
  });

  describe("extractRecommendedBooks", () => {
    it("コメントがない場合は空の配列を返す", () => {
      const review = Review.create(reviewIdentity, bookId, name, rating);
      const recommendedBooks = review.extractRecommendedBooks();
      expect(recommendedBooks).toEqual([]);
    });

    it("コメントからパターンに一致する複数の推薦本を抽出できる", () => {
      // 複数の推薦本を含むコメント - パターンに確実に一致するよう調整
      const commentWithMultipleBooks = new Comment(
        "『実践ドメイン駆動設計』を読んだ後に読むと理解しやすいです。また、前提知識として『エリック・エヴァンスのドメイン駆動設計』が必要です。",
      );

      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        commentWithMultipleBooks,
      );

      const result = review.extractRecommendedBooks();

      // 両方のパターンに一致するはず
      expect(result).toEqual([
        "実践ドメイン駆動設計",
        "エリック・エヴァンスのドメイン駆動設計",
      ]);
    });

    it("重複する推薦本は一度だけカウントされる", () => {
      // 同じ推薦本が複数のパターンに一致するコメント - パターンに確実に一致するよう調整
      const commentWithDuplicates = new Comment(
        "『実践ドメイン駆動設計』を読んだ後に読むと理解しやすいです。『実践ドメイン駆動設計』を先に読むことを推奨します。",
      );

      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        commentWithDuplicates,
      );

      const result = review.extractRecommendedBooks();
      expect(result).toEqual(["実践ドメイン駆動設計"]);
    });
  });

  describe("updateName", () => {
    it("名前を変更できる", () => {
      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      const newName = new Name("佐藤花子");
      review.updateName(newName);
      expect(review.name.equals(newName)).toBeTruthy();
    });
  });

  describe("updateRating", () => {
    it("評価を変更できる", () => {
      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      const newRating = new Rating(5);
      review.updateRating(newRating);
      expect(review.rating.equals(newRating)).toBeTruthy();
    });
  });

  describe("editComment", () => {
    it("コメントを変更できる", () => {
      const review = Review.create(
        reviewIdentity,
        bookId,
        name,
        rating,
        comment,
      );
      const newComment = new Comment("新しいコメントです。");
      review.editComment(newComment);
      expect(review.comment?.equals(newComment)).toBeTruthy();
    });
  });
});
```

### 11-4-3 Book集約のテスト

サンプルコードでは、次のコマンドでユニットテストを実行できる。

```bash
npx jest src/Domain/models/Book/Book.test.ts
```

`Book` 集約のテストは、次をユニットテストしている。

- `Book` 集約の作成（`"create"`）
- `Book` 集約の再作成（`"reconstruct"`）
- `Book` 集約の同一性判定（`"equals"`）
- 書籍価格の変更（`"changePrice"`）

```typescript
import {Author} from "./Author/Author";
import {Book} from "./Book";
import {BookId} from "./BookId/BookId";
import {BookIdentity} from "./BookIdentity/BookIdentity";
import {Price} from "./Price/Price";
import {Title} from "./Title/Title";

describe("Book", () => {
  // テスト用の値オブジェクトを作成
  const bookId = new BookId("9784798126708");
  const title = new Title("エリック・エヴァンスのドメイン駆動設計入門");
  const author = new Author("エリック・エヴァンス");
  const price = new Price({amount: 5720, currency: "JPY"});
  const newPrice = new Price({amount: 5200, currency: "JPY"});

  // BookIdentityインスタンスを作成
  const bookIdentity = new BookIdentity(bookId, title, author);

  describe("create", () => {
    it("書籍を正しく作成できる", () => {
      const book = Book.create(bookIdentity, price);
      expect(book.bookId).toBe(bookId);
      expect(book.title).toBe(title);
      expect(book.author).toBe(author);
      expect(book.price).toBe(price);
    });
  });

  describe("reconstruct", () => {
    it("書籍を正しく再構築できる", () => {
      const book = Book.reconstruct(bookIdentity, price);
      expect(book.bookId).toBe(bookId);
      expect(book.title).toBe(title);
      expect(book.author).toBe(author);
      expect(book.price).toBe(price);
    });
  });

  describe("equals", () => {
    it("同じBookIdentityを持つ書籍は等価と判定される", () => {
      const book1 = Book.create(bookIdentity, price);
      const book2 = Book.create(bookIdentity, newPrice);
      expect(book1.equals(book2)).toBeTruthy();
    });

    it("異なるBookIdentityを持つ書籍は等価でないと判定される", () => {
      const book1 = Book.create(bookIdentity, price);
      const newBookId = new BookId("9784167158058");
      const newBookIdentity = new BookIdentity(newBookId, title, author);
      const book2 = Book.create(newBookIdentity, price);
      expect(book1.equals(book2)).toBeFalsy();
    });
  });

  describe("changePrice", () => {
    it("価格を変更できる", () => {
      const book = Book.create(bookIdentity, price);

      // 価格変更前の検証
      expect(book.price).toBe(price);

      // 価格を変更
      book.changePrice(newPrice);

      // 価格変更後の検証
      expect(book.price).toBe(newPrice);
    });
  });
});
```

## 11-5 集約の発展的な考え方

### 11-5-1 集約は可変である必要があるか

『オブジェクトの状態の整合性を保つ必要があるかどうかで集約の境界を決めるべきである』と解説したが、集約の状態は可変でなくてもよい。

たとえば、ステートソーシングではなくイベントソーシングによるモデリングでは、集約は不変になる場合がある。

※ イベント駆動のドメイン駆動設計はドメインオブジェクト（エンティティ、値オブジェクト）の設計がクソむずい

### 11-5-2 発展的な集約設計の選択

集約の設計では、『集約は小さくする』『集約間は識別子で参照する』『デメテルの法則に従う』『集約の外部では結果整合性を用いる』という原則を守りつつ、読者の現場のドメインや状況に応じて可変になる場合と不変になる場合がある。
