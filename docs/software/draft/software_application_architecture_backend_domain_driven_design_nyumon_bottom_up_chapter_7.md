## 7.1 技術要素への依存がもたらすもの

オブジェクトAやBは、中核にあるオブジェクトCに依存しているとする。

オブジェクトCを変更すると、オブジェクトAやBに影響する。

積み木に例えると、重要なブロック（依存されるオブジェクト）を抜き出すと、上にあるブロック（依存するオブジェクト）は崩れてしまう。

![domain_driven_design_nyumon_bottom_up_chapter_7-01](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-01.png)

<br>

## 7.2 依存とは

### 依存関係のある例

次の例では、オブジェクトAはオブジェクトBを参照している。

これは、オブジェクトAがBに依存している状況である。

リスト7.1：ObjectAはObjectBに依存する。

```typescript
class ObjectA {
  private objectB?: ObjectB;
}
```

![domain_driven_design_nyumon_bottom_up_chapter_7-02](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-02.png)

次の例では、実装リポジトリはインターフェースリポジトリの実装である。

これも、UserRepositoryがIUserRepositoryに依存している状況である。

リスト7.2：UserRepositoryはIUserRepositoryに依存する

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

![domain_driven_design_nyumon_bottom_up_chapter_7-03](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-03.png)

### よくない依存関係

次の例では、UserApplicationServiceはUserRepository（実装リポジトリ）に依存している。

この状態では、UserApplicationServiceの処理を実行する時に、DBが必要になってしまう。

リスト7.3：UserApplicationServiceの依存関係に着目

```typescript
export class UserApplicationService {
  private readonly repository: UserRepository;

  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  // 中略
}
```

![domain_driven_design_nyumon_bottom_up_chapter_7-04](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-04.png)

代わりに、IUserRepository（インターフェースリポジトリ）に依存させる。

インメモリ実装リポジトリに差し替えられるため、テスト時などでDBがなくてもUserApplicationServiceの処理を実行できるようになる。

リスト7.4：リポジトリのインターフェースを参照する

```typescript
export class UserApplicationService {
  private readonly repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  // 中略
}
```

結果的に、『具体型』のUserApplicationServiceとUserRepositoryの両方が『抽象型』のIUserRepositoryに依存することとなる。

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

![domain_driven_design_nyumon_bottom_up_chapter_7-05](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-05.png)

## 7.3 依存関係逆転の原則とは

次の２つの条件のことである。

A：上位レベルのモジュールは下位レベルのモジュールに依存してはならない、どちらのモジュールも抽象に依存すべきである。

B：抽象は、実装の詳細に依存してはならない。実装の詳細が抽象に依存すべきである。

### 7.3.1 抽象に依存せよ

![domain_driven_design_nyumon_bottom_up_chapter_7-06](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-06.png)

Aを満たす。

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

AとBを満たす。

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

上記２つを実装すると、AとBの両方を満たすため、依存関係逆転の原則を満たせる。

### 7.3.2 主導権を抽象に

上位モジュールが主導権をもつべき。

上位レベルのモジュールが「どんな処理を呼び出したいか」をインターフェースとして宣言し、下位モジュールがそのインターフェースに従って実装するべき。

## 7.4 依存関係をコントロールする

次の例のように、テスト時にインメモリ実装リポジトリを使用したいという目的で、インメモリ実装リポジトリの呼び出しをハードコーディングしてしまうのはよくない。

リスト7.5：インメモリ実装リポジトリをコンストラクタで生成する

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

次の例のように、実環境で動かす時に実装リポジトリを呼び出すように書き換えないといけない

リスト7.6：プロダクション用のリポジトリに差し替える

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

そんな時は、ServiceLocatorパターンが役立つ。

ServiceLocatorパターンによって、オブジェクトの呼び出しを紐付け、動的に切り替える。

<details><summary>🚨補足（クリックで開く）</summary><div>

インメモリ実装リポジトリを使用せず、テスト時も実装リポジトリを使用してDBに接続する場合、Service Locatorパターンはなくても大丈夫

</div></details>

リスト7.7：ServiceLocatorを適用する

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

![domain_driven_design_nyumon_bottom_up_chapter_7-07](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-07.png)

ServiceLocatorパターンを実装したServiceLocatorオブジェクトには、呼び出しの紐づけを事前に登録しておく。

例えば、テスト時はIUserRepositoryを呼び出すとInMemoryUserRepositoryが返却されるように実装しておく。

リスト7.8：事前にインスタンスを登録する

```typescript

// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
ServiceLocator.registerClass<IUserRepository>(
  IUserRepository,
  InMemoryUserRepository>
);

```

また、実環境ではIUserRepositoryを呼び出すとUserRepositoryが返却されるように実装しておく。

リスト7.9：プロダクションに移行するためリポジトリを切り替える

```typescript
// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
ServiceLocator.registerClass<IUserRepository>(IUserRepository, UserRepository);
```

これらの対応関係を実環境とテスト時で切り替えられるようにしておく。

![domain_driven_design_nyumon_bottom_up_chapter_7-08](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-08.png)

<details><summary>🚨補足（クリックで開く）</summary><div>

ServiceLocatorオブジェクトには、呼び出しの紐づけを事前に登録しておく。

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

書籍では言及していないが、ServiceLocatorオブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的なServiceLocatorオブジェクトはstatic宣言を使用する。

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

ServiceLocatorオブジェクトのデメリットとして、依存関係がオブジェクトの外からはわからない。

UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。

リスト7.11：リスト7.10 のコンストラクタ

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

ServiceLocatorではstatic宣言なため、アプリ起動時にインスタンスをServiceLocator内で作る。

UserApplicationServiceの中では、依存先のUserRepositoryがすでに準備されてしまっている

```typescript
import {UserApplicationService} from "./userApplicationService";

// UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
const userApplicationService = new UserApplicationService();

userApplicationService.findById(1);
```

</div></details>

また、ServiceLocatorは呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならず、テストなどで実行しないとエラーにならない

リスト7.13：UserApplicationServiceに変化が起きた

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

### 7.4.2 IoC Containerパターン

ということで、Service Locatorパターンとは別の方法で、インメモリ実装リポジトリと実装リポジトリを差し替えてみる。

それには、次のプラクティスを使用する。

- コンストラクタインジェクション
- IoC Containerパターン

<details><summary>🚨補足（クリックで開く）</summary><div>

インメモリ実装リポジトリを使用せず、テスト時も実装リポジトリを使用してDBに接続する場合、IoC Containerパターンはなくても大丈夫

</div></details>

まずは、コンストラクタインジェクションから説明する。

次の例では、UserApplicationServiceをInMemoryUserRepositoryに依存させている（InMemoryUserRepositoryに対する依存を注入している）

リスト7.14：依存を注入する

```typescript
const userRepository = new InMemoryUserRepository();
const userApplicationService = new UserApplicationService(userRepository);
```

コンストラクタを使用して依存させているため、コンストラクタインジェクションという。

リスト7.15：新たな依存関係を追加する

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

次に、IoC Containerパターンを実装したIoC Containerオブジェクトを説明する。

IoC Containerオブジェクトは、オブジェクトを指定すると、依存関係をよしなに解決した上でインスタンスを返却してくれる。

IoC Containerオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

ServiceLocatorオブジェクトでは、オブジェクトの呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならない

一方で、IoC ContainerオブジェクトではUserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しないといけないため、ビルド時にエラーになってくれる。

リスト7.17：IoC Containerを利用して依存関係を解決させる

```typescript
// IoC Containerオブジェクト
const serviceCollection = new ServiceCollection();

// IoC Containerオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
serviceCollection.addTransient<IUserRepository, InMemoryUserRepository>();
// UserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しておかないと、ここでエラーになる
serviceCollection.addTransient<UserApplicationService>();

// IoC ContainerオブジェクトからuserApplicationServiceを取得する
const provider = serviceCollection.buildServiceProvider();
const userApplicationService = provider.getService<UserApplicationService>();
```

![domain_driven_design_nyumon_bottom_up_chapter_7-09](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-09.png)

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

// IoC Containerオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
const iocContainer = new IocContainer();
for (const {token, implementation} of repositoriesMap) {
  iocContainer.register(token, implementation);
}
```

書籍では言及していないが、IoC Containerオブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的なIoC ContainerオブジェクトはServiceLocatorとは違いstatic宣言を使用しない。

そのため、IoC Cotainerでは実行したタイミングでインスタンスを作る。

```typescript
// IoC Container
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

IoC Containerオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

```typescript
// IoC Cotainerとコンストラクタインジェクションの場合

import { container } from "./repositories";
import { tokens } from "./iocContainer";
import type { IUserRepository } from "./domain/IUserRepository";
import { UserApplicationService } from "./userApplicationService";

// IoC ContainerからuserRepositoryインスタンスを取得する
const userRepository = container.resolve<IUserRepository>(tokens.IUserRepository);

// コンストラクタに注入する
// 引数にリポジトリや他の依存する新しいリポジトリを渡さないとビルド段階でエラーになる
const userApplicationService = new UserApplicationService(tokens.userRepository, ...);

userApplicationService.findById("1");
```

ServiceLocatorオブジェクトではstatic宣言なため、アプリ起動時にインスタンスをServiceLocatorオブジェクト内で作る。

ServiceLocatorオブジェクトからインスタンスを取り出せないため、コンストラクタにインスタンスを渡せない。

また前述の通り、ServiceLocatorオブジェクトはオブジェクトの呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならない

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
