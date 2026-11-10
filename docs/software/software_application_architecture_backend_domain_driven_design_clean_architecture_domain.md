---
title: 【IT技術の知見】ドメイン層＠クリーンアーキテクチャ
description: ドメイン層＠クリーンアーキテクチャの知見を記録しています。
---

# ドメイン層＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

TypeScript の例では、インターフェースで型を定義し、生成関数でドメインオブジェクトを作る。非公開の状態はクロージャーに保持し、共通の処理は関数やオブジェクトの合成で共有する。

<br>

## 01. ドメイン層

### ドメイン層とは

ドメインモデルやドメインルールを定義する。

<br>

### エンティティ

#### ▼ エンティティとは

ノート内の『エンティティ』の項目を参照せよ。

<br>

### 値オブジェクト

#### ▼ 値オブジェクトとは

ノート内の『値オブジェクト』の項目を参照せよ。

<br>

### ドメインイベント

#### ▼ ドメインイベントとは

ドメイン層のなかで、ビジネス的な『出来事』をモデリングしたもの。

エンティティや値オブジェクトは『物』をモデリングするため、着眼点が異なる。

エンティティデザインパターンの 1 つである『パブリッシュ／サブスクライブ方式』の概念を使用して、ドメインイベントとイベントリスナー (イベントハンドラー) の関連を表す。

<br>

### 区分オブジェクト

#### ▼ 区分オブジェクトとは

区分オブジェクトは概念的な呼び名で、実際は、標準的なパッケージとして利用できる enum 型のクラスに相当する。

一意に識別する必要がないユビキタス言語のなかでも、特に『区分』や『種類』などは、値オブジェクトとしてではなく、enum 型のクラスとしてモデリング/実装する。

ただし、類似するパターンとして値オブジェクトのディレクトリ内に配置してもよい。

#### ▼ 色

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    const (
    	ColorTypeRed  = 1
    	ColorTypeBlue = 2
    )

    // 『定数名』で、定義の値へアクセスする
    var colorTypeSet = map[int]map[string]string{
    	ColorTypeRed:  {"name": "レッド"},
    	ColorTypeBlue: {"name": "ブルー"},
    }

    // 色の区分オブジェクト
    type ColorType struct {
    	// 値
    	value int
    	// 色名
    	name string
    }

    // インスタンス化の時に、『色の区分値』を受け取る。
    func NewColorType(value int) *ColorType {
    	// valueに応じて、色名をnameデータにセットする。
    	return &ColorType{
    		value: value,
    		name:  colorTypeSet[value]["name"],
    	}
    }

    // 値を返却する
    func (c *ColorType) Value() int {
    	return c.value
    }

    // 色名を返却する
    func (c *ColorType) Name() string {
    	return c.name
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /**
     * 色の区分オブジェクト
     */

    export const COLORTYPE_RED = 1;

    export const COLORTYPE_BLUE = 2;
    /**
     * 色の区分値と表示名の対応を定義する
     */
    const COLORTYPE_SET: Record<number, {name: string}> = {
      [COLORTYPE_RED]: {name: "レッド"},
      [COLORTYPE_BLUE]: {name: "ブルー"},
    };
    export interface ColorType {
      value(): number;
      name(): string;
    }
    export function createColorType(initialValue: number): ColorType {
      const state: {_value: number; _name: string} = {
        _value: initialValue,
        _name: COLORTYPE_SET[initialValue].name,
      };

      // initialValueに応じて、色名をnameデータにセットする。

      /**
       * 値を返却する
       */
      function value(): number {
        return state._value;
      }
      /**
       * 色名を返却する
       */
      function name(): string {
        return state._name;
      }
      return {value, name};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 色の区分オブジェクト
     */
    class ColorType
    {
        const RED = 1;
        const BLUE = 2;

        /**
         * 『self::定数名』で、定義の値へアクセスする
         */
        private static array $set = [
            self::RED  => ["name" => "レッド"],
            self::BLUE => ["name" => "ブルー"]
        ];

        /**
         * 値
         */
        private int $value;

        /**
         * 色名
         */
        private string $name;

        // インスタンス化の時に、『色の区分値』を受け取る。
        public function __construct(int $value)
        {
            // $valueに応じて、色名をnameデータにセットする。
            $this->value = $value;
            $this->name = static::$set[$value]["name"];
        }

        /**
         * 値を返却する
         */
        public function value(): int
        {
            return $this->value;
        }

        /**
         * 色名を返却する
         */
        public function name(): string
        {
            return $this->name;
        }
    }
    ```

#### ▼ 性別

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    const (
    	SexTypeMan     = 1
    	SexTypeWoman   = 2
    	SexTypeUnknown = 3
    )

    var sexTypeSet = map[int]map[string]string{
    	SexTypeMan:     {"name": "男性"},
    	SexTypeWoman:   {"name": "女性"},
    	SexTypeUnknown: {"name": "不明"},
    }

    // 性別の区分オブジェクト
    type SexType struct {
    	// 値
    	value int
    	// 名前
    	name string
    }

    func NewSexType(value int) *SexType {
    	return &SexType{
    		value: value,
    		name:  sexTypeSet[value]["name"],
    	}
    }

    // 値を返却する
    func (s *SexType) Value() int {
    	return s.value
    }

    // 名前を返却する
    func (s *SexType) Name() string {
    	return s.name
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /**
     * 性別の区分オブジェクト
     */

    export const SEXTYPE_MAN = 1;

    export const SEXTYPE_WOMAN = 2;

    export const SEXTYPE_UNKNOWN = 3;

    const SEXTYPE_SET: Record<number, {name: string}> = {
      [SEXTYPE_MAN]: {name: "男性"},
      [SEXTYPE_WOMAN]: {name: "女性"},
      [SEXTYPE_UNKNOWN]: {name: "不明"},
    };
    export interface SexType {
      value(): number;
      name(): string;
    }
    export function createSexType(initialValue: number): SexType {
      const state: {_value: number; _name: string} = {
        _value: initialValue,
        _name: SEXTYPE_SET[initialValue].name,
      };

      /**
       * 値を返却する
       */
      function value(): number {
        return state._value;
      }
      /**
       * 名前を返却する
       */
      function name(): string {
        return state._name;
      }
      return {value, name};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 性別の区分オブジェクト
     */
    class SexType
    {
        const MAN     = 1;
        const WOMAN   = 2;
        const UNKNOWN = 3;

        private static array $set = [
            self::MAN     => ["name" => "男性"],
            self::WOMAN   => ["name" => "女性"],
            self::UNKNOWN => ["name" => "不明"],
        ];

        /**
         * 値
         */
        private int $value;

        /**
         * 名前
         */
        private string $name;

        public function __construct(int $value)
        {
            $this->value = $value;
            $this->name = static::$set[$value]["name"];
        }

        /**
         * 値を返却する
         */
        public function value(): int
        {
            return $this->value;
        }
        /**
         * 名前を返却する
         */
        public function name(): string
        {
            return $this->name;
        }
    }
    ```

#### ▼ 年号

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    const (
    	YmdTypeMeiji   = 1 // 明治
    	YmdTypeTaisho  = 2 // 大正
    	YmdTypeShowa   = 3 // 昭和
    	YmdTypeHeisei  = 4 // 平成
    	YmdTypeReiwa   = 5 // 令和
    	YmdTypeSeireki = 9 // 西暦
    )

    var ymdTypeSet = map[int]map[string]string{
    	YmdTypeMeiji:   {"name": "明治"},
    	YmdTypeTaisho:  {"name": "大正"},
    	YmdTypeShowa:   {"name": "昭和"},
    	YmdTypeHeisei:  {"name": "平成"},
    	YmdTypeReiwa:   {"name": "令和"},
    	YmdTypeSeireki: {"name": "西暦"},
    }

    var ymdTypeYmd = map[int]map[string]map[string]int{
    	YmdTypeMeiji: {
    		"start": {"year": 1868, "month": 1, "day": 25},
    		"end":   {"year": 1912, "month": 7, "day": 29},
    	},
    	YmdTypeTaisho: {
    		"start": {"year": 1912, "month": 7, "day": 30},
    		"end":   {"year": 1926, "month": 12, "day": 24},
    	},
    	YmdTypeShowa: {
    		"start": {"year": 1926, "month": 12, "day": 25},
    		"end":   {"year": 1989, "month": 1, "day": 7},
    	},
    	YmdTypeHeisei: {
    		"start": {"year": 1989, "month": 1, "day": 8},
    		"end":   {"year": 2019, "month": 4, "day": 30},
    	},
    	YmdTypeReiwa: {
    		"start": {"year": 2019, "month": 5, "day": 1},
    		"end":   {"year": 9999, "month": 12, "day": 31},
    	},
    }

    // 年月日の区分オブジェクト
    type YmdType struct {
    	// 値
    	value int
    	// 年号名
    	name string
    }

    func NewYmdType(value int) *YmdType {
    	return &YmdType{
    		value: value,
    		name:  ymdTypeSet[value]["name"],
    	}
    }

    // 値を返却する
    func (y *YmdType) Value() int {
    	return y.value
    }

    // 年号名を返却する
    func (y *YmdType) Name() string {
    	return y.name
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /**
     * 年月日の区分オブジェクト
     */

    export const YMDTYPE_MEIJI = 1;
    // 明治
    export const YMDTYPE_TAISHO = 2;
    // 大正
    export const YMDTYPE_SHOWA = 3;
    // 昭和
    export const YMDTYPE_HEISEI = 4;
    // 平成
    export const YMDTYPE_REIWA = 5;
    // 令和
    export const YMDTYPE_SEIREKI = 9;
    // 西暦
    const YMDTYPE_SET: Record<number, {name: string}> = {
      [YMDTYPE_MEIJI]: {name: "明治"},
      [YMDTYPE_TAISHO]: {name: "大正"},
      [YMDTYPE_SHOWA]: {name: "昭和"},
      [YMDTYPE_HEISEI]: {name: "平成"},
      [YMDTYPE_REIWA]: {name: "令和"},
      [YMDTYPE_SEIREKI]: {name: "西暦"},
    };

    const YMDTYPE_YMD: Record<
      number,
      Record<"start" | "end", {year: number; month: number; day: number}>
    > = {
      [YMDTYPE_MEIJI]: {
        start: {year: 1868, month: 1, day: 25},
        end: {year: 1912, month: 7, day: 29},
      },
      [YMDTYPE_TAISHO]: {
        start: {year: 1912, month: 7, day: 30},
        end: {year: 1926, month: 12, day: 24},
      },
      [YMDTYPE_SHOWA]: {
        start: {year: 1926, month: 12, day: 25},
        end: {year: 1989, month: 1, day: 7},
      },
      [YMDTYPE_HEISEI]: {
        start: {year: 1989, month: 1, day: 8},
        end: {year: 2019, month: 4, day: 30},
      },
      [YMDTYPE_REIWA]: {
        start: {year: 2019, month: 5, day: 1},
        end: {year: 9999, month: 12, day: 31},
      },
    };
    export interface YmdType {
      value(): number;
      name(): string;
    }
    export function createYmdType(initialValue: number): YmdType {
      const state: {_value: number; _name: string} = {
        _value: initialValue,
        _name: YMDTYPE_SET[initialValue].name,
      };

      /**
       * 値を返却する
       */
      function value(): number {
        return state._value;
      }
      /**
       * 年号名を返却する
       */
      function name(): string {
        return state._name;
      }
      return {value, name};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 年月日の区分オブジェクト
     */
    class YmdType extends Type
    {
        const MEIJI   = 1; // 明治
        const TAISHO  = 2; // 大正
        const SHOWA   = 3; // 昭和
        const HEISEI  = 4; // 平成
        const REIWA   = 5; // 令和
        const SEIREKI = 9; // 西暦

        private static array $set = [
            self::MEIJI   => ["name" => "明治"],
            self::TAISHO  => ["name" => "大正"],
            self::SHOWA   => ["name" => "昭和"],
            self::HEISEI  => ["name" => "平成"],
            self::REIWA   => ["name" => "令和"],
            self::SEIREKI => ["name" => "西暦"],
        ];

        private static array $ymd = [
            self::MEIJI  => [
                "start" => [ "year" => 1868, "month" => 1, "day" => 25, ],
                "end"   => [ "year" => 1912, "month" => 7, "day" => 29, ],
            ],
            self::TAISHO => [
                "start" => [ "year" => 1912, "month" => 7,  "day" => 30, ],
                "end"   => [ "year" => 1926, "month" => 12, "day" => 24, ],
            ],
            self::SHOWA  => [
                "start" => [ "year" => 1926, "month" => 12, "day" => 25, ],
                "end"   => [ "year" => 1989, "month" => 1,  "day" => 7, ],
            ],
            self::HEISEI => [
                "start" => [ "year" => 1989, "month" => 1,  "day" => 8, ],
                "end"   => [ "year" => 2019, "month" => 4, "day" => 30, ],
            ],
            self::REIWA => [
                "start" => [ "year" => 2019, "month" => 5,  "day" => 1, ],
                "end"   => [ "year" => 9999, "month" => 12, "day" => 31, ],
            ],
        ];

        /**
         * 値
         */
        private string $value;

        /**
         * 年号名
         */
        private string $name;

        /**
         * 値を返却する
         */
        public function value(): string
        {
            return $this->value;
        }

        public function __construct(string $value)
        {
            $this->value = $value;
            $this->name = static::$set[$value]["name"];
        }

        /**
         * 年号名を返却する
         */
        public function name(): string
        {
            return $this->name;
        }
    }
    ```

<br>

### ドメインサービス

#### ▼ ドメインサービスとは

特定の集約内で、ドメイン層のエンティティに持たせるとやや不自然で、他のドメインオブジェクトを対象とした汎用的な振舞ロジックを切り分けたもの。

ドメインサービスは、他のドメインオブジェクトにロジックを関数として提供するのみで、自身の状態を変化させる関数は持たせないようにする。

すべての関数を `1` 個のドメインサービスにまとめて管理するよりも、動作の種類ごとに分けて管理したほうがよい。

このとき、エンティティのビジネスロジックがドメインサービスに実装されすぎないように注意する。

補足として、ドメイン層でリポジトリを使用することを嫌って、ドメインサービスの処理をユースケース層のアプリケーションサービスで定義しても問題ない。

> - [ドメインサービスについての質問です。ドメインサービスは誰が呼ぶのですか？ユースケースにDIして使うのでしょうか？だとするとドメインサービスの中でリポジトリーを使用しても良いのでしょうか？それともユースケースでリポジトリを使用してドメインサー... · Issue #159 · little-hands/ddd-q-and-a · GitHub](https://github.com/little-hands/ddd-q-and-a/issues/159)
> - [Amazon.co.jp: ドメイン駆動設計入門 ボトムアップでわかる！ドメイン駆動設計の基本 eBook : 成瀬 允宣: Kindleストア](https://www.amazon.co.jp/dp/B082WXZVPC)
> - https://codezine.jp/article/detail/10318

#### ▼ 重複確認

ドメイン層のリポジトリを使用して、該当の名前のエンティティが DB に存在するか否かを検証する。

ドメインサービスではなく、アプリケーションサービスとして定義してもよい。

=== "Go"

    ```go title="Go の場合の実装例"
    package services

    import "context"

    type CheckDuplicateFooService struct {
    	fooRepository FooRepository
    }

    func NewCheckDuplicateFooService(fooRepository FooRepository) *CheckDuplicateFooService {
    	return &CheckDuplicateFooService{fooRepository: fooRepository}
    }

    // エンティティがすでに存在しているか否かを判定する
    func (s *CheckDuplicateFooService) Exists(ctx context.Context, foo *Foo) (bool, error) {
    	foo, err := s.fooRepository.FindByName(ctx, foo.Name())
    	if err != nil {
    		return false, err
    	}

    	return foo != nil, nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface CheckDuplicateFooService {
      exists(foo: Foo): Promise<boolean>;
    }
    export function createCheckDuplicateFooService(
      fooRepository: FooRepository,
    ): CheckDuplicateFooService {
      /**
       * エンティティがすでに存在しているか否かを判定する
       */
      async function exists(foo: Foo): Promise<boolean> {
        const found = await fooRepository.findByName(foo.name());

        return found !== null;
      }
      return {exists};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Services;

    class CheckDuplicateFooService
    {

        private FooRepository $fooRepository;

        public function __construct(FooRepository $fooRepository)
        {
            $this->fooRepository = $fooRepository;
        }

        /**
         * エンティティがすでに存在しているか否かを判定する
         */
        public function exists(Foo $foo): bool
        {
            $foo = $this->fooRepository
                ->findByName($foo->name());

            return $foo !== null;
        }
    }
    ```

> - https://stackoverflow.com/questions/45007667/cqrs-ddd-how-to-validate-products-existence-before-adding-them-to-order
> - [Amazon.co.jp: ドメイン駆動設計入門 ボトムアップでわかる！ドメイン駆動設計の基本 eBook : 成瀬 允宣: Kindleストア](https://www.amazon.co.jp/dp/B082WXZVPC)
> - [「ユーザーの名前はユニークであること」というような要件の場合、このユニークバリデーションチェックはどこの層でチェックするのが良いのでしょうか？単純に考えるとユーザーをRepositoryのsaveに食わせて、Repositoryのsave内... · Issue #573 · little-hands/ddd-q-and-a · GitHub](https://github.com/little-hands/ddd-q-and-a/issues/573)

#### ▼ 認可

ドメイン層のリポジトリを使用して、該当の ID のエンティティに対してアクセスできるかを検証する。

認可処理はドメインと結びつきが強いので、ドメイン層に実装する。

あるいはドメインサービスではなく、アプリケーションサービスとして定義してもよい。

<table>
  <thead>
    <tr>
      <th>テーブル</th>
      <th>説明</th>
      <th>テーブル例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ロール</td>
      <td>ユーザーの権限を表す。</td>
      <td>ロール名 (<code>Administorator</code>、<code>Operator</code>、`Reporter など) を定義する。</td>
    </tr>
    <tr>
      <td>パーミッション (ロールポリシー)</td>
      <td>ロールをポリシーに紐づける。</td>
      <td>テーブル上でロール名とポリシー名を紐づける。</td>
    </tr>
    <tr>
      <td>ポリシー</td>
      <td>各パーミッションの認可スコープを定義する。</td>
      <td><code>StandardAccess</code>、<code>FullAccess</code>、<code>ReadOnly</code> を定義する。</td>
    </tr>
  </tbody>
</table>

=== "Go"

    ```go title="Go の場合の実装例"
    package services

    import "context"

    type AuthorizeFooService struct {
    	fooRepository FooRepository
    }

    func NewAuthorizeFooService(fooRepository FooRepository) *AuthorizeFooService {
    	return &AuthorizeFooService{fooRepository: fooRepository}
    }

    // 更新処理を実行できるかを検証する
    func (s *AuthorizeFooService) CanUpdateById(ctx context.Context, fooId FooId, userId UserId) (bool, error) {
    	foo, err := s.fooRepository.FindById(ctx, fooId)
    	if err != nil {
    		return false, err
    	}

    	return foo.UserId().Equals(userId), nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface AuthorizeFooService {
      canUpdateById(fooId: FooId, userId: UserId): Promise<boolean>;
    }
    export function createAuthorizeFooService(
      fooRepository: FooRepository,
    ): AuthorizeFooService {
      /**
       * 更新処理を実行できるかを検証する
       */
      async function canUpdateById(fooId: FooId, userId: UserId): Promise<boolean> {
        const foo = await fooRepository.findById(fooId);

        return foo.userId.equals(userId);
      }
      return {canUpdateById};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Services;

    class AuthorizeFooService
    {

        private FooRepository $fooRepository;

        public function __construct(FooRepository $fooRepository)
        {
            $this->fooRepository = $fooRepository;
        }

        /**
         * 更新処理を実行できるかを検証する
         */
        public function canUpdateById(FooId $fooId, UserId $userId): bool
        {
            return $this->fooRepository
                ->findById($fooId)
                ->userId
                ->equals($userId);
        }
    }
    ```

> - [Authorization and authentication in clean architecture](https://lessthan12ms.com/authorization-and-authentication-in-clean-architecture.html)
> - https://medium.com/@martinezdelariva/authentication-and-authorization-in-ddd-671f7a5596ac
> - [ema/src/Domain/Note/Commands/ModifyNote/ModifyNoteAuthorizer.php at master · lezhnev74/ema · GitHub](https://github.com/lezhnev74/ema/blob/master/src/Domain/Note/Commands/ModifyNote/ModifyNoteAuthorizer.php)
> - [DDDを採用した場合、認可に関する知識をどのレイヤー（Domain,Application,ControllerやAPI Gateway）に置くのが適切でしょうか？例えばブログサービスなどで自分のブログの内容を編集できるAPIがあるとします... · Issue #121 · little-hands/ddd-q-and-a · GitHub](https://github.com/little-hands/ddd-q-and-a/issues/121)

#### ▼ ドメイン例外

ドメイン層の例外処理をまとめた例外クラス。

=== "Go"

    ```go title="Go の場合の実装例"
    package services

    type FooException struct {
    }

    func (e *FooException) Error() string {
    	return "FooException"
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface FooException extends Error {
      readonly name: "FooException";
    }
    export function createFooException(message: string): FooException {
      return Object.assign(new Error(message), {name: "FooException" as const});
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Services;

    class FooException extends Exception
    {

    }
    ```

<br>

### 仕様パターン (Specification パターン)

#### ▼ 仕様パターンとは

デザインパターンの一種。

責務として、ドメインルール検証、クエリ検索条件を持つ。

これらをエンティティや値オブジェクトの関数内部に持たせた場合、肥大化の原因となり、また埋もれてしまうため、可読性と保守性が悪い。

そこで、こういった処理を Specification オブジェクトとして切り分けておく。

#### ▼ ドメインルールのバリデーション

エンティティから切り分けたドメインルールバリデーションオブジェクトとして実装する。

バリデーションを実装できるパッケージが世の中にあるが、ビジネスロジックは外部に依存しないほうがいいため、言語のそのままのロジックで実装するとよい。

複数のエンティティをまたぐドメインルールのバリデーションは Specification パターンに切り分けるのがよい。

boolean 値関数 (`isFoo()` 関数) のように、仕様を満たしているかを調べる処理する。

- 単一のエンティティを引数として、複数を要求を満たしているか
- 複数のエンティティを引数として、仕様を満たしているか
- 何らかの処理のために用意できているか

単一のエンティティに関する単一のドメインルールの場合は、Specification パターンとして切り分けずに、そのエンティティに boolean 値関数 (`isFoo()` 関数) をもたせる。

=== "Go"

    ```go title="Go の場合の実装例"
    package specifications

    type FooSpecification struct {
    }

    // ドメインルールを判定する
    func (s *FooSpecification) IsSatisfiedBy(entity *Entity) bool {
    	// 複数の仕様を組み合わせる条件
    	if !entity.IsX {
    		return false
    	}
    	if !entity.IsY {
    		return false
    	}
    	if !entity.IsZ {
    		return false
    	}

    	return true
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface FooSpecification {
      isSatisfiedBy(entity: Entity): boolean;
    }
    export function createFooSpecification(): FooSpecification {
      /**
       * ドメインルールを判定する
       */
      function isSatisfiedBy(entity: Entity): boolean {
        // 複数の仕様を組み合わせる条件
        if (!entity.isX) return false;
        if (!entity.isY) return false;
        if (!entity.isZ) return false;

        return true;
      }
      return {isSatisfiedBy};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Specifications;

    class FooSpecification
    {
        /**
         * ドメインルールを判定する
         */
        public function isSatisfiedBy(Entity $entity): bool
        {
            // 複数の仕様を組み合わせる条件
            if (!$entity->isX) return false;
            if (!$entity->isY) return false;
            if (!$entity->isZ) return false;

            return true;
        }
    }
    ```

#### ▼ クエリ検索条件

リポジトリの引数に渡すクエリ検索条件オブジェクトとして実装する。

Specification パターンを検索条件オブジェクトとして使った場合に、Criteria パターンと呼ぶこともある。

ユースケースに対応する検索条件をオブジェクトに閉じ込めるとよい。

ドメインルールのバリデーションを実行する Specification クラスと区別するために、Criteria オブジェクトという名前としても使用される。

=== "Go"

    ```go title="Go の場合の実装例"
    package criterion

    type FooCriteria struct {
    	id    int
    	name  string
    	email string
    }

    // クエリ検索条件オブジェクトを作成する
    func BuildFooCriteria(array map[string]any) *FooCriteria {
    	criteria := &FooCriteria{}

    	if id, ok := array["id"].(int); ok {
    		criteria.id = id
    	}

    	if name, ok := array["name"].(string); ok {
    		criteria.name = name
    	}

    	if email, ok := array["email"].(string); ok {
    		criteria.email = email
    	}

    	return criteria
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface FooCriteria {
      readonly id?: number;
      readonly name?: string;
      readonly email?: string;
    }

    // 検索条件をデータとして受け取り、新しいオブジェクトを返す
    export function createFooCriteria(values: FooCriteria): FooCriteria {
      return {...values};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Criterion;

    class FooCriteria
    {

        private int $id;

        private string $name;

        private string $email;

        /**
         * クエリ検索条件オブジェクトを作成する
         */
        public function build(array $array): static
        {
            // 自身をインスタンス化。
            $criteria = new static();

            if (isset($array["id"])) {
                $criteria->id = $array["id"];
            }

            if (isset($array["name"])) {
                $criteria->name = $array["name"];
            }

            if (isset($array["email"])) {
                $criteria->email = $array["email"];
            }

            return $criteria;
        }
    }
    ```

#### ▼ クエリ条件

特

<br>

## 02. ドメイン層のロジックの流出

### ドメイン貧血症

#### ▼ ドメイン貧血症とは

ドメイン層のドメインオブジェクトがビジネスロジックをほとんど持たない状態になっていること。

ドメインオブジェクトであるエンティティがゲッターとセッターしか持っていない。

これは、ドメイン貧血症である。

=== "Go"

    ```go title="Go の場合の実装例"
    package entities

    import (
    	"app/domain/user/ids"
    	"app/domain/user/valueobjects"
    )

    type User struct {
    	userId   ids.UserId
    	userName valueobjects.UserName
    }

    func NewUser(userId ids.UserId, userName valueobjects.UserName) *User {
    	return &User{
    		userId:   userId,
    		userName: userName,
    	}
    }

    func (u *User) Id() ids.UserId {
    	return u.userId
    }

    func (u *User) UserName() valueobjects.UserName {
    	return u.userName
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserId} from "@/domain/user/ids/userId";
    import {UserName} from "@/domain/user/valueObjects/userName";

    export interface User {
      id(): UserId;
      userName(): UserName;
    }
    export function createUser(userId: UserId, _userName: UserName): User {
      function id(): UserId {
        return userId;
      }

      function userName(): UserName {
        return _userName;
      }
      return {id, userName};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    declare(strict_types=1);

    namespace App\Domain\User\Entities;

    use App\Domain\User\Ids\UserId;
    use App\Domain\User\ValueObjects\UserName;

    final class User
    {

        private UserId $userId;

        private UserName $userName;

        public function __construct(UserId $userId, UserName $userName)
        {
            $this->userId = $userId;
            $this->userName = $userName;
        }

        public function id(): UserId
        {
            return $this->userId;
        }

        public function userName(): UserName
        {
            return $this->userName;
        }
    }
    ```

<br>

### ドメインサービスへのドメインロジックの流出

ドメインロジックをドメインサービスに切り分けすぎると、集約内のエンティティや値オブジェクトに実装するドメインロジックがなくなってしまい、ドメイン貧血症になる。

そのため、ドメインサービス層の作成は控えめにし、冗長であっても複数のエンティティや値オブジェクトにそれを実装してもよい。

<br>

### ユースケース層のアプリケーションサービスへの流出

ドメイン層のロジックをユースケース層のユースケース層に実装してしまうと、ドメイン層のエンティティや値オブジェクトに実装するドメインロジックがなくなってしまい、ドメイン貧血症になる。

ドメイン層とユースケース層のアプリケーションサービスのいずれに実装する必要があるかは、モデリングの対象がドメインルールに基づくものなのか、ソフトウェア利用者のユースケースに基づくものなのかである。

> - [Amazon.co.jp: ドメイン駆動設計入門 ボトムアップでわかる！ドメイン駆動設計の基本 eBook : 成瀬 允宣: Kindleストア](https://www.amazon.co.jp/dp/B082WXZVPC)

<br>

## 03. エンティティ

### エンティティとは

責務として、ドメインルールや制約の定義を持ち、値オブジェクトとは区別される。

エンティティの責務をデザインパターンに切り分けてもよい。

一意で識別できるデータ (例：`id` データ) を持つ

![ドメイン駆動設計_エンティティ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_エンティティ.jpg)

<br>

### 識別可能

#### ▼ 識別可能とは

オブジェクトが識別子 (例：DB のオートインクリメント ID、UUID など) を持ち、他のオブジェクトと同じ属性をもっていても、区別される。

この識別子は、DB のオートインクリメント ID に対応している。

=== "Go"

    ```go title="Go の場合の実装例"
    package entities

    import (
    	"fmt"

    	"app/domain"
    	"app/domain/foo/valueobjects"
    )

    // 犬用おもちゃのエンティティ
    type DogToy struct {
    	domain.Entity
    	// 犬用おもちゃタイプ
    	toyType ToyType
    	// 犬用おもちゃ商品名
    	name valueobjects.ToyName
    	// 数量
    	number valueobjects.Number
    	// 価格の値オブジェクト
    	priceVO valueobjects.PriceVO
    	// 色の値オブジェクト
    	colorVO valueobjects.ColorVO
    }

    func NewDogToy(toyType ToyType, name valueobjects.ToyName, number valueobjects.Number, priceVO valueobjects.PriceVO, colorVO valueobjects.ColorVO) *DogToy {
    	return &DogToy{
    		toyType: toyType,
    		name:    name,
    		number:  number,
    		priceVO: priceVO,
    		colorVO: colorVO,
    	}
    }

    // 犬用おもちゃ名 (色) を返却する
    func (d *DogToy) NameWithColor() string {
    	return fmt.Sprintf(
    		"%s (%s) ",
    		d.name.Value(),
    		d.colorVO.Name(),
    	)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import type {Id} from "@/domain/id";
    import {Entity, createEntity} from "@/domain/entity";
    import {ToyName} from "@/domain/foo/valueObjects/toyName";
    import {Number} from "@/domain/foo/valueObjects/number";
    import {PriceVO} from "@/domain/foo/valueObjects/priceVO";
    import {ColorVO} from "@/domain/foo/valueObjects/colorVO";

    /**
     * 犬用おもちゃのエンティティ
     */

    export interface DogToy extends Entity {
      nameWithColor(): string;
    }
    export function createDogToy(
      id: Id,
      type: ToyType,
      name: ToyName,
      number: Number,
      priceVO: PriceVO,
      colorVO: ColorVO,
    ): DogToy {
      /**
       * 犬用おもちゃ名 (色) を返却する
       */
      function nameWithColor(): string {
        return `${name.value()} (${colorVO.name()}) `;
      }
      return {...createEntity("DogToy", id), nameWithColor};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Entities;

    use App\Domain\Entity;
    use App\Domain\Id;
    use App\Domain\Foo\ValueObjects\ToyName;
    use App\Domain\Foo\ValueObjects\Number;
    use App\Domain\Foo\ValueObjects\PriceVO;
    use App\Domain\Foo\ValueObjects\ColorVO;

    /**
     * 犬用おもちゃのエンティティ
     */
    class DogToy extends Entity
    {
        /**
         * 犬用おもちゃタイプ
         */
        private ToyType $type;

        /**
         * 犬用おもちゃ商品名
         */
        private ToyName $name;

        /**
         * 数量
         */
        private Number $number;

        /**
         * 価格の値オブジェクト
         */
        private PriceVO $priceVO;

        /**
         * 色の値オブジェクト
         */
        private ColorVO $colorVO;

        public function __construct(ToyType $type, ToyName $name, Number $number, PriceVO $priceVO, ColorVO $colorVO)
        {
            $this->type = $type;
            $this->name = $name;
            $this->number = $number;
            $this->priceVO = $priceVO;
            $this->colorVO = $colorVO;
        }

        /**
         * 犬用おもちゃ名 (色) を返却する
         */
        public function nameWithColor(): string
        {
            return sprintf(
                "%s (%s) ",
                $this->name->value(),
                $this->colorVO->name()
            );
        }
    }
    ```

#### ▼ エンティティの識別子として適するもの

エンティティの識別子にはドメインルールを持たせないほうがよいため、システムで使用する ID が適する。

- DB のオートインクリメント ID
- UUID など

例えば、ドメインルール上の識別子（例：書籍の ISBN、配達物の追跡番号）はエンティティの識別子にしないほうがいい。

<br>

### 識別子による等価性バリデーション

#### ▼ 識別子による等価性バリデーションとは

等価性バリデーション用の `equals()` 関数を持つ。

保持する識別子が、対象のエンティティと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

すべてのエンティティに等価性のバリデーション関数を持たせると可読性が低い。

そこで、等価性バリデーション用の `equals()` 関数を共通化するとよい。TypeScript の例では、エンティティの種類と識別子を受け取る `createEntity()` で共通の処理を作り、個別のエンティティに組み込む。

=== "Go"

    ```go title="Go の場合の実装例"
    package domain

    // エンティティ
    type Entity struct {
    	// ID構造体
    	id Id
    }

    // エンティティの等価性を検証する
    func (e *Entity) Equals(entity *Entity) bool {
    	return e.id.Equals(entity.Id()) // IDオブジェクトの等価性
    }

    // ID構造体を返却する
    func (e *Entity) Id() Id {
    	return e.id
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /** エンティティの識別子と種類を公開する契約 */
    export interface Entity {
      readonly kind: string;
      id(): Id;
      equals(other: Entity): boolean;
    }

    // クラスの継承に代わり、共通の等価性判定を生成関数で提供する
    export function createEntity(kind: string, entityId: Id): Entity {
      return {
        kind,
        id: () => entityId,
        equals: (other) => kind === other.kind && entityId.equals(other.id()),
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain;

    /**
     * エンティティ抽象クラス
     */
    abstract class Entity
    {
        /**
         * IDクラス
         */
        protected Id $id;

        /**
         * エンティティの等価性を検証する
         */
        public function equals(Entity $entity): bool
        {
            return ($entity instanceof $this || $this instanceof $entity) // エンティティのデータ型の等価性
                && $this->id->equals($entity->id()); // IDオブジェクトの等価性
        }

        /**
         * IDクラスを返却する
         */
        public function id(): Id
        {
            return $this->id;
        }
    }
    ```

#### ▼ 複合主キーへの対応 (PHP では不要)

以降の説明は Java について適用されるため、PHP では不要である。

複合主キーを持つオブジェクトに対応するため、主キーとなるほうのオブジェクト側に `equals()` 関数と `hash()` 関数を定義する。

これにより、言語標準搭載の `equals()` 関数と `hash()` 関数をオーバーライドし、異なるセッションに渡ってオブジェクトを比較できるようにする。

これらを定義しないと、オーバーライドされずに標準搭載の関数が使用される。

標準搭載の関数では、異なるセッションに渡ったオブジェクトの比較では、必ず異なるオブジェクトであると判定してしまう。

PHP では不要であるが、参考までに、PHP で実装した。

```injectablephp title="PHP の場合の実装例"
<?php

namespace App\Domain;

/**
 * ID抽象クラス
 */
abstract class Id
{
    /**
     * ID
     */
    private string $id;

    public function __construct(string $id)
    {
        $this->id = $id;
    }

    /**
     * ハッシュ値を返却する
     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドする
     */
    public function hash(): string
    {
        return $this->id;
    }

    /**
     * オブジェクトの等価性を検証する
     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドする
     */
    public function equals(Id $id): bool
    {
        return ($id instanceof $this || $this instanceof $id) // IDオブジェクトのデータ型の等価性
            && $this->hash() == $id->hash(); // ハッシュ値の等価性
    }
}
```

<br>

### データの可変性/不変性

#### ▼ 可変性/不変性の実現方法 (ミュータブル/イミュータブル)

エンティティのデータは可変/不変データのいずれであってもよい。

ただし、そもそもオブジェクトは不変であるほうが望ましいため、可変的なデータは最小限にする。

変化させても問題ないプロパティに対してはセッターを定義し、不変的なデータに対してはコンストラクタインジェクションのみを許可する。

もちろん、セッター内ではドメインルールのバリデーションを実行する。

<br>

## 04. 値オブジェクト

### 値オブジェクトとは

ドメイン上で意味合いをもち、またプリミティブ（例：文字列、数値など）の型で表現されるオブジェクトである。

責務として、ドメインルールや制約の定義を持ち、エンティティと区別される。

金額、数字、電話番号、文字列、日付、氏名、色などのユビキタス言語に関する状態を持つ一方で、一意で識別できるデータ (例：`id` データ) を持たない。

よくある値オブジェクトは次のとおりである。

- FullName：苗字や名前と関連処理（例：表示形式、氏名作成など）を状態・振る舞いとして表現
- Money：金額や通貨単位と関連処理（例：四則演算、不正検証など）を状態・振る舞いとして表現
- UserId：ユーザーID と関連処理（例：ID の出力など）を状態・振る舞いとして表現
- Email：メールアドレスと関連処理（例：構文検証など）を状態・振る舞いとして表現
- Address：住所と関連処理（例：表示形式、構文検証など）を状態・振る舞いとして表現
- PhoneNumber：電話番号と関連処理（例：構文検証、国番号抽出など）を状態・振る舞いとして表現

すべてのプリミティブを値オブジェクトにするとコード量が増えてしまうため、どこまでを値オブジェクトにするのか判断が必要である。

![ドメイン駆動設計_バリューオブジェクト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_バリューオブジェクト.jpg)

<br>

### 識別不可能

#### ▼ 識別不可能とは

一意に識別できるデータをもたず、対象のユビキタス言語に関するデータと関数を持つ

#### ▼ 金額

金額データの計算を Interactor 内処理やエンティティ内関数で行うのではなく、金額計算をする値オブジェクトの関数として分割する。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    // 金額の値オブジェクト
    type MoneyVO struct {
    	// 金額
    	amount float64
    }

    func NewMoneyVO(amount float64) *MoneyVO {
    	return &MoneyVO{amount: amount}
    }

    // 金額を返却する
    func (m *MoneyVO) Amount() float64 {
    	return m.amount
    }

    // 単位を返却する
    func (m *MoneyVO) Unit() string {
    	return "円"
    }

    // 足し算の結果を返却する
    func (m *MoneyVO) Add(price *MoneyVO) *MoneyVO {
    	return NewMoneyVO(m.amount + price.amount)
    }

    // 引き算の結果を返却する
    func (m *MoneyVO) Subtract(price *MoneyVO) *MoneyVO {
    	return NewMoneyVO(m.amount - price.amount)
    }

    // 掛け算の結果を返却する
    func (m *MoneyVO) Multiply(price *MoneyVO) *MoneyVO {
    	return NewMoneyVO(m.amount * price.amount)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {ValueObject, createValueObject} from "@/domain/valueObject";

    /**
     * 金額の値オブジェクト
     */

    export interface MoneyVO extends ValueObject<{amount: number}> {
      amount(): number;
      unit(): string;
      add(price: MoneyVO): MoneyVO;
      subtract(price: MoneyVO): MoneyVO;
      multiply(price: MoneyVO): MoneyVO;
    }
    export function createMoneyVO(initialAmount: number = 0.0): MoneyVO {
      /**
       * 金額を返却する
       */
      function amount(): number {
        return initialAmount;
      }
      /**
       * 単位を返却する
       */
      function unit(): string {
        return "円";
      }
      /**
       * 足し算の結果を返却する
       */
      function add(price: MoneyVO): MoneyVO {
        return createMoneyVO(initialAmount + price.amount());
      }
      /**
       * 引き算の結果を返却する
       */
      function subtract(price: MoneyVO): MoneyVO {
        return createMoneyVO(initialAmount - price.amount());
      }
      /**
       * 掛け算の結果を返却する
       */
      function multiply(price: MoneyVO): MoneyVO {
        return createMoneyVO(initialAmount * price.amount());
      }
      return {
        ...createValueObject({amount: initialAmount}),
        amount,
        unit,
        add,
        subtract,
        multiply,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 金額の値オブジェクト
     */
    class MoneyVO extends ValueObject
    {
        /**
         * 金額
         */
        private float $amount;

        public function __construct(float $amount = 0.0)
        {
            $this->amount = $amount;
        }

        /**
         * 金額を返却する
         */
        public function amount(): float
        {
            return $this->amount;
        }

        /**
         * 単位を返却する
         */
        public function unit(): string
        {
            return "円";
        }

        /**
         * 足し算の結果を返却する
         */
        public function add(self $price): static
        {
            return new static($this->amount + $price->amount);
        }

        /**
         * 引き算の結果を返却する
         */
        public function subtract(self $price): static
        {
            return new static($this->amount - $price->amount);
        }

        /**
         * 掛け算の結果を返却する
         */
        public function multiply(self $price): static
        {
            return new static($this->amount * $price->amount);
        }
    }
    ```

#### ▼ 所要時間

所要時間データの計算を Interactor クラス内処理やエンティティ内関数で行うのではなく、所要時間計算をする値オブジェクトの関数として分割する。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    import "math"

    // 判定値、歩行速度の目安、車速度の目安を定数で定義する。
    const (
    	JudgmentMinute        = 21
    	WalkingSpeedPerMinute = 80
    	CarSpeedPerMinute     = 400
    )

    // 所要時間の値オブジェクト
    type RequiredTime struct {
    	// 距離
    	distance int
    }

    func NewRequiredTime(distance int) *RequiredTime {
    	return &RequiredTime{distance: distance}
    }

    // 徒歩または車のどちらを使用するかを判定する
    func (r *RequiredTime) IsMinuteByWalking() bool {
    	if float64(r.distance)*1000/WalkingSpeedPerMinute < JudgmentMinute {
    		return true
    	}

    	return false
    }

    // 徒歩での所要時間を計算する
    func (r *RequiredTime) MinuteByWalking() float64 {
    	minute := float64(r.distance) * 1000 / WalkingSpeedPerMinute
    	return math.Ceil(minute)
    }

    // 車での所要時間を計算する
    func (r *RequiredTime) MinuteByCar() float64 {
    	minute := float64(r.distance) * 1000 / CarSpeedPerMinute
    	return math.Ceil(minute)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {ValueObject, createValueObject} from "@/domain/valueObject";

    /**
     * 所要時間の値オブジェクト
     */
    /**
     * 判定値、歩行速度の目安、車速度の目安を定数で定義する。
     */
    export const REQUIREDTIME_JUDGMENT_MINUTE = 21;

    export const REQUIREDTIME_WALKING_SPEED_PER_MINUTE = 80;

    export const REQUIREDTIME_CAR_SPEED_PER_MINUTE = 400;
    export interface RequiredTime extends ValueObject<{distance: number}> {
      isMinuteByWalking(): boolean;
      minuteByWalking(): number;
      minuteByCar(): number;
    }
    export function createRequiredTime(distance: number): RequiredTime {
      /**
       * 徒歩または車のどちらを使用するかを判定する
       */
      function isMinuteByWalking(): boolean {
        if (
          (distance * 1000) / REQUIREDTIME_WALKING_SPEED_PER_MINUTE <
          REQUIREDTIME_JUDGMENT_MINUTE
        ) {
          return true;
        }

        return false;
      }
      /**
       * 徒歩での所要時間を計算する
       */
      function minuteByWalking(): number {
        const minute = (distance * 1000) / REQUIREDTIME_WALKING_SPEED_PER_MINUTE;
        return Math.ceil(minute);
      }
      /**
       * 車での所要時間を計算する
       */
      function minuteByCar(): number {
        const minute = (distance * 1000) / REQUIREDTIME_CAR_SPEED_PER_MINUTE;
        return Math.ceil(minute);
      }
      return {
        ...createValueObject({distance}),
        isMinuteByWalking,
        minuteByWalking,
        minuteByCar,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 所要時間の値オブジェクト
     */
    class RequiredTime extends ValueObject
    {
        /**
         * 判定値、歩行速度の目安、車速度の目安を定数で定義する。
         */
        const JUDGMENT_MINUTE = 21;
        const WALKING_SPEED_PER_MINUTE = 80;
        const CAR_SPEED_PER_MINUTE = 400;

        /**
         * 距離
         */
        private int $distance;

        public function __construct(int $distance)
        {
            $this->distance = $distance;
        }

        /**
         * 徒歩または車のどちらを使用するかを判定する
         */
        public function isMinuteByWalking(): bool
        {
            if ($this->distance * 1000 / self::WALKING_SPEED_PER_MINUTE < self::JUDGMENT_MINUTE) {
                return true;
            }

            return false;
        }

        /**
         * 徒歩での所要時間を計算する
         */
        public function minuteByWalking(): float
        {
            $minute = $this->distance * 1000 / self::WALKING_SPEED_PER_MINUTE;
            return ceil($minute);
        }

        /**
         * 車での所要時間を計算する
         */
        public function minuteByCar(): float
        {
            $minute = $this->distance * 1000 / self::CAR_SPEED_PER_MINUTE;
            return ceil($minute);
        }
    }
    ```

#### ▼ 住所

郵便番号データとその処理を値オブジェクトとして分割する。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    import "fmt"

    // 住所の文字数上限
    const AddressMaxLength = 512

    // 住所の値オブジェクト
    type Address struct {
    	// 郵便番号
    	zip string
    	// 住所 (番地など)
    	address string
    	// 市区町村
    	city string
    }

    func NewAddress(city string, zip string, address string, kana string) *Address {
    	return &Address{
    		city:    city,
    		zip:     zip,
    		address: address,
    	}
    }

    // 郵便番号を作成し、返却する
    func (a *Address) Zip() string {
    	return fmt.Sprintf(
    		"〒%s-%s",
    		a.zip[:3],
    		a.zip[3:],
    	)
    }

    // 住所を作成し、返却する
    func (a *Address) Address() string {
    	return fmt.Sprintf(
    		"%s%s",
    		a.city,
    		a.address,
    	)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {ValueObject, createValueObject} from "@/domain/valueObject";

    /**
     * 住所の値オブジェクト
     */
    /**
     * 住所の文字数上限
     */
    export const ADDRESS_ADDRESS_MAX_LENGTH = 512;
    export interface Address extends ValueObject<{
      city: string;
      zip: string;
      address: string;
    }> {
      zip(): string;
      address(): string;
    }
    export function createAddress(
      city: string,
      initialZip: string,
      initialAddress: string,
      kana: string,
    ): Address {
      /**
       * 郵便番号を作成し、返却する
       */
      function zip(): string {
        return `〒${initialZip.substring(0, 3)}-${initialZip.substring(3)}`;
      }
      /**
       * 住所を作成し、返却する
       */
      function address(): string {
        return `${city}${initialAddress}`;
      }
      return {
        ...createValueObject({city, zip: initialZip, address: initialAddress}),
        zip,
        address,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 住所の値オブジェクト
     */
    class Address extends ValueObject
    {
        /**
         * 住所の文字数上限
         */
        const ADDRESS_MAX_LENGTH = 512;

        /**
         * 郵便番号
         */
        private string $zip;

        /**
         * 住所 (番地など)
         */
        private string $address;

        /**
         * 市区町村
         */
        private string $city;

        public function __construct(string $city, string $zip, string $address, string $kana)
        {
            $this->city = $city;
            $this->zip = $zip;
            $this->address = $address;
        }

        /**
         * 郵便番号を作成し、返却する
         */
        public function zip(): string
        {
            return sprintf(
                "〒%s-%s",
                substr($this->zip, 0, 3),
                substr($this->zip, 3)
            );
        }

        /**
         * 住所を作成し、返却する
         */
        public function address(): string
        {
            return sprintf(
                "%s%s",
                $this->city,
                $this->address
            );
        }
    }
    ```

#### ▼ 氏名

氏名、性別、データとその処理を値オブジェクトとして分割する。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    // 名前の文字数上限下限
    const (
    	MinNameLength = 1
    	MaxNameLength = 64
    )

    // 氏名構造体の値オブジェクト
    type Name struct {
    	// 姓
    	lastName string
    	// 名
    	firstName string
    	// セイ
    	lastKanaName string
    	// メイ
    	firstKanaName string
    }

    func NewName(lastName string, firstName string, lastKanaName string, firstKanaName string) *Name {
    	return &Name{
    		lastName:      lastName,
    		firstName:     firstName,
    		lastKanaName:  lastKanaName,
    		firstKanaName: firstKanaName,
    	}
    }

    // 氏名を作成する
    func (n *Name) FullName() string {
    	return n.lastName + n.firstName
    }

    // カナ氏名を作成する
    func (n *Name) FullKanaName() string {
    	return n.lastKanaName + n.firstKanaName
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {ValueObject, createValueObject} from "@/domain/valueObject";

    /**
     * 氏名クラスの値オブジェクト
     */
    /**
     * 名前の文字数上限下限
     */
    export const NAME_MIN_NAME_LENGTH = 1;

    export const NAME_MAX_NAME_LENGTH = 64;
    export interface Name extends ValueObject<{
      lastName: string;
      firstName: string;
      lastKanaName: string;
      firstKanaName: string;
    }> {
      fullName(): string;
      fullKanaName(): string;
    }
    export function createName(
      lastName: string,
      firstName: string,
      lastKanaName: string,
      firstKanaName: string,
    ): Name {
      /**
       * 氏名を作成する
       */
      function fullName(): string {
        return lastName + firstName;
      }
      /**
       * カナ氏名を作成する
       */
      function fullKanaName(): string {
        return lastKanaName + firstKanaName;
      }
      return {
        ...createValueObject({lastName, firstName, lastKanaName, firstKanaName}),
        fullName,
        fullKanaName,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 氏名クラスの値オブジェクト
     */
    class Name extends ValueObject
    {
        /**
         * 名前の文字数上限下限
         */
        const MIN_NAME_LENGTH = 1;
        const MAX_NAME_LENGTH = 64;

        /**
         * 姓
         */
        private string $lastName;

        /**
         * 名
         */
        private string $firstName;

        /**
         * セイ
         */
        private string $lastKanaName;

        /**
         * メイ
         */
        private string $firstKanaName;

        public function __construct(string $lastName, string $firstName, string $lastKanaName, string $firstKanaName)
        {
            $this->lastName = $lastName;
            $this->firstName = $firstName;
            $this->lastKanaName = $lastKanaName;
            $this->firstKanaName = $firstKanaName;

        }

        /**
         * 氏名を作成する
         */
        public function fullName(): string
        {
            return $this->lastName . $this->firstName;
        }

        /**
         * カナ氏名を作成する
         */
        public function fullKanaName(): string
        {
            return $this->lastKanaName . $this->firstKanaName;
        }
    }
    ```

<br>

### データの不変性 (イミュータブル)

#### ▼ 不変性の実現方法

値オブジェクトは不変的であり、インスタンスとして作成されて以降、データは変更されない。

オブジェクトの不変性を実現するために、オブジェクトにセッターを定義しないようにし、データの設定には `construct()` 関数のみを使用するようにする。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    // 値オブジェクト
    type FooVO struct {
    	propertyA any
    	propertyB any
    	propertyC any
    }

    // FooVO constructor.
    func NewFooVO(propertyA any, propertyB any, propertyC any) *FooVO {
    	return &FooVO{
    		propertyA: propertyA,
    		propertyB: propertyB,
    		propertyC: propertyC,
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {ValueObject, createValueObject} from "@/domain/valueObject";

    export interface FooVO extends ValueObject<{
      propertyA: unknown;
      propertyB: unknown;
      propertyC: unknown;
    }> {}

    export function createFooVO(
      propertyA: unknown,
      propertyB: unknown,
      propertyC: unknown,
    ): FooVO {
      return createValueObject({propertyA, propertyB, propertyC});
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 値オブジェクト
     */
    class FooVO extends ValueObject
    {

        private mixed $propertyA = null;

        private mixed $propertyB = null;

        private mixed $propertyC = null;

        /**
         * FooVO constructor.
         */
        public function __construct(mixed $propertyA, mixed $propertyB, mixed $propertyC)
        {
            $this->propertyA = $propertyA;
            $this->propertyB = $propertyB;
            $this->propertyC = $propertyC;
        }
    }
    ```

#### ▼ セッターでは不変的にならない理由

Test01 クラスインスタンスの `$property01` データに値を設定するためには、インスタンスからセッターをコールする。

セッターは何度でも呼び出せ、そのたびにデータの値を上書きできてしまう。

=== "Go"

    ```go title="Go の場合の実装例"
    package main

    func main() {
    	test01 := &Test01{}

    	test01.SetProperty01("データ01の値")

    	test01.SetProperty01("新しいデータ01の値")
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const test01 = createTest01();

    test01.setProperty01("データ01の値");

    test01.setProperty01("新しいデータ01の値");
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $test01 = new Test01;

    $test01->setProperty01("データ01の値");

    $test01->setProperty01("新しいデータ01の値");
    ```

Test02 クラスインスタンスの `$property02` データに値を設定するためには、インスタンスを作り直さなければならない。

つまり、以前に作ったインスタンスの `$property02` の値は上書きできない。

セッターを持たせずに、`construct()` 関数のみを持たせれば、不変的なオブジェクトとなる。

=== "Go"

    ```go title="Go の場合の実装例"
    package main

    func main() {
    	test02 := NewTest02("データ02の値")

    	test02 = NewTest02("新しいデータ02の値")
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    let test02 = createTest02("データ02の値");

    test02 = createTest02("新しいデータ02の値");
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $test02 = new Test02("データ02の値");

    $test02 = new Test02("新しいデータ02の値");
    ```

#### ▼ 過剰なゲッターへの対処法

不変的なデータはゲッターを使用しなければアクセスできない。

そのため、値オブジェクトにプロパティ値を返すだけのゲッターが量産され、ファイルの見通しが悪くなってしまう。

そこで、例えば PHP では、マジック関数の `__get()` 関数を使用して、ゲッターの実装を省略できる。

すべての値オブジェクトの基底クラスに、『コールされたゲッターがクラス内に存在していなければ、動的にプロパティにアクセスして返却する』処理を持った `__get()` 関数を定義しておく。

すると、マジック関数のオーバーライド機能により、自身で定義した `__get()` 関数が代わりにコールされる。そのため、ゲッターを定義する必要がなくなる。

```injectablephp title="PHP の場合の実装例"
<?php

declare(strict_types=1);

namespace App\Traits;

use LogicException;

/**
 * イミュータブルトレイト
 * NOTE: イミュータブルなオブジェクトで使用する汎用的な関数を定義する
 */
trait ImmutableTrait
{
    /**
     * ゲッターが定義されていなくとも、プロパティにアクセスできるようにする
     */
    public function __get(string $name): mixed
    {
        if (!property_exists($this, $name)) {
            throw new LogicException(sprintf(
                "property %s is not found in %s",
                $name,
                static::class // 関数が実行されたクラスを取得
            ));
        }

        return $this->{$name};
    }
}
```

```injectablephp title="PHP の場合の実装例"
<?php

class Foo
{
    use ImmutableTrait;

    private string $bar;

    public function __construct(string $bar)
    {
        $this->bar = $bar;
    }
}

$foo = new Foo("BAR");
$foo->bar; // __get関数が代わりにコールされ、プロパティ値が返却される。
```

<br>

### 概念的な統一体

=== "Go"

    ```go title="Go の場合の実装例"
    package main

    // ここに実装例
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // ここに実装例
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // ここに実装例
    ```

<br>

### 交換可能性

オブジェクトが新しくインスタンス化された場合、以前に同一オブジェクトから作成されたインスタンスを新しいものに置き換える必要がある。

<br>

### 属性による等価性

#### ▼ 属性による等価性バリデーションとは

等価性を検証する関数を持つ。

保持するすべての属性が、対象の値オブジェクトと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

属性を 1 つだけ保持する場合、`1` 個の属性のみを検証すればよいため、以下の通りとなる。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    // 連絡先メールアドレスの値オブジェクト
    type ContactMail struct {
    	value string
    }

    func NewContactMail(value string) *ContactMail {
    	return &ContactMail{value: value}
    }

    func (c *ContactMail) Value() string {
    	return c.value
    }

    // 値オブジェクトの等価性を検証する
    func (c *ContactMail) Equals(vo *ContactMail) bool {
    	// 単一の属性を対象とする。
    	return c.Value() == vo.Value()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /**
     * 連絡先メールアドレスの値オブジェクト
     */

    export interface ContactMail {
      value(): string;
      equals(VO: ContactMail): boolean;
    }
    export function createContactMail(_value: string): ContactMail {
      function value(): string {
        return _value;
      }
      /**
       * 値オブジェクトの等価性を検証する
       */
      function equals(VO: ContactMail): boolean {
        // 単一の属性を対象とする。
        return value() === VO.value();
      }
      return {value, equals};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 連絡先メールアドレスの値オブジェクト
     */
    final class ContactMail extends ValueObject
    {

        private string $value;

        public function __construct(string $value)
        {
            $this->value = $value;
        }

        public function value(): string
        {
            return $this->value;
        }

        /**
         * 値オブジェクトの等価性を検証する
         */
        public function equals(ValueObject $VO): bool
        {
            // 単一の属性を対象とする。
            return $this->value() === $VO->value();
        }
    }
    ```

属性を複数保持する値オブジェクトの場合、すべての属性を検証する必要があるため、以下の通りとなる。

=== "Go"

    ```go title="Go の場合の実装例"
    package valueobjects

    // 支払情報の値オブジェクト
    type PaymentInfoVO struct {
    	// 支払い方法
    	paymentType *PaymentType
    	// 連絡先メールアドレス
    	contactMail *ContactMail
    	// 金額
    	price *Money
    }

    func NewPaymentInfoVO(paymentType *PaymentType, contactMail *ContactMail, price *Money) *PaymentInfoVO {
    	return &PaymentInfoVO{
    		paymentType: paymentType,
    		contactMail: contactMail,
    		price:       price,
    	}
    }

    // 値オブジェクトの等価性を検証する
    func (p *PaymentInfoVO) Equals(vo *PaymentInfoVO) bool {
    	// 複数の属性を対象とする。
    	return p.paymentType.Value() == vo.paymentType.Value() &&
    		p.contactMail.Value() == vo.contactMail.Value() &&
    		p.price.Value() == vo.price.Value()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /** 支払情報の値オブジェクト */
    export interface PaymentInfoVO {
      readonly paymentType: PaymentType;
      readonly contactMail: ContactMail;
      readonly price: Money;
      equals(other: PaymentInfoVO): boolean;
    }

    export function createPaymentInfoVO(
      paymentType: PaymentType,
      contactMail: ContactMail,
      price: Money,
    ): PaymentInfoVO {
      return {
        paymentType,
        contactMail,
        price,
        equals: (other) =>
          paymentType.value() === other.paymentType.value() &&
          contactMail.value() === other.contactMail.value() &&
          price.value() === other.price.value(),
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\ValueObjects;

    /**
     * 支払情報の値オブジェクト
     */
    final class PaymentInfoVO extends ValueObject
    {
        /**
         * 支払い方法
         */
        private PaymentType $paymentType;

        /**
         * 連絡先メールアドレス
         */
        private ContactMail $contactMail;

        /**
         * 金額
         */
        private Money $price;

        public function __construct(PaymentType $paymentType, ContactMail $contactMail, Money $price)
        {
            $this->paymentType = $paymentType;
            $this->contactMail = $contactMail;
            $this->price = $price;
        }

        /**
         * 値オブジェクトの等価性を検証する
         */
        public function equals(ValueObject $VO): bool
        {
            // 複数の属性を対象とする。
            return $this->paymentType->value() === $VO->paymentType->value()
                && $this->contactMail->value() === $VO->contactMail->value()
                && $this->price->value() === $VO->price->value();
        }
    }
    ```

すべての値オブジェクトに等価性のバリデーション関数を持たせると可読性が低い。

そこで、属性の比較処理を共通化するとよい。TypeScript の例では、`createValueObject()` が返すオブジェクトを個別の値オブジェクトに組み込み、`equals()` を共有する。

そのときは、保持している属性を反復的に検証できるよう実装するとよい。

=== "Go"

    ```go title="Go の場合の実装例"
    package domain

    import "reflect"

    // 値オブジェクトの等価性を検証する
    func Equals[T any](vo T, other T) bool {
    	v := reflect.ValueOf(vo)
    	o := reflect.ValueOf(other)

    	// 全ての属性を反復的に検証する
    	for i := 0; i < v.NumField(); i++ {
    		if !v.Field(i).Equal(o.Field(i)) {
    			return false
    		}
    	}

    	return true
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /** 比較対象の属性を公開する値オブジェクトの契約 */
    export interface ValueObject<T extends object> {
      readonly attributes: Readonly<T>;
      equals(other: ValueObject<T>): boolean;
    }

    export function createValueObject<T extends object>(
      attributes: T,
    ): ValueObject<T> {
      const values = Object.freeze({...attributes});

      return {
        attributes: values,
        equals(other) {
          const keys = Object.keys(values) as (keyof T)[];
          // 関数を比較せず、全ての属性を浅く比較する
          return (
            keys.length === Object.keys(other.attributes).length &&
            keys.every(
              (key) =>
                Object.prototype.hasOwnProperty.call(other.attributes, key) &&
                values[key] === other.attributes[key],
            )
          );
        },
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain;

    /**
     * 値オブジェクト抽象クラス
     */
    abstract class ValueObject
    {
        /**
         * 値オブジェクトの等価性を検証する
         */
        public function equals(ValueObject $VO): bool
        {
            // 全ての属性を反復的に検証する
            foreach (get_object_vars($this) as $key => $value) {
                if ($this->__get($key) !== $VO->__get($key)) {
                    return false;
                }
            }

            return true;
        }
    }
    ```

<br>

## 05. ルートエンティティとトランザクション

### ルートエンティティ

#### ▼ ルートエンティティとは

![ドメイン駆動設計_集約関係](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_集約関係.jpg)

エンティティや値オブジェクトからなる集約のなかで、最終的にユースケース層へレスポンスされる集約を、『ルートエンティティ』という。

EC サイトであれは、業務フローに沿って、以下のルートエンティティがある。

- 受注管理部門の受注ルートエンティティ
- 出荷管理部門の出荷ルートエンティティ
- 請求管理部門の請求ルートエンティティ
- 在庫管理部門の在庫ルートエンティティ
- 調達管理部門の調達ルートエンティティ

=== "Go"

    ```go title="Go の場合の実装例"
    package entities

    import (
    	"app/domain"
    	"app/domain/dog/entities"
    )

    // 犬用注文エンティティ
    type DogOrder struct {
    	// 犬用商品コンボID
    	id domain.Id
    	// 犬用おもちゃ
    	dogToy *entities.DogToy
    	// 犬用えさ
    	dogFood *entities.DogFood
    }

    func NewDogOrder(dogToy *entities.DogToy, dogFood *entities.DogFood) *DogOrder {
    	return &DogOrder{
    		dogToy:  dogToy,
    		dogFood: dogFood,
    	}
    }

    // 犬用おもちゃを返却する
    func (d *DogOrder) GetDogToy() *entities.DogToy {
    	return d.dogToy
    }

    // 犬用えさを返却する
    func (d *DogOrder) GetDogFood() *entities.DogFood {
    	return d.dogFood
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {Id} from "@/domain/id";
    import {DogToy} from "@/domain/dog/entities/dogToy";
    import {DogFood} from "@/domain/dog/entities/dogFood";

    /**
     * 犬用注文エンティティ
     */

    export interface DogOrder {
      getDogToy(): DogToy;
      getDogFood(): DogFood;
    }
    export function createDogOrder(dogToy: DogToy, dogFood: DogFood): DogOrder {
      const state: {id?: Id; dogToy: DogToy; dogFood: DogFood} = {
        id: undefined,
        dogToy,
        dogFood,
      };

      /**
       * 犬用おもちゃを返却する
       */
      function getDogToy(): DogToy {
        return state.dogToy;
      }
      /**
       * 犬用えさを返却する
       */
      function getDogFood(): DogFood {
        return state.dogFood;
      }
      return {getDogToy, getDogFood};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\Foo\Entities;

    use App\Domain\Entity;
    use App\Domain\Id;
    use App\Domain\Dog\Entities\DogToy;
    use App\Domain\Dog\Entities\DogFood;

    /**
     * 犬用注文エンティティ
     */
    class DogOrder
    {
        /**
         * 犬用商品コンボID
         */
        private Id $id;

        /**
         * 犬用おもちゃ
         */
        private DogToy $dogToy;

        /**
         * 犬用えさ
         */
        private DogFood $dogFood;

        public function __construct(DogToy $dogToy, DogFood $dogFood)
        {
            $this->dogToy = $dogToy;
            $this->dogFood = $dogFood;
        }

        /**
         * 犬用おもちゃを返却する
         */
        public function getDogToy(): DogToy
        {
            return $this->dogToy;
        }

        /**
         * 犬用えさを返却する
         */
        public function getDogFood(): DogFood
        {
            return $this->dogFood;
        }
    }
    ```

> - [販売管理の業務フローを図でわかりやすく解説！効率化するには？ \| ITトレンド](https://it-trend.jp/sales_management/article/11-0031)

#### ▼ 集約とは

データをセットで扱う必要があるエンティティのまとまりのこと。

<br>

### 集約の見つけ方

#### ▼ イベントストーミングにおける『名詞』のユビキタス言語

ドメインエキスパートが業務を語る際に登場するユビキタス言語の名詞は、境界づけられたコンテキストを横断して移動するルートエンティティである可能性がある。

#### ▼ トランザクションとの関係性

インフラストラクチャ層のリポジトリでは、レコードの書き込み/読み出しをルートエンティティ単位で実行する。

ルートエンティティを定義づけるときの注意点として、集約の単位が大き過ぎると、一部分のエンティティのみをトランザクション対象とすればよい処理であるのにも関わらず、ルートエンティティ全体まで対象としなければならなくなる。

そのため、ビジネスロジックとしてのまとまりと、トランザクションとしてのまとまりの両方から、ルートエンティティの単位を定義づけるとよい。

> - [Repositoryパターンのアンチパターン #デザインパターン - Qiita](https://qiita.com/mikesorae/items/ff8192fb9cf106262dbf#%E5%AF%BE%E7%AD%96-1)
> - https://codezine.jp/article/detail/10776
> - https://learn.microsoft.com/ja-jp/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/インフラストラクチャ層-persistence-layer-design#define-one-repository-per-aggregate

<br>

## 06. ルートエンティティ、エンティティ、値オブジェクトの見分け方

次の観点で見分けられる。

- ルートエンティティ
  - 識別子をもつ
  - 内包するエンティティや値オブジェクトを含む集約全体の状態を変更できる
  - ルートエンティティはそれぞれ独立して変更できる
- エンティティ
  - 識別子をもつ
  - 集約の外部から直接変更できず、通常はルートエンティティ経由で集約の状態を変更する
- 値オブジェクト
  - 識別子をもたない
  - ドメインルール上でのプリミティブ値や性質を表す

<br>
