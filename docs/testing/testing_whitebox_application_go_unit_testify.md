---
title: 【IT技術の知見】testify＠Go単体テスト
description: testify＠Go単体テストの知見を記録しています。
---

# testify＠Go単体テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. testifyとは

モック、スタブ、アサーションの関数を作成する。

Goではオブジェクトの概念がないため、モックオブジェクトとは言わない。

<br>

## 02. testifyの仕組み

1. `mock`パッケージのモック構造体に関数を設定する。
2. `On`関数や`Called`関数を使用し、モック構造体に仮の関数を定義する。
3. `mock`パッケージのモック構造体で`Assert*****`関数を実行し、期待値と実際値を比較する。
4. `assert`パッケージで検証関数を実行し、期待値と実際値を比較する。

<br>

## 03. mock

### Mock

#### ▼ Mockとは

構造体のフィールドにモック構造体を設定すれば、その構造体をモック化できる。

**＊実装例＊**

AWSクライアントをモック構造体化する。

```go
package amplify

import (
	"github.com/stretchr/testify/mock"
)

/**
 * AWSクライアントをモック構造体化します。
 */
type MockedAwsClient struct {
	mock.Mock
}
```

#### ▼ On

モック構造体の仮の関数に処理を設定する。

```go
package user

type UserInterface interface {
	Get(id int) (*model.User, error)
}

type User struct {
    UserInterface
}

func (u *User) UserName(id int) (string, error) {

    usr, err := u.Get(id)

	if usr == nil || err != nil {
        return "", err
    }

	return usr.Name, nil
}
```

```go
package test

import (
	"github.com/stretchr/testify/mock"
)

// MockUserInterface UserInterfaceのモック構造体
type MockUserInterface struct {
	mock.Mock
}

// モック構造体に紐づける仮の関数
func (m *MockUserInterface) Get(id int) (*model.User, error) {

	// On関数で設定された値を受け取る
	arguments := m.Called(id)

	return arguments.Get(0).(*model.User), ret.Error(1)
}

func TestUser_UserName(t *testing.T) {

    testUser := &model.User{ID: 1, Name: "Tom", Gender: model.Male, CreatedAt: time.Now(), UpdatedAt: time.Now()}

    mockUser := new(user.MockUserInterface)

	// Get関数内部のCalled関数に、仮の処理 (ここでは引数と返却値) を設定する
    mockUser.On("Get", testUser.ID).Return(testUser, nil)

    u := &User{
        mockUser,
    }

    got, err := u.UserName(testUser.ID)

    if err != nil {
        t.Error(err)
    }
}
```

> - https://qiita.com/muroon/items/f8beec802c29e66d1918#%E3%83%86%E3%82%B9%E3%83%88%E3%81%AE%E5%AE%9F%E8%A1%8C

#### ▼ Called

モック構造体に仮の関数を紐づける場合に使用する。

`On`関数で設定された引数や返却値を取得する。

**＊実装例＊**

```go
package user

type UserInterface interface {
	Get(id int) (*model.User, error)
}

type User struct {
	UserInterface
}

func (u *User) UserName(id int) (string, error) {

	usr, err := u.Get(id)

	if usr == nil || err != nil {
		return "", err
	}

	return usr.Name, nil
}
```

```go
package test

import (
	"github.com/stretchr/testify/mock"
)

type MockUserInterface struct {
	mock.Mock
}

// Mock構造体に紐づける仮の関数
func (m *MockUserInterface) Get(id int) (*model.User, error) {

	// On関数で設定された値を受け取る
	arguments := m.Called(id)

	return arguments.Get(0).(*model.User), arguments.Error(1)
}

func TestUser_UserName(t *testing.T) {

	testUser := &model.User{ID: 1, Name: "Tom", Gender: model.Male, CreatedAt: time.Now(), UpdatedAt: time.Now()}

	mockUser := new(user.MockUserInterface)

	// Get関数内部のCalled関数に、仮の処理 (ここでは引数と返却値) を設定する
	mockUser.On("Get", testUser.ID).Return(testUser, nil)

	u := &User{
		mockUser,
	}

	got, err := u.UserName(testUser.ID)

	if err != nil {
		t.Error(err)
	}
}
```

> - https://qiita.com/muroon/items/f8beec802c29e66d1918#%E3%83%A2%E3%83%83%E3%82%AFstruct

**＊実装例＊**

```go
package amplify

import (
	"context"
	"github.com/stretchr/testify/mock"

	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// モック構造体に紐づける仮の関数
func (m *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	// On関数で設定された値を受け取る
	arguments := m.Called(ctx, params, optFns)

	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Mock.Called

#### ▼ AssertExpectations

モック構造体の`On`関数や`Retuen`関数が正しく実行されたか否かを検証する。

検証対象は、ユーザー定義箇所ではなく、`mock`パッケージのモック構造体である。

```go
package user

type user interface {
	GetAge() int
}

func isAdult(u user) bool {

	age := u.GetAge()

	return age >= 20
}
```

```go
package test

import (
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/assert"
)

// MockedUser Userのモック構造体
type MockedUser struct {
	mock.Mock
}

// Mock構造体に紐づける仮の関数
func (m *MockedUser) GetAge() int {

	// On関数で設定された値を受け取る
	args := m.Called()

	return args.Int(0)
}

func Test_Mock(t *testing.T) {

	mockUser := new(MockedUser)

	// GetAge関数内部のCalled関数に、仮の処理 (ここでは返却値) を設定する
	mockUser.On("GetAge").Return(20)

	// テストを実施する
	result := isAdult(mockUser)

	// 期待値と実際値を比較する
	mockUser.AssertExpectations(t)
	assert.True(t, result)
}
```

> - https://dev.classmethod.jp/articles/go-testify/#toc-5

#### ▼ AssertNumberOfCalls

モック構造体内の関数がコールされた回数を検証する。

検証対象は、ユーザー定義箇所ではなく、`mock`パッケージのモック構造体である。

```go
package user

type user interface {
	GetAge() int
}

func isAdult(u user) bool {

	age := u.GetAge()

	return age >= 20
}
```

```go
package test

import (
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/assert"
)

// MockedUser Userのモック構造体
type MockedUser struct {
	mock.Mock
}

// Mock構造体に紐づける仮の関数
func (m *MockedUser) GetAge() int {

	// On関数で設定された値を受け取る
	args := m.Called()

	return args.Int(0)
}

func Test_Mock(t *testing.T) {

	mockUser := new(MockedUser)

	// GetAge関数内部のCalled関数に、仮の処理 (ここでは返却値) を設定する
	mockUser.On("GetAge").Return(20)

	// テストを実施する
	result := isAdult(mockUser)

	// 期待値と実際値を比較する
	mockUser.AssertExpectations(t)
	mockUser.AssertExpectations(t, "GetAge", 1)	// GetAge関数をコールした回数を検証する
	assert.True(t, result)
}
```

> https://dev.classmethod.jp/articles/go-testify/#toc-5

<br>

### Argument

#### ▼ Argumentとは

モック構造体に渡した引数を保持する。

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Arguments

#### ▼ Get

引数の順番をインデックス数で指定し、保持された引数を取得する。

**＊実装例＊**

```go
package amplify

import (
	"context"
	"github.com/stretchr/testify/mock"

	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// Mock構造体に紐づける仮の関数
func (m *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	// On関数で設定された値を受け取る
	arguments := m.Called(ctx, params, optFns)

	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Arguments.Get

#### ▼ Error

引数の順番をインデックス数で指定し、保持された引数を取得する。

引数がなければ、エラーを返却する。

**＊実装例＊**

```go
package amplify

import (
	"context"
	"github.com/stretchr/testify/mock"

	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// Mock構造体に紐づける仮の関数
func (m *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	// On関数で設定された値を受け取る
	arguments := m.Called(ctx, params, optFns)

	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Arguments.Error

<br>

## 04. assert

### 事前処理と事後処理

テスト関数を実行する直前に、事前処理を実行する。

モック構造体の作成のために使用すると良い。

事前処理と事後処理については、以下のリンクを参考にせよ。

| よく使用する関数 | 実行タイミング | 説明                                                                                                                                              |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SetupSuite`     | 1              | テストスイート内の全てのテストの事前処理として、一回だけ実行する。                                                                                |
| `SetupTest`      | 2              | テストスイート内の各テストの事前処理として、テストの度に事前に実行する。`BeforeTest`関数よりも前に実行されることに注意する。                      |
| `BeforeTest`     | 3              | テストスイート内の各テストの直前の事前処理として、テストの度に事前に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `AfterTest`      | 4              | テストスイート内の各テストの直後の事後処理として、テストの度に事後に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `TearDownTest`   | 5              | テストスイート内の各テストの事後処理として、テストの度に事後に実行する。`BeforeTest`関数よりも後に実行されることに注意する。                      |
| `TearDownSuite`  | 6              | テストスイート内の全てのテストの事後処理として、一回だけ実行する。                                                                                |

**＊実装例＊**

事前にモック構造体を作成するために、`BeforeTest`関数を使用する。

```go
package foo

import (
	"testing"

	"github.com/stretchr/testify/suite"
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

	// モック構造体を作成する。
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
	"github.com/stretchr/testify/suite"
)

/**
 * Method関数が成功することを検証する。
 */
func (suite *FooSuite) TestMethod() {

	suite.T().Helper()

	// 事前処理で作成したモック構造体を使用する。
	fooMock := suite.fooMock

	// 以降にテスト処理
}
```

> - https://github.com/google/go-github/blob/master/github/github_test.go#L36-L66
> - https://pkg.go.dev/github.com/stretchr/testify/suite

<br>

### 結果の検証

#### ▼ Exactly

期待値と実際値 (値、データ型) の整合性を検証する。

ポインタのメモリアドレス値は一致していなくても良い。

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/assert#Assertions.Exactly
> - https://bayashi.net/diary/2023/0426

#### ▼ Equal

期待値と実際値 (値) の整合性を検証する。

ポインタのメモリアドレス値は一致していなくても良い。

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/assert#Equal
> - https://bayashi.net/diary/2023/0426

#### ▼ Same

期待値と実際値 (メモリアドレス値) の整合性を検証する。

ポインタのメモリアドレス値が同じであれば、結果的に値とデータ型も同じになる。

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/assert#Same
> - https://bayashi.net/diary/2023/0426

<br>
