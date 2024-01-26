---
title: 【IT技術の知見】パッケージ@Go
---

# パッケージ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## ビルトインパッケージ

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_go_logic_method_data.html

<br>

## 外部パッケージの管理

### コマンド

#### ▼ `go mod tidy`

インポートされているパッケージに合わせて、`go.mod`ファイルと`go.sum`ファイルを更新する。

```bash
$ go mod tidy
```

もし`go.sum`ファイルがあるのにも関わらず、以下のようなエラーが出る時は、`go mod tidy`コマンドを実行して`go.sum`ファイルを更新する必要がある。

```bash
cmd/main.go:4:5: missing go.sum entry for module providing package github.com/foo/foo-package (imported by github.com/hiroki-it/bar/cmd); to add:
        go get github.com/hiroki-hasegawa/bar/cmd
```

<br>

### go.modファイル

#### ▼ `go.mod`ファイルとは

PHPにおける`composer.json`ファイルに相当する。

インターネット上における自身のパッケージ名とGoバージョンを定義するために、全てのGoアプリケーションで必ず必要である。

基本的には、パッケージのURLやディレクトリ構成と同じにする。

```go
module github.com/hiroki-hasegawa/foo-repository

go 1.16
```

#### ▼ インターネットからインポート

パッケージ名とバージョンタグを使用して、インターネットからパッケージをインポートする。

`go mod tidy`コマンドによって`indirect`コメントのついたパッケージが実装される。

これは、使用しているパッケージではなく、インポートしているパッケージが依存しているパッケージである。

注意点として、パッケージ名は、使用したいパッケージの`go.mod`ファイルを参照すること。

> - https://github.com/golang/go/wiki/Modules#should-i-commit-my-gosum-file-as-well-as-my-gomod-file

```go
module github.com/hiroki-hasegawa/repository

go 1.16

require (
    <パッケージ名> <バージョンタグ>
    github.com/foo v1.3.0
    github.com/bar v1.0.0
    github.com/baz // indirect
)
```

```go
import "github.com/bar"

func main() {
    // 何らかの処理
}
```

#### ▼ ローカルマシンからインポート

ローカルマシンのみで使用する独自共有パッケージは、インターネット上での自身のリポジトリからインポートせずに、`replace`関数を使用してインポートする必要がある。

独自共有の全パッケージでパッケージ名を置換する必要はなく、プロジェクトのルートパスについてのみ定義すれば良い。

パス実際、`unknown revision`のエラーで、バージョンを見つけられない。

> - https://qiita.com/hnishi/items/a9217249d7832ed2c035

```go
module foo.com/hiroki-it/repository

go 1.16

replace github.com/hiroki-hasegawa/foo-repository => /
```

また、ルートディレクトリのみでなく、各パッケージにも`go.mod`ファイルを配置する必要がある。

```yaml
repository/
├── cmd/
│   └── hello.go
│
├── go.mod
├── go.sum
└── local-pkg/
    ├── go.mod # 各パッケージにgo.modを配置する。
    └── module.go
```

```go
module foo.com/hiroki-it/foo-repository/local-pkg

go 1.16
```

これらにより、ローカルマシンのパッケージをインポートできるようになる。

```go
import "local.packages/local-pkg"

func main() {
    // 何らかの処理
}
```

<br>

### go.sumファイル

#### ▼ `go.sum`ファイルとは

PHPにおける`composer.lock`ファイルに相当する。

`go.mod`ファイルによって実際にインストールされたパッケージが自動的に実装される。

パッケージごとのチェックサムが記録されるため、前回のインストール時と比較して、パッケージに変更があるか否かを検知できる。

<br>

## aws-sdk-go-v2

### aws-sdk-go-v2とは

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2?tab=versions

<br>

### awsとは

汎用的な関数が同梱されている。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws?tab=versions

ポインタ型からstring型に変換する`ToString`関数や、反対にstring型からポインタ型に変換する`String`関数をよく使用する。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#String
> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#ToString

#### ▼ serviceパッケージ

記入中...

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/amplify?tab=versions

<br>

## aws-lambda-go

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_lambda_function.html

<br>

## go-chi

ミドルウェア処理 (特にルーティング) のパッケージである。

```go
package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})

	http.ListenAndServe(":3000", r)
}
```

> - https://github.com/go-chi/chi

<br>

## go-grpc-middleware

gRPCに関するミドルウェア処理 (例：認証、ロギング、メトリクス、分散トレーシング、など) を持つ。

なお、gRPCはリモートプロシージャーコールであるため、ミドルウェア処理にルーティングは含まれない。

`v1`系と`v2`系があり、関数の引数の設定方法が異なる。

これを`Chain`関数に渡せば、gRPCで様々なインターセプター処理を簡単に実行できる。

> - https://github.com/grpc-ecosystem/go-grpc-middleware/tree/main#interceptors
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/server/main.go#L136-L152

<br>

## gorm

### gormとは

Go製のORMである。

その他のORMについては、以下のリポジトリが参考になる。

執筆時点 (2022/01/31) では、GormとBeegoが接戦している。

> - https://github.com/d-tsuji/awesome-go-orms

<br>

### DBとの接続

#### ▼ MySQLの場合

> - https://gorm.io/docs/connecting_to_the_database.html#MySQL

```go
func NewDB() (*gorm.DB, error) {

    // 接続情報。sprintfメソッドを使用すると、可読性が高い。
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_DATABASE"),
	)

    // DBに接続します。
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	return db, nil
}

func Close(db *gorm.DB) error {

	sqlDb, err := db.DB()

	if err != nil {
		return err
	}

    // DBとの接続を切断します。
	err = sqlDb.Close()

	if err != nil {
		return err
	}

	return nil
}
```

<br>

### Gormモデル

#### ▼ Gormモデル埋め込み

構造体にGormモデルを埋め込むと、IDやタイムスタンプレコードがフィールドとして追加される。

構造体をマッピングしたテーブルに、`id`カラム、`created_at`カラム、`updated_at`カラム、`deleted_at`カラムが追加される。

> - https://gorm.io/docs/models.html#embedded_struct

```go
type User struct {
	gorm.Model
	Name string
}

// 以下と同じ
type User struct {
	ID        uint `gorm:"primaryKey"`
    Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeleteAt `gorm:"index"`
}
```

#### ▼ プライマリーキー

『ID』という名前のフィールドを認識して、これをプライマリーキーとしてデータをマッピングする。もし、他の名前のフィールドをIDとして使用したい場合は、`gorm:"primaryKey"`タグをつける。

```go
type User struct {
	ID   string // プライマリーキーとして使用される。
	Name string
}
```

```go
type User struct {
	UserID string `gorm:"primaryKey"` // プライマリーキーとして使用される。
	Name   string
}
```

> - https://gorm.io/docs/conventions.html#ID-as-Primary-Key

#### ▼ SoftDelete

構造体が、`gorm.DeleteAt`をデータ型とするフィールドを持っていると、その構造体を使用した`DELETE`処理では論理削除が実行される。

Gormモデルを埋め込むことによりこのフィールドを持たせるか、または独自定義することにより、SoftDeleteを有効化できる。

```go
type User struct {
	ID      int
	Deleted gorm.DeletedAt
	Name    string
}
```

```go
user := User{Id: 111}

// UPDATE users SET deleted_at="2013-10-29 10:23" WHERE id = 111;
db.Delete(&user)

// UPDATE users SET deleted_at="2013-10-29 10:23" WHERE age = 20;
db.Where("age = ?", 20).Delete(&User{})

// SELECT * FROM users WHERE age = 20 AND deleted_at IS NULL;
db.Where("age = 20").Find(&user)
```

> - https://gorm.io/docs/delete.html#Soft-Delete

<br>

### DBマイグレーション

#### ▼ `TableName`メソッド

デフォルトではGormモデルの名前をスネークケースに変更し、加えて複数形とした名前のテーブルが作成される。

`TableName`メソッドにより、ユーザー定義のテーブル名をつけられる。

```go
// テーブル名はデフォルトでは『users』になる。
type User struct {
	ID      int
	Deleted gorm.DeletedAt
	Name    string
}

// テーブル名を『foo』になる。
func (User) TableName() string {
	return "foo"
}
```

> - https://gorm.io/docs/conventions.html#TableName

<br>

### Create

Gormモデルのフィールドに設定された値を元に、カラムを作成する。

作成したカラムのプライマリーキーを、構造体から取得できる。

```go
user := User{Name: "Jinzhu", Age: 18, Birthday: time.Now()}

result := db.Create(&user) // pass pointer of data to Create

user.ID             // returns inserted data's primary key
result.Error        // returns error
result.RowsAffected // returns inserted records count
```

> - https://gorm.io/docs/create.html#Create-Record

<br>

### Read

#### ▼ 全カラム取得

```go
user := User{}

// Get all records
result := db.Find(&users)
// SELECT * FROM users;

result.RowsAffected // returns found records count, equals `len(users)`
result.Error        // returns error
```

> - https://gorm.io/docs/query.html#Retrieving-all-objects

#### ▼ 単一/複数カラム取得

Gormモデルとプライマリーキーを指定して、プライマリーキーのモデルに紐付けられたカラムを取得する。

```go
user := User{}

db.First(&user, 10)
// SELECT * FROM users WHERE id = 10;

db.First(&user, "10")
// SELECT * FROM users WHERE id = 10;

db.Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

> - https://gorm.io/docs/query.html#Retrieving-objects-with-primary-key

<br>

### Update

#### ▼ 単一カラム更新 (暗黙的)

フィールドとは無関係に、渡された値を元にUPDATE分を実行する。

> - https://gorm.io/docs/update.html#Update-single-column

```go
// Update with conditions
db.Model(&User{}).Where("active = ?", true).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE active=true;

user := User{Id:111}

// User's ID is `111`:
db.Model(&user).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111;

// Update with conditions and model value
db.Model(&user).Where("active = ?", true).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111 AND active=true;
```

#### ▼ 複数カラム更新 (暗黙的)

Gormモデルのフィールドを暗黙的に指定して、複数のカラム値を更新する。

または、フィールドとは無関係に、マップデータを元にUPDATE文を実行する。

Gormモデルを使用した場合、フィールド値がゼロ値であると、これに紐付けられたカラム値の更新はスキップされてしまう。

> - https://gorm.io/docs/update.html#Updates-multiple-columns

```go
user := User{Id:111}

// Update attributes with `struct`, will only update non-zero fields
db.Model(&user).Updates(User{Name: "hello", Age: 18, Active: "false"})
// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;

// Update attributes with `map`
db.Model(&user).Updates(map[string]interface{}{"name": "hello", "age": 18, "active": "false"})
// UPDATE users SET name='hello', age=18, active=false, updated_at='2013-11-17 21:34:10' WHERE id=111;
```

#### ▼ 複数カラム更新 (明示的)

Gormモデルのフィールドを明示的に指定して、複数のカラム値を更新する。

フィールド値がゼロ値であっても、スキップされない。

> - https://gorm.io/docs/update.html#Update-Selected-Fields

```go
user := User{Id:111}

// Select with Struct (select zero value fields)
db.Model(&user).Select("Name", "Age").Updates(User{Name: "new_name", Age: 0})
// UPDATE users SET name='new_name', age=0 WHERE id=111;

// Select all fields (select all fields include zero value fields)
db.Model(&user).Select("*").Updates(User{Name: "jinzhu", Role: "admin", Age: 0})
// UPDATE users SET name='new_name', age=0 WHERE id=111;
```

#### ▼ 全カラム更新

Gormモデルのフィールドを暗黙的に全て指定して、全てのカラム値を強制的に更新する。

> - https://gorm.io/docs/update.html#Save-All-Fields

```go
user := User{Id:111}

db.First(&user)

user.Name = "jinzhu 2"
user.Age = 100
db.Save(&user)
// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111;
```

<br>

## testify

### testifyとは

モック、スタブ、アサーションメソッドを提供するパッケージ。

Goではオブジェクトの概念がないため、モックオブジェクトとは言わない。

<br>

### mock、assert

#### ▼ モック化

| よく使用するメソッド | 説明                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| なし                 | データとして、構造体に`Mock`を設定すれば、その構造体はモック化される。 |

**＊実装例＊**

AWSクライアントをモック化する。

```go
package amplify

import (
	"github.com/stretchr/testify/mock"
)

/**
 * AWSクライアントをモック化します。


 */
type MockedAwsClient struct {
	mock.Mock
}
```

#### ▼ スタブ化

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions

| よく使用するメソッド      | 説明                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Mock.Called`メソッド     | 関数の一部の処理をスタブ化する時に使用する。関数に値が渡されたことをモックに伝える。                                         |
| `Arguments.Get`メソッド   | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。ユーザー定義のデータ型を返却する処理を定義する。 |
| `Arguments.Error`メソッド | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。エラーを返却する処理を定義する。                 |

**＊実装例＊**

関数の一部の処理をスタブ化し、これをAWSクライアントのモックに紐付ける。

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

/**
 * AmplifyのGetBranch関数の処理をスタブ化します。


 */
func (mock *MockedAmplifyAPI) GetBranch(ctx context.Context, params *aws_amplify.GetBranchInput, optFns ...func(*aws_amplify.Options)) (*aws_amplify.GetBranchOutput, error) {
	arguments := mock.Called(ctx, params, optFns)
	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

#### ▼ アサーションメソッドによる検証

| よく使用するメソッド              | 説明                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Mock.On`メソッド                 | 関数の検証時に使用する。関数内部のスタブに引数として渡される値と、その時の返却値を定義する。   |
| `Mock.AssertExpectations`メソッド | 関数の検証時に使用する。関数内部のスタブが正しく実行されたか否かを検証する。                   |
| `assert.Exactly`メソッド          | 関数の検証時に使用する。期待値と実際値の整合性を検証する。値のみでなく、データ型も検証できる。 |

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions
> - https://pkg.go.dev/github.com/stretchr/testify/assert?tab=versions

#### ▼ 事前処理と事後処理

テスト関数を実行する直前に、事前処理を実行する。

モックの作成のために使用すると良い。

事前処理と事後処理については、以下のリンクを参考にせよ。

> - https://github.com/google/go-github/blob/master/github/github_test.go#L36-L66

| よく使用する関数 | 実行タイミング | 説明                                                                                                                                              |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SetupSuite`     | 1              | テストスイート内の全てのテストの事前処理として、一回だけ実行する。                                                                                |
| `SetupTest`      | 2              | テストスイート内の各テストの事前処理として、テストの度に事前に実行する。`BeforeTest`関数よりも前に実行されることに注意する。                      |
| `BeforeTest`     | 3              | テストスイート内の各テストの直前の事前処理として、テストの度に事前に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `AfterTest`      | 4              | テストスイート内の各テストの直後の事後処理として、テストの度に事後に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `TearDownTest`   | 5              | テストスイート内の各テストの事後処理として、テストの度に事後に実行する。`BeforeTest`関数よりも後に実行されることに注意する。                      |
| `TearDownSuite`  | 6              | テストスイート内の全てのテストの事後処理として、一回だけ実行する。                                                                                |

**＊実装例＊**

事前にモックを作成するために、`BeforeTest`関数を使用する。

```go
package foo

import (
	"testing"
)

/**
 * 単体テストのテストスイートを構成する。


 */
type FooSuite struct {
	suite.Suite
	fooMock *FooMock
}

/**
 * 単体テストの直前の事前処理を実行する。


 */
func (suite *FooSuite) BeforeTest(suiteName string, testName string) {

	// モックを作成する。
	suite.fooMock = &FooMock{}
}

/**
 * 単体テストのテストスイートを実行する。


 */
func TestFooSuite(t *testing.T) {
	suite.Run(t, &FooSuite{})
}
```

```go
package foo

import (
	"github.com/stretchr/testify/assert"
)

/**
 * Methodメソッドが成功することを検証する。


 */
func (suite *FooSuite) TestMethod() {

	suite.T().Helper()

	// 事前処理で作成したモックを使用する。
	fooMock := suite.fooMock

	// 以降にテスト処理
}
```

<br>

## validator

### validatorとは

<br>

### バリデーションとエラーメッセージ

```go
package validators

import (
	"fmt"

	"github.com/go-playground/validator"
)

type FoobarbazValidator struct {
	Foo string `json:"foo" validate:"required"`
	Bar string `json:"bar" validate:"required"`
	Baz string `json:"baz" validate:"required"`
}

// NewValidator コンストラクタ
func NewValidator() *Validator {

	return &Validator{}
}

// Validate バリデーションを実行します。
func (v *FoobarbazValidator) Validate() map[string]string {

	err := validator.New().Struct(v)

	var errorMessages = make(map[string]string)

	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			switch err.Field() {
			// フィールドごとにマップ形式でバリデーションメッセージを構成します。
			case "foo":
				errorMessages["foo"] = v.stringValidation(err)
				errorMessages["foo"] = v.requiredValidation(err)
			case "bar":
				errorMessages["bar"] = v.stringValidation(err)
			case "baz":
				errorMessages["baz"] = v.stringValidation(err)
				errorMessages["baz"] = v.requiredValidation(err)
			}
		}
	}

	return errorMessages
}

// stringValidation string型指定のメッセージを返却します。
func (v *FoobarbazValidator) stringValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は文字列のみ有効です", err.Field())
}

// requiredValidation 必須メッセージを返却します。
func (v *FoobarbazValidator) requiredValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は必須です", err.Field())
}
```

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/foobarbaz-repository/validators"
)

func main() {
	v := NewFoobarbazValidator()

	// JSONを構造体にマッピングします。
	err := json.Unmarshal([]byte(`{"foo": "test", "bar": "test", "baz": "test"}`), v)

	if err != nil {
		log.Print(err)
		return
	}

	// バリデーションを実行します。
	errorMessages := v.Validate()

	if len(errorMessages) > 0 {
		// マップをJSONに変換します。
		byteJson, _ := json.Marshal(errorMessages)
		fmt.Printf("%#v\n", byteJson)
	}

	// エンコード結果を出力します。
	fmt.Println("データに問題はありません。")
}
```

<br>
