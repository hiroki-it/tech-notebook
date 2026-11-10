---
title: 【IT技術の知見】クラス＠オブジェクト指向
description: クラス＠オブジェクト指向の知見を記録しています。
---

# クラス＠オブジェクト指向

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

TypeScript の例では、インターフェースと生成関数でオブジェクトを実装する。クラスの継承や抽象クラスに対応する例は、オブジェクトの合成と関数の受け渡しで同じ役割を実現する。

<br>

## 01. has-one、has-many (状態として保持する関係性)

### has-one、has-many な関係性とは

クラスがほかのクラスを状態として保持する関係性のことで、ライフサイクルの依存の有無によって Association、Aggregation、Composition に分類できる。

![データとして保持する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/データとして保持する関係性.png)

<br>

### Association (関連)

#### ▼ Association とは

クラス A がクラス B を状態として保持する関係性のこと。

引数型/返却値型として使用する『依存』とは区別する。

#### ▼ Association の種類

保持される側のクラスのインスタンスが、状態として保持する側のクラスによって作成されるか否かによって、『Aggregation』または『Composition』に分類できる。

<br>

### Aggregation (集約)

#### ▼ Aggregation とは

保持される側のクラスのインスタンスが、保持する側のクラスのインスタンスによって作成されずに外側から渡されるとき、クラス間が『Aggregation』の関係にある。

#### ▼ 例

![aggregation_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aggregation_example.png)

User は UserName を状態として保持する。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct {
    	name *valueobject.UserName // 状態として保持
    }

    func NewUser(name *valueobject.UserName) *User {
    	return &User{name: name}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      readonly name: UserName;
    }
    export function createUser(name: UserName): User {
      return {name};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        private UserName $name; // 状態として保持

        public function __construct(UserName $name)
        {
            $this->name = $name;
        }
    }

    ```

また、UserName クラスのインスタンスは、User クラスによって作成されずに外側から渡される。

そのため、User クラスと UserName クラスは『Aggregation』の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    name := NewUserName()
    user := NewUser(name) // 集約の関係
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const name = createUserName();
    const user = createUser(name); // 集約の関係
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $name = new UserName();
    $user = new User($name); // 集約の関係
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    import "app/domain/car/entity"

    type Car struct {
    	tire1 *entity.Tire1

    	tire2 *entity.Tire2

    	tire3 *entity.Tire3

    	tire4 *entity.Tire4
    }

    func NewCar(t1 *entity.Tire1, t2 *entity.Tire2, t3 *entity.Tire3, t4 *entity.Tire4) *Car {
    	// Tire構造体のインスタンスを状態として保持
    	return &Car{
    		tire1: t1,
    		tire2: t2,
    		tire3: t3,
    		tire4: t4,
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {Tire1, Tire2, Tire3, Tire4} from "~/domain/car/entity";

    interface Car {
      readonly tire1: Tire1;

      readonly tire2: Tire2;

      readonly tire3: Tire3;

      readonly tire4: Tire4;
    }
    function createCar(t1: Tire1, t2: Tire2, t3: Tire3, t4: Tire4): Car {
      // Tireオブジェクトを状態として保持

      return {
        tire1: t1,
        tire2: t2,
        tire3: t3,
        tire4: t4,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    use App\Domain\Car\Entity\Tire1;
    use App\Domain\Car\Entity\Tire2;
    use App\Domain\Car\Entity\Tire3;
    use App\Domain\Car\Entity\Tire4;

    class Car
    {
        private Tire1 $tire1;

        private Tire2 $tire2;

        private Tire3 $tire3;

        private Tire4 $tire4;

        public function __construct(Tire1 $t1, Tire2 $t2, Tire3 $t3, Tire4 $t4)
        {
            // Tireクラスのインスタンスを状態として保持
            $this->tire1 = $t1;
            $this->tire2 = $t2;
            $this->tire3 = $t3;
            $this->tire4 = $t4;
        }
    }
    ```

また、Tire クラスのインスタンスは、Car クラスによって作成されずに外側から渡される。

そのため、Car クラスと Tire クラスは『Aggregation』の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    // Tire構造体をインスタンス化
    tire1 := NewTire1()
    tire2 := NewTire2()
    tire3 := NewTire3()
    tire4 := NewTire4()

    // Tire構造体のインスタンスの作成、Carによって制限されない。
    car := NewCar(tire1, tire2, tire3, tire4)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // Tireオブジェクトを生成
    const tire1 = createTire1();
    const tire2 = createTire2();
    const tire3 = createTire3();
    const tire4 = createTire4();

    // Tireオブジェクトの作成、Carによって制限されない。
    const car = createCar(tire1, tire2, tire3, tire4);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // Tireクラスをインスタンス化
    $tire1 = new Tire1();
    $tire2 = new Tire2();
    $tire3 = new Tire3();
    $tire4 = new Tire4();

    // Tireクラスのインスタンスの作成、Carによって制限されない。
    $car = new Car($tire1, $tire2, $tire3, $tire4);
    ```

<br>

### Composition (合成)

#### ▼ Composition とは

保持される側のクラスのインスタンスが、保持する側のクラスのインスタンスによって作成されるとき、クラス間が『Composition』の関係にある。

#### ▼ 例

![composition_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/composition_example.png)

User クラスは UserName クラスを状態として保持する。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct {
    	name *valueobject.UserName // 状態として保持
    }

    func (u *User) Method() string {
    	u.name = valueobject.NewUserName() // 合成の関係

    	return "Hello! " + u.name.GetName()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName, createUserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      method(): string;
    }
    export function createUser(): User {
      const state: {name?: UserName} = {name: undefined};

      // 状態として保持
      function method(): string {
        state.name = createUserName(); // 合成の関係

        return "Hello! " + state.name.getName();
      }
      return {method};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        private UserName $name; // 状態として保持

        public function method(): string
        {
            $this->name = new UserName(); // 合成の関係

            return "Hello! " . $this->name->getName();
        }
    }

    ```

また、UserName インスタンスは、User クラスによって作成される。

そのため、User クラスと UserName クラスは『Composition』の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    user := &User{}
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = createUser();
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $user = new User();
    ```

Car クラスは Lock クラスを状態として保持する。

=== "Go"

    ```go title="Go の場合の実装例"
    type Car struct {
    	lock *Lock
    }

    func NewCar() *Car {
    	// Lock構造体のインスタンスを状態として保持。
    	return &Car{lock: NewLock()}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Car {
      readonly lock: Lock;
    }
    function createCar(): Car {
      // Lockオブジェクトを状態として保持。

      return {lock: createLock()};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class Car
    {
        private Lock $lock;

        public function __construct()
        {
            // Lockクラスのインスタンスを状態として保持。
            $this->lock = new Lock();
        }
    }
    ```

また、Lock クラスのインスタンスは、Car クラスによって作成される。

そのため、Car クラスと Lock クラスは『Composition』の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    // Car構造体のインスタンスの中で、Lock構造体がインスタンス化される。
    car := NewCar()
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // Carオブジェクトの中で、Lockオブジェクトが生成される。
    const car = createCar();
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // Carクラスのインスタンスの中で、Lockクラスがインスタンス化される。
    $car = new Car();
    ```

<br>

## 02. is-a-kind-of (グループとメンバーの関係性)

### is-a-kind-of な関係性とは

クラスがほかのクラスの性質を継承する、またはその振る舞いを実装する関係性のことで、Generalization と Realization に分類できる。

![グループとメンバーの関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループとメンバーの関係性.png)

<br>

### Generalization (汎化)

#### ▼ 汎化における Override

汎化のとき、子クラスで関数の処理内容を再び実装すると、処理内容は上書きされる。

=== "Go"

    ```go title="Go の場合の実装例"
    import "fmt"

    // 親クラスに相当する構造体
    type Goods struct {
    	// 商品名データ
    	name string

    	// 商品価格データ
    	price int
    }

    // コンストラクタ。商品名と商品価格を設定する
    func NewGoods(name string, price int) *Goods {
    	return &Goods{
    		name:  name,
    		price: price,
    	}
    }

    // ★★★★★★注目★★★★★★
    // 商品名と価格を表示する関数
    func (g *Goods) PrintPrice() {
    	fmt.Printf("%sの価格: ￥%d<br>", g.name, g.price)
    }

    // 商品名のゲッター
    func (g *Goods) GetName() string {
    	return g.name
    }

    // 商品価格のゲッター
    func (g *Goods) GetPrice() int {
    	return g.price
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 共通の処理を提供するオブジェクト

    interface Goods {
      printPrice(): void;
      getName(): string;
      getPrice(): number;
    }
    function createGoods(name: string, price: number): Goods {
      // ★★★★★★注目★★★★★★
      // 商品名と価格を表示する関数
      function printPrice(): void {
        console.log(name + "の価格: ￥" + price + "<br>");
      }
      // 商品名のゲッター
      function getName(): string {
        return name;
      }
      // 商品価格のゲッター
      function getPrice(): number {
        return price;
      }
      return {printPrice, getName, getPrice};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 親クラス
    class Goods
    {
        // 商品名データ
        private string $name = "";

        // 商品価格データ
        private int $price = 0;

        // コンストラクタ。商品名と商品価格を設定する
        public function __construct(string $name, int $price)
        {
            $this->name = $name;
            $this->price = $price;
        }

        // ★★★★★★注目★★★★★★
        // 商品名と価格を表示する関数
        public function printPrice(): void
        {
            print($this->name."の価格: ￥".$this->price."<br>");
        }

        // 商品名のゲッター
        public function getName(): string
        {
            return $this->name;
        }

        // 商品価格のゲッター
        public function getPrice(): int
        {
            return $this->price;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    import (
    	"fmt"
    	"math"
    )

    // 子クラスに相当する構造体
    type GoodsWithTax struct {
    	*Goods
    }

    // ★★★★★★注目★★★★★★
    // printPrice関数をOverride
    func (g *GoodsWithTax) PrintPrice() {
    	// 商品価格の税込み価格を計算し、表示
    	priceWithTax := math.Round(float64(g.GetPrice()) * 1.08)     // (1)
    	fmt.Printf("%sの税込み価格: ￥%.0f<br>", g.GetName(), priceWithTax) // (2)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 共通の処理を持つオブジェクトに、税込み表示の関数を組み合わせる
    interface GoodsWithTax extends Goods {}

    function createGoodsWithTax(name: string, price: number): GoodsWithTax {
      const goods = createGoods(name, price);
      return {
        ...goods,
        printPrice() {
          const priceWithTax = Math.round(goods.getPrice() * 1.08);
          console.log(goods.getName() + "の税込み価格: ￥" + priceWithTax + "<br>");
        },
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 子クラス
    class GoodsWithTax extends Goods
    {
        // ★★★★★★注目★★★★★★
        // printPrice関数をOverride
        public function printPrice(): void
        {
            // 商品価格の税込み価格を計算し、表示
            $priceWithTax = round($this->getPrice() * 1.08);  // (1)
            print($this->getName()."の税込み価格: ￥".$priceWithTax."<br>");  // (2)
        }
    }
    ```

#### ▼ 抽象クラス

ビジネスロジックとして使用する。

多重継承できない。

以下の条件の社員オブジェクトを実装したいとする。

1. 午前９時に出社

2. 営業部・開発部・総務部があり、それぞれが異なる仕事を担当する

3. 午後６時に退社

このとき、『働く関数』は部署ごとに異なってしまうが、どう実装したらよいのか…

![抽象クラスと抽象関数-1](https://user-images.githubusercontent.com/42175286/59590447-12ff8b00-9127-11e9-802e-126279fcb0b1.PNG)

これを解決するために、例えば、次の 2 つの実装方法が考えられる。

1. 営業部社員オブジェクト、開発部社員オブジェクト、総務部社員オブジェクトを別々に実装

    ⇒ メリット：ほかの部署のオブジェクトに影響を与えない。

    ⇒ デメリット：各社員オブジェクトで共通の処理を個別に実装しなければならない。

    共通の処理が同じコードで書かれる保証がない。

2. `1` 個の社員オブジェクトのなかで、働く関数に部署ごとで変化する引数を設定

    ⇒ メリット：全部署の社員を `1` 個のオブジェクトで呼び出せる。

    ⇒ デメリット：`1` 個の修正が、全部署の社員の処理に影響を与えてしまう。

抽象オブジェクトと抽象関数を使用すると、`2` 個のメリットを生かしつつ、デメリットを解決可能。

![抽象クラスと抽象関数-2](https://user-images.githubusercontent.com/42175286/59590387-e8adcd80-9126-11e9-87b3-7659468af2f6.PNG)

=== "Go"

    ```go title="Go の場合の実装例"
    import (
    	"fmt"
    	"time"
    )

    // 定数の定義
    const (
    	TimeToArrive = "09:00:00"
    	TimeToLeave  = "18:00:00"
    )

    // 抽象クラスに相当するインターフェース。型として提供したいものを定義する。
    type ShainManagement interface {
    	// 抽象関数。
    	// 処理内容を子クラスに相当する構造体でOverrideしなければならない。
    	ToWork()
    	ToArrive() string
    	ToLeave() string
    }

    // 具象関数を持つ構造体。子クラスに相当する構造体に埋め込む。
    type BaseShainManagement struct{}

    // 具象関数。出勤時刻を表示。もし遅刻していたら、代わりに差分を表示。
    // 子クラスに相当する構造体へ、埋め込みによってそのまま引き継がれる。子クラスに相当する構造体でオーバーライドしなくても良い。
    func (b *BaseShainManagement) ToArrive() string {
    	nowTime := time.Now()
    	arriveTime := todayAt(nowTime, TimeToArrive)

    	// 出社時間より遅かった場合、遅刻と表示する。
    	if nowTime.After(arriveTime) {
    		return fmt.Sprintf(
    			"%s の遅刻です。",
    			formatDuration(nowTime.Sub(arriveTime)),
    		)
    	}

    	return fmt.Sprintf(
    		"%s に出勤しました。",
    		nowTime.Format("15時04分05秒"),
    	)
    }

    // 具象関数。退社時間と残業時間を表示。
    // 子クラスに相当する構造体へ、埋め込みによってそのまま引き継がれる。子クラスに相当する構造体でオーバーライドしなくても良い。
    func (b *BaseShainManagement) ToLeave() string {
    	nowTime := time.Now()

    	return fmt.Sprintf(
    		"%sに退社しました。%s の残業です。",
    		nowTime.Format("15時04分05秒"),
    		formatDuration(nowTime.Sub(todayAt(nowTime, TimeToLeave))),
    	)
    }

    // 本日の指定時刻を返却する
    func todayAt(nowTime time.Time, clock string) time.Time {
    	t, _ := time.ParseInLocation(time.DateTime, nowTime.Format(time.DateOnly)+" "+clock, nowTime.Location())
    	return t
    }

    // 時間の差分を「H時i分s秒」の形式にする
    func formatDuration(d time.Duration) string {
    	return time.Time{}.Add(d).Format("15時04分05秒")
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // インターフェースとコールバックで共通処理と業務固有の処理を分ける。
    // 定数の定義
    const SHAINMANAGEMENT_TIME_TO_ARRIVE = "09:00:00";

    const SHAINMANAGEMENT_TIME_TO_LEAVE = "18:00:00";
    interface ShainManagement {
      toWork(): void;
      toArrive(): string;
      toLeave(): string;
    }
    function createShainManagement(toWork: () => void): ShainManagement {
      // 具象関数。出勤時刻を表示。もし遅刻していたら、代わりに差分を表示。
      // 生成するオブジェクトに共通の処理として組み込む。
      function toArrive(): string {
        const nowTime = new Date();
        const arriveTime = todayAt(SHAINMANAGEMENT_TIME_TO_ARRIVE);

        // 出社時間より遅かった場合、遅刻と表示する。
        if (nowTime > arriveTime) {
          return `${formatDuration(nowTime.getTime() - arriveTime.getTime())} の遅刻です。`;
        }

        return `${formatTime(nowTime)} に出勤しました。`;
      }
      // 具象関数。退社時間と残業時間を表示。
      // 生成するオブジェクトに共通の処理として組み込む。
      function toLeave(): string {
        const nowTime = new Date();
        const leaveTime = todayAt(SHAINMANAGEMENT_TIME_TO_LEAVE);

        return `${formatTime(nowTime)}に退社しました。${formatDuration(nowTime.getTime() - leaveTime.getTime())} の残業です。`;
      }
      return {toWork, toArrive, toLeave};
    }

    // 本日の指定時刻を返却する
    function todayAt(clock: string): Date {
      const [hours, minutes, seconds] = clock.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }

    // 時刻を「H時i分s秒」の形式にする
    function formatTime(date: Date): string {
      const pad = (n: number): string => String(n).padStart(2, "0");
      return `${pad(date.getHours())}時${pad(date.getMinutes())}分${pad(date.getSeconds())}秒`;
    }

    // 時間の差分を「H時i分s秒」の形式にする
    function formatDuration(milliseconds: number): string {
      const date = new Date(0);
      date.setHours(0, 0, 0, milliseconds);
      return formatTime(date);
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 抽象クラス。型として提供したいものを定義する。
    abstract class ShainManagement
    {
        // 定数の定義
        const TIME_TO_ARRIVE = "09:00:00";
        const TIME_TO_LEAVE = "18:00:00";

        // 抽象関数。
        // 処理内容を子クラスでOverrideしなければならない。
        abstract function toWork(): void;

        // 具象関数。出勤時刻を表示。もし遅刻していたら、代わりに差分を表示。
        // 子クラスへそのまま継承される。子クラスでオーバーライドしなくても良い。
        public function toArrive(): string
        {
            $nowTime = strtotime( date("H:i:s") );

            // 出社時間より遅かった場合、遅刻と表示する。
            if($nowTime > strtotime(self::TIME_TO_ARRIVE)){

                return sprintf(
                    "%s の遅刻です。",
                    date("H時i分s秒", $nowTime - strtotime(self::TIME_TO_ARRIVE))
                );
            }

            return sprintf(
                "%s に出勤しました。",
                date("H時i分s秒", $nowTime)
            );

        }

        // 具象関数。退社時間と残業時間を表示。
        // 子クラスへそのまま継承される。子クラスでオーバーライドしなくても良い。
        public function toLeave(): string
        {
            $nowTime = strtotime( date("H:i:s") );

            return sprintf(
                "%sに退社しました。%s の残業です。",
                date("H時i分s秒", $nowTime),
                date("H時i分s秒", $nowTime - strtotime(self::TIME_TO_LEAVE))
            );
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // 子クラスに相当する構造体
    type EngineerShainManagement struct {
    	BaseShainManagement
    }

    // 鋳型となった抽象クラスに相当するインターフェースの関数は実装しなければならない。
    func (e *EngineerShainManagement) ToWork() {
    	// 処理内容
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 業務固有の関数を共通の生成関数へ渡す
    function createEngineerShainManagement(): ShainManagement {
      return createShainManagement(() => {
        // エンジニアの業務処理
      });
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 子クラス
    class EngineerShainManagement extends ShainManagement
    {
        // 鋳型となった抽象クラスの抽象関数はOverrideしなければならない。
        public function toWork(): void
        {
            // 処理内容
        }
    }
    ```

プリウスと各世代プリウスが、抽象クラスと子クラスの関係にある。

![抽象クラス](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/抽象クラス.png)

<br>

### Realization (実現)

#### ▼ Realization とは

実装クラスが正常に動作するために最低限必要な関数の実装を強制する。

これによって、必ず実装クラスを正常に働かせられる。

オープンソースのパッケージは、ユーザーが実装クラスを自身で追加実装することも考慮して、Realization を使用している。

各車は、モーター機能を必ず持っていなければ、正常に働けない。

そこで、モーター機能に最低限必要な関数の実装を強制する。

![インターフェースとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/インターフェースとは.png)

実装クラスに処理内容を記述しなければならない。

つまり、抽象クラスに関数の型のみ定義した場合と同じである。

多重継承できる。

![子インターフェースの多重継承_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/子インターフェースの多重継承_2.png)

=== "Go"

    ```go title="Go の場合の実装例"
    type Animal interface {
    	// インターフェイスでは、実装を伴う関数や状態の宣言はできない
    	Eat()
    	Sleep()
    	Mating()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Animal {
      // インターフェースは型を定義する。関数の実装や値の初期化は行わない
      eat(): void;
      sleep(): void;
      mating(): void;
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    interface Animal
    {
        // インターフェイスでは、実装を伴う関数や状態の宣言はできない
        public function eat(): void;
        public function sleep(): void;
        public function mating(): void;
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // 実装クラスに相当する構造体が正常に動作するために最低限必要な関数の実装を強制する。
    var _ Animal = (*Mammal)(nil)

    type Mammal struct{}

    func (m *Mammal) Eat() {
    	// 食べる
    }

    func (m *Mammal) Sleep() {
    	// 眠る
    }

    func (m *Mammal) Mating() {
    	// 交尾する
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Mammal extends Animal {
      eat(): void;
      sleep(): void;
      mating(): void;
    }
    function createMammal(): Mammal {
      // Animalの契約を満たす関数を実装する。
      function eat(): void {
        // 食べる
      }

      function sleep(): void {
        // 眠る
      }

      function mating(): void {
        // 交尾する
      }
      return {eat, sleep, mating};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class Mammal implements Animal
    {
        // 実装クラスが正常に動作するために最低限必要な関数の実装を強制する。
        public function eat(): void
        {
            // 食べる
        }

        public function sleep(): void
        {
            // 眠る
        }

        public function mating(): void
        {
            // 交尾する
        }
    }
    ```

<br>

### 通常クラス、抽象クラス、インターフェースの違い

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:left">通常クラス</th>
      <th style="text-align:left">抽象クラス</th>
      <th style="text-align:left">インターフェース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>役割</strong></td>
      <td style="text-align:left">専用処理の部品化</td>
      <td style="text-align:left">通常クラスの共通処理の部品化</td>
      <td style="text-align:left">・通常クラスのクラス型を定義する。<br>・実装クラスが正常に動作するために最低限必要な関数の実装を強制する。</td>
    </tr>
    <tr>
      <td><strong>子クラスでの継承先数</strong></td>
      <td style="text-align:left">単一継承</td>
      <td style="text-align:left">単一継承</td>
      <td style="text-align:left">単一継承｜多重継承</td>
    </tr>
    <tr>
      <td><strong>メンバ変数のコール</strong></td>
      <td style="text-align:left">自身と継承先</td>
      <td style="text-align:left">継承先のみ</td>
      <td style="text-align:left">実装先のみ</td>
    </tr>
    <tr>
      <td><strong>定数の定義</strong></td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">⭕️</td>
    </tr>
    <tr>
      <td><strong>抽象関数の定義</strong></td>
      <td style="text-align:left">✕</td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">⭕️ (abstract は省略)</td>
    </tr>
    <tr>
      <td><strong>具象関数の定義</strong></td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">✕</td>
    </tr>
    <tr>
      <td><strong><code>construct()</code> 関数 の定義</strong></td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">⭕️</td>
      <td style="text-align:left">✕</td>
    </tr>
  </tbody>
</table>

1. 種々の車クラスに共通する処理を持つ抽象クラスとして、Car クラスを作成。

2. 各車は、エンジン機能を必ず持っていなければ、正常に働けない。

    そこで、抽象関数によって、エンジン機能に最低限必要な関数の実装を強制する。

    ![インターフェースと抽象クラスの使い分け](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/インターフェースと抽象クラスの使い分け.png)

<br>

## 02-02. 継承

### 継承によるクラスチェーン

#### ▼ クラスチェーンとは

クラスからデータや関数をコールしたとき、そのクラスにこれらが存在しなければ、継承元まで参照しにいく仕組みを『クラスチェーン』という。

類似するものとして、JavaScript のプロトタイプチェーンがある。

=== "Go"

    ```go title="Go の場合の実装例"
    // 継承元クラスに相当する構造体
    type Foo struct {
    	value1 any
    }

    func (f *Foo) GetValue() any {
    	return f.value1
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 共通の処理を提供するオブジェクト

    interface Foo {
      getValue(): unknown;
    }
    function createFoo(): Foo {
      const state: {value1: unknown} = {value1: null};

      function getValue(): unknown {
        return state.value1;
      }
      return {getValue};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 継承元クラス
    class Foo
    {
        private mixed $value1 = null;

        public function getValue(): mixed
        {
            return $this->value1;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // 継承先クラスに相当する構造体
    type SubFoo struct {
    	Foo
    	SubValue any
    }

    func (s *SubFoo) GetSubValue() any {
    	return s.SubValue
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 共通のオブジェクトを合成する
    interface SubFoo extends Foo {
      subValue: unknown;
      getSubValue(): unknown;
    }

    function createSubFoo(): SubFoo {
      const foo = createFoo();
      let subValue: unknown = null;
      return {
        ...foo,
        get subValue() {
          return subValue;
        },
        set subValue(value: unknown) {
          subValue = value;
        },
        getSubValue: () => subValue,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // 継承先クラス
    class SubFoo extends Foo
    {
        public mixed $subValue = null;

        public function getSubValue(): mixed
        {
            return $this->subValue;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    subFoo := &SubFoo{}

    // SubFoo構造体にはGetValue()は無い。
    // 埋め込んだFoo構造体まで辿り、Foo構造体から関数がコールされる (クラスチェーンに相当する) 。
    fmt.Println(subFoo.GetValue())
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const subFoo = createSubFoo();

    // createFooで作った関数を、合成したオブジェクトから呼び出す
    console.log(subFoo.getValue());
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $subFoo = new SubFoo;

    // SubFooクラスにはgetValue()は無い。
    // 継承元まで辿り、Fooクラスから関数がコールされる (クラスチェーン) 。
    echo $subFoo->getValue();
    ```

<br>

### 継承元の関数を参照

=== "Go"

    ```go title="Go の場合の実装例"
    type Foo struct{}

    func (f *Foo) Foo() {
    	// 処理内容;
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Foo {
      foo(): void;
    }
    function createFoo(): Foo {
      function foo(): void {
        // 処理内容;
      }
      return {foo};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    abstract class Foo
    {
        public function foo(): void
        {
            // 処理内容;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type SubFoo struct {
    	Foo
    }

    func (s *SubFoo) SubFoo() {
    	// 継承元の関数を参照。
    	s.Foo.Foo()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface SubFoo extends Foo {
      subFoo(): void;
    }

    function createSubFoo(): SubFoo {
      const base = createFoo();
      return {
        ...base,
        subFoo() {
          // 共通の関数を明示的に呼び出す
          base.foo();
        },
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class SubFoo extends Foo
    {
        public function subFoo(): void
        {
            // 継承元の関数を参照。
            parent::foo();
        }
    }
    ```

<br>

## 02-03. 委譲

### 委譲による関数コール

#### ▼ 委譲とは

処理の一部またはすべてを他のクラスに託すこと。

PHP では、集約や合成の関係性を作り、委譲元クラスの関数で委譲先クラスの関数をコールして、処理を追加実装することに相当する。

他に、インターフェースによる Realization の関係性でも実現できる。

#### ▼ 継承よりも優れた点

> - [オブジェクト指向言語としてGoをやろうとするとハマる点を整理してみる #Go - Qiita](https://qiita.com/sonatard/items/2b4b70694fd680f6297c#3-%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82%E4%BD%95%E6%95%85go%E3%81%AF%E7%B6%99%E6%89%BF%E3%82%92%E5%BB%83%E6%AD%A2%E3%81%97%E3%81%A6%E5%A7%94%E8%AD%B2%E3%82%92%E6%8E%A8%E5%A5%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%AE%E3%81%8B)

<br>

## 03. use (引数型/返却値型として使用する関係性)

### use な関係とは

> - [【IT技術の知見】オブジェクト指向設計＠アーキテクチャ - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_object_orientation_design.html)

<br>

### Dependency (依存)

#### ▼ Dependency とは

![引数型または返却値型として使用する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/引数型または返却値型として使用する関係性.png)

クラス A がクラス B を引数型/返却値型として使用する関係性のこと。

> - https://stackoverflow.com/questions/1230889/difference-between-association-and-dependency
> - https://stackoverflow.com/questions/41765798/difference-between-aggregation-and-dependency-injection

#### ▼ 例

![dependency_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dependency_example.png)

User は UserName を引数として使用する。

User は UserName に依存している。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct{}

    func (u *User) Method(name *valueobject.UserName) string { // 依存の関係
    	return "Hello! " + name.GetName()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      method(name: UserName): string;
    }
    export function createUser(): User {
      function method(name: UserName): string {
        // 依存の関係
        return "Hello! " + name.getName();
      }
      return {method};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        public function method(UserName $name): string // 依存の関係
        {
            return "Hello! " . $name->getName();
        }
    }
    ```

<br>

### DI：Dependency Injection (依存オブジェクト注入)

#### ▼ DI とは

サプライヤー側 (依存先) の『インスタンス』を、クライアント側のインスタンスの外部から『引数として』注入する実装方法。

『依存性注入』と訳すのは混乱を招くため、『依存オブジェクト注入』と訳すようにする。

> - [Dependency injection - Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection#Types_of_dependency_injection)
> - [Dependency Injectionを「依存性の注入」と訳すのは非常に悪い誤訳 - little hands' lab](https://little-hands.hatenablog.com/entry/2018/05/27/dependency-injection)

#### ▼ コンストラクタインジェクションとは

関数のなかでも特に、`construct()` 関数 の引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側を状態として保持させ、Aggregation の関係性を作れる。

コンストラクタインジェクションのみが、`construct()` 関数 によって、インスタンス作成のために依存関係の要件を強制できる。

また、セッターを完全になくした場合、インスタンス作成後にオブジェクトの状態を変更できなくなる。

そのため、ビジネス上ありえないオブジェクトを作成できなくなり、インジェクションのなかで、ソフトウェアの安全性の観点でもっとも優れている。

依存先の Supplier クラスを、`construct()` 関数の引数として、Client クラスに注入する。

=== "Go"

    ```go title="Go の場合の実装例"
    supplier := NewSupplier()

    // 依存されるSupplier構造体をClient構造体に注入
    client := NewClient(supplier)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const supplier = createSupplier();

    // 依存されるSupplierオブジェクトをClientオブジェクトに注入
    const client = createClient(supplier);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $supplier = new Supplier();

    // 依存されるSupplierクラスをClientクラスに注入
    $client = new Client($supplier);
    ```

依存先の UserName クラスを、`construct()` 関数の引数として、User クラスに注入する。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct {
    	name *valueobject.UserName
    }

    func NewUser(name *valueobject.UserName) *User {
    	return &User{name: name}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      readonly name: UserName;
    }
    export function createUser(name: UserName): User {
      return {name};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        private UserName $name;

        public function __construct(UserName $name)
        {
            $this->name = $name;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    name := NewUserName()
    user := NewUser(name) // インジェクション
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const name = createUserName();
    const user = createUser(name); // インジェクション
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $name = new UserName();
    $user = new User($name); // インジェクション
    ```

#### ▼ セッターインジェクションとは

関数のなかでも特に、セッターの引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側を状態として保持させ、Aggregation の関係性を作れる。

依存先の Supplier クラスを、セッターの引数として、Client クラスに注入する。

=== "Go"

    ```go title="Go の場合の実装例"
    supplier := NewSupplier()
    client := NewClient()

    // Client構造体はSupplier構造体に依存している。
    client.SetSupplier(supplier)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const supplier = createSupplier();
    const client = createClient();

    // ClientオブジェクトはSupplierオブジェクトに依存している。
    client.setSupplier(supplier);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $supplier = new Supplier();
    $client = new Client();

    // ClientクラスはSupplierクラスに依存している。
    $client->setSupplier($supplier);
    ```

依存先の UserName クラスを、セッターの引数として、User クラスに注入する。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct {
    	name *valueobject.UserName
    }

    func (u *User) SetUserName(name *valueobject.UserName) {
    	u.name = name
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      setUserName(name: UserName): void;
    }
    export function createUser(): User {
      const state: {name?: UserName} = {name: undefined};

      function setUserName(name: UserName): void {
        state.name = name;
      }
      return {setUserName};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        private UserName $name;

        public function setUserName(UserName $name): void
        {
            $this->name = $name;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    user := &User{}
    name := NewUserName()
    user.SetUserName(name) // インジェクション
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = createUser();
    const name = createUserName();
    user.setUserName(name); // インジェクション
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $user = new User();
    $name = new UserName();
    $user->setUserName($name); // インジェクション
    ```

#### ▼ 関数インジェクションとは

上記 2 つ以外の関数の引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側を状態として保持せず、読み込んで関数を使用する。

依存先の UserName クラスを、関数の引数として、User クラスに注入する。

=== "Go"

    ```go title="Go の場合の実装例"
    package entity

    import "app/domain/user/valueobject"

    type User struct{}

    func (u *User) Method(name *valueobject.UserName) {
    	_ = name.GetName()

    	// 何らかの処理
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserName} from "~/domain/user/valueObject/UserName";

    export interface User {
      method(name: UserName): void;
    }
    export function createUser(): User {
      function method(name: UserName): void {
        const userName = name.getName();

        // 何らかの処理
      }
      return {method};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    namespace App\Domain\User\Entity;

    use App\Domain\User\ValueObject\UserName;

    final class User
    {
        public function method(UserName $name): void
        {
            $userName = $name->getName();

            // 何らかの処理
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    user := &User{}
    name := NewUserName()
    user.Method(name) // インジェクション
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const user = createUser();
    const name = createUserName();
    user.method(name); // インジェクション
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $user = new User();
    $name = new UserName();
    $user->method($name); // インジェクション
    ```

<br>

### DI Container (依存オブジェクト注入コンテナ) 、Service Container

#### ▼ DI Container (依存オブジェクト注入コンテナ) 、Service Container とは

依存オブジェクト注入の責務に特化したデザインパターンを『Service Container』という。

あらかじめクラスを登録 (バインド) しておき、必要なときにインスタンスを作成 (リゾルブ) してくれる。

DI コンテナを使用した場合 (PHP では Pimple パッケージ)

=== "Go"

    ```go title="Go の場合の実装例"
    import (
    	"app/domain/user/entity"
    	"app/domain/user/valueobject"
    )

    type Container struct {
    	factories map[string]func(container *Container) any
    	instances map[string]any
    }

    func NewContainer() *Container {
    	c := &Container{
    		factories: map[string]func(container *Container) any{},
    		instances: map[string]any{},
    	}

    	// UserName構造体の準備
    	c.factories["user_name"] = func(container *Container) any {
    		return valueobject.NewUserName("Hiroki")
    	}

    	// User構造体にUserName構造体を注入
    	c.factories["user"] = func(container *Container) any {
    		return entity.NewUser(container.Get("user_name").(*valueobject.UserName))
    	}

    	return c
    }

    func (c *Container) Get(id string) any {
    	if _, ok := c.instances[id]; !ok {
    		c.instances[id] = c.factories[id](c)
    	}

    	return c.instances[id]
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {createUser} from "~/domain/user/entity/User";
    import {UserName, createUserName} from "~/domain/user/valueObject/UserName";

    type Factory = (container: Container) => unknown;

    export interface Container {
      get<T>(id: string): T;
    }

    export function createContainer(): Container {
      const factories = new Map<string, Factory>();
      const instances = new Map<string, unknown>();
      const container: Container = {
        get<T>(id: string): T {
          if (!instances.has(id)) {
            const factory = factories.get(id);
            if (!factory) throw new Error(`Factory not found: ${id}`);
            instances.set(id, factory(container));
          }
          return instances.get(id) as T;
        },
      };

      factories.set("user_name", () => createUserName("Hiroki"));
      factories.set("user", (container) =>
        createUser(container.get<UserName>("user_name")),
      );
      return container;
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    use Pimple\Container as PimpleContainer;
    use App\Domain\User\Entity\User;
    use App\Domain\User\ValueObject\UserName;

    class Container extends PimpleContainer
    {
        public function __construct()
        {
            parent::__construct();

            // UserNameクラスの準備
            $this["user_name"] = function (PimpleContainer $container): UserName {
                return new UserName("Hiroki");
            };

            // UserクラスにUserNameクラスを注入
            $this["user"] = function (PimpleContainer $container): User {
                return new User($container["user_name"]);
            };
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    package autoload

    // autoload.go で、IoCコンテナ自体のインスタンスを事前に作成。
    var Container = NewContainer()
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // autoload.ts で、IoCコンテナ自体のインスタンスを事前に作成。
    export const container = createContainer();
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // autoload.php で、IoCコンテナ自体のインスタンスを事前に作成。
    $container = new Container();
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // IoCコンテナの読み出し
    import "app/autoload"

    func main() {
    	// 登録名を宣言してインスタンスを作成。
    	user := autoload.Container.Get("user")
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // IoCコンテナの読み出し
    import {container} from "./autoload";
    import {User} from "~/domain/user/entity/User";

    // 戻り値の型を指定してオブジェクトを取得する。
    const user = container.get<User>("user");
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // IoCコンテナの読み出し
    require_once __DIR__ . "/autoload.php";

    // クラス名を宣言してインスタンスを作成。
    $user = $container["user"];
    ```

#### ▼ Service Locator パターン

Service Locator パターンはアンチパターンである。

インスタンスへのコンテナ渡しのファイルを実装せず、コンテナ自体を注入してしまう誤った実装方法。

=== "Go"

    ```go title="Go の場合の実装例"
    type Sample struct {
    	logger       any
    	notification any
    }

    func NewSample(container map[string]any) *Sample {
    	return &Sample{
    		logger:       container["foo.logger"],
    		notification: container["bar.notification"],
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Sample {
      readonly logger: unknown;

      readonly notification: unknown;
    }
    function createSample(container: Record<string, unknown>): Sample {
      return {
        logger: container["foo.logger"],
        notification: container["bar.notification"],
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class Sample
    {
        private mixed $logger;
        private mixed $notification;

        public function __construct(mixed $container)
        {
            $this->logger            = $container["foo.logger"];
            $this->notification      = $container["bar.notification"];
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    // IoCコンテナ自体をインジェクションしてしまうと、不要なインスタンスにも依存してしまう。
    sample := NewSample(container)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const sample = createSample({
      "foo.logger": logger,
      "bar.notification": notification,
    });
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    // IoCコンテナ自体をインジェクションしてしまうと、不要なインスタンスにも依存してしまう。
    $sample = new Sample($container);
    ```

<br>

## 03-02. Dependency Inversion Principle (依存性逆転の原則)

### DIP

#### ▼ DIP とは

インターフェースに依存するように実装する。

『逆転』とは、インターフェースを使用した場合、より下位層の実装クラスが上位層のインターフェイスに依存していることを指して言う。

`2` 個の原則からなる。

#### ▼ 原則 1

上位レイヤーは下位レイヤーに依存してはならない。

どちらのレイヤーも『抽象』に依存すべきである。

#### ▼ 原則 2

『抽象』は『実装』に依存してはならない。

『実装』が『抽象』に依存すべきである。

<br>

### DIP を満たす実装

#### ▼ DIP を満たさない実装の場合 (従来)

より上位レイヤーにコール処理を配置し、下位レイヤーでコールされる側を定義する。

これによって、上位レイヤーのクラスは下位レイヤーのクラスへ依存する関係性になる。

![DIPに基づかない設計の場合](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DIPに基づかない設計の場合.png)

#### ▼ DIP を満たす実装の場合

インターフェース (または抽象クラス) で抽象関数を記述することによって、実装クラスでの実装が強制される。

つまり、実装クラスは抽象クラスに依存している。

より上位レイヤーにインターフェースを配置することで、下位レイヤーのクラスが上位レイヤーのクラスに依存するような逆転関係を作れる (原則２)。

原則２でいう依存は、引数型/返却値型として使用する関係性の文脈でいう『依存』ではないことに注意する。

また、実装クラスをインターフェースのエイリアスとしてコールできるようにすると、実装クラスに依存するレイヤーは代わりにインターフェースへ依存することになる。

よって、すべてのレイヤーがインターフェースに依存する (原則 1)。

> - https://speakerdeck.com/hiroki_hasegawa/domeinqu-dong-she-ji-falseakitekutiyabian-qian-toyi-cun-xing-ni-zhuan-falseyuan-ze

![DIPに基づく設計の場合](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DIPに基づく設計の場合.png)

#### ▼ DIP に基づくドメイン駆動設計の場合

1. Repository クラスにインターフェースと実装クラスを用意する。これにより、原則２を満たす。

2. Repository のインターフェース (抽象クラス) を、より上位のドメイン層に配置する。また、Repository の実装クラスを、より下位のインフラストラクチャ層に配置する。

3. 両方のクラスに対して、バインディング (紐付け) を行い、インターフェース (抽象クラス) をコールしたときに、実際には実装クラスがコールされるようにする。

4. 2 と 3 により、インフラストラクチャ層とユースケース層の両方は、ドメイン層のインターフェース (抽象クラス) に依存する。これは原則 1 を満たす。

    ![ドメイン駆動設計_逆転依存性の原則](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_依存性逆転の原則.jpg)

<br>

### DIP のメリット

#### ▼ 実装リポジトリの差し替えが簡単

実装リポジトリはインターフェースに依存し、特定の関数の実装が強制されている。

ここで実装リポジトリを異なるものに差し替えたとしても、もう一方でインターフェースに依存するユースケースは、インターフェースの関数のコール方法を変える必要がない。

つまり、ユースケース層に影響を与えることなく、実装リポジトリのリファクタリングや新しい実装リポジトリへの移行が行える。

#### ▼ リポジトリが対象とする集約の単位がわかりやすい

ドメイン層にインターフェースリポジトリを配置する例を考える。

インターフェースリポジトリは、実装リポジトリよりも定義が簡潔である。

そのため、実装リポジトリではなくインターフェースリポジトリを確認することで、そのリポジトリがどの集約に対して CRUD 処理を実行するのかを認識しやすい。

<br>

## 04. モジュール性

### 結合度

#### ▼ 結合度とは

依存には、引数の渡し方によって、程度がある。

それによって、処理を、どのクラスのデータと操作に振り分けていくかが決まる。

結合度はモジュール間の依存度合いについて使用される用語であるが、より理解しやすくするために、特にクラスを使用して説明する。

#### ▼ データ結合とは

もっとも理想的な結合。

スカラ型のデータをサプライヤー側として、クライアント側のインスタンスの引数として渡すような関係。

ModuleA と ModuleB は、データ結合の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    type ModuleA struct{} // コールされる側

    func (m *ModuleA) MethodA(a int, b int, c string) string {
    	return fmt.Sprintf("%d + %d", a, b) + c
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface ModuleA {
      methodA(a: number, b: number, c: string): string;
    }
    function createModuleA(): ModuleA {
      // コールされる側
      function methodA(a: number, b: number, c: string): string {
        return `${a} + ${b}` + c;
      }
      return {methodA};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class ModuleA // コールされる側
    {
        public function methodA(int $a, int $b, string $c): string
        {
            return "$a + $b".$c;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type ModuleB struct{} // コールする側

    func (m *ModuleB) MethodB() {
    	moduleA := &ModuleA{}
    	_ = moduleA.MethodA(1, 2, "です.") // スカラ型データを渡すだけ
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface ModuleB {
      methodB(): void;
    }
    function createModuleB(): ModuleB {
      // コールする側
      function methodB(): void {
        const moduleA = createModuleA();
        const result = moduleA.methodA(1, 2, "です."); // スカラ型データを渡すだけ
      }
      return {methodB};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class ModuleB // コールする側
    {
        public function methodB(): void
        {
            $moduleA= new ModuleA();
            $result = $moduleA->methodA(1, 2, "です."); // スカラ型データを渡すだけ
        }
    }
    ```

デザインパターンの Factory クラスでは、スカラ型データの値に応じて、インスタンスを作り分ける。

Factory クラスのインスタンスと、これをコールするほかのインスタンス は、データ結合の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    // コールされる側
    // 距離に応じて、移動手段のオブジェクトを作り分けるファクトリクラスに相当する構造体
    type TransportationMethodsFactory struct{}

    func (TransportationMethodsFactory) CreateInstance(distance int) TransportationMethod {
    	walking := NewWalking(distance)
    	car := NewCar(distance)

    	if walking.NeedsWalking() {
    		return walking
    	}

    	return car
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    /**
     * コールされる側
     *
     * 距離に応じて、移動手段のオブジェクトを作り分ける生成関数
     */

    function createTransportationMethod(distance: number): Car | Walking {
      const walking = createWalking(distance);
      const car = createCar(distance);

      if (walking.needsWalking()) {
        return walking;
      }

      return car;
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    /**
     * コールされる側
     *
     * 距離に応じて、移動手段のオブジェクトを作り分けるファクトリクラス
     */
    class TransportationMethodsFactory
    {
        public static function createInstance(mixed $distance): Car|Walking
        {
            $walking = new Walking($distance);
            $car = new Car($distance);

            if($walking->needsWalking()) {
                return $walking;
            }

            return $car;
        }
    }
    ```

#### ▼ スタンプ結合とは

object 型のデータをサプライヤー側として、クライアント側のインスタンスの引数として渡す関係。

ModuleA と ModuleB は、スタンプ結合の関係にある。

=== "Go"

    ```go title="Go の場合の実装例"
    type Shared struct {
    	value int
    }

    func NewShared(value int) *Shared {
    	return &Shared{value: value}
    }

    func (s *Shared) GetValue() int {
    	return s.value
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Shared {
      getValue(): number;
    }
    function createShared(value: number): Shared {
      function getValue(): number {
        return value;
      }
      return {getValue};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class Shared
    {
        private int $value;

        public function __construct(int $value)
        {
            $this->value = $value;
        }

        public function getValue(): int
        {
            return $this->value;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type ModuleA struct{}

    func (m *ModuleA) MethodA() int {
    	shared := NewShared(1)

    	moduleB := &ModuleB{}

    	return moduleB.MethodB(shared) // 1
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface ModuleA {
      methodA(): number;
    }
    function createModuleA(): ModuleA {
      function methodA(): number {
        const shared = createShared(1);

        const moduleB = createModuleB();

        return moduleB.methodB(shared); // 1
      }
      return {methodA};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class ModuleA
    {
        public function methodA(): int
        {
            $shared = new Shared(1);

            $moduleB = new ModuleB;

            return $moduleB->methodB($shared); // 1
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type ModuleB struct{}

    func (m *ModuleB) MethodB(shared *Shared) int {
    	return shared.GetValue() // 1
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface ModuleB {
      methodB(shared: Shared): number;
    }
    function createModuleB(): ModuleB {
      function methodB(shared: Shared): number {
        return shared.getValue(); // 1
      }
      return {methodB};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    class ModuleB
    {
        public function methodB(Shared $shared): int
        {
            return $shared->getValue(); // 1
        }
    }
    ```

<br>

### 凝集度

#### ▼ 凝集度とは

凝集度は、『モジュール内の責務の統一度合い』について使用される用語であるが、より理解しやすくするために、特にクラスを使用して説明する。

#### ▼ 機能的強度

もっとも理想的な凝集。

クラスの責務が機能単位になるように、ロジックを振り分ける。

#### ▼ LCOM：Lack Of Cohesion of Methods

凝集度の程度を表す指標のこと。

LCOM の計測方法にはいくつか種類がある。

LCOM4 は、クラスの各関数内で、保持するすべてのデータにアクセスしているほど、凝集度が高いと見なす方法である。

> - [Amazon.co.jp: ドメイン駆動設計入門 ボトムアップでわかる！ドメイン駆動設計の基本 eBook : 成瀬 允宣: Kindleストア](https://www.amazon.co.jp/dp/B082WXZVPC)
> - [存在感の薄い「凝集度」に光を当てる - LCOMでクラスを凝集度を測定しよう #JavaScript - Qiita](https://qiita.com/fujiharuka/items/65125592bd31e2a1c16d)

<br>

### コナーセンス

#### ▼ 静的コナーセンス

コード実行前の結合度のこと。

#### ▼ 動的コナーセンス

コード実行時の結合度のこと。

<br>

### 低結合と高凝集

各モジュールは、結合度が低く、凝集度が高いほどよい。

例として、以下の画像では、道具モジュールをキッチン引き出しモジュールとガレージ工具箱モジュールに分けている。これにより、各クラスの結合度を低くし、凝集度を高くできる。

![低結合度高凝集度](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/低結合度高凝集度.png)

<br>
