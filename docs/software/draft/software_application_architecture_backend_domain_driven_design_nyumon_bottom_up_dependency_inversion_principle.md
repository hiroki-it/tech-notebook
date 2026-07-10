---
title: 【IT技術の知見】７章＠ドメイン駆動設計入門ボトムアップ
description: ７章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ７章＠ドメイン駆動設計入門ボトムアップ

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter7

<br>

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 7.1 技術要素への依存がもたらすもの

オブジェクト A や B は、中核にあるオブジェクト C へ依存しているとする。

オブジェクト C を変更すると、オブジェクト A や B に影響する。

積み木に例えると、重要なブロック（依存されるオブジェクト）を抜き出す。

すると、上にあるブロック（依存するオブジェクト）は崩れてしまう。

![domain_driven_design_nyumon_bottom_up_chapter_07-01](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-01.png)

<br>

## 7.2 依存とは

### 依存関係のある例

次の例では、オブジェクト A はオブジェクト B を参照している。

これは、オブジェクト A が B に依存している状況である。

リスト 7.1：ObjectA は ObjectB に依存する。

```typescript
class ObjectA {
  private objectB?: ObjectB;
}
```

![domain_driven_design_nyumon_bottom_up_chapter_07-02](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-02.png)

次の例では、実装リポジトリはインターフェースリポジトリの実装である。

これも、UserRepository が IUserRepository に依存している状況である。

リスト 7.2：UserRepository は IUserRepository に依存する

```typescript
export type IUserRepository = {
  find: (id: UserId) => Promise<User | null>;
};

export class UserRepository implements IUserRepository {
  async find(id: UserId): Promise<User | null> {
    // 中略
  }
}
```

![domain_driven_design_nyumon_bottom_up_chapter_07-03](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-03.png)

### よくない依存関係

次の例では、UserApplicationService は UserRepository（実装リポジトリ）に依存している。

この状態では、UserApplicationService の処理を実行するときに、DB が必要になってしまう。

リスト 7.3：UserApplicationService の依存関係に着目

```typescript
export class UserApplicationService {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  // 中略
}
```

![domain_driven_design_nyumon_bottom_up_chapter_07-04](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-04.png)

代わりに、IUserRepository（インターフェースリポジトリ）に依存させる。

インメモリ実装リポジトリに差し替えられるため、テスト時などで DB がなくても UserApplicationService の処理を実行できるようになる。

リスト 7.4：リポジトリのインターフェースを参照する

```typescript
export class UserApplicationService {
  private readonly repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  // 中略
}
```

結果的に、『具体型』の UserApplicationService と UserRepository の両方が『抽象型』の IUserRepository に依存することとなる。

これは依存関係逆転の原則を満たしている。

```typescript
export type IUserRepository = {
  find: (id: UserId) => Promise<User | null>;
};

export class UserRepository implements IUserRepository {
  async find(id: UserId): Promise<User | null> {
    // 中略
  }
}
```

![domain_driven_design_nyumon_bottom_up_chapter_07-05](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-05.png)

## 7.3 依存関係逆転の原則とは

次の２つの条件のことである。

A：上位レベルのモジュールは下位レベルのモジュールに依存してはならない、どちらのモジュールも抽象に依存すべきである。

B：抽象は、実装の詳細に依存してはならない。実装の詳細が抽象に依存すべきである。

### 7.3.1 抽象に依存せよ

![domain_driven_design_nyumon_bottom_up_chapter_07-06](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-06.png)

A を満たす。

```typescript
export class UserApplicationService {
  // 上位レベル（≒ 上位レイヤー）が抽象に依存する
  private readonly repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  // 中略
}
```

A と B を満たす。

```typescript
export type IUserRepository = {
  find: (id: UserId) => Promise<User | null>;
};

// 下位レベル（≒ 下位レイヤー）が抽象に依存する
// 実装の詳細が抽象に依存する
export class UserRepository implements IUserRepository {
  async find(id: UserId): Promise<User | null> {
    // 中略
  }
}
```

上記２つを実装すると、A と B の両方を満たすため、依存関係逆転の原則を満たせる。

### 7.3.2 主導権を抽象に

上位モジュールが主導権をもつべき。

上位レベルのモジュールが「どんな処理を呼び出したいか」をインターフェースとして宣言し、下位モジュールがそのインターフェースに従って実装するべき。

## 7.4 依存関係をコントロールする

次の例のように、テスト時にインメモリ実装リポジトリを使用したいという目的で、インメモリ実装リポジトリの呼び出しをハードコーディングしてしまうのはよくない。

リスト 7.5：インメモリ実装リポジトリをコンストラクタで生成する

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;

  constructor() {
    // テスト時はインメモリ実装リポジトリを呼び出すようにハードコーディングしてしまう
    this.userRepository = new InMemoryUserRepository();
  }

  // 中略
}
```

次の例のように、実環境で動かすときに実装リポジトリを呼び出すように書き換えないといけない

リスト 7.6：プロダクション用のリポジトリに差し替える

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;

  constructor() {
    // 実環境では実装リポジトリを呼び出すように書き換えないといけない
    this.userRepository = new UserRepository();
  }

  // 中略
}
```

### 7.4.1 Service Locatorパターン

インメモリ実装リポジトリと実装リポジトリをハードコーディングせずに差し替えたい。

そんなときは、ServiceLocator パターンが役立つ。

ServiceLocator パターンによって、オブジェクトの呼び出しを紐付け、動的に切り替える。

<details><summary>🚨補足（クリックで開く）</summary><div>

インメモリ実装リポジトリを使用せず、テスト時も実装リポジトリを使用して DB に接続する場合、Service Locator パターンはなくても大丈夫

</div></details>

リスト 7.7：ServiceLocator を適用する

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;

  // コンストラクタの引数はない
  constructor() {
    // IUserRepositoryを呼び出しているが、内部的にはServiceLocatorオブジェクトで登録したオブジェクトを呼び出している
    this.userRepository =
      ServiceLocator.resolve<IUserRepository>(IUserRepository);
  }
}
```

![domain_driven_design_nyumon_bottom_up_chapter_07-07](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-07.png)

ServiceLocator パターンを実装した ServiceLocator オブジェクトには、呼び出しの紐づけを事前に登録しておく。

例えば、テスト時は IUserRepository を呼び出すと InMemoryUserRepository が返却されるように実装しておく。

リスト 7.8：事前にインスタンスを登録する

```typescript

// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
ServiceLocator.registerClass<IUserRepository>(
  IUserRepository,
  InMemoryUserRepository>
);

```

また、実環境では IUserRepository を呼び出すと UserRepository が返却されるように実装しておく。

リスト 7.9：プロダクションに移行するためリポジトリを切り替える

```typescript
// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
ServiceLocator.registerClass<IUserRepository>(IUserRepository, UserRepository);
```

これらの対応関係を実環境とテスト時で切り替えられるようにしておく。

![domain_driven_design_nyumon_bottom_up_chapter_07-08](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-08.png)

<details><summary>🚨補足（クリックで開く）</summary><div>

ServiceLocator オブジェクトには、呼び出しの紐づけを事前に登録しておく。

紐づけをキーバリューで定義しておき、（書籍では言及していないが）フラグで条件分岐させて切り替える。

```typescript
import {IUserRepository} from "./domain/IUserRepository";
import {ICircleRepository} from "./domain/ICircleRepository";
import {
  InMemoryUserRepository,
  UserRepository,
} from "./infrastructure/userRepository";
import {
  InMemoryCircleRepository,
  CircleRepository,
} from "./infrastructure/circleRepository";
import {ServiceLocator} from "./serviceLocator";

type RepositoriesMap = {
  token: symbol;
  implementation: unknown;
};

const tokens = {
  IUserRepository: Symbol("IUserRepository"),
  ICircleRepository: Symbol("ICircleRepository"),
  // 中略
} as const;

// 環境変数からフラグを取得する
const inMemory = process.env.IN_MEMORY === "true";

const repositoriesMap: RepositoriesMap[] = [
  {
    token: tokens.IUserRepository,
    implementation: inMemory
      ? new InMemoryUserRepository()
      : new UserRepository(),
  },
  {
    token: tokens.ICircleRepository,
    implementation: inMemory
      ? new InMemoryCircleRepository()
      : new CircleRepository(),
  },
  // 中略
];

// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
for (const {token, implementation} of repositoriesMap) {
  ServiceLocator.register(token, implementation);
}
```

書籍では言及していないが、ServiceLocator オブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的な ServiceLocator オブジェクトは static 宣言を使用する。

```typescript
export class ServiceLocator {
  private static registry = new Map<symbol, unknown>();

  // インターフェースリポジトリと実装リポジトリの対応関係を登録する
  static register<T>(token: symbol, implementation: T): void {
    this.registry.set(token, implementation);
  }

  // 登録済みの実装リポジトリのインスタンスを返却する
  // インスタンスは事前に作成されている
  static resolve<T>(token: symbol): T {
    return this.registry.get(token) as T;
  }

  static clear(): void {
    this.registry.clear();
  }
}
```

</div></details>

ServiceLocator オブジェクトのデメリットとして、依存関係がオブジェクトの外からはわからない。

UserApplicationService を外から見ても、UserRepository に依存することはわからない。

リスト 7.11：リスト 7.10 のコンストラクタ

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;

  constructor() {
    this.userRepository =
      ServiceLocator.resolve<IUserRepository>(IUserRepository);
  }
}
```

<details><summary>🚨補足（クリックで開く）</summary><div>

ServiceLocator では static 宣言なため、アプリ起動時にインスタンスを ServiceLocator 内で作る。

UserApplicationService のなかでは、依存先の UserRepository がすでに準備されてしまっている

```typescript
import {UserApplicationService} from "./userApplicationService";

// UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
const userApplicationService = new UserApplicationService();

userApplicationService.findById(1);
```

</div></details>

また、ServiceLocator は呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならず、テストなどで実行しないとエラーにならない

リスト 7.13：UserApplicationService に変化が起きた

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;
  private readonly fooRepository: IFooRepository;

  constructor() {
    this.userRepository =
      ServiceLocator.resolve<IUserRepository>(IUserRepository);
    // repositoriesMapに対応関係をまだ登録していないが、ビルドの段階ではエラーにならない
    this.fooRepository = ServiceLocator.resolve<IFooRepository>(IFooRepository);
  }
}
```

### 7.4.2 IoCコンテナパターン

ということで、Service Locator パターンとは別の方法で、インメモリ実装リポジトリと実装リポジトリを差し替えてみる。

それには、次のプラクティスを使用する。

- コンストラクタインジェクション
- IoC コンテナパターン

<details><summary>🚨補足（クリックで開く）</summary><div>

インメモリ実装リポジトリを使用せず、テスト時も実装リポジトリを使用して DB に接続する場合、IoC コンテナパターンはなくても大丈夫

</div></details>

まずは、コンストラクタインジェクションから説明する。

次の例では、UserApplicationService を InMemoryUserRepository に依存させている（InMemoryUserRepository に対する依存を注入している）

リスト 7.14：依存を注入する

```typescript
const userRepository = new InMemoryUserRepository();
const userApplicationService = new UserApplicationService(userRepository);
```

コンストラクタを使用して依存させているため、コンストラクタインジェクションという。

リスト 7.15：新たな依存関係を追加する

```typescript
export class UserApplicationService {
  private readonly userRepository: IUserRepository;
  private readonly circleRepository: ICircleRepository;

  // コンストラクタを使用して依存させている
  constructor(
    userRepository: IUserRepository,
    circleRepository: ICircleRepository
  ) {
    this.userRepository = userRepository;
    this.circleRepository = circleRepository;
  }

  set(...)
}
```

他にも

- コンストラクタインジェクション：constructor(…)
- セッターインジェクション：set〇〇(…)
- メソッドインジェクション：foo(…)

次に、IoC コンテナパターンを実装した IoC コンテナオブジェクトを説明する。

IoC コンテナオブジェクトは、オブジェクトを指定すると、依存関係をよしなに解決したうえでインスタンスを返却してくれる。

IoC コンテナオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

ServiceLocator オブジェクトでは、オブジェクトの呼び出しを動的に切り替える。

そのため、ビルドの段階ではエラーにならない。

一方で、IoC コンテナオブジェクトでは UserApplicationService のコンストラクタに IUserRepository を渡すように実装しないといけない。

そのため、ビルド時はエラーになってくれる。

リスト 7.17：IoC コンテナを利用して依存関係を解決させる

```typescript
// IoCコンテナオブジェクト
const serviceCollection = new ServiceCollection();

// IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
serviceCollection.addTransient<IUserRepository, InMemoryUserRepository>();
// UserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しておかないと、ここでエラーになる
serviceCollection.addTransient<UserApplicationService>();

// IoCコンテナオブジェクトからuserApplicationServiceを取得する
const provider = serviceCollection.buildServiceProvider();
const userApplicationService = provider.getService<UserApplicationService>();
```

![domain_driven_design_nyumon_bottom_up_chapter_07-09](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-09.png)

<details><summary>🚨補足（クリックで開く）</summary><div>

```typescript
import {IUserRepository} from "./domain/IUserRepository";
import {ICircleRepository} from "./domain/ICircleRepository";
import {
  InMemoryUserRepository,
  UserRepository,
} from "./infrastructure/userRepository";
import {
  InMemoryCircleRepository,
  CircleRepository,
} from "./infrastructure/circleRepository";
import {IocContainer} from "./iocContainer";

type RepositoriesMap = {
  token: symbol;
  implementation: unknown;
};

const tokens = {
  IUserRepository: Symbol("IUserRepository"),
  ICircleRepository: Symbol("ICircleRepository"),
  // 中略
} as const;

// 環境変数からフラグを取得する
const inMemory = process.env.IN_MEMORY === "true";

const repositoriesMap: RepositoriesMap[] = [
  {
    token: tokens.IUserRepository,
    implementation: inMemory ? InMemoryUserRepository : UserRepository,
  },
  {
    token: tokens.ICircleRepository,
    implementation: inMemory ? InMemoryCircleRepository : CircleRepository,
  },
  // 中略
];

// IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
const iocContainer = new IocContainer();
for (const {token, implementation} of repositoriesMap) {
  iocContainer.register(token, implementation);
}
```

書籍では言及していないが、IoC コンテナオブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的な IoC コンテナオブジェクトは ServiceLocator とは違い static 宣言を使用しない。

そのため、IoC Container では実行したタイミングでインスタンスを作る。

```typescript
// IoCコンテナ
type Constructor<T> = new (...args: any[]) => T;

export class IocContainer {
  private registry = new Map<symbol, Constructor<any>>();

  // インターフェースリポジトリと実装リポジトリの対応関係を登録する
  register<T>(token: symbol, implementation: Constructor<T>): void {
    this.registry.set(token, implementation);
  }

  // 登録済みの実装リポジトリのインスタンスを返却する
  // インスタンスは事前に作成したものではなく、新しく作成される
  resolve<T>(token: symbol): T {
    const implementation = this.registry.get(token);
    return new implementation() as T;
  }

  clear(): void {
    this.registry.clear();
  }
}
```

IoC コンテナオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

```typescript
// IoC Containerとコンストラクタインジェクションの場合

import { container } from "./repositories";
import { tokens } from "./iocContainer";
import type { IUserRepository } from "./domain/IUserRepository";
import { UserApplicationService } from "./userApplicationService";

// IoCコンテナからuserRepositoryインスタンスを取得する
const userRepository = container.resolve<IUserRepository>(tokens.IUserRepository);

// コンストラクタに注入する
// 引数にリポジトリや他の依存する新しいリポジトリを渡さないとビルド段階でエラーになる
const userApplicationService = new UserApplicationService(tokens.userRepository, ...);

userApplicationService.findById("1");
```

ServiceLocator オブジェクトでは static 宣言なため、アプリ起動時にインスタンスを ServiceLocator オブジェクト内で作る。

ServiceLocator オブジェクトからインスタンスを取り出せないため、コンストラクタにインスタンスを渡せない。

また前述の通り、ServiceLocator オブジェクトはオブジェクトの呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならない

```typescript
// ServiceLocatorオブジェクトの場合

import {UserApplicationService} from "./userApplicationService";

// UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
// UserApplicationServiceにIUserRepositoryを渡し忘れても、ビルド段階ではエラーにならない
const userApplicationService = new UserApplicationService();

userApplicationService.findById(1);
```

</div></details>

## 7.5 まとめ

依存関係の取り扱いを間違えると、硬直したソフトウェアになってしまう。

依存自体は避けられないが、我々で制御できる。

ビジネスロジックを中核として、依存の方向性をちゃんと制御しよう。
