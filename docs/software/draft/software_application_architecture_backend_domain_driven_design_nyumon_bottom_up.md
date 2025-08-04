# 前提知識

## 用語の整理

ドメイン、ドメインモデル、ドメインオブジェクトを整理します。

- ドメイン：ソフトウェア化の対象になる現実世界の領域
- ドメインモデル：ドメインにある概念がもつデータ・振る舞いを抽象化したもの。ドメインモデル図を設計する。
- ドメインオブジェクト：データ・振る舞いをもつドメインモデルを実装可能な状態に具体化したもの。ユースケース図やオブジェクト図で設計する。

上記を行ったり来たりしながら、よりよいドメインオブジェクトを設計します。

## ドメインオブジェクト設計の手順（※ おまけ）

ドメインオブジェクト設計の流れは以下の通りです。

例えば、Amazonのような小売業のEC業務システムでマイクロサービスアーキテクチャを構築する場合を考えます。

1. 既存のモノリスアーキテクチャのシステム関連図 (受注管理業務システムを取り巻く周辺システムの様子) を作成する。これにより、ドメイン全体と既存システム全体の対応関係を理解できる。
2. システムに関して、ドメインエキスパート (受注管理業務のプロ) にビジネスルールや振る舞いをヒアリングする。
3. ビジネスルールと振る舞いに基づいて、ユースケース図 (受注管理業務の具体的な作業の様子) を作成する。ユースケース図により、システムがどのように振る舞い、ドメインをの課題を解決するのかがわかる。
4. ユースケース図に登場する名詞に基づいて、ドメインオブジェクト図 (ドメインモデルを具体化する) やドメインモデル図 (ドメインモデルを抽象化する) を作成する。
5. ドメインモデル図にて、同時に永続化することになりそうなドメインモデルをグループ化する。グループ化により、集約の範囲が決まる。
6. ドメインモデル図にて、モデル名の日本語と英語をユビキタス言語とする。境界づけられたコンテキスト間ではユビキタス言語が異なるため、境界づけられたコンテキストを明確化できる。また開発 / ビジネスメンバー間で用語を共通認識化できる。
7. ドメインオブジェクト図とドメインモデル図に基づいて、DDDのデザインパターン (例：エンティティ、**値オブジェクト**、ルートエンティティなど) のクラス図を作成する。各デザインパターンをアプリアーキテクチャ (例：クリーンアーキテクチャ) の適切な層に配置する。
8. 集約内のルートエンティティ (例：受注エンティティ、購入ユーザーエンティティ、決済エンティティなど) を中心に、マイクロサービス全体を設計する。

境界づけられたコンテキストの切り離しを繰り返し、複数の境界づけられたコンテキストを抽出します。
各境界づけられたコンテキストを一つのマイクロサービスとして扱います。

# 値オブジェクト

### 値オブジェクトとは

ドメイン上で意味合いをもち、またプリミティブ（例：文字列、数値など）の型で表現される以下の値があります。

これをモデリングし、ドメインオブジェクトとして実装したものを値オブジェクトという。

- FullName：苗字や名前と関連処理（例：表示形式、氏名作成など）をデータ・振る舞いとして表現
- Money：金額や通貨単位と関連処理（例：IDの出力など）をデータ・振る舞いとして表現
- UserId：ユーザーIDと関連処理（例：四則演算、不正検証など）をデータ・振る舞いとして表現
- Email：メールアドレスと関連処理（例：構文検証など）をデータ・振る舞いとして表現
- Address：住所と関連処理（例：表示形式、構文検証など）をデータ・振る舞いとして表現
- PhoneNumber：電話番号と関連処理（例：構文検証、国番号抽出など）をデータ・振る舞いとして表現

## 実装方法の比較（※ 関数型プログラミングで実装）

### 氏名を値オブジェクトにする場合

classを使用したオブジェクト指向型プログラミングではなく、関数型プログラミングを広く使用してます。

また、TypeScriptを使用してます。

そこで、値オブジェクトを関数型プログラミングかつTypeScriptで紹介します。

氏名を値オブジェクトにする場合は次のとおりになります。

```tsx
// 値オブジェクト
export type FullName = Readonly<{
  // データ
  firstName: string;
  lastName: string;
}>;

// 初期化
export const createFullName = (
  first: string,
  last: string,
): FullName | Error => {
  if (!first || !last) return new Error("氏名は必須です");
  return Object.freeze({firstName: first, lastName: last});
};

// 等価性検証
export const equalsFullName = (a: FullName, b: FullName): boolean => {
  return a.firstName === b.firstName && a.lastName === b.lastName;
};

// 振る舞い
export const getDisplayName = (fullName: FullName): string => {
  return `${fullName.lastName} ${fullName.firstName}`;
};
```

```tsx
const fullName = createFullName("太郎", "山田");

console.log(getDisplayName(fullName)); // 山田 太郎
```

### 氏名をプリミティブにする場合

氏名をプリミティブにする場合は次のとおりになります。

```tsx
// データ
const firstName = "太郎";
const lastName = "山田";

// 振る舞い
function getDisplayName(firstName: string, lastName: string): string {
  return `${lastName} ${firstName}`;
}
```

```tsx
console.log(getDisplayName(firstName, lastName)); // 山田 太郎
```

## 値オブジェクトの利点

ここでは、氏名を使って解説します。

氏名をプリミティブ型ではなく値オブジェクトで定義すると、以下の利点があります。

- 氏名を値オブジェクトとして扱うと、ドメインオブジェクトのもつデータに意味づけができる。
- 値オブジェクトをプログラミング上のデータ型として扱えば、getDisplayName関数のような苗字や名前に関する処理では、これらのデータのみを扱うように強制できる

```tsx
// 値オブジェクト
export type FullName = Readonly<{
  // データ
  firstName: string;
  lastName: string;
}>;

// 初期化
export const createFullName = (
  first: string,
  last: string,
): FullName | Error => {
  if (!first || !last) return new Error("氏名は必須です");
  return Object.freeze({firstName: first, lastName: last});
};

// 等価性検証
export const equalsFullName = (a: FullName, b: FullName): boolean => {
  return a.firstName === b.firstName && a.lastName === b.lastName;
};

// 振る舞い
export const getDisplayName = (fullName: FullName): string => {
  return `${fullName.lastName} ${fullName.firstName}`;
};
```

## 値オブジェクトにもたせるべき特徴

### インスタンスのデータが不変である

値オブジェクトから作成したインスタンスのデータを後から変えられないようにじっそうする必要があります。

- Readonlyを使用して、JavaScriptへのコンパイル時にインスタンスのもつデータが変化しないようにする必要がある
- Object.freezeを使用して、コンパイル後の実行時にインスタンスのもつデータが変化しないようにする必要がある（この実装は、あればなお良しくらい）

```tsx
// 値オブジェクト
export type FullName = Readonly<{
  // データ
  firstName: string;
  lastName: string;
}>;

// 初期化
export const createFullName = (
  first: string,
  last: string,
): FullName | Error => {
  if (!first || !last) return new Error("氏名は必須です");
  return Object.freeze({firstName: first, lastName: last});
};

// 等価性検証
export const equalsFullName = (a: FullName, b: FullName): boolean => {
  return a.firstName === b.firstName && a.lastName === b.lastName;
};

// 振る舞い
export const getDisplayName = (fullName: FullName): string => {
  return `${fullName.lastName} ${fullName.firstName}`;
};
```

```tsx
// インスタンスのデータを後から変えられない
const fullName = createFullName("太郎", "山田");
```

### インスタンスを交換できる

インスタンスは異なるが、どちらを使用しても同じ結果を得られるように実装する必要があります。

```tsx
const fullName1 = createFullName("太郎", "山田");
const fullName2 = createFullName("太郎", "山田");

// getDisplayNameに渡すインスタンスを交換しても、display1とdisplay2は同じである
const display1 = getDisplayName(fullName1);
const display2 = getDisplayName(fullName2);

console.log(display1 === display2); // true
```

### インスタンス間で等価性を検証できる

```tsx
// 値オブジェクト
export type FullName = Readonly<{
  // データ
  firstName: string;
  lastName: string;
}>;

// 初期化
export const createFullName = (
  first: string,
  last: string,
): FullName | Error => {
  if (!first || !last) return new Error("氏名は必須です");
  return Object.freeze({firstName: first, lastName: last});
};

// 振る舞い
export const getDisplayName = (fullName: FullName): string => {
  return `${fullName.lastName} ${fullName.firstName}`;
};

// 等価性検証
export const equalsFullName = (a: FullName, b: FullName): boolean => {
  return a.firstName === b.firstName && a.lastName === b.lastName;
};
```

```tsx
const fullName1 = createFullName("太郎", "山田");
const fullName2 = createFullName("太郎", "山田");

console.log(equalsFullName(fullName1, fullName2)); // true
```

# 監視SaaSで値オブジェクトを考えてみる

## 監視業務における値オブジェクトは何？

監視SaaSを開発しているため、どんな値オブジェクトがありそうかを考えてみます。

監視SaaSは監視業務（監視業務ドメイン）をソフトウェア化の対象としたアプリケーションです。

どのようなドメインモデルがあり、それを値オブジェクトに具体化できそうか考えてみます。

| ドメインモデル                                                                                | 値オブジェクト | 持つデータ                           |
| --------------------------------------------------------------------------------------------- | -------------- | ------------------------------------ |
| 時間範囲                                                                                      | TimeRange      | 期間                                 |
| タグ                                                                                          | Tag            | タグ値                               |
| メトリクス型（例えば、Prometheusにあるcounter、gauge、histgram、summaryといったメトリクス型） | MetricsType    | どのメトリクス型であるかを表す識別子 |

## 値オブジェクトにするべきかどうかの判断基準

### 値オブジェクトの具体例として上がっている場合

例えば以下は、プリミティブ型ではなく値オブジェクトとして扱った方が良いものとして、先人が判断してくれています。

ドメインの種類に限らず、値オブジェクトとして扱いましょう。

- FullName
- Money
- UserId
- Email
- Address
- PhoneNumber

### 具体例として上がっていなくても値オブジェクトの恩恵を受けたい場合

ドメインによっては、値オブジェクトとして扱うべきかどうか、先人の知見がない場合があります。

監視業務は先人の知見が全然なく、何をプリミティブ型として、何を値オブジェクトとして判断するべきかわからないかもしれません。

その場合、ロジック中に頻繁に登場する値は積極的に値オブジェクトを使用するとよさそうです👍

<br>
