---
title: 【IT技術の知見】アンチパターン＠RDB
description: アンチパターン＠RDBの知見を記録しています。
---

# アンチパターン＠RDB

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. DB 接続を再利用しない

### 問題

DB 処理のたびに DB 接続を確立すると、DB 処理に時間がかかる。

<br>

### 実装例

=== "Go"

    ```go title="Go の場合の実装例"
    import (
    	"gorm.io/driver/mysql"
    	"gorm.io/gorm"
    )

    func Handler() ([]User, error) {
    	// 毎回、DB接続を作成してしまっている
    	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    	if err != nil {
    		return nil, err
    	}

    	var users []User
    	err = db.Find(&users).Error
    	return users, err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import type {User} from "@prisma/client";
    import {prisma} from "~/services/prisma.server";

    export async function handler() {
      // 毎回、PrismaClientを作成してしまっている
      const prisma = new PrismaClient();
      return prisma.user.findMany();
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    function handler(): array
    {
        // 毎回、PDOを作成してしまっている
        $pdo = new PDO(DSN, DB_USER, DB_PASSWORD);
        return $pdo->query("SELECT * FROM users")->fetchAll();
    }
    ```

<br>

## 02. データの意味や用途に適さない DB カラム型で保存する

### 問題

データの見た目だけで DB カラム型を決めると、値の比較や計算のたびに型変換が必要になる。

また、DB カラム型に基づいて値を検証できず、不正な値を保存したり、インデックスを効果的に使用できなかったりする可能性がある。

データの見た目ではなく、ドメイン上の意味、制約、比較方法、計算方法に適した DB カラム型で保存する。

<br>

### 実装例

#### ▼ 問題がある実装

=== "Go"

    ```go title="Go の場合の実装例"
    user := User{
    	ID:        1,
    	BirthDate: "2000-01-01",
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = {
      id: 1,
      birthDate: "2000-01-01",
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $user = [
        "id"        => 1,
        "birthDate" => "2000-01-01",
    ];
    ```

#### ▼ 解決方法

日付として比較や計算をする値には、`VARCHAR` 型のカラムではなく `DATE` 型のカラムを使用する。

同様に、金額には `DECIMAL` 型のカラム、件数には `INT` 型のカラム、真偽値には `BOOLEAN` 型のカラムを使用する。

ただし、電話番号、郵便番号、商品コードなど、数字で構成されていても計算を目的としない値には `VARCHAR` 型のカラムを使用する。

=== "Go"

    ```go title="Go の場合の実装例"
    user := User{
    	ID: 1,
    	// 日付（DBではDATE型のカラムにする）
    	BirthDate: time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC),
    	// 金額（DBではDECIMAL型のカラムにする）
    	AccountBalance: decimal.RequireFromString("1000.50"),
    	// 件数（DBではINT型のカラムにする）
    	LoginCount: 10,
    	// 真偽値（DBではBOOLEAN型のカラムにする）
    	IsActive: true,
    	// 電話番号（DBではVARCHAR型のカラムにする）
    	PhoneNumber: "03-1234-5678",
    	// 郵便番号（DBではVARCHAR型のカラムにする）
    	PostalCode: "012-3456",
    	// 商品コード（DBではVARCHAR型のカラムにする）
    	ProductCode: "001234",
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {Prisma} from "@prisma/client";

    const user = {
      id: 1,
      // 日付（DBではDATE型のカラムにする）
      birthDate: new Date("2000-01-01"),
      // 金額（DBではDECIMAL型のカラムにする）
      accountBalance: new Prisma.Decimal("1000.50"),
      // 件数（DBではINT型のカラムにする）
      loginCount: 10,
      // 真偽値（DBではBOOLEAN型のカラムにする）
      isActive: true,
      // 電話番号（DBではVARCHAR型のカラムにする）
      phoneNumber: "03-1234-5678",
      // 郵便番号（DBではVARCHAR型のカラムにする）
      postalCode: "012-3456",
      // 商品コード（DBではVARCHAR型のカラムにする）
      productCode: "001234",
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    use Brick\Math\BigDecimal;

    $user = [
        "id"             => 1,
        // 日付（DBではDATE型のカラムにする）
        "birthDate"      => new DateTimeImmutable("2000-01-01"),
        // 金額（DBではDECIMAL型のカラムにする）
        "accountBalance" => BigDecimal::of("1000.50"),
        // 件数（DBではINT型のカラムにする）
        "loginCount"     => 10,
        // 真偽値（DBではBOOLEAN型のカラムにする）
        "isActive"       => true,
        // 電話番号（DBではVARCHAR型のカラムにする）
        "phoneNumber"    => "03-1234-5678",
        // 郵便番号（DBではVARCHAR型のカラムにする）
        "postalCode"     => "012-3456",
        // 商品コード（DBではVARCHAR型のカラムにする）
        "productCode"    => "001234",
    ];
    ```

<br>

## 03. 不要な DB レコードやカラムを取得する

### 問題

不要な DB レコードやカラムを取得すると、DB 処理に時間がかかる。

<br>

### 実装例

=== "Go"

    ```go title="Go の場合の実装例"
    var user User
    err := db.
    	// 不要なカラムも取得してしまっている
    	Preload("Team").
    	Preload("Bans").
    	Preload("Logs").
    	Preload("Profiles").
    	First(&user, id).Error
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import type {User} from "@prisma/client";
    import {prisma} from "~/services/prisma.server";

    const user = await prisma.user.findUnique({
      where: {id},
      // 不要なカラムも取得してしまっている
      include: {team: true, bans: true, logs: true, profiles: true},
    });
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $user = User::query()
        // 不要なカラムも取得してしまっている
        ->with(["team", "bans", "logs", "profiles"])
        ->find($id);
    ```

<br>

## 04. N+1 問題を起こす

### N+1 問題とは

親テーブルを経由して子テーブルにアクセスするとき、親テーブルのレコード数分の SQL を発行してしまうアンチパターンのこと。

<br>

### 実装例

#### ▼ 問題がある実装（１）

反復処理のなかで子テーブルのレコードにアクセスしてしまう場合、N+1 問題が起こる。

内部的には、親テーブルへの SQL と、Where 句を持つ SQL が親テーブルのレコード数分だけ発行される。

=== "Go"

    ```go title="Go の場合の実装例"
    // 親テーブルにSQLを発行 (1回)
    var users []User
    db.Where("team_id = ?", teamID).Find(&users)

    for _, u := range users {
    	// 親テーブルのレコード数分のWhere句SQLを発行する (N回)
    	var logs []Log
    	db.Where("user_id = ?", u.ID).Find(&logs)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import type {User} from "@prisma/client";
    import {prisma} from "~/services/prisma.server";

    // 親テーブルにSQLを発行 (1回)
    const users = await prisma.user.findMany({where: {teamId}});

    for (const u of users) {
      // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
      const logs = await prisma.log.findMany({
        where: {userId: u.id},
      });
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 親テーブルにSQLを発行 (1回)
    $departments = Department::all();

    foreach($departments as $department) {
        // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
        $department->employees;
    }
    ```

    ```bash
    # 1回
    select * from `departments`

    # N回
    select * from `employees` where `department_id` = 1
    select * from `employees` where `department_id` = 2
    select * from `employees` where `department_id` = 3
    ...
    ```

#### ▼ 問題がある実装（２）

`map()` 関数や並行処理を使用した反復処理でも、もちろん N+1 問題が起こる。

=== "Go"

    ```go title="Go の場合の実装例"
    // 親テーブルにSQLを発行 (1回)
    var users []User
    db.Where("team_id = ?", teamID).Find(&users)

    // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
    logs := make([][]Log, len(users))
    var eg errgroup.Group
    for i, u := range users {
    	eg.Go(func() error {
    		return db.Where("user_id = ?", u.ID).Find(&logs[i]).Error
    	})
    }
    if err := eg.Wait(); err != nil {
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import type {User} from "@prisma/client";
    import {prisma} from "~/services/prisma.server";

    // 親テーブルにSQLを発行 (1回)
    const users = await prisma.user.findMany({where: {teamId}});

    // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
    const logs = await Promise.all(
      users.map(async (u) => {
        const logs = await prisma.log.findMany({
          where: {userId: u.id},
        });
        return {user: u, logs};
      }),
    );
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 親テーブルにSQLを発行 (1回)
    $departments = Department::all();

    // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
    $employees = $departments->map(function ($department) {
        return $department->employees;
    });
    ```

#### ▼ 解決方法

反復処理の前に、子テーブルへアクセスしておく。

レコード取得時に IN 句や JOIN 句を使用すると、N+1 問題を解消できる。

=== "Go"

    GORM では、`Where()` 関数で IN 句を指定すると、IN 句を含む SQL が発行され、最終的に 2 回で済む。

    ```go title="Go の場合の実装例"
    // 親テーブルにSQLを発行 (1回)
    var users []User
    db.Where("team_id = ?", teamID).Find(&users)

    userIDs := make([]int, 0, len(users))
    for _, u := range users {
    	userIDs = append(userIDs, u.ID)
    }

    // 子テーブルにIN句のSQLを発行する (1回)
    var logs []Log
    // 内部的にIN句
    db.Where("user_id IN ?", userIDs).Find(&logs)
    ```

=== "TypeScript"

    Prisma では、`in` プロパティを使用すると、IN 句を含む SQL が発行され、最終的に 2 回で済む。

    ```typescript title="TypeScript の場合の実装例"
    import type {User} from "@prisma/client";
    import {prisma} from "~/services/prisma.server";

    // 親テーブルにSQLを発行 (1回)
    const users = await prisma.user.findMany({where: {teamId}});

    // 子テーブルにIN句のSQLを発行する (1回)
    const logs = await prisma.log.findMany({
      where: {
        // 内部的にIN句
        userId: {in: users.map((u) => u.id)},
      },
    });
    ```

=== "PHP"

    Laravel では `with()` 関数を使用すると、内部的に親テーブルへの SQL と IN 句を使用した SQL が発行され、最終的に 2 回で済む。

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 親テーブルと子テーブルにSQLを発行する (2回)
    // 子テーブルへのSQLでは、内部的にIN句を使用する
    $departments = Department::with('employees')->get();

    foreach($departments as $department) {
        // キャッシュを使用するのでSQLの発行はされない (0回)
        $department->employees;
    }
    ```

    ```bash
    # 2回
    select * from `departments`
    select * from `employees` where `department_id` in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ... 100)
    ```

<br>

## 05. 一覧取得でページング（取得数指定）がない

### 問題

DB からレコードの一覧を取得する場合、ページング（取得数指定）がないと、DB 処理に時間がかかる。

<br>

### 実装例

#### ▼ 解決方法

=== "Go"

    ```go title="Go の場合の実装例"
    page := 1
    limit := 50

    var users []User
    err := db.
    	Where("team_id = ?", teamID).
    	Offset((page - 1) * limit).
    	Limit(limit).
    	Order("created_at DESC").
    	Find(&users).Error
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const page = 1;
    const limit = 50;

    const users = await prisma.user.findMany({
      where: {teamId},
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {createdAt: "desc"},
    });
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $page = 1;
    $limit = 50;

    $users = User::where("team_id", $teamId)
        ->skip(($page - 1) * $limit)
        ->take($limit)
        ->orderBy("created_at", "desc")
        ->get();
    ```

<br>

## 06. 検索するレコード数をむやみに増やす

### 問題

集計結果を一覧で表示するような機能では、テナント内のレコードを横断的に取得する必要がある。

ただし、大量のレコードを Read 処理で取得し、その都度集計すると負荷がかかる。処理時間も長くなる。

<br>

### 実装例

#### ▼ 問題がある実装

=== "Go"

    ```go title="Go の場合の実装例"
    var events []Event
    err := db.
    	Where("tenant_id = ?", tenantID).
    	Where("occurred_at >= ? AND occurred_at < ?", startAt, endAt).
    	Find(&events).Error

    eventCount := len(events)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const events = await prisma.event.findMany({
      where: {
        tenantId,
        occurredAt: {
          gte: startAt,
          lt: endAt,
        },
      },
    });

    const eventCount = events.length;
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $events = Event::where("tenant_id", $tenantId)
        ->where("occurred_at", ">=", $startAt)
        ->where("occurred_at", "<", $endAt)
        ->get();

    $eventCount = $events->count();
    ```

#### ▼ 解決方法

高負荷の処理をバッチマイクロサービスに分割する。

バックエンドでは、バッチマイクロサービスとの共有テーブルから、事前に集計されたレコードを取得する。

バッチマイクロサービスでは、共有の集計テーブルに集計結果を書き込む。

取得するレコード数を削減できる。

=== "Go"

    ```go title="Go の場合の実装例"
    err := db.
    	Clauses(clause.OnConflict{
    		Columns:   []clause.Column{{Name: "tenant_id"}, {Name: "hour"}},
    		DoUpdates: clause.Assignments(map[string]interface{}{"count": eventCount}),
    	}).
    	Create(&EventHourlySummary{
    		TenantID: tenantID,
    		Hour:     startAt,
    		Count:    eventCount,
    	}).Error
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    await prisma.eventHourlySummary.upsert({
      where: {
        tenantId_hour: {
          tenantId,
          hour: startAt,
        },
      },
      update: {
        count: eventCount,
      },
      create: {
        tenantId,
        hour: startAt,
        count: eventCount,
      },
    });
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    EventHourlySummary::upsert(
        [
            [
                "tenant_id" => $tenantId,
                "hour"      => $startAt,
                "count"     => $eventCount,
            ],
        ],
        ["tenant_id", "hour"],
        ["count"]
    );
    ```

```prisma
// EventHourlySummaryテーブル
model EventHourlySummary {
  tenantId String
  hour     DateTime
  count    Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@id([tenantId, hour])
  @@map("event_hourly_summaries")
}
```

バックエンドでは、共有の集計テーブルから集計結果を取得する。

=== "Go"

    ```go title="Go の場合の実装例"
    var eventSummary EventHourlySummary
    err := db.
    	Where("tenant_id = ? AND hour = ?", tenantID, startAt).
    	First(&eventSummary).Error
    if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
    	return err
    }

    eventCount := eventSummary.Count
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const eventSummary = await prisma.eventHourlySummary.findUnique({
      where: {
        tenantId_hour: {
          tenantId,
          hour: startAt,
        },
      },
    });

    const eventCount = eventSummary?.count ?? 0;
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $eventSummary = EventHourlySummary::where("tenant_id", $tenantId)
        ->where("hour", $startAt)
        ->first();

    $eventCount = $eventSummary?->count ?? 0;
    ```

<br>

## 07. 空入力でも SQL を実行する

### 問題

検索対象を表す配列が空の場合、検索結果は空になることが事前にわかる。

それにもかかわらず SQL を実行すると、不要な DB 処理が発生して性能が低下したり、不具合が起こったりする可能性がある。

<br>

### 実装例

#### ▼ 問題がある実装

=== "Go"

    ```go title="Go の場合の実装例"
    func findByUserNames(userNames []string) ([]User, error) {
    	var users []User
    	err := db.
    		Where("name IN ?", userNames).
    		Find(&users).Error
    	return users, err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    async function findByUserNames(userNames: string[]) {
      return prisma.user.findMany({
        where: {
          name: {in: userNames},
        },
      });
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    function findByUserNames(array $userNames): array
    {
        return User::whereIn("name", $userNames)->get()->all();
    }
    ```

#### ▼ 解決方法

空入力に対するガード節を設け、SQL を実行せずに空配列を返す。

この早期リターンにより、不要な DB 処理を避け、性能低下や不具合を防げる。

=== "Go"

    ```go title="Go の場合の実装例"
    func findByUserNames(userNames []string) ([]User, error) {
    	if len(userNames) == 0 {
    		return []User{}, nil
    	}

    	var users []User
    	err := db.
    		Where("name IN ?", userNames).
    		Find(&users).Error
    	return users, err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    async function findByUserNames(userNames: string[]) {
      if (userNames.length === 0) {
        return [];
      }

      return prisma.user.findMany({
        where: {
          name: {in: userNames},
        },
      });
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    function findByUserNames(array $userNames): array
    {
        if (count($userNames) === 0) {
            return [];
        }

        return User::whereIn("name", $userNames)->get()->all();
    }
    ```

<br>

## 08. GROUP BY 句を使用せずにアプリケーション側で集計する

### 問題

集計対象のレコードをすべて取得してアプリケーション側でグループ化すると、DB から転送するデータ量とアプリケーションのメモリ使用量が増える。

単純な件数や合計値の集計には GROUP BY 句を使用し、必要な集計結果だけを取得する。

<br>

### 実装例

#### ▼ 問題がある実装

=== "Go"

    ```go title="Go の場合の実装例"
    var users []User
    err := db.
    	Select("team_id").
    	Find(&users).Error

    userCountByTeam := map[string]int{}
    for _, user := range users {
    	userCountByTeam[user.TeamID]++
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const users = await prisma.user.findMany({
      select: {
        teamId: true,
      },
    });

    const userCountByTeam = users.reduce<Record<string, number>>((counts, user) => {
      counts[user.teamId] = (counts[user.teamId] ?? 0) + 1;
      return counts;
    }, {});
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $users = User::select("team_id")->get();

    $userCountByTeam = $users->reduce(function (array $counts, User $user) {
        $counts[$user->team_id] = ($counts[$user->team_id] ?? 0) + 1;
        return $counts;
    }, []);
    ```

#### ▼ 解決方法

Prisma の `groupBy()` 関数を使用し、チームごとのユーザー数を集計する処理をアプリケーションのインフラストラクチャ層から DB に委譲する。

=== "Go"

    ```go title="Go の場合の実装例"
    var userCountByTeam []struct {
    	TeamID string
    	Count  int
    }
    err := db.
    	Model(&User{}).
    	Select("team_id, COUNT(*) AS count").
    	Group("team_id").
    	Scan(&userCountByTeam).Error
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const userCountByTeam = await prisma.user.groupBy({
      by: ["teamId"],
      _count: {
        _all: true,
      },
    });
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $userCountByTeam = User::selectRaw("team_id, COUNT(*)")
        ->groupBy("team_id")
        ->get();
    ```

内部的には、GROUP BY 句を使用した SQL が発行される。

```sql
SELECT team_id, COUNT(*)
FROM users
GROUP BY team_id;
```

<br>

## 09. SUM 関数を使用せずにアプリケーション側で合計する

### 問題

合計対象のレコードをすべて取得してアプリケーション側で合計すると、DB から転送するデータ量とアプリケーションのメモリ使用量が増える。

単純な数値の合計には SUM 関数を使用し、必要な合計値だけを取得する。

<br>

### 実装例

#### ▼ 問題がある実装

=== "Go"

    ```go title="Go の場合の実装例"
    var orders []Order
    err := db.
    	Select("amount").
    	Find(&orders).Error

    totalAmount := 0
    for _, order := range orders {
    	totalAmount += order.Amount
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const orders = await prisma.order.findMany({
      select: {
        amount: true,
      },
    });

    const totalAmount = orders.reduce((total, order) => total + order.amount, 0);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $orders = Order::select("amount")->get();

    $totalAmount = $orders->reduce(fn ($total, Order $order) => $total + $order->amount, 0);
    ```

#### ▼ 解決方法

Prisma の `aggregate()` 関数を使用し、注文金額を合計する処理をアプリケーションのインフラストラクチャ層から DB に委譲する。

=== "Go"

    ```go title="Go の場合の実装例"
    var totalAmount int
    err := db.
    	Model(&Order{}).
    	Select("COALESCE(SUM(amount), 0)").
    	Scan(&totalAmount).Error
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const result = await prisma.order.aggregate({
      _sum: {
        amount: true,
      },
    });

    const totalAmount = result._sum.amount ?? 0;
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $totalAmount = Order::sum("amount");
    ```

内部的には、SUM 関数を使用した SQL が発行される。

```sql
SELECT SUM(amount)
FROM orders;
```
