---
title: 【IT技術の知見】エラー＠クリーンアーキテクチャ
description: エラー＠クリーンアーキテクチャの知見を記録しています。
---

# エラー＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 上位層への例外伝播

各レイヤーでは例外をスローするだけに留まり、スローされた例外を対処する責務は、より上位レイヤーに持たせる。

より上位レイヤーでは、そのレイヤーに合った例外へ詰め替えてスローする。

最終的には、インターフェース層まで持ち上げ、画面上のポップアップで警告文としてこれを表示する。

<br>

## 02. インターフェース層

### 例外の種類

#### ▼ BadRequestError

リクエスト形式が不正である。

=== "Go"

    ```go
    type BadRequestError struct {
    	name       string
    	statusCode int
    }

    func NewBadRequestError() *BadRequestError {
    	return &BadRequestError{
    		// エラー名
    		name: "BadRequestError",
    		// ステータスコード
    		statusCode: 400,
    	}
    }

    func (e *BadRequestError) Error() string {
    	// エラーメッセージ
    	return "リクエスト形式が不正です"
    }
    ```

=== "TypeScript"

    ```typescript
    export class BadRequestError extends Error {
      private readonly _name: string;
      private readonly _statusCode: number;

      constructor() {
        // エラーメッセージ
        super("リクエスト形式が不正です");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "BadRequestError";
        // ステータスコード
        this._statusCode = 400;
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class BadRequestError extends Exception
    {
        // エラー名
        private string $name = "BadRequestError";

        // ステータスコード
        private int $statusCode = 400;

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("リクエスト形式が不正です");
        }
    }
    ```

#### ▼ UnauthorizedError

認証されていない。

=== "Go"

    ```go
    type UnauthorizedError struct {
    	name       string
    	statusCode int
    }

    func NewUnauthorizedError() *UnauthorizedError {
    	return &UnauthorizedError{
    		// エラー名
    		name: "UnauthorizedError",
    		// ステータスコード
    		statusCode: 401,
    	}
    }

    func (e *UnauthorizedError) Error() string {
    	// エラーメッセージ
    	return "認証されていません"
    }
    ```

=== "TypeScript"

    ```typescript
    export class UnauthorizedError extends Error {
      private readonly _name: string;
      private readonly _statusCode: number;

      constructor() {
        // エラーメッセージ
        super("認証されていません");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "UnauthorizedError";
        // ステータスコード
        this._statusCode = 401;
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class UnauthorizedError extends Exception
    {
        // エラー名
        private string $name = "UnauthorizedError";

        // ステータスコード
        private int $statusCode = 401;

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("認証されていません");
        }
    }
    ```

#### ▼ ForbiddenError

認可されていない。

=== "Go"

    ```go
    type ForbiddenError struct {
    	name       string
    	statusCode int
    }

    func NewForbiddenError() *ForbiddenError {
    	return &ForbiddenError{
    		// エラー名
    		name: "ForbiddenError",
    		// ステータスコード
    		statusCode: 403,
    	}
    }

    func (e *ForbiddenError) Error() string {
    	// エラーメッセージ
    	return "認可されていません"
    }
    ```

=== "TypeScript"

    ```typescript
    export class ForbiddenError extends Error {
      private readonly _name: string;
      private readonly _statusCode: number;

      constructor() {
        // エラーメッセージ
        super("認可されていません");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "ForbiddenError";
        // ステータスコード
        this._statusCode = 403;
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class ForbiddenError extends Exception
    {
        // エラー名
        private string $name = "ForbiddenError";

        // ステータスコード
        private int $statusCode = 403;

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("認可されていません");
        }
    }
    ```

<br>

### ハンドリング

ユースケース層の処理から返された例外を捕捉し、エラーレスポンスにして返信する。

<br>

### クライアント別の例外

ドメイン例外やユースケース例外は何が起きたかだけを表し、どのクライアントから呼ばれたかやレスポンスの形式を知らない。

インターフェース層で、それぞれの例外を UI クライアント向けと API クライアント向けのエラーレスポンスに分けて詰め替える。

API クライアント向けのエラーレスポンスには、クライアントが処理を分岐できるように、変わらない `code` を持たせる。

=== "Go"

    ```go
    // ドメイン層：ドメインルールに違反した場合、ドメイン例外を返却する
    type FooName struct {
    	value string
    }

    func NewFooName(value string) (*FooName, error) {
    	if utf8.RuneCountInString(value) > 20 {
    		return nil, NewFooNameLengthExceededError(value)
    	}

    	return &FooName{value: value}, nil
    }

    // ユースケース層：ユースケースの処理に失敗した場合、ユースケース例外を返却する
    func ChangeFooName(ctx context.Context, id string, name string) error {
    	foo, err := fooRepository.FindById(ctx, id)
    	if err != nil {
    		return err
    	}
    	if foo == nil {
    		return NewFooNotFoundError()
    	}

    	fooName, err := NewFooName(name)
    	if err != nil {
    		return err
    	}

    	foo.ChangeName(fooName)

    	return fooRepository.Save(ctx, foo)
    }

    // インターフェース層：UIクライアント向けのエラーレスポンス
    func UiNotFoundErrorResponse(w http.ResponseWriter, err *FooNotFoundError) {
    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusNotFound)
    	json.NewEncoder(w).Encode(map[string]any{
    		"error": map[string]string{"title": "404 Not Found", "message": err.Error()},
    	})
    }

    // インターフェース層：APIクライアント向けのエラーレスポンス
    func ApiNotFoundErrorResponse(w http.ResponseWriter, err *FooNotFoundError) {
    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusNotFound)
    	json.NewEncoder(w).Encode(map[string]string{
    		"title":   "404 Not Found",
    		"message": err.Error(),
    		"code":    "NOT_FOUND",
    	})
    }

    func ApiBadRequestErrorResponse(w http.ResponseWriter, err *FooNameLengthExceededError) {
    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusBadRequest)
    	json.NewEncoder(w).Encode(map[string]string{
    		"title":   "400 Bad Request",
    		"message": err.Error(),
    		"code":    "BAD_REQUEST",
    	})
    }

    // インターフェース層：APIクライアント向けのコントローラー
    func ChangeFooNameHandler(w http.ResponseWriter, r *http.Request) {
    	err := ChangeFooName(r.Context(), r.PathValue("id"), r.FormValue("name"))

    	var notFoundErr *FooNotFoundError
    	if errors.As(err, &notFoundErr) {
    		ApiNotFoundErrorResponse(w, notFoundErr)
    		return
    	}

    	var lengthExceededErr *FooNameLengthExceededError
    	if errors.As(err, &lengthExceededErr) {
    		ApiBadRequestErrorResponse(w, lengthExceededErr)
    		return
    	}

    	if err != nil {
    		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
    		return
    	}

    	w.WriteHeader(http.StatusOK)
    }
    ```

=== "TypeScript"

    ```typescript
    // ドメイン層：ドメインルールに違反した場合、ドメイン例外をスローする
    export class FooName {
      constructor(private readonly value: string) {
        if (value.length > 20) {
          throw new FooNameLengthExceededError(value);
        }
      }
    }

    // ユースケース層：ユースケースの処理に失敗した場合、ユースケース例外をスローする
    export async function changeFooName({ id, name }: { id: string; name: string }) {
      const foo = await fooRepository.findById(id);
      if (!foo) {
        throw new FooNotFoundError();
      }

      foo.changeName(new FooName(name));

      await fooRepository.save(foo);
    }

    // インターフェース層：UIクライアント向けのエラーレスポンス
    export class UiNotFoundErrorResponse extends Response {
      constructor(error: FooNotFoundError) {
        super(
          JSON.stringify({
            error: { title: "404 Not Found", message: error.message },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // インターフェース層：APIクライアント向けのエラーレスポンス
    export class ApiNotFoundErrorResponse extends Response {
      constructor(error: FooNotFoundError) {
        super(
          JSON.stringify({
            title: "404 Not Found",
            message: error.message,
            code: "NOT_FOUND",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    export class ApiBadRequestErrorResponse extends Response {
      constructor(error: FooNameLengthExceededError) {
        super(
          JSON.stringify({
            title: "400 Bad Request",
            message: error.message,
            code: "BAD_REQUEST",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // インターフェース層：APIクライアント向けのコントローラー
    try {
      await changeFooName({ id, name });
    } catch (error) {
      if (error instanceof FooNotFoundError) {
        throw new ApiNotFoundErrorResponse(error);
      }
      if (error instanceof FooNameLengthExceededError) {
        throw new ApiBadRequestErrorResponse(error);
      }
      throw error;
    }
    ```

=== "PHP"

    ```injectablephp
    // ドメイン層：ドメインルールに違反した場合、ドメイン例外をスローする
    class FooName
    {
        public function __construct(private readonly string $value)
        {
            if (mb_strlen($value) > 20) {
                throw new FooNameLengthExceededError($value);
            }
        }
    }

    // ユースケース層：ユースケースの処理に失敗した場合、ユースケース例外をスローする
    class FooUsecase
    {
        public function __construct(private readonly FooRepository $fooRepository)
        {
        }

        public function changeFooName(string $id, string $name): void
        {
            $foo = $this->fooRepository->findById($id);
            if ($foo === null) {
                throw new FooNotFoundError();
            }

            $foo->changeName(new FooName($name));

            $this->fooRepository->save($foo);
        }
    }

    // インターフェース層：UIクライアント向けのエラーレスポンス
    class UiNotFoundErrorResponse
    {
        public function __construct(private readonly FooNotFoundError $error)
        {
        }

        public function send(): void
        {
            http_response_code(404);
            header("Content-Type: application/json");
            echo json_encode([
                "error" => ["title" => "404 Not Found", "message" => $this->error->getMessage()],
            ]);
        }
    }

    // インターフェース層：APIクライアント向けのエラーレスポンス
    class ApiNotFoundErrorResponse
    {
        public function __construct(private readonly FooNotFoundError $error)
        {
        }

        public function send(): void
        {
            http_response_code(404);
            header("Content-Type: application/json");
            echo json_encode([
                "title" => "404 Not Found",
                "message" => $this->error->getMessage(),
                "code" => "NOT_FOUND",
            ]);
        }
    }

    class ApiBadRequestErrorResponse
    {
        public function __construct(private readonly FooNameLengthExceededError $error)
        {
        }

        public function send(): void
        {
            http_response_code(400);
            header("Content-Type: application/json");
            echo json_encode([
                "title" => "400 Bad Request",
                "message" => $this->error->getMessage(),
                "code" => "BAD_REQUEST",
            ]);
        }
    }

    // インターフェース層：APIクライアント向けのコントローラー
    try {
        $fooUsecase->changeFooName($id, $name);
    } catch (FooNotFoundError $error) {
        (new ApiNotFoundErrorResponse($error))->send();
    } catch (FooNameLengthExceededError $error) {
        (new ApiBadRequestErrorResponse($error))->send();
    }
    ```

<br>

## 03. ユースケース層

### 例外の種類

ユースケースの処理に失敗した例外である。

#### ▼ FooNotFoundError

Foo ドメインオブジェクトが存在しない。

=== "Go"

    ```go
    type FooNotFoundError struct {
    	name string
    }

    func NewFooNotFoundError() *FooNotFoundError {
    	return &FooNotFoundError{
    		// エラー名
    		name: "FooNotFoundError",
    	}
    }

    func (e *FooNotFoundError) Error() string {
    	// エラーメッセージ
    	return "Fooドメインオブジェクトが存在しません"
    }
    ```

=== "TypeScript"

    ```typescript
    export class FooNotFoundError extends Error {
      private readonly _name: string;

      constructor() {
        // エラーメッセージ
        super("Fooドメインオブジェクトが存在しません");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "FooNotFoundError";
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooNotFoundError extends Exception
    {
        // エラー名
        private string $name = "FooNotFoundError";

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("Fooドメインオブジェクトが存在しません");
        }
    }
    ```

#### ▼ FooAlreadyExistsError

Foo ドメインオブジェクトが重複する。

#### ▼ FooQuotaExceededError

Foo ドメインオブジェクトの登録上限を超えている。

#### ▼ FooChangeFailedError

更新系ユースケースが失敗した。

#### ▼ FooRegisterFailedError

登録系ユースケースが失敗した。

=== "Go"

    ```go
    type FooRegisterFailedError struct {
    	name string
    }

    func NewFooRegisterFailedError() *FooRegisterFailedError {
    	return &FooRegisterFailedError{
    		// エラー名
    		name: "FooRegisterFailedError",
    	}
    }

    func (e *FooRegisterFailedError) Error() string {
    	// エラーメッセージ
    	return "Fooドメインオブジェクトの登録に失敗しました"
    }
    ```

=== "TypeScript"

    ```typescript
    export class FooRegisterFailedError extends Error {
      private readonly _name: string;

      constructor() {
        // エラーメッセージ
        super("Fooドメインオブジェクトの登録に失敗しました");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "FooRegisterFailedError";
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooRegisterFailedError extends Exception
    {
        // エラー名
        private string $name = "FooRegisterFailedError";

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("Fooドメインオブジェクトの登録に失敗しました");
        }
    }
    ```

#### ▼ FooGetDraftFailedError

下書き系ユースケースが失敗した。

#### ▼ FooGetFailedError

閲覧系ユースケースが失敗した。

#### ▼ FooDeleteFailedError

削除系ユースケースが失敗した。

<br>

### ハンドリング

トランザクションの処理から返されたインフラストラクチャ例外を捕捉し、ユースケース例外に詰め替えて返却する。

<br>

### ユースケース別の例外

ユースケースの処理に失敗した例外は、登録系・更新系・閲覧系・削除系といったユースケースの種類ごとに分ける。

どのユースケースで失敗したかが例外名からわかるため、インターフェース層でエラーメッセージやログを出し分けやすくなる。

=== "Go"

    ```go
    // 登録系ユースケース
    func RegisterFoo(ctx context.Context, name string) error {
    	fooName, err := NewFooName(name)
    	if err != nil {
    		return err
    	}

    	if err := fooRepository.Save(ctx, NewFoo(fooName)); err != nil {
    		return NewFooRegisterFailedError()
    	}

    	return nil
    }

    // 削除系ユースケース
    func DeleteFoo(ctx context.Context, id string) error {
    	if err := fooRepository.Delete(ctx, id); err != nil {
    		return NewFooDeleteFailedError()
    	}

    	return nil
    }
    ```

=== "TypeScript"

    ```typescript
    // 登録系ユースケース
    export async function registerFoo({ name }: { name: string }) {
      try {
        await fooRepository.save(new Foo(new FooName(name)));
      } catch (error) {
        throw new FooRegisterFailedError();
      }
    }

    // 削除系ユースケース
    export async function deleteFoo({ id }: { id: string }) {
      try {
        await fooRepository.delete(id);
      } catch (error) {
        throw new FooDeleteFailedError();
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooUsecase
    {
        public function __construct(private readonly FooRepository $fooRepository)
        {
        }

        // 登録系ユースケース
        public function registerFoo(string $name): void
        {
            try {
                $this->fooRepository->save(new Foo(new FooName($name)));
            } catch (Exception $error) {
                throw new FooRegisterFailedError();
            }
        }

        // 削除系ユースケース
        public function deleteFoo(string $id): void
        {
            try {
                $this->fooRepository->delete($id);
            } catch (Exception $error) {
                throw new FooDeleteFailedError();
            }
        }
    }
    ```

<br>

## 04. ドメイン層

### 例外の種類

ドメインルールに違反した例外である。

#### ▼ FooNameLengthExceededError

Foo 名が許可された最大文字数を超えている。

=== "Go"

    ```go
    type FooNameLengthExceededError struct {
    	name      string
    	maxLength int
    }

    func NewFooNameLengthExceededError(fooName string) *FooNameLengthExceededError {
    	return &FooNameLengthExceededError{
    		// エラー名
    		name: "FooNameLengthExceededError",
    		// ドメインルール
    		maxLength: 20,
    	}
    }

    func (e *FooNameLengthExceededError) Error() string {
    	// エラーメッセージ
    	return fmt.Sprintf("Foo名は%d文字以内にしてください", e.maxLength)
    }
    ```

=== "TypeScript"

    ```typescript
    export class FooNameLengthExceededError extends Error {
      private readonly _name: string;
      private readonly _maxLength: number;

      constructor(fooName: string) {
        // エラーメッセージ
        super(`Foo名は20文字以内にしてください`);

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "FooNameLengthExceededError";
        // ドメインルール
        this._maxLength = 20;
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooNameLengthExceededError extends Exception
    {
        // エラー名
        private string $name = "FooNameLengthExceededError";

        // ドメインルール
        private int $maxLength = 20;

        public function __construct(string $fooName)
        {
            // エラーメッセージ
            parent::__construct("Foo名は{$this->maxLength}文字以内にしてください");
        }
    }
    ```

#### ▼ FooNameRequiredError

Foo 名が空である。

=== "Go"

    ```go
    type FooNameRequiredError struct {
    	name string
    }

    func NewFooNameRequiredError() *FooNameRequiredError {
    	return &FooNameRequiredError{
    		// エラー名
    		name: "FooNameRequiredError",
    	}
    }

    func (e *FooNameRequiredError) Error() string {
    	// エラーメッセージ
    	return "Foo名は必須です"
    }
    ```

=== "TypeScript"

    ```typescript
    export class FooNameRequiredError extends Error {
      private readonly _name: string;

      constructor() {
        // エラーメッセージ
        super("Foo名は必須です");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "FooNameRequiredError";
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooNameRequiredError extends Exception
    {
        // エラー名
        private string $name = "FooNameRequiredError";

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("Foo名は必須です");
        }
    }
    ```

<br>

### ハンドリング

ドメイン層では例外を捕捉せず、そのまま上位層に返却する。

<br>

### ドメインルール別の例外

ドメイン例外は、違反したドメインルールごとに分ける。

`FooNameInvalidError` のように 1 つにまとめると、どのドメインルールに違反したのかが例外名からわからなくなる。

=== "Go"

    ```go
    type FooName struct {
    	value string
    }

    func NewFooName(value string) (*FooName, error) {
    	// 必須のドメインルール
    	if value == "" {
    		return nil, NewFooNameRequiredError()
    	}

    	// 最大文字数のドメインルール
    	if utf8.RuneCountInString(value) > 20 {
    		return nil, NewFooNameLengthExceededError(value)
    	}

    	return &FooName{value: value}, nil
    }
    ```

=== "TypeScript"

    ```typescript
    export class FooName {
      constructor(private readonly value: string) {
        // 必須のドメインルール
        if (value.length === 0) {
          throw new FooNameRequiredError();
        }

        // 最大文字数のドメインルール
        if (value.length > 20) {
          throw new FooNameLengthExceededError(value);
        }
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class FooName
    {
        public function __construct(private readonly string $value)
        {
            // 必須のドメインルール
            if ($value === "") {
                throw new FooNameRequiredError();
            }

            // 最大文字数のドメインルール
            if (mb_strlen($value) > 20) {
                throw new FooNameLengthExceededError($value);
            }
        }
    }
    ```

<br>

## 05. インフラストラクチャ層

### 例外の種類

データベースに関する例外である。

#### ▼ UniqueConstraintError

プライマリーキー制約に違反した。

=== "Go"

    ```go
    type UniqueConstraintError struct {
    	name string
    }

    func NewUniqueConstraintError() *UniqueConstraintError {
    	return &UniqueConstraintError{
    		// エラー名
    		name: "UniqueConstraintError",
    	}
    }

    func (e *UniqueConstraintError) Error() string {
    	// エラーメッセージ
    	return "プライマリーキー制約に違反しました"
    }
    ```

=== "TypeScript"

    ```typescript
    export class UniqueConstraintError extends Error {
      private readonly _name: string;

      constructor() {
        // エラーメッセージ
        super("プライマリーキー制約に違反しました");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "UniqueConstraintError";
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class UniqueConstraintError extends Exception
    {
        // エラー名
        private string $name = "UniqueConstraintError";

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("プライマリーキー制約に違反しました");
        }
    }
    ```

#### ▼ ForeignKeyConstraintError

外部キー制約に違反した。

#### ▼ DatabaseConnectionError

DB 接続に失敗した。

=== "Go"

    ```go
    type DatabaseConnectionError struct {
    	name string
    }

    func NewDatabaseConnectionError() *DatabaseConnectionError {
    	return &DatabaseConnectionError{
    		// エラー名
    		name: "DatabaseConnectionError",
    	}
    }

    func (e *DatabaseConnectionError) Error() string {
    	// エラーメッセージ
    	return "DB接続に失敗しました"
    }
    ```

=== "TypeScript"

    ```typescript
    export class DatabaseConnectionError extends Error {
      private readonly _name: string;

      constructor() {
        // エラーメッセージ
        super("DB接続に失敗しました");

        Object.setPrototypeOf(this, new.target.prototype);

        // エラー名
        this._name = "DatabaseConnectionError";
      }
    }
    ```

=== "PHP"

    ```injectablephp
    class DatabaseConnectionError extends Exception
    {
        // エラー名
        private string $name = "DatabaseConnectionError";

        public function __construct()
        {
            // エラーメッセージ
            parent::__construct("DB接続に失敗しました");
        }
    }
    ```

#### ▼ QueryTimeoutError

クエリがタイムアウトした。

<br>

### ハンドリング

トランザクションの処理から返された例外を捕捉し、インフラストラクチャ例外にして返却する。

<br>

### 障害の種類別の例外

インフラストラクチャ例外は、制約違反や接続失敗といった障害の種類ごとに分ける。

障害の種類によって、ユースケース層での対応（ユースケース例外への詰め替え、再試行など）が変わるためである。

=== "Go"

    ```go
    err := fooRepository.Save(ctx, foo)

    // 制約違反の場合、重複を表すユースケース例外に詰め替える
    var uniqueConstraintErr *UniqueConstraintError
    if errors.As(err, &uniqueConstraintErr) {
    	return NewFooAlreadyExistsError()
    }

    // 一時的な障害の場合、再試行する
    var connectionErr *DatabaseConnectionError
    var timeoutErr *QueryTimeoutError
    if errors.As(err, &connectionErr) || errors.As(err, &timeoutErr) {
    	return retry(func() error {
    		return fooRepository.Save(ctx, foo)
    	})
    }

    return err
    ```

=== "TypeScript"

    ```typescript
    try {
      await fooRepository.save(foo);
    } catch (error) {
      // 制約違反の場合、重複を表すユースケース例外に詰め替える
      if (error instanceof UniqueConstraintError) {
        throw new FooAlreadyExistsError();
      }

      // 一時的な障害の場合、再試行する
      if (
        error instanceof DatabaseConnectionError ||
        error instanceof QueryTimeoutError
      ) {
        return await retry(() => fooRepository.save(foo));
      }

      throw error;
    }
    ```

=== "PHP"

    ```injectablephp
    try {
        $this->fooRepository->save($foo);
    } catch (UniqueConstraintError $error) {
        // 制約違反の場合、重複を表すユースケース例外に詰め替える
        throw new FooAlreadyExistsError();
    } catch (DatabaseConnectionError | QueryTimeoutError $error) {
        // 一時的な障害の場合、再試行する
        retry(fn () => $this->fooRepository->save($foo));
    }
    ```

<br>
