---
title: 【IT技術の知見】７章＠ドメイン駆動設計入門ボトムアップ
description: ７章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ７章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter7 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter7)

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

=== "Go"

    ```go title=".go"
    type ObjectA struct {
    	objectB *ObjectB
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    class ObjectA {
      private objectB?: ObjectB;
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class ObjectA
    {
        private ?ObjectB $objectB = null;
    }
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-02](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-02.png)

次の例では、実装リポジトリはインターフェースリポジトリの実装である。

これも、UserRepository が IUserRepository に依存している状況である。

リスト 7.2：UserRepository は IUserRepository に依存する

=== "Go"

    ```go title=".go"
    type IUserRepository interface {
    	Find(id UserId) (*User, error)
    }

    type UserRepository struct{}

    func (r *UserRepository) Find(id UserId) (*User, error) {
    	// 中略
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export type IUserRepository = {
      find: (id: UserId) => Promise<User | null>;
    };

    export class UserRepository implements IUserRepository {
      async find(id: UserId): Promise<User | null> {
        // 中略
      }
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    interface IUserRepository
    {
        public function find(UserId $id): ?User;
    }

    class UserRepository implements IUserRepository
    {
        public function find(UserId $id): ?User
        {
            // 中略
        }
    }
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-03](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-03.png)

### よくない依存関係

次の例では、UserApplicationService は UserRepository（実装リポジトリ）に依存している。

この状態では、UserApplicationService の処理を実行するときに、DB が必要になってしまう。

リスト 7.3：UserApplicationService の依存関係に着目

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	repository *UserRepository
    }

    func NewUserApplicationService(repository *UserRepository) *UserApplicationService {
    	return &UserApplicationService{
    		repository: repository,
    	}
    }

    // 中略
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      private readonly repository: UserRepository;

      constructor(repository: UserRepository) {
        this.repository = repository;
      }

      // 中略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly UserRepository $repository;

        public function __construct(UserRepository $repository)
        {
            $this->repository = $repository;
        }

        // 中略
    }
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-04](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-04.png)

代わりに、IUserRepository（インターフェースリポジトリ）に依存させる。

インメモリ実装リポジトリに差し替えられるため、テスト時などで DB がなくても UserApplicationService の処理を実行できるようになる。

リスト 7.4：リポジトリのインターフェースを参照する

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	repository IUserRepository
    }

    func NewUserApplicationService(repository IUserRepository) *UserApplicationService {
    	return &UserApplicationService{
    		repository: repository,
    	}
    }

    // 中略
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      private readonly repository: IUserRepository;

      constructor(repository: IUserRepository) {
        this.repository = repository;
      }

      // 中略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $repository;

        public function __construct(IUserRepository $repository)
        {
            $this->repository = $repository;
        }

        // 中略
    }
    ```

結果的に、『具体型』の UserApplicationService と UserRepository の両方が『抽象型』の IUserRepository に依存することとなる。

これは依存関係逆転の原則を満たしている。

=== "Go"

    ```go title=".go"
    type IUserRepository interface {
    	Find(id UserId) (*User, error)
    }

    type UserRepository struct{}

    func (r *UserRepository) Find(id UserId) (*User, error) {
    	// 中略
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export type IUserRepository = {
      find: (id: UserId) => Promise<User | null>;
    };

    export class UserRepository implements IUserRepository {
      async find(id: UserId): Promise<User | null> {
        // 中略
      }
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    interface IUserRepository
    {
        public function find(UserId $id): ?User;
    }

    class UserRepository implements IUserRepository
    {
        public function find(UserId $id): ?User
        {
            // 中略
        }
    }
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-05](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-05.png)

## 7.3 依存関係逆転の原則とは

次に示す２つの条件のことである。

A：上位レベルのモジュールは下位レベルのモジュールに依存してはならない、どちらのモジュールも抽象に依存すべきである。

B：抽象は、実装の詳細に依存してはならない。実装の詳細が抽象に依存すべきである。

### 7.3.1 抽象に依存せよ

![domain_driven_design_nyumon_bottom_up_chapter_07-06](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-06.png)

A を満たす。

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	// 上位レベル（≒ 上位レイヤー）が抽象に依存する
    	repository IUserRepository
    }

    func NewUserApplicationService(repository IUserRepository) *UserApplicationService {
    	return &UserApplicationService{
    		repository: repository,
    	}
    }

    // 中略
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      // 上位レベル（≒ 上位レイヤー）が抽象に依存する
      private readonly repository: IUserRepository;

      constructor(repository: IUserRepository) {
        this.repository = repository;
      }

      // 中略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        // 上位レベル（≒ 上位レイヤー）が抽象に依存する
        private readonly IUserRepository $repository;

        public function __construct(IUserRepository $repository)
        {
            $this->repository = $repository;
        }

        // 中略
    }
    ```

A と B を満たす。

=== "Go"

    ```go title=".go"
    type IUserRepository interface {
    	Find(id UserId) (*User, error)
    }

    // 下位レベル（≒ 下位レイヤー）が抽象に依存する
    // 実装の詳細が抽象に依存する
    type UserRepository struct{}

    func (r *UserRepository) Find(id UserId) (*User, error) {
    	// 中略
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    interface IUserRepository
    {
        public function find(UserId $id): ?User;
    }

    // 下位レベル（≒ 下位レイヤー）が抽象に依存する
    // 実装の詳細が抽象に依存する
    class UserRepository implements IUserRepository
    {
        public function find(UserId $id): ?User
        {
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

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository IUserRepository
    }

    func NewUserApplicationService() *UserApplicationService {
    	return &UserApplicationService{
    		// テスト時はインメモリ実装リポジトリを呼び出すようにハードコーディングしてしまう
    		userRepository: NewInMemoryUserRepository(),
    	}
    }

    // 中略
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      private readonly userRepository: IUserRepository;

      constructor() {
        // テスト時はインメモリ実装リポジトリを呼び出すようにハードコーディングしてしまう
        this.userRepository = new InMemoryUserRepository();
      }

      // 中略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;

        public function __construct()
        {
            // テスト時はインメモリ実装リポジトリを呼び出すようにハードコーディングしてしまう
            $this->userRepository = new InMemoryUserRepository();
        }

        // 中略
    }
    ```

次の例のように、実環境で動かすときに実装リポジトリを呼び出すように書き換えないといけない

リスト 7.6：プロダクション用のリポジトリに差し替える

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository IUserRepository
    }

    func NewUserApplicationService() *UserApplicationService {
    	return &UserApplicationService{
    		// 実環境では実装リポジトリを呼び出すように書き換えないといけない
    		userRepository: NewUserRepository(),
    	}
    }

    // 中略
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      private readonly userRepository: IUserRepository;

      constructor() {
        // 実環境では実装リポジトリを呼び出すように書き換えないといけない
        this.userRepository = new UserRepository();
      }

      // 中略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;

        public function __construct()
        {
            // 実環境では実装リポジトリを呼び出すように書き換えないといけない
            $this->userRepository = new UserRepository();
        }

        // 中略
    }
    ```

### 7.4.1 Service Locator パターン

インメモリ実装リポジトリと実装リポジトリをハードコーディングせずに差し替えたい。

そんなときは、ServiceLocator パターンが役立つ。

ServiceLocator パターンによって、オブジェクトの呼び出しを紐付け、動的に切り替える。

<details><summary>🚨補足（クリックで開く）</summary><div>

インメモリ実装リポジトリを使用せず、テスト時も実装リポジトリを使用して DB に接続する場合、Service Locator パターンはなくても大丈夫

</div></details>

リスト 7.7：ServiceLocator を適用する

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository IUserRepository
    }

    // コンストラクタの引数はない
    func NewUserApplicationService() *UserApplicationService {
    	return &UserApplicationService{
    		// IUserRepositoryを呼び出しているが、内部的にはServiceLocatorオブジェクトで登録したオブジェクトを呼び出している
    		userRepository: servicelocator.Resolve[IUserRepository]("IUserRepository"),
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;

        // コンストラクタの引数はない
        public function __construct()
        {
            // IUserRepositoryを呼び出しているが、内部的にはServiceLocatorオブジェクトで登録したオブジェクトを呼び出している
            $this->userRepository = ServiceLocator::resolve(IUserRepository::class);
        }
    }
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-07](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-07.png)

ServiceLocator パターンを実装した ServiceLocator オブジェクトには、呼び出しの紐づけを事前に登録しておく。

例えば、テスト時は IUserRepository を呼び出すと InMemoryUserRepository が返却されるように実装しておく。

リスト 7.8：事前にインスタンスを登録する

=== "Go"

    ```go title=".go"
    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    servicelocator.RegisterClass(
    	"IUserRepository",
    	NewInMemoryUserRepository,
    )
    ```

=== "TypeScript"

    ```typescript title=".ts"

    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    ServiceLocator.registerClass<IUserRepository>(
      IUserRepository,
      InMemoryUserRepository
    );

    ```

=== "PHP"

    ```injectablephp title=".php"
    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    ServiceLocator::registerClass(
        IUserRepository::class,
        InMemoryUserRepository::class
    );
    ```

また、実環境では IUserRepository を呼び出すと UserRepository が返却されるように実装しておく。

リスト 7.9：プロダクションに移行するためリポジトリを切り替える

=== "Go"

    ```go title=".go"
    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    servicelocator.RegisterClass("IUserRepository", NewUserRepository)
    ```

=== "TypeScript"

    ```typescript title=".ts"
    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    ServiceLocator.registerClass<IUserRepository>(IUserRepository, UserRepository);
    ```

=== "PHP"

    ```injectablephp title=".php"
    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    ServiceLocator::registerClass(IUserRepository::class, UserRepository::class);
    ```

これらの対応関係を実環境とテスト時で切り替えられるようにしておく。

![domain_driven_design_nyumon_bottom_up_chapter_07-08](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-08.png)

<details><summary>🚨補足（クリックで開く）</summary><div>

ServiceLocator オブジェクトには、呼び出しの紐づけを事前に登録しておく。

紐づけをキーバリューで定義しておき、（書籍では言及していないが）フラグで条件分岐させて切り替える。

=== "Go"

    ```go title=".go"
    package main

    import (
    	"os"

    	"app/domain"
    	"app/infrastructure"
    	"app/servicelocator"
    )

    type RepositoriesMap struct {
    	token          string
    	implementation any
    }

    var tokens = struct {
    	IUserRepository   string
    	ICircleRepository string
    	// 中略
    }{
    	IUserRepository:   "IUserRepository",
    	ICircleRepository: "ICircleRepository",
    	// 中略
    }

    func main() {
    	// 環境変数からフラグを取得する
    	inMemory := os.Getenv("IN_MEMORY") == "true"

    	var userRepository domain.IUserRepository = infrastructure.NewUserRepository()
    	var circleRepository domain.ICircleRepository = infrastructure.NewCircleRepository()

    	if inMemory {
    		userRepository = infrastructure.NewInMemoryUserRepository()
    		circleRepository = infrastructure.NewInMemoryCircleRepository()
    	}

    	repositoriesMap := []RepositoriesMap{
    		{
    			token:          tokens.IUserRepository,
    			implementation: userRepository,
    		},
    		{
    			token:          tokens.ICircleRepository,
    			implementation: circleRepository,
    		},
    		// 中略
    	}

    	// ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    	for _, repository := range repositoriesMap {
    		servicelocator.Register(repository.token, repository.implementation)
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    <?php

    use App\Domain\IUserRepository;
    use App\Domain\ICircleRepository;
    use App\Infrastructure\InMemoryUserRepository;
    use App\Infrastructure\UserRepository;
    use App\Infrastructure\InMemoryCircleRepository;
    use App\Infrastructure\CircleRepository;
    use App\ServiceLocator;

    final class RepositoriesMap
    {
        public function __construct(
            public readonly string $token,
            public readonly object $implementation,
        ) {
        }
    }

    $tokens = [
        "IUserRepository" => IUserRepository::class,
        "ICircleRepository" => ICircleRepository::class,
        // 中略
    ];

    // 環境変数からフラグを取得する
    $inMemory = getenv("IN_MEMORY") === "true";

    $repositoriesMap = [
        new RepositoriesMap(
            token: $tokens["IUserRepository"],
            implementation: $inMemory
                ? new InMemoryUserRepository()
                : new UserRepository(),
        ),
        new RepositoriesMap(
            token: $tokens["ICircleRepository"],
            implementation: $inMemory
                ? new InMemoryCircleRepository()
                : new CircleRepository(),
        ),
        // 中略
    ];

    // ServiceLocatorオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    foreach ($repositoriesMap as $repository) {
        ServiceLocator::register($repository->token, $repository->implementation);
    }
    ```

書籍では言及していないが、ServiceLocator オブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的な ServiceLocator オブジェクトは static 宣言を使用する。

=== "Go"

    ```go title=".go"
    package servicelocator

    var registry = map[string]any{}

    // インターフェースリポジトリと実装リポジトリの対応関係を登録する
    func Register(token string, implementation any) {
    	registry[token] = implementation
    }

    // 登録済みの実装リポジトリのインスタンスを返却する
    // インスタンスは事前に作成されている
    func Resolve[T any](token string) T {
    	return registry[token].(T)
    }

    func Clear() {
    	registry = map[string]any{}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class ServiceLocator
    {
        private static array $registry = [];

        // インターフェースリポジトリと実装リポジトリの対応関係を登録する
        public static function register(string $token, object $implementation): void
        {
            self::$registry[$token] = $implementation;
        }

        // 登録済みの実装リポジトリのインスタンスを返却する
        // インスタンスは事前に作成されている
        public static function resolve(string $token): object
        {
            return self::$registry[$token];
        }

        public static function clear(): void
        {
            self::$registry = [];
        }
    }
    ```

</div></details>

ServiceLocator オブジェクトのデメリットとして、依存関係がオブジェクトの外からはわからない。

UserApplicationService を外から見ても、UserRepository に依存することはわからない。

リスト 7.11：リスト 7.10 のコンストラクタ

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository IUserRepository
    }

    func NewUserApplicationService() *UserApplicationService {
    	return &UserApplicationService{
    		userRepository: servicelocator.Resolve[IUserRepository]("IUserRepository"),
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    export class UserApplicationService {
      private readonly userRepository: IUserRepository;

      constructor() {
        this.userRepository =
          ServiceLocator.resolve<IUserRepository>(IUserRepository);
      }
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;

        public function __construct()
        {
            $this->userRepository = ServiceLocator::resolve(IUserRepository::class);
        }
    }
    ```

<details><summary>🚨補足（クリックで開く）</summary><div>

ServiceLocator では static 宣言であるため、アプリ起動時にインスタンスを ServiceLocator 内で作る。

UserApplicationService のなかでは、依存先の UserRepository がすでに準備されてしまっている

=== "Go"

    ```go title=".go"
    package main

    import "app/application"

    func main() {
    	// UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    	userApplicationService := application.NewUserApplicationService()

    	userApplicationService.FindById(1)
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    import {UserApplicationService} from "./userApplicationService";

    // UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    const userApplicationService = new UserApplicationService();

    userApplicationService.findById(1);
    ```

=== "PHP"

    ```injectablephp title=".php"
    use App\Application\UserApplicationService;

    // UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    $userApplicationService = new UserApplicationService();

    $userApplicationService->findById(1);
    ```

</div></details>

また、ServiceLocator は呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならず、テストなどで実行しないとエラーにならない

リスト 7.13：UserApplicationService に変化が起きた

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository IUserRepository
    	fooRepository  IFooRepository
    }

    func NewUserApplicationService() *UserApplicationService {
    	return &UserApplicationService{
    		userRepository: servicelocator.Resolve[IUserRepository]("IUserRepository"),
    		// repositoriesMapに対応関係をまだ登録していないが、ビルドの段階ではエラーにならない
    		fooRepository: servicelocator.Resolve[IFooRepository]("IFooRepository"),
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;
        private readonly IFooRepository $fooRepository;

        public function __construct()
        {
            $this->userRepository = ServiceLocator::resolve(IUserRepository::class);
            // repositoriesMapに対応関係をまだ登録していないが、ビルドの段階ではエラーにならない
            $this->fooRepository = ServiceLocator::resolve(IFooRepository::class);
        }
    }
    ```

### 7.4.2 IoC コンテナパターン

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

=== "Go"

    ```go title=".go"
    userRepository := NewInMemoryUserRepository()
    userApplicationService := NewUserApplicationService(userRepository)
    ```

=== "TypeScript"

    ```typescript title=".ts"
    const userRepository = new InMemoryUserRepository();
    const userApplicationService = new UserApplicationService(userRepository);
    ```

=== "PHP"

    ```injectablephp title=".php"
    $userRepository = new InMemoryUserRepository();
    $userApplicationService = new UserApplicationService($userRepository);
    ```

コンストラクタを使用して依存させているため、コンストラクタインジェクションという。

リスト 7.15：新たな依存関係を追加する

=== "Go"

    ```go title=".go"
    type UserApplicationService struct {
    	userRepository   IUserRepository
    	circleRepository ICircleRepository
    }

    // コンストラクタを使用して依存させている
    func NewUserApplicationService(
    	userRepository IUserRepository,
    	circleRepository ICircleRepository,
    ) *UserApplicationService {
    	return &UserApplicationService{
    		userRepository:   userRepository,
    		circleRepository: circleRepository,
    	}
    }

    // set(...) の実装は省略
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

      // set(...) の実装は省略
    }
    ```

=== "PHP"

    ```injectablephp title=".php"
    class UserApplicationService
    {
        private readonly IUserRepository $userRepository;
        private readonly ICircleRepository $circleRepository;

        // コンストラクタを使用して依存させている
        public function __construct(
            IUserRepository $userRepository,
            ICircleRepository $circleRepository
        ) {
            $this->userRepository = $userRepository;
            $this->circleRepository = $circleRepository;
        }

        // set(...) の実装は省略
    }
    ```

他にも

- コンストラクタインジェクション：constructor(…)
- セッターインジェクション：set 〇〇(…)
- メソッドインジェクション：foo(…)

次に、IoC コンテナパターンを実装した IoC コンテナオブジェクトを説明する。

IoC コンテナオブジェクトは、オブジェクトを指定すると、依存関係をよしなに解決したうえでインスタンスを返却してくれる。

IoC コンテナオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

ServiceLocator オブジェクトでは、オブジェクトの呼び出しを動的に切り替える。

そのため、ビルドの段階ではエラーにならない。

一方で、IoC コンテナオブジェクトでは UserApplicationService のコンストラクタに IUserRepository を渡すように実装しないといけない。

そのため、ビルド時はエラーになってくれる。

リスト 7.17：IoC コンテナを利用して依存関係を解決させる

=== "Go"

    ```go title=".go"
    // IoCコンテナオブジェクト
    serviceCollection := NewServiceCollection()

    // IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    serviceCollection.AddTransient((*IUserRepository)(nil), NewInMemoryUserRepository)
    // UserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しておかないと、ここでエラーになる
    serviceCollection.AddTransient((*UserApplicationService)(nil), NewUserApplicationService)

    // IoCコンテナオブジェクトからuserApplicationServiceを取得する
    provider := serviceCollection.BuildServiceProvider()
    userApplicationService := provider.GetService((*UserApplicationService)(nil)).(*UserApplicationService)
    ```

=== "TypeScript"

    ```typescript title=".ts"
    // IoCコンテナオブジェクト
    const serviceCollection = new ServiceCollection();

    // IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    serviceCollection.addTransient<IUserRepository, InMemoryUserRepository();
    // UserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しておかないと、ここでエラーになる
    serviceCollection.addTransient<UserApplicationService>();

    // IoCコンテナオブジェクトからuserApplicationServiceを取得する
    const provider = serviceCollection.buildServiceProvider();
    const userApplicationService = provider.getService<UserApplicationService>();
    ```

=== "PHP"

    ```injectablephp title=".php"
    // IoCコンテナオブジェクト
    $serviceCollection = new ServiceCollection();

    // IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    $serviceCollection->addTransient(IUserRepository::class, InMemoryUserRepository::class);
    // UserApplicationServiceのコンストラクタにIUserRepositoryを渡すように実装しておかないと、ここでエラーになる
    $serviceCollection->addTransient(UserApplicationService::class);

    // IoCコンテナオブジェクトからuserApplicationServiceを取得する
    $provider = $serviceCollection->buildServiceProvider();
    $userApplicationService = $provider->getService(UserApplicationService::class);
    ```

![domain_driven_design_nyumon_bottom_up_chapter_07-09](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_07-09.png)

<details><summary>🚨補足（クリックで開く）</summary><div>

=== "Go"

    ```go title=".go"
    package main

    import (
    	"os"

    	"app/infrastructure"
    	"app/iocontainer"
    )

    type RepositoriesMap struct {
    	token          string
    	implementation iocontainer.Constructor
    }

    var tokens = struct {
    	IUserRepository   string
    	ICircleRepository string
    	// 中略
    }{
    	IUserRepository:   "IUserRepository",
    	ICircleRepository: "ICircleRepository",
    	// 中略
    }

    func main() {
    	// 環境変数からフラグを取得する
    	inMemory := os.Getenv("IN_MEMORY") == "true"

    	userRepository := iocontainer.Constructor(func() any { return infrastructure.NewUserRepository() })
    	circleRepository := iocontainer.Constructor(func() any { return infrastructure.NewCircleRepository() })

    	if inMemory {
    		userRepository = func() any { return infrastructure.NewInMemoryUserRepository() }
    		circleRepository = func() any { return infrastructure.NewInMemoryCircleRepository() }
    	}

    	repositoriesMap := []RepositoriesMap{
    		{
    			token:          tokens.IUserRepository,
    			implementation: userRepository,
    		},
    		{
    			token:          tokens.ICircleRepository,
    			implementation: circleRepository,
    		},
    		// 中略
    	}

    	// IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    	iocContainer := iocontainer.NewIocContainer()
    	for _, repository := range repositoriesMap {
    		iocContainer.Register(repository.token, repository.implementation)
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    <?php

    use App\Domain\IUserRepository;
    use App\Domain\ICircleRepository;
    use App\Infrastructure\InMemoryUserRepository;
    use App\Infrastructure\UserRepository;
    use App\Infrastructure\InMemoryCircleRepository;
    use App\Infrastructure\CircleRepository;
    use App\IocContainer;

    final class RepositoriesMap
    {
        public function __construct(
            public readonly string $token,
            public readonly string $implementation,
        ) {
        }
    }

    $tokens = [
        "IUserRepository" => IUserRepository::class,
        "ICircleRepository" => ICircleRepository::class,
        // 中略
    ];

    // 環境変数からフラグを取得する
    $inMemory = getenv("IN_MEMORY") === "true";

    $repositoriesMap = [
        new RepositoriesMap(
            token: $tokens["IUserRepository"],
            implementation: $inMemory ? InMemoryUserRepository::class : UserRepository::class,
        ),
        new RepositoriesMap(
            token: $tokens["ICircleRepository"],
            implementation: $inMemory ? InMemoryCircleRepository::class : CircleRepository::class,
        ),
        // 中略
    ];

    // IoCコンテナオブジェクトにインターフェースリポジトリと実装リポジトリの対応関係を登録する
    $iocContainer = new IocContainer();
    foreach ($repositoriesMap as $repository) {
        $iocContainer->register($repository->token, $repository->implementation);
    }
    ```

書籍では言及していないが、IoC コンテナオブジェクトは自前で実装したり、フレームワークに備わっていればそれを使用する。

典型的な IoC コンテナオブジェクトは ServiceLocator とは違い static 宣言を使用しない。

そのため、IoC Container では実行したタイミングでインスタンスを作る。

=== "Go"

    ```go title=".go"
    package iocontainer

    // IoCコンテナ
    type Constructor func() any

    type IocContainer struct {
    	registry map[string]Constructor
    }

    func NewIocContainer() *IocContainer {
    	return &IocContainer{
    		registry: map[string]Constructor{},
    	}
    }

    // インターフェースリポジトリと実装リポジトリの対応関係を登録する
    func (c *IocContainer) Register(token string, implementation Constructor) {
    	c.registry[token] = implementation
    }

    // 登録済みの実装リポジトリのインスタンスを返却する
    // インスタンスは事前に作成したものではなく、新しく作成される
    func Resolve[T any](c *IocContainer, token string) T {
    	implementation := c.registry[token]
    	return implementation().(T)
    }

    func (c *IocContainer) Clear() {
    	c.registry = map[string]Constructor{}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
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

=== "PHP"

    ```injectablephp title=".php"
    // IoCコンテナ
    class IocContainer
    {
        /** @var array<string, class-string> */
        private array $registry = [];

        // インターフェースリポジトリと実装リポジトリの対応関係を登録する
        public function register(string $token, string $implementation): void
        {
            $this->registry[$token] = $implementation;
        }

        // 登録済みの実装リポジトリのインスタンスを返却する
        // インスタンスは事前に作成したものではなく、新しく作成される
        public function resolve(string $token): object
        {
            $implementation = $this->registry[$token];
            return new $implementation();
        }

        public function clear(): void
        {
            $this->registry = [];
        }
    }
    ```

IoC コンテナオブジェクトでインスタンスを作成し、これをコンストラクタに渡す。

=== "Go"

    ```go title=".go"
    // IoC Containerとコンストラクタインジェクションの場合

    package main

    import (
    	"app/application"
    	"app/domain"
    	"app/iocontainer"
    	"app/repositories"
    )

    func main() {
    	// IoCコンテナからuserRepositoryインスタンスを取得する
    	userRepository := iocontainer.Resolve[domain.IUserRepository](repositories.Container, iocontainer.Tokens.IUserRepository)

    	// コンストラクタに注入する
    	// 引数にリポジトリや他の依存する新しいリポジトリを渡さないとビルド段階でエラーになる
    	userApplicationService := application.NewUserApplicationService(userRepository /* 他の依存するリポジトリは省略 */)

    	userApplicationService.FindById("1")
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    // IoC Containerとコンストラクタインジェクションの場合

    import { container } from "./repositories";
    import { tokens } from "./iocContainer";
    import type { IUserRepository } from "./domain/IUserRepository";
    import { UserApplicationService } from "./userApplicationService";

    // IoCコンテナからuserRepositoryインスタンスを取得する
    const userRepository = container.resolve<IUserRepository>(tokens.IUserRepository);

    // コンストラクタに注入する
    // 引数にリポジトリや他の依存する新しいリポジトリを渡さないとビルド段階でエラーになる
    const userApplicationService = new UserApplicationService(userRepository /* 他の依存するリポジトリは省略 */);

    userApplicationService.findById("1");
    ```

=== "PHP"

    ```injectablephp title=".php"
    // IoC Containerとコンストラクタインジェクションの場合

    use App\Application\UserApplicationService;
    use App\Domain\IUserRepository;

    require_once __DIR__ . "/repositories.php";

    // IoCコンテナからuserRepositoryインスタンスを取得する
    /** @var IUserRepository $userRepository */
    $userRepository = $container->resolve($tokens["IUserRepository"]);

    // コンストラクタに注入する
    // 引数にリポジトリや他の依存する新しいリポジトリを渡さないとビルド段階でエラーになる
    $userApplicationService = new UserApplicationService($userRepository /* 他の依存するリポジトリは省略 */);

    $userApplicationService->findById("1");
    ```

ServiceLocator オブジェクトでは static 宣言であるため、アプリ起動時にインスタンスを ServiceLocator オブジェクト内で作る。

ServiceLocator オブジェクトからインスタンスを取り出せないため、コンストラクタにインスタンスを渡せない。

また前述の通り、ServiceLocator オブジェクトはオブジェクトの呼び出しを動的に切り替えるため、ビルドの段階ではエラーにならない

=== "Go"

    ```go title=".go"
    // ServiceLocatorオブジェクトの場合

    package main

    import "app/application"

    func main() {
    	// UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    	// UserApplicationServiceにIUserRepositoryを渡し忘れても、ビルド段階ではエラーにならない
    	userApplicationService := application.NewUserApplicationService()

    	userApplicationService.FindById(1)
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    // ServiceLocatorオブジェクトの場合

    import {UserApplicationService} from "./userApplicationService";

    // UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    // UserApplicationServiceにIUserRepositoryを渡し忘れても、ビルド段階ではエラーにならない
    const userApplicationService = new UserApplicationService();

    userApplicationService.findById(1);
    ```

=== "PHP"

    ```injectablephp title=".php"
    // ServiceLocatorオブジェクトの場合

    use App\Application\UserApplicationService;

    // UserApplicationServiceを外から見ても、UserRepositoryに依存することはわからない。
    // UserApplicationServiceにIUserRepositoryを渡し忘れても、ビルド段階ではエラーにならない
    $userApplicationService = new UserApplicationService();

    $userApplicationService->findById(1);
    ```

</div></details>

## 7.5 まとめ

依存関係の取り扱いを間違えると、硬直したソフトウェアになってしまう。

依存自体は避けられないが、我々で制御できる。

ビジネスロジックを中核として、依存の方向性をちゃんと制御しよう。
