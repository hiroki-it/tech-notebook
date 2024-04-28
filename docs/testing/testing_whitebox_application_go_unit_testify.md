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

## 02. mock

### Mock

#### ▼ Mockとは

構造体のフィールドに`Mock`構造体を設定すれば、その構造体をモック化できる。

| よく使用するメソッド | 説明 |
| -------------------- | ---- |
| なし                 |      |

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

#### ▼ On

モックに、引数として渡される期待値と返却値の期待値を定義する。

```go
package test

import (
	mock "github.com/stretchr/testify/mock"
)

func TestUser_UserName(t *testing.T) {

    testUser := &model.User{ID: 1, Name: "Tom", Gender: model.Male, CreatedAt: time.Now(), UpdatedAt: time.Now()}

    mockUser := new(datastore.MockUserInterface)

    mockUser.On("Get", testUser.ID).Return(testUser, nil)

    u := &User{
        dt: mockUser,
    }

    got, err := u.UserName(testUser.ID)

    if err != nil {
        t.Error(err)
    }
}
```

> - https://qiita.com/muroon/items/f8beec802c29e66d1918#%E3%83%86%E3%82%B9%E3%83%88%E3%81%AE%E5%AE%9F%E8%A1%8C

#### ▼ AssertExpectations

モックが正しく実行されたか否かを検証する。

<br>

### Called

#### ▼ Called

『メソッドをコールした』というイベントをモックに登録する。

**＊実装例＊**

```go
package test

import (
	mock "github.com/stretchr/testify/mock"
)

type MockUserInterface struct {
	mock.Mock
}

func (_m *MockUserInterface) Get(id int) (*model.User, error) {
	ret := _m.Called(id)
	return ret.Get(0).(*model.User), ret.Error(1)
}
```

> - https://qiita.com/muroon/items/f8beec802c29e66d1918#%E3%83%A2%E3%83%83%E3%82%AFstruct

**＊実装例＊**

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// モックが使用するGetBranch関数
func (mock *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	// モックに渡した引数を一時的に保管する
	arguments := mock.Called(ctx, params, optFns)

	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Mock.Called

<br>

### Argument

#### ▼ Get

引数の順番をインデックス数で指定し、`Called`メソッドに登録された引数を取得する。

**＊実装例＊**

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// モックが使用するGetBranch関数
func (mock *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	arguments := mock.Called(ctx, params, optFns)


	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Arguments.Get

#### ▼ Error

引数の順番をインデックス数で指定し、`Called`メソッドのエラーを取得する。

**＊実装例＊**

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

// モックが使用するGetBranch関数
func (mock *MockedAmplifyAPI) GetBranch(
	ctx context.Context,
	params *aws_amplify.GetBranchInput,
	optFns ...func(*aws_amplify.Options)
	) (*aws_amplify.GetBranchOutput, error) {

	arguments := mock.Called(ctx, params, optFns)


	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify@v1.9.0/mock#Arguments.Error

<br>

## 03. assert

### 事前処理と事後処理

テスト関数を実行する直前に、事前処理を実行する。

モックの作成のために使用すると良い。

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

> - https://github.com/google/go-github/blob/master/github/github_test.go#L36-L66

<br>

### アサーション

#### ▼ Exactly

期待値と実際値の整合性を検証する。

値のみでなく、データ型も検証できる。

<br>
