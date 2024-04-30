---
title: 【IT技術の知見】SQLパッケージ@Go
description: SQLパッケージ@Goの知見を記録しています。
---

# SQLパッケージ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. gorm

### gormとは

Go製のORMである。

その他のORMについては、以下のリポジトリが参考になる。

執筆時点 (2022/01/31) では、gormとbeegoが接戦している。

> - https://github.com/d-tsuji/awesome-go-orms

<br>

### DBとの接続

#### ▼ MySQLの場合

```go
func NewDB() (*gorm.DB, error) {

    // 接続情報。sprintf関数を使用すると、可読性が高い。
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

> - https://gorm.io/docs/connecting_to_the_database.html#MySQL

<br>

### gormモデル

#### ▼ gormモデル埋め込み

構造体にgormモデルを埋め込むと、IDやタイムスタンプレコードがフィールドとして追加される。

構造体をマッピングしたテーブルに、対応するカラム (`id`、`created_at`、`updated_at`、`deleted_at`) を持つレコードを作成する。

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

> - https://gorm.io/docs/models.html#embedded_struct

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

gormモデルを埋め込むことによりこのフィールドを持たせるか、または自前定義することにより、SoftDeleteを有効化できる。

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

#### ▼ `TableName`関数

デフォルトではgormモデルの名前をスネークケースに変更し、加えて複数形とした名前のテーブルが作成される。

`TableName`関数により、ユーザー定義のテーブル名をつけられる。

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

## 01-02. gormクエリ

### Create

#### ▼ Createとは

gormモデルのフィールドに設定された値を元に、レコードを作成する。

作成したレコードのプライマリーキーを、構造体から取得できる。

```go
user := User{Name: "Jinzhu", Age: 18, Birthday: time.Now()}

result := db.Create(&user)

user.ID
result.Error
result.RowsAffected
```

> - https://gorm.io/docs/create.html#Create-Record

<br>

### Exec

#### ▼ Execとは

SQLステートメントをそのまま実行する。

```go
db.Exec("DROP TABLE users")
db.Exec("UPDATE orders SET shipped_at = ? WHERE id IN ?", time.Now(), []int64{1, 2, 3})
db.Exec("UPDATE users SET money = ? WHERE name = ?", gorm.Expr("money * ? + ?", 10000, 1), "jinzhu")
```

```go
db.Exec(fmt.Sprintf("SET SESSION max_execution_time=%d;", 10))
```

> - https://gorm.io/docs/sql_builder.html

<br>

### Hook

#### ▼ Hookとは

CRUDの関数の前後に設定した独自処理を実行できるようにする。

#### ▼ 特定のCRUD関数の前後

```go
func NewDb() {

	...

	// Createの前
	db.Callback().Create().Before("gorm:before_create").Register("<フック名>", "<CRUD関数名>")

	...
}
```

> - https://golang.withcodeexample.com/blog/golang-gorm-hooks-guide/

#### ▼ 全てのCRUD関数の前後

```go
func (user *User) BeforeSave(tx *gorm.DB) (err error) {
    user.LastUpdated = time.Now()
    return nil
}
```

```go
func (user *User) AfterSave(tx *gorm.DB) (err error) {
    log.Println("User successfully saved:", user.ID)
    return nil
}
```

> - https://golang.withcodeexample.com/blog/golang-gorm-hooks-guide/

<br>

### Read

#### ▼ Readとは

gormモデルに対応するレコードを読み出す。

#### ▼ 全レコード取得

```go
user := User{}

// SELECT * FROM users;
result := db.Find(&users)

result.RowsAffected
result.Error
```

> - https://gorm.io/docs/query.html#Retrieving-all-objects

#### ▼ 単一/複数レコード取得

gormモデルとプライマリーキーを指定して、プライマリーキーのモデルに紐付けられたレコードを取得する。

```go
user := User{}

// SELECT * FROM users WHERE id = 10;
db.First(&user, 10)

// SELECT * FROM users WHERE id = 10;
db.First(&user, "10")

// SELECT * FROM users WHERE id IN (1,2,3);
db.Find(&users, []int{1,2,3})
```

> - https://gorm.io/docs/query.html#Retrieving-objects-with-primary-key

<br>

### Statement

#### ▼ Statementとは

gormクエリに関する情報を持つ。

```go
type DB struct {
	*Config
	Error        error
	RowsAffected int64
	Statement    *Statement
	clone        int
}

type Statement struct {
	*DB
	TableExpr            *clause.Expr
	Table                string
	Model                interface{}
	Unscoped             bool
	Dest                 interface{}
	ReflectValue         reflect.Value
	Clauses              map[string]clause.Clause
	BuildClauses         []string
	Distinct             bool
	Selects              []string
	Omits                []string
	Joins                []join
	Preloads             map[string][]interface{}
	Settings             sync.Map
	ConnPool             ConnPool
	Schema               *schema.Schema
	// SQLステートメントごとのコンテキスト
	// SQLにタイムアウト値やキャンセル関数を設定できる
	Context              context.Context
	RaiseErrorOnNotFound bool
	SkipHooks            bool
	// SQLステートメント
	SQL                  strings.Builder
	Vars                 []interface{}
	CurDestIndex         int
	attrs                []interface{}
	assigns              []interface{}
	scopes               []func(*DB) *DB
}
```

> - https://github.com/go-gorm/gorm/blob/v1.25.9/statement.go#L22-L49

<br>

### Update

#### ▼ Updateとは

gormモデルのフィールドに設定された値を元に、レコードを変更する。

#### ▼ 単一レコード更新 (暗黙的)

フィールドとは無関係に、渡された値を元にUPDATE分を実行する。

> - https://gorm.io/docs/update.html#Update-single-column

```go
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE active=true;
db.Model(&User{}).Where("active = ?", true).Update("name", "hello")

user := User{Id:111}

// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111;
db.Model(&user).Update("name", "hello")

// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE id=111 AND active=true;
db.Model(&user).Where("active = ?", true).Update("name", "hello")
```

#### ▼ 複数レコード更新 (暗黙的)

gormモデルのフィールドを暗黙的に指定して、複数のレコード値を更新する。

または、フィールドとは無関係に、mapを元にUPDATE文を実行する。

gormモデルを使用した場合、フィールド値がゼロ値であると、これに紐付けられたレコード値の更新はスキップされてしまう。

> - https://gorm.io/docs/update.html#Updates-multiple-columns

```go
user := User{Id:111}

// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;
db.Model(&user).Updates(User{Name: "hello", Age: 18, Active: "false"})

// UPDATE users SET name='hello', age=18, active=false, updated_at='2013-11-17 21:34:10' WHERE id=111;
db.Model(&user).Updates(map[string]interface{}{"name": "hello", "age": 18, "active": "false"})
```

#### ▼ 複数レコード更新 (明示的)

gormモデルのフィールドを明示的に指定して、複数のレコード値を更新する。

フィールド値がゼロ値であっても、スキップされない。

> - https://gorm.io/docs/update.html#Update-Selected-Fields

```go
user := User{Id:111}

// UPDATE users SET name='new_name', age=0 WHERE id=111;
db.Model(&user).Select("Name", "Age").Updates(User{Name: "new_name", Age: 0})

// UPDATE users SET name='new_name', age=0 WHERE id=111;
db.Model(&user).Select("*").Updates(User{Name: "jinzhu", Role: "admin", Age: 0})
```

#### ▼ 全レコード更新

gormモデルのフィールドを暗黙的に全て指定して、全てのレコード値を強制的に更新する。

```go
user := User{Id:111}

db.First(&user)

user.Name = "jinzhu 2"

user.Age = 100

// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111;
db.Save(&user)
```

> - https://gorm.io/docs/update.html#Save-All-Fields

<br>

### WithContext

#### ▼ WithContextとは

gormクエリにコンテキストを設定する。

```go
// タイムアウト時間を設定し、コンテキストを作成する
ctx, cancel := context.WithTimeout(
    context.Background(),
    5 * time.Second,
)

// タイムアウト時間経過後に処理を中断する
defer cancel()

db.WithContext(ctx).Find(&users)
```

> - https://gorm.io/docs/context.html#Context-Timeout
> - https://elahe-dstn.medium.com/query-timeout-a-gopher-perspective-3caa221566e0

<br>
