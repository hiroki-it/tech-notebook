---
title: 【IT技術の知見】９章＠ドメイン駆動設計入門ボトムアップ
description: ９章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ９章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter9 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter9)

<br>

## 9.1 ファクトリーとは

- ドメインオブジェクトに渡す複雑な引数の作成処理をコンストラクタから切り分ける

<br>

## 9.2 ファクトリーの実装方法（関数型）

### ドメイン層

#### ▼ UserName

=== "Go"

    ```go title=".go"
    type UserName struct {
    	Value string
    }

    func createUserName(value string) (UserName, error) {
    	if strings.TrimSpace(value) == "" {
    		return UserName{}, errors.New("UserName cannot be empty")
    	}
    	return UserName{Value: value}, nil
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    type UserName = {
      value: string;
    };

    const createUserName = (value: string): UserName => {
      if (!value || value.trim().length === 0) {
        throw new Error("UserName cannot be empty");
      }
      return {value};
    };
    ```

=== "PHP"

    ```injectablephp title=".php"
    final readonly class UserName
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    function createUserName(string $value): UserName
    {
        if (trim($value) === "") {
            throw new InvalidArgumentException("UserName cannot be empty");
        }
        return new UserName(value: $value);
    }
    ```

#### ▼ UserId

=== "Go"

    ```go title=".go"
    type UserId string

    type User struct {
    	Id   UserId
    	Name UserName
    }

    func createUser(id UserId, name UserName) User {
    	return User{
    		Id:   id,
    		Name: name,
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    type UserId = string;

    type User = {
      id: UserId;
      name: UserName;
    };

    const createUser = (id: UserId, name: UserName): User => ({
      id,
      name,
    });
    ```

=== "PHP"

    ```injectablephp title=".php"
    final readonly class UserId
    {
        public function __construct(
            public string $value,
        ) {
        }
    }

    final readonly class User
    {
        public function __construct(
            public UserId $id,
            public UserName $name,
        ) {
        }
    }

    function createUser(UserId $id, UserName $name): User
    {
        return new User(
            id: $id,
            name: $name,
        );
    }
    ```

<br>

### ユーザーインターフェース層

#### ▼ UserFactory

=== "Go"

    ```go title=".go"
    import "github.com/google/uuid"

    type UserFactory interface {
    	CreateUserWithId(name UserName) (User, error)
    }

    type userFactory struct{}

    func createUserFactory() UserFactory {
    	return &userFactory{}
    }

    func (f *userFactory) CreateUserWithId(name UserName) (User, error) {
    	nextId, err := generateId()
    	if err != nil {
    		return User{}, err
    	}
    	return createUser(UserId(nextId), name), nil
    }

    // 採番処理
    func generateId() (string, error) {
    	id, err := uuid.NewRandom()
    	if err != nil {
    		return "", err
    	}
    	return id.String(), nil
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    import {v4 as uuidv4} from "uuid";

    type UserFactory = {
      createUserWithId: (name: UserName) => Promise<User>;
    };

    const createUserFactory = (): UserFactory => {
      return {
        createUserWithId: async (name: UserName): Promise<User> => {
          const nextId = await generateId();
          return createUser(nextId, name);
        },
      };
    };

    // 採番処理
    const generateId = async (): Promise<string> => {
      return uuidv4();
    };
    ```

=== "PHP"

    ```injectablephp title=".php"
    use Ramsey\Uuid\Uuid;

    interface UserFactory
    {
        public function createUserWithId(UserName $name): User;
    }

    function createUserFactory(): UserFactory
    {
        return new class () implements UserFactory {
            public function createUserWithId(UserName $name): User
            {
                $nextId = generateId();
                return createUser(new UserId($nextId), $name);
            }
        };
    }

    // 採番処理
    function generateId(): string
    {
        return Uuid::uuid4()->toString();
    }
    ```

#### ▼ UserApplicationService

=== "Go"

    ```go title=".go"
    type UserApplicationService interface {
    	RegisterUser(userName string) (User, error)
    }

    type userApplicationService struct {
    	factory UserFactory
    }

    func createUserApplicationService(
    	factory UserFactory,
    ) UserApplicationService {
    	return &userApplicationService{
    		factory: factory,
    	}
    }

    func (s *userApplicationService) RegisterUser(userName string) (User, error) {
    	name, err := createUserName(userName)
    	if err != nil {
    		return User{}, err
    	}
    	user, err := s.factory.CreateUserWithId(name)
    	if err != nil {
    		return User{}, err
    	}
    	return user, nil
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    type UserApplicationService = {
      registerUser: (userName: string) => Promise<User>;
    };

    const createUserApplicationService = (
      factory: UserFactory,
    ): UserApplicationService => {
      return {
        registerUser: async (userName: string): Promise<User> => {
          const name = createUserName(userName);
          const user = await factory.createUserWithId(name);
          return user;
        },
      };
    };
    ```

=== "PHP"

    ```injectablephp title=".php"
    interface UserApplicationService
    {
        public function registerUser(string $userName): User;
    }

    function createUserApplicationService(
        UserFactory $factory,
    ): UserApplicationService {
        return new class ($factory) implements UserApplicationService {
            public function __construct(
                private readonly UserFactory $factory,
            ) {
            }

            public function registerUser(string $userName): User
            {
                $name = createUserName($userName);
                $user = $this->factory->createUserWithId($name);
                return $user;
            }
        };
    }
    ```

<br>

## 9.3 採番処理をどこに実装するか

### ファクトリ

今回の例に相当する。

<br>

### リポジトリ

採番処理を採番テーブルを使用して実装する場合、データベースに関する処理になるため、リポジトリに実装できる。

=== "Go"

    ```go title=".go"
    type UserRepository interface {
    	NextIdentity() (UserId, error)
    	Save(user User) error
    }

    type userRepositoryImpl struct{}

    var userRepository UserRepository = &userRepositoryImpl{}

    func (r *userRepositoryImpl) NextIdentity() (UserId, error) {
    	// 採番テーブルが生成したIDを取得する
    	var id int64
    	if err := pool.QueryRow("SELECT nextval('user_seq') AS id").Scan(&id); err != nil {
    		return "", err
    	}
    	return UserId(strconv.FormatInt(id, 10)), nil
    }

    func (r *userRepositoryImpl) Save(user User) error {
    	ctx := context.Background()
    	conn, err := pool.Conn(ctx)
    	if err != nil {
    		return err
    	}
    	defer conn.Close()

    	_, err = conn.ExecContext(
    		ctx,
    		"INSERT INTO users(id, name) VALUES (?, ?)",
    		user.Id, user.Name.Value,
    	)
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    type UserRepository = {
      nextIdentity: () => Promise<UserId>;
      save: (user: User) => Promise<void>;
    };

    const userRepository: UserRepository = {

      nextIdentity: async () => {
        // 採番テーブルが生成したIDを取得する
        const result = await pool.query("SELECT nextval('user_seq') AS id");
        return result.rows[0].id.toString();
      },

      save: async (user: User) => {
        const conn = await pool.getConnection();
        try {
          await conn.execute(
            "INSERT INTO users(id, name) VALUES (?, ?)",
            [user.id, user.name.value]
          );
        } finally {
          conn.release();
        }
      },
    };
    ```

=== "PHP"

    ```injectablephp title=".php"
    interface UserRepository
    {
        public function nextIdentity(): UserId;

        public function save(User $user): void;
    }

    $userRepository = new class ($pool) implements UserRepository {
        public function __construct(
            private readonly PDO $pool,
        ) {
        }

        public function nextIdentity(): UserId
        {
            // 採番テーブルが生成したIDを取得する
            $result = $this->pool->query("SELECT nextval('user_seq') AS id");
            return new UserId((string) $result->fetch(PDO::FETCH_ASSOC)["id"]);
        }

        public function save(User $user): void
        {
            $statement = $this->pool->prepare(
                "INSERT INTO users(id, name) VALUES (?, ?)"
            );
            $statement->execute([$user->id->value, $user->name->value]);
        }
    };
    ```

===! "Go"

    ```go title=".go"
    import (
    	"database/sql"
    	"os"

    	"github.com/go-sql-driver/mysql"
    )

    var pool *sql.DB

    func init() {
    	config := mysql.NewConfig()
    	config.Net = "tcp"
    	config.Addr = os.Getenv("DB_HOST")
    	config.User = os.Getenv("DB_USER")
    	config.Passwd = os.Getenv("DB_PASS")
    	config.DBName = os.Getenv("DB_NAME")

    	var err error
    	pool, err = sql.Open("mysql", config.FormatDSN())
    	if err != nil {
    		panic(err)
    	}
    }
    ```

=== "TypeScript"

    ```typescript title=".ts"
    import mysql from "mysql2/promise";
    import {v4 as uuidv4} from "uuid";

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    ```

=== "PHP"

    ```injectablephp title=".php"
    $pool = new PDO(
        sprintf("mysql:host=%s;dbname=%s", getenv("DB_HOST"), getenv("DB_NAME")),
        getenv("DB_USER"),
        getenv("DB_PASS"),
    );
    ```

<br>

### エンティティのコンストラクタ

採番処理を UUID の生成で実装する場合、データベースに依存しないため、エンティティのコンストラクタに実装できる。

<br>
