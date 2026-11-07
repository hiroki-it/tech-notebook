---
title: 【IT技術の知見】11章＠ドメイン駆動設計実践入門
description: 11章＠ドメイン駆動設計実践入門の知見を記録しています。
---

# 11章＠ドメイン駆動設計実践入門

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 11-1 集約とは

集約とは、関連するオブジェクト群（エンティティ、値オブジェクト）のグループである。

※ 集約オブジェクトはルートエンティティ（書籍には出てきていない言葉）ともいう。

『集約に含まれるエンティティや値オブジェクトの状態を変更するためには、集約を操作しなければならない』という実装にすることで、集約がオブジェクト群の状態の整合性を守る範囲になる。

まず『本に関するものを全部 `Book` 集約（≒ Book ルートエンティティ）に入れてしまう』設計の問題を通して、集約境界の考え方を説明する。

この実装は一見わかりやすく見えるが、`Book` 集約、`Review` 集約、`Publisher` 集約、`Stock` 集約という異なる集約を 1 つの集約に押し込めている。

その結果、集約が大きくなり、状態の整合性を守る範囲が広くなってしまっている。

=== "Go"

    ```go title=".go"
    type Book struct {
    	BookID BookID // ID値オブジェクト
    	Title  Title  // タイトル値オブジェクト
    	Author Author // 著者値オブジェクト
    	Price  Price  // 価格値オブジェクト

    	// いろんな集約
    	Reviews   []*Review // レビューエンティティ（本来は別集約にすべき)
    	Publisher Publisher // 出版社エンティティ（本来は別集約にすべき)
    	Stock     Stock     // 在庫エンティティ（本来は別集約にすべき)
    }

    func NewBook(bookID BookID, title Title, author Author, price Price, reviews []*Review, publisher Publisher, stock Stock) *Book {
    	return &Book{
    		BookID:    bookID,
    		Title:     title,
    		Author:    author,
    		Price:     price,
    		Reviews:   reviews,
    		Publisher: publisher,
    		Stock:     stock,
    	}
    }

    // (省略) 本に関するあらゆる操作がここに混在する可能性がある
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class Book
    {
        public function __construct(
            public BookId $bookId, // ID値オブジェクト
            public Title $title, // タイトル値オブジェクト
            public Author $author, // 著者値オブジェクト
            public Price $price, // 価格値オブジェクト

            // いろんな集約
            public array $reviews, // レビューエンティティ（本来は別集約にすべき)
            public Publisher $publisher, // 出版社エンティティ（本来は別集約にすべき)
            public Stock $stock, // 在庫エンティティ（本来は別集約にすべき)
        ) {
        }
        // (省略) 本に関するあらゆる操作がここに混在する可能性がある
    }
    ```

## 11-2 集約の設計上の指針

### 11-2-1 集約は小さくする

状態の整合性を守る範囲が広くなると、操作するオブジェクトが増えて処理や DB の性能問題が起こったり、ほかの集約と範囲が重なって DB で競合する可能性があるため、集約をできるだけ小さく保つ必要がある。

#### ▼ 集約をどこで区切るか

- 集約がどんなドメインルールを扱っているのか、というモデリングに戻って考える。オブジェクトの状態の整合性を保つ必要があるかどうかで集約の境界を決めるべきである。例えば『`Book` 集約と `Review` 集約は関連しているから同じ集約にする』という考え方は誤りである。重要なのは、`Book` 集約と `Review` 集約の状態について一貫性を保つ必要があるかどうかである。レビューの追加や更新は、書籍の基本情報の更新とは独立して行われるため、異なる集約として判断できる。
- 集約を操作するときに一部のオブジェクトが大量に含まれる場合、そのオブジェクトを異なる集約として切り分ける。
  - ドメインモデリングではなく、性能問題を起点として集約を設計
- 変更頻度が高いオブジェクトを異なる集約として切り分ける。
  - ドメインモデリングではなく、リリースのしやすさを起点として集約を設計

### 11-2-2 集約間は識別子（たとえばエンティティの ID オブジェクト）でコールする

集約が他の集約を直接コールし、さらにその内部状態を直接変更する例である。

この実装では、`Book` 集約が `Review` 集約のメソッドを直接コールしている。

これでは `Review` 集約側が守るべき整合性の範囲を `Book` 集約が侵食してしまい、集約の結合度が高くなってしまう。

識別子にはドメインルールを持たせないほうがよいため、ドメインルール上の識別子（例：書籍の ISBN）はエンティティの識別子にしないほうがいい。

=== "Go"

    ```go title=".go"
    // アンチパターン: 集約が他の集約を直接コールする
    type Book struct {
    	BookID  BookID
    	Title   Title
    	Price   Price
    	Reviews []*Review // Review集約のインスタンスを直接保持
    }

    func NewBook(bookID BookID, title Title, price Price, reviews []*Review) *Book {
    	return &Book{BookID: bookID, Title: title, Price: price, Reviews: reviews}
    }

    // Book集約からReview集約に関わる操作
    func (b *Book) AntiPatternMethod() {
    	if len(b.Reviews) > 0 {
    		b.Reviews[0].UpdateRating(NewRating(4))
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    // アンチパターン: 集約が他の集約を直接コールする
    class Book
    {
        public function __construct(
            public BookId $bookId,
            public Title $title,
            public Price $price,
            public array $reviews, // Review集約のインスタンスを直接保持
        ) {
        }

        // Book集約からReview集約に関わる操作
        public function antiPatternMethod(): void
        {
            if (count($this->reviews) > 0) {
                $this->reviews[0]->updateRating(new Rating(4));
            }
        }
    }
    ```

`Review` 集約が `Book` 集約そのものを保持するのではなく、BookId を保持する例が次の実装である。

この形にすることで、`Review` 集約は `Book` 集約の内部構造を知らずに済む。

これが『集約間は識別子でコールする』という指針の具体例である。

=== "Go"

    ```go title=".go"
    type Review struct {
    	ReviewID ReviewID // ID値オブジェクト
    	BookID   BookID
    	Name     Name    // 投稿者名値オブジェクト
    	Rating   Rating  // 評価値オブジェクト
    	Comment  Comment // コメント値オブジェクト（任意）
    }

    func NewReview(reviewID ReviewID, bookID BookID, name Name, rating Rating, comment Comment) *Review {
    	return &Review{ReviewID: reviewID, BookID: bookID, Name: name, Rating: rating, Comment: comment}
    }

    // (省略)
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class Review
    {
        public function __construct(
            public ReviewId $reviewId, // ID値オブジェクト
            public BookId $bookId,
            public Name $name, // 投稿者名値オブジェクト
            public Rating $rating, // 評価値オブジェクト
            public Comment $comment, // コメント値オブジェクト（任意）
        ) {
        }
        // (省略)
    }
    ```

`Book` 集約側が ReviewId のリストを持つパターンもある。

このパターンでは、`Book` 集約と複数の `Review` 集約の関係を表現しつつ、`Review` 集約そのものを直接抱え込まずに済む。

=== "Go"

    ```go title=".go"
    type Book struct {
    	BookID    BookID
    	Title     Title
    	Price     Price
    	ReviewIDs []ReviewID // Review集約のID （値オブジェクト）のリストを保持
    }

    func NewBook(bookID BookID, title Title, price Price, reviewIDs []ReviewID) *Book {
    	return &Book{BookID: bookID, Title: title, Price: price, ReviewIDs: reviewIDs}
    }

    // (省略)
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class Book
    {
        public function __construct(
            public BookId $bookId,
            public Title $title,
            public Price $price,
            public array $reviewIds, // Review集約のID （値オブジェクト）のリストを保持
        ) {
        }
        // (省略)
    }
    ```

### 11-2-3 デメテルの法則に従う

デメテルの法則（≒ オブジェクト内部のオブジェクトをチェーンでコールすることは避けるべきという法則）に違反する例である。

`Book` 集約から `Review` 集約を取り出し、さらに `Review` 集約内にもアクセスできてしまう。

=== "Go"

    ```go title=".go"
    // 冒頭の悪い例
    type Book struct {
    	BookID  BookID
    	Title   Title
    	Reviews []*Review // publicになっているため外部から直接アクセス可能
    	// ...
    }

    func NewBook(bookID BookID, title Title, reviews []*Review /* ... */) *Book {
    	return &Book{BookID: bookID, Title: title, Reviews: reviews}
    }

    // (省略) 本に関するあらゆる操作がここに混在する可能性がある

    // この構造だと外部コードは以下のようなアクセスが可能になる
    var book = NewBook(bookID, title, reviews /* 他の引数は省略 */)

    // book.Reviewsを直接参照できる
    var firstReview = book.Reviews[0]

    // さらにReviewの内部構造にもアクセスできてしまう
    var reviewRating = firstReview.Rating
    ```

=== "TypeScript"

    ```typescript title=".ts"
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
    const book = new Book(bookId, title, reviews /* 他の引数は省略 */);

    // book.reviewsを直接参照できる
    const firstReview = book.reviews[0];

    // さらにReviewの内部構造にもアクセスできてしまう
    const reviewRating = firstReview.rating;
    ```

=== "PHP"

    ```injectablephp title=".php"
    // 冒頭の悪い例
    class Book
    {
        public function __construct(
            public BookId $bookId,
            public Title $title,
            public array $reviews, // publicになっているため外部から直接アクセス可能
            // ...
        ) {
        }

        // (省略) 本に関するあらゆる操作がここに混在する可能性がある
    }

    // この構造だと外部コードは以下のようなアクセスが可能になる
    $book = new Book($bookId, $title, $reviews /* 他の引数は省略 */);

    // $book->reviewsを直接参照できる
    $firstReview = $book->reviews[0];

    // さらにReviewの内部構造にもアクセスできてしまう
    $reviewRating = $firstReview->rating;
    ```

それに対して、デメテルの法則に従う設計では、オブジェクト内部のオブジェクトをチェーンでコールしない

`Review` 集約から `review.extractRecommendedBooks()` をコールする。

=== "Go"

    ```go title=".go"
    // 書籍の基本情報に焦点を当てた集約
    type Book struct {
    	bookID BookID
    	title  Title
    	author Author
    	price  Price
    }

    func NewBook(bookID BookID, title Title, author Author, price Price) *Book {
    	return &Book{bookID: bookID, title: title, author: author, price: price}
    }

    // 価格変更のメソッド
    func (b *Book) ChangePrice(newPrice Price) {
    	b.price = newPrice
    }

    // レビュー管理に焦点を当てた集約
    type Review struct {
    	reviewID ReviewID
    	bookID   BookID
    	rating   Rating
    	comment  *Comment
    }

    func NewReview(reviewID ReviewID, bookID BookID, rating Rating, comment *Comment) *Review {
    	return &Review{reviewID: reviewID, bookID: bookID, rating: rating, comment: comment}
    }

    // 推薦書籍抽出のロジックを集約内にカプセル化
    func (r *Review) ExtractRecommendedBooks() []string {
    	if r.comment == nil {
    		return []string{}
    	}

    	// 推薦本を抽出する正規表現パターン（実装の詳細は集約内に隠蔽）
    	// 書籍名の後30文字以内に推薦キーワードがあるものを抽出
    	pattern := regexp.MustCompile(`[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)`)

    	matches := r.comment.ExtractMatches(pattern)
    	seen := make(map[string]struct{}, len(matches))
    	uniqueMatches := make([]string, 0, len(matches))
    	for _, match := range matches {
    		if _, ok := seen[match]; ok {
    			continue
    		}
    		seen[match] = struct{}{}
    		uniqueMatches = append(uniqueMatches, match)
    	}
    	return uniqueMatches
    }

    // デメテルの法則に従った使用例
    // レビューから推薦書籍を抽出
    var recommendedBooks = review.ExtractRecommendedBooks()
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    // 書籍の基本情報に焦点を当てた集約
    class Book
    {
        public function __construct(
            private readonly BookId $bookId,
            private readonly Title $title,
            private readonly Author $author,
            private Price $price,
        ) {
        }

        // 価格変更のメソッド
        public function changePrice(Price $newPrice): void
        {
            $this->price = $newPrice;
        }
    }

    // レビュー管理に焦点を当てた集約
    class Review
    {
        public function __construct(
            private readonly ReviewId $reviewId,
            private readonly BookId $bookId,
            private readonly Rating $rating,
            private readonly ?Comment $comment = null,
        ) {
        }

        // 推薦書籍抽出のロジックを集約内にカプセル化
        public function extractRecommendedBooks(): array
        {
            if ($this->comment === null) {
                return [];
            }

            // 推薦本を抽出する正規表現パターン（実装の詳細は集約内に隠蔽）
            // 書籍名の後30文字以内に推薦キーワードがあるものを抽出
            $pattern =
                "/[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)/u";

            $matches = $this->comment->extractMatches($pattern);
            return array_values(array_unique($matches));
        }
    }

    // デメテルの法則に従った使用例
    // レビューから推薦書籍を抽出
    $recommendedBooks = $review->extractRecommendedBooks();
    ```

### 11-2-4 集約の外部では結果整合性を用いる

異なる集約の状態の整合性を保ちたい場合、これらの集約を統合するのではなく、結果整合性を採用することで集約間の整合性を保つように妥協することも重要である。

`Book` 集約のなかに `Review` 集約を含め、状態の整合性を保とうとするとすると次のような設計になる。

この実装は『1 冊につきレビューは 100 件まで』という Book 集約と Review 集約間の状態の整合性を保ちやすくなる一方、`Book` 集約が肥大化し、`Review` 集約の更新のたびに `Book` 集約全体を巻き込んでしまっている

=== "Go"

    ```go title=".go"
    type Book struct {
    	BookID BookID
    	// ...

    	Reviews []*Review // レビューを直接含める
    }

    func NewBook(bookID BookID /* ... */) *Book {
    	return &Book{BookID: bookID}
    }

    // レビューを追加するメソッド
    func (b *Book) AddReview(review *Review) error {
    	// レビュー数の制約を集約内で強制できる
    	if len(b.Reviews) >= 100 {
    		return errors.New("レビュー数が上限に達しています")
    	}
    	b.Reviews = append(b.Reviews, review)
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class Book
    {
        public array $reviews; // レビューを直接含める

        public function __construct(
            public BookId $bookId,
            // ...
        ) {
        }

        // レビューを追加するメソッド
        public function addReview(Review $review): void
        {
            // レビュー数の制約を集約内で強制できる
            if (count($this->reviews) >= 100) {
                throw new Exception("レビュー数が上限に達しています");
            }
            $this->reviews[] = $review;
        }
    }
    ```

それに対し、`Book` 集約と `Review` 集約を分けたまま、状態の結果整合性を保つ。

この設計では、`Book` 集約と `Review` 集約を疎結合にしている。Book リポジトリで Books 集約の状態を取得し、Review リポジトリで取得した `Review` 集約に渡している。

=== "Go"

    ```go title=".go"
    // Book集約 - 基本情報管理に特化
    type Book struct {
    	bookID BookID
    	title  Title
    	author Author
    	price  Price
    }

    func NewBook(bookID BookID, title Title, author Author, price Price) *Book {
    	return &Book{bookID: bookID, title: title, author: author, price: price}
    }

    // 書籍の基本情報に関する機能のみを提供
    func (b *Book) ChangePrice(newPrice Price) {
    	b.price = newPrice
    }

    // Review集約 - レビュー分析という差別化ロジックに特化
    type Review struct {
    	reviewID ReviewID
    	bookID   BookID // 書籍IDで参照
    	rating   Rating
    	comment  *Comment
    }

    func NewReview(reviewID ReviewID, bookID BookID, rating Rating, comment *Comment) *Review {
    	return &Review{reviewID: reviewID, bookID: bookID, rating: rating, comment: comment}
    }

    // 差別化ロジック: レビューからの推薦書籍抽出
    func (r *Review) ExtractRecommendedBooks() []string {
    	// レビューからの推薦書籍抽出ロジック
    	// これは競合他社にはない独自の機能
    }

    // レビュー作成時に整合性を確認
    func createReview(ctx context.Context, bookID string, rating int, comment *string) error {
    	// 書籍の存在確認
    	book, err := bookRepository.FindByID(ctx, bookID) // DBから書籍を取得
    	if err != nil {
    		return err
    	}
    	if book == nil {
    		return errors.New("対象の書籍が存在しません")
    	}

    	// レビュー数の確認（一時的な不整合の可能性あり）
    	reviewCount, err := reviewRepository.CountByBookID(ctx, book.bookID)
    	if err != nil {
    		return err
    	}
    	if reviewCount >= 100 {
    		return errors.New("レビュー数が上限に達しています")
    	}

    	// レビューを作成
    	// ...
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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
      // ...
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    // Book集約 - 基本情報管理に特化
    class Book
    {
        public function __construct(
            private readonly BookId $bookId,
            private readonly Title $title,
            private readonly Author $author,
            private Price $price,
        ) {
        }

        public function bookId(): BookId
        {
            return $this->bookId;
        }

        // 書籍の基本情報に関する機能のみを提供
        public function changePrice(Price $newPrice): void
        {
            $this->price = $newPrice;
        }
    }

    // Review集約 - レビュー分析という差別化ロジックに特化
    class Review
    {
        public function __construct(
            private readonly ReviewId $reviewId,
            private readonly BookId $bookId, // 書籍IDで参照
            private readonly Rating $rating,
            private readonly ?Comment $comment = null,
        ) {
        }

        // 差別化ロジック: レビューからの推薦書籍抽出
        public function extractRecommendedBooks(): array
        {
            // レビューからの推薦書籍抽出ロジック
            // これは競合他社にはない独自の機能
        }
    }

    // レビュー作成時に整合性を確認
    function createReview(
        BookRepository $bookRepository,
        ReviewRepository $reviewRepository,
        string $bookId,
        int $rating,
        ?string $comment = null,
    ): void {
        // 書籍の存在確認
        $book = $bookRepository->findById($bookId); // DBから書籍を取得
        if ($book === null) {
            throw new Exception("対象の書籍が存在しません");
        }

        // レビュー数の確認（一時的な不整合の可能性あり）
        $reviewCount = $reviewRepository->countByBookId($book->bookId());
        if ($reviewCount >= 100) {
            throw new Exception("レビュー数が上限に達しています");
        }

        // レビューを作成
        // ...
    }
    ```

## 11-3 複数の集約による実装

### 11-3-1 設計指針に基づいた実装アプローチ

ここでは、『集約は小さくする』『集約間は識別子で参照する』『デメテルの法則に従う』『集約の外部では結果整合性を用いる』という 4 つの原則を守って、集約を実装する。

<table>
  <thead>
    <tr>
      <th>集約</th>
      <th>属性</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Book 集約</td>
      <td>・BookId、Title、Author、Price という属性を持つ</td>
    </tr>
    <tr>
      <td>Review 集約</td>
      <td>・ReviewId、BookId、Name、Rating、Comment という属性を持つ</td>
    </tr>
  </tbody>
</table>

### 11-3-2 Review 集約の実装

実際の `Review` 集約の実装は次のとおりである。

この実装では、`Review` 集約が書籍 ID（`BookId`）などの状態を持ち、また信頼性評価（`isTrustworthy()`）、推薦本抽出（`extractRecommendedBooks()`）、名前変更（`updateName()`）、評価変更（`updateRating()`）、コメント編集（`editComment()`）という振る舞いを持つ。

`Review` 集約が `Book` 集約を参照するときは、`BookId` を使うだけである。

`Review` 集約と `Book` 集約は疎結合になっている。

=== "Go"

    ```go title=".go"
    package review

    import (
    	"regexp"

    	"example.com/catalog/domain/models/book"
    )

    type Review struct {
    	identity ReviewIdentity
    	bookID   book.BookID
    	name     Name
    	rating   Rating
    	comment  *Comment
    }

    func Create(identity ReviewIdentity, bookID book.BookID, name Name, rating Rating, comment *Comment) *Review {
    	return &Review{identity: identity, bookID: bookID, name: name, rating: rating, comment: comment}
    }

    func Reconstruct(identity ReviewIdentity, bookID book.BookID, name Name, rating Rating, comment *Comment) *Review {
    	return &Review{identity: identity, bookID: bookID, name: name, rating: rating, comment: comment}
    }

    // IsTrustworthy このレビューが信頼できるかを判断
    // threshold: 信頼性閾値（0.0～1.0）
    // 信頼できる場合はtrueを返す
    func (r *Review) IsTrustworthy(threshold float64) bool {
    	// コメントがない場合は評価のみで判断
    	if r.comment == nil {
    		return r.rating.GetQualityFactor() >= threshold
    	}

    	// 評価とコメントの係数を組み合わせる
    	ratingFactor := r.rating.GetQualityFactor()
    	commentFactor := r.comment.GetQualityFactor()

    	// 評価の重みを0.7、コメントの重みを0.3とする
    	combinedFactor := ratingFactor*0.7 + commentFactor*0.3
    	return combinedFactor >= threshold
    }

    // ExtractRecommendedBooks コメントから推薦本を抽出する
    // 推薦本のタイトル配列を返す
    func (r *Review) ExtractRecommendedBooks() []string {
    	if r.comment == nil {
    		return []string{}
    	}

    	// 書籍名の後30文字以内に推薦キーワードがあるものを抽出
    	pattern := regexp.MustCompile(`[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)`)

    	matches := r.comment.ExtractMatches(pattern)
    	seen := make(map[string]struct{}, len(matches))
    	uniqueMatches := make([]string, 0, len(matches))
    	for _, match := range matches {
    		if _, ok := seen[match]; ok {
    			continue
    		}
    		seen[match] = struct{}{}
    		uniqueMatches = append(uniqueMatches, match)
    	}
    	return uniqueMatches
    }

    // Equals 別のレビューと同一かどうかを判定
    // other: 比較対象のレビュー
    // 同一の場合はtrueを返す
    func (r *Review) Equals(other *Review) bool {
    	return r.identity.Equals(other.identity)
    }

    func (r *Review) ReviewID() ReviewID {
    	return r.identity.ReviewID()
    }

    func (r *Review) BookID() book.BookID {
    	return r.bookID
    }

    func (r *Review) Name() Name {
    	return r.name
    }

    func (r *Review) Rating() Rating {
    	return r.rating
    }

    func (r *Review) Comment() *Comment {
    	return r.comment
    }

    func (r *Review) UpdateName(name Name) {
    	r.name = name
    }

    func (r *Review) UpdateRating(rating Rating) {
    	r.rating = rating
    }

    func (r *Review) EditComment(comment Comment) {
    	r.comment = &comment
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    <?php

    namespace Domain\Models\Review;

    use Domain\Models\Book\BookId\BookId;
    use Domain\Models\Review\Comment\Comment;
    use Domain\Models\Review\Name\Name;
    use Domain\Models\Review\Rating\Rating;
    use Domain\Models\Review\ReviewId\ReviewId;
    use Domain\Models\Review\ReviewIdentity\ReviewIdentity;

    class Review
    {
        private function __construct(
            private readonly ReviewIdentity $identity,
            private readonly BookId $bookId,
            private Name $name,
            private Rating $rating,
            private ?Comment $comment = null,
        ) {
        }

        public static function create(
            ReviewIdentity $identity,
            BookId $bookId,
            Name $name,
            Rating $rating,
            ?Comment $comment = null,
        ): self {
            return new self($identity, $bookId, $name, $rating, $comment);
        }

        public static function reconstruct(
            ReviewIdentity $identity,
            BookId $bookId,
            Name $name,
            Rating $rating,
            ?Comment $comment = null,
        ): self {
            return new self($identity, $bookId, $name, $rating, $comment);
        }

        /**
         * このレビューが信頼できるかを判断
         * @param float $threshold 信頼性閾値（0.0～1.0）
         * @return bool 信頼できる場合はtrue
         */
        public function isTrustworthy(float $threshold = 0.6): bool
        {
            // コメントがない場合は評価のみで判断
            if ($this->comment === null) {
                return $this->rating->getQualityFactor() >= $threshold;
            }

            // 評価とコメントの係数を組み合わせる
            $ratingFactor = $this->rating->getQualityFactor();
            $commentFactor = $this->comment->getQualityFactor();

            // 評価の重みを0.7、コメントの重みを0.3とする
            $combinedFactor = $ratingFactor * 0.7 + $commentFactor * 0.3;
            return $combinedFactor >= $threshold;
        }

        /**
         * コメントから推薦本を抽出する
         * @return string[] 推薦本のタイトル配列
         */
        public function extractRecommendedBooks(): array
        {
            if ($this->comment === null) {
                return [];
            }

            // 書籍名の後30文字以内に推薦キーワードがあるものを抽出
            $pattern =
                "/[『『]([^』』]+)[』』][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)/u";

            $matches = $this->comment->extractMatches($pattern);
            return array_values(array_unique($matches));
        }

        /**
         * 別のレビューと同一かどうかを判定
         * @param Review $other 比較対象のレビュー
         * @return bool 同一の場合はtrue
         */
        public function equals(Review $other): bool
        {
            return $this->identity->equals($other->identity);
        }

        public function reviewId(): ReviewId
        {
            return $this->identity->reviewId();
        }

        public function bookId(): BookId
        {
            return $this->bookId;
        }

        public function name(): Name
        {
            return $this->name;
        }

        public function rating(): Rating
        {
            return $this->rating;
        }

        public function comment(): ?Comment
        {
            return $this->comment;
        }

        public function updateName(Name $name): void
        {
            $this->name = $name;
        }

        public function updateRating(Rating $rating): void
        {
            $this->rating = $rating;
        }

        public function editComment(Comment $comment): void
        {
            $this->comment = $comment;
        }
    }
    ```

### 11-3-3 Book 集約の実装

`Book` 集約は書籍 ID（`BookId`）、タイトル（`Title`）、著者（`Author`）、価格（`Price`）という状態を持ち、また価格変更（`changePrice()`）という振る舞いを持つ。

`Book` 集約が `Review` 集約をコールすることはない。

`Review` 集約と `Book` 集約は疎結合になっている。

=== "Go"

    ```go title=".go"
    package book

    type Book struct {
    	identity BookIdentity
    	price    Price
    }

    func NewBook(identity BookIdentity, price Price) *Book {
    	return &Book{identity: identity, price: price}
    }

    func Create(identity BookIdentity, price Price) *Book {
    	return NewBook(identity, price)
    }

    func Reconstruct(identity BookIdentity, price Price) *Book {
    	return NewBook(identity, price)
    }

    // Equals 別の書籍と同一かどうかを判定
    // other: 比較対象の書籍
    // 同一の場合はtrueを返す
    func (b *Book) Equals(other *Book) bool {
    	return b.identity.Equals(other.identity)
    }

    func (b *Book) BookID() BookID {
    	return b.identity.BookID()
    }

    func (b *Book) Title() Title {
    	return b.identity.Title()
    }

    func (b *Book) Author() Author {
    	return b.identity.Author()
    }

    func (b *Book) Price() Price {
    	return b.price
    }

    func (b *Book) ChangePrice(price Price) {
    	b.price = price
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    <?php

    namespace Domain\Models\Book;

    use Domain\Models\Book\Author\Author;
    use Domain\Models\Book\BookId\BookId;
    use Domain\Models\Book\BookIdentity\BookIdentity;
    use Domain\Models\Book\Price\Price;
    use Domain\Models\Book\Title\Title;

    class Book
    {
        public function __construct(
            private readonly BookIdentity $identity,
            private Price $price,
        ) {
        }

        public static function create(BookIdentity $identity, Price $price): self
        {
            return new self($identity, $price);
        }

        public static function reconstruct(BookIdentity $identity, Price $price): self
        {
            return new self($identity, $price);
        }

        /**
         * 別の書籍と同一かどうかを判定
         * @param Book $other 比較対象の書籍
         * @return bool 同一の場合はtrue
         */
        public function equals(Book $other): bool
        {
            return $this->identity->equals($other->identity);
        }

        public function bookId(): BookId
        {
            return $this->identity->bookId();
        }

        public function title(): Title
        {
            return $this->identity->title();
        }

        public function author(): Author
        {
            return $this->identity->author();
        }

        public function price(): Price
        {
            return $this->price;
        }

        public function changePrice(Price $price): void
        {
            $this->price = $price;
        }
    }
    ```

## 11-4 集約のテスト

### 11-4-1 集約テストの役割

集約のテストでは、状態を正常に変更できるか、ドメインルールに違反する操作を正常にバリデーションできるか、そしてドメインイベントなどの副作用が適切に発生するかをユニットテストする。

### 11-4-2 Review 集約のテスト

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

```typescript title=".ts"
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

      // プライベート関数をモンキーパッチし、仮の返却値を返却させるように内部実装を差し替える
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

      // プライベート関数をモンキーパッチし、仮の返却値を返却させるように内部実装を差し替える
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

### 11-4-3 Book 集約のテスト

サンプルコードでは、次のコマンドでユニットテストを実行できる。

```bash
npx jest src/Domain/models/Book/Book.test.ts
```

`Book` 集約のテストは、次をユニットテストしている。

- `Book` 集約の作成（`"create"`）
- `Book` 集約の再作成（`"reconstruct"`）
- `Book` 集約の同一性判定（`"equals"`）
- 書籍価格の変更（`"changePrice"`）

```typescript title=".ts"
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
