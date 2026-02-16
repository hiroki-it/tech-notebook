---
title: 【IT技術の知見】12章＠ドメイン駆動設計入門ボトムアップ
description: 12章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# 12章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter12

<br>

## 12.1 集約とは

集約は、「ほかとの境界をもつ同種のドメインオブジェクトのグループ」のこと。

集約には、次の概念がある。

| 概念       | 説明                                           |
| ---------- | ---------------------------------------------- |
| 集約       | ドメインオブジェクトのグループ                 |
| 境界       | それぞれの集約を区別する境目                   |
| 集約ルート | 境界内の親ドメインオブジェクトに相当するルート |

### 12.1.1 集約の基本的構造

ユーザー集約を例に挙げて、集約の概念を説明すると次のとおり。

- 集約：青塗り
- 境界：枠
- 集約ルート：Userオブジェクト

![domain_driven_design_nyumon_bottom_up_chapter_12-01](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-01.png)

集約内のドメインオブジェクトは集約ルートを通じてのみ操作できる。

```
“親のオブジェクトを通じて、親が所有する子のオブジェクトを操作するべき”
というプラクティスを『デメテルの法則』という。
```

例えば、ユーザー集約とUser集約ルートを考えてみる。

UserNameの状態を変更するときは、UserにUserNameを渡さないといけない。

これにより、ユーザー名のない不正なユーザーの作成を防げる。

リスト12.1：ユーザ名の変更は User オブジェクトに依頼する

```tsx
// 誤った方法
// これをできないように実装するべき
const user = new User();
user.name = userName;

// 正しい方法
const userName = new UserName("NewName");
const user = new User(new UserName("OldName"));
```

次に、サークル集約とCircle集約ルートを考えてみる。

CircleとUserは異なる集約に属し、それぞれが集約ルートである。

![domain_driven_design_nyumon_bottom_up_chapter_12-02](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-02.png)

このとき、ユーザーを作成し、メンバーとして所属させるようなユースケースを考える。

Membersを作成したいとき、次のような処理はダメである。

なぜなら、サークル集約内のドメインオブジェクトの操作はCircle集約ルートが実施しないといけない

CircleがMembersを作成しないといけないはずが、Circle内のMembersを直接操作し、Membersを作成してしまっているためである。

リスト12.2：第 11 章で登場したサークルにメンバーを追加するコード

```tsx
circle.members.add(member);
```

次のようにCircleがMembersを作成するべきである。

ここでは、MembersはUserの配列としている。

リスト12.3：メンバーを追加するコードをエンティティに追加

```tsx
class Circle {
  private readonly id: CircleId;
  private owner: User;
  // MembersはUserの配列
  private members: User[];

  constructor(id: CircleId, owner: User) {
    this.id = id;
    this.owner = owner;
    this.members = []; // ここ
  }

  public join(member: User): void {
    if (!member) {
      throw new Error("ArgumentNullException: member");
    }
    if (this.members.length >= 29) {
      throw new CircleFullException(this.id);
    }
    this.members.push(member); // ここ
  }
}
```

次のようにCircleを通じてMembersを作成する。

これは『デメテルの法則』を満たしている。

リスト12.4：メンバー追加のために Circle の関数を呼び出す

```tsx
circle.join(user);
```

一方で、MembersというUser配列を定義しない方法もある。

この方法は誤っているわけではない。

ただ、Membersを介さずにCircleがUserを直接操作できてしまうため、サークル集約とユーザー集約の境界が曖昧になってしまう。

![domain_driven_design_nyumon_bottom_up_chapter_12-03](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-03.png)

リスト12.5：データストアを直接操作してコレクションを生成する

```tsx
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

class Circle {
  private readonly id: CircleId;

  constructor(id: CircleId) {
    this.id = id;
  }

  public async getMembers(): Promise<User[]> {
    // Membersを介さずにCircleがUserを直接操作できてしまう
    const [circle] = await prisma.$transaction([
      prisma.circle.findUnique({
        where: {id: this.id.value},
        include: {
          circleMembers: {
            include: {
              user: true,
            },
          },
        },
      }),
    ]);

    if (!circle) {
      throw new Error(`Circle not found: ${this.id.value}`);
    }

    return circle.circleMembers.map(
      (cm) => new User(new UserId(cm.user.id), new UserName(cm.user.name)),
    );
  }
}
```

### 12.1.2 オブジェクトの操作に関する基本的な原則

次はデメテルの法則に違反する実装である。

CircleがMembersの数を検証しないといけないはずが、Circle内のMembersを直接操作し、Membersの数を検証してしまっているためである。

リスト12.6：メンバーを追加する際の上限チェックを行うコード

```tsx
if (circle.members.count >= 29) {
  throw new CircleFullException(this.id);
}
```

次のisFull関数ように、CircleがMembersの数を検証するべきである。

リスト12.7：デメテルの法則にしたがいオブジェクトにふるまいを追加する

```tsx
class Circle {
  private readonly id: CircleId;
  private members: User[];

  constructor(id: CircleId) {
    this.id = id;
    this.members = [];
  }

  // CircleがMembersの数を検証するべきである
  public isFull(): boolean {
    return this.members.length >= 29;
  }

  public join(user: User): void {
    if (!user) {
      throw new Error("ArgumentNullException: user");
    }
    if (this.isFull()) {
      throw new CircleFullException(this.id);
    }
    this.members.push(user);
  }
}
```

次のようにCircleを通じてMembersの数を検証する。

これは『デメテルの法則』を満たしている。

リスト12.8：リスト12.7 の IsFull 関数を利用して上限チェックを行う

```tsx
if (circle.isFull()) {
  throw new CircleFullException(circleId);
}
```

上限数の仕様が変われば、次のように 29 から 49 に変更する。

リスト12.9：上限数の変更

```tsx
class Circle {
  private members: User[];

  constructor() {
    this.members = [];
  }

  // 上限数の仕様が変わったので、49に変更するような場面もある
  public isFull(): boolean {
    return this.members.length >= 49;
  }
}
```

### 12.1.3 内部データを隠蔽するために

オブジェクトのプロパティはプライベートにしたほうが良い。

ただ、プライベートにすると、永続化するときにオブジェクトからデータを取り出せなくなってしまう。

リスト12.10：リポジトリの永続化処理

```tsx
class EFUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(user: User): Promise<void> {
    const userDataModel = {
      // データを永続化したいが、idやnameがプライベートだとここで取り出せずにエラーになってしまう
      id: user.id.value,
      name: user.name.value,
    };

    await this.prisma.$transaction([
      this.prisma.user.create({
        data: userDataModel,
      }),
    ]);
  }
}
```

これの対処方法として、データモデル（DTOともいう）を使用するのがよい。

まずは、データモデルインターフェースを定義する。

例えば、IUserNotificationとする。

リスト12.11：通知のためのインターフェース

```tsx
interface IUserNotification {
  id(id: UserId): void;
  name(name: UserName): void;
}
```

次に、実装データモデルを定義する。

実装データモデルでは、ドメインオブジェクトをデータモデルに変換する

リスト12.12：リスト12.11 を実装した通知オブジェクト

```tsx
class UserDataModelBuilder implements IUserNotification {
  // ドメインオブジェクトをプロパティに設定する
  private id!: UserId;
  private name!: UserName;

  public id(id: UserId): void {
    this.id = id;
  }

  public name(name: UserName): void {
    this.name = name;
  }

  // ドメインオブジェクトをデータモデルに変換する
  public build(): UserDataModel {
    return new UserDataModel({
      id: this.id.value,
      name: this.name.value,
    });
  }
}
```

ドメインオブジェクトには、ドメインオブジェクトを実装データモデルに渡す処理を持たせる。

リスト12.13：通知オブジェクトを受け取る関数を追加する

```tsx
class User {
  private readonly id: UserId;
  private name: UserName;

  constructor(id: UserId, name: UserName) {
    this.id = id;
    this.name = name;
  }

  public notify(note: IUserNotification): void {
    // ドメインオブジェクトを実装データモデルに渡す
    note.id(this.id);
    note.name(this.name);
  }
}
```

実装データモデルをORMに渡すと、ORMは実装データモデルのプロパティに設定されたドメインオブジェクトを読み取り、データを永続化する。

結果、ドメインオブジェクトや実装データモデルのプロパティをプライベートにしたままで、データを永続化できた。

リスト12.14：通知オブジェクトを利用してデータモデルを取得する

```tsx
class EFUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(user: User): Promise<void> {
    const userDataModelBuilder = new UserDataModelBuilder();
    user.notify(userDataModelBuilder);

    const userDataModel = userDataModelBuilder.build();

    // 実装データモデルをORMに渡す
    await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          id: userDataModel.id,
          name: userDataModel.name,
        },
      }),
    ]);
  }
}
```

ちなみに、Scalaにはこれを少ない実装で解決できる便利機能がある。

それは、特定のオブジェクトにだけ、プライベートプロパティの参照を許可する機能である。

つぎのように実装すると、IUserRepository型のオブジェクト（つまり、IUserRepositoryそのものと実装UserRepository）にだけプライベートプロパティの参照を許可できる。

そのため、先ほどのデータモデルのような仲介役が不要になる。

リスト12.15：よりきめ細やかなアクセス制御（Scala）

```scala
public class User (
  private [IUserRepository] val id: UserId,
  private [IUserRepository] val name: UserName
) {
}
```

## 12.2 集約をどう区切るか

データ変更の単位は、集約の単位に合わせるべきである。

データ変更の単位を集約の単位を合わせないとどのような問題が起こるかを見ていく。

![domain_driven_design_nyumon_bottom_up_chapter_12-04](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-04.png)

次の実装では、CircleがMembers内のUserの名前を変更しようとしている。

Circleでは、UserをMembers配列で保持することで、CircleからUserを操作できる。

リスト12.16：サークル集約を通じてユーザ集約のふるまいを呼び出す

```tsx
class Circle {
  private members: User[];

  constructor() {
    this.members = [];
  }

  public changeMemberName(id: UserId, name: UserName): void {
    const target = this.members.find((x) => x.id.equals(id));
    if (target) {
      target.changeName(name);
    }
  }
}
```

CircleRepositoryでUserを永続化しようとしている。

一見問題なさそうに見える。

しかし、実のところUserRepositoryにも同じようなコードがあり、保存先のテーブルが衝突してしまっている。

つまり、CircleRepositoryがサークル集約を超えてユーザー集約に関する責務も持ってしまったため、衝突してしまったということになる。

リスト12.18：サークル集約越しに操作されたユーザ集約に対する変更をサポートする

```tsx
class CircleRepository implements ICircleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(circle: Circle): Promise<void> {
    await this.prisma.$transaction([
      // Userを永続化
      ...circle.members.map((user) =>
        this.prisma.user.update({
          where: {id: user.id.value},
          data: {
            name: user.name.value,
          },
        }),
      ),
      // Circleを永続化
      this.prisma.circle.update({
        where: {id: circle.id.value},
        data: {
          name: circle.name.value,
          ownerId: circle.owner ? circle.owner.id.value : null,
        },
      }),
    ]);
  }
}
```

### 12.2.1 IDによるコンポジション

これまでのCircleは、UserをMembers配列で保持することで、Userを操作していた。

これをやめ、Membersを作成したい場合は、CircleRepositoryだけでなくUserRepositoryも呼ばなければいけないように実装してみる。

まずは、CircleのMembers配列の中身をUserではなくUserIdに変更する。

これにより、事前にUserRepositoryを実行してUserを作成したうえで、CircleはそのUserのUserIdを使用するようになる。

リスト12.19：識別子をインスタンスの代わりとして保持する

```tsx
class Circle {
  public readonly id: CircleId;
  private name: CircleName;

  // UserではなくUserIdを配列で保持する
  private members: UserId[];

  constructor(id: CircleId, name: CircleName, members: UserId[] = []) {
    this.id = id;
    this.name = name;
    this.members = members;
  }

  public getName(): CircleName {
    return this.name;
  }

  public getMembers(): UserId[] {
    return [...this.members];
  }
}
```

UserIdを使用するようにしたメリットはほかにもある。

サークル名を変更するような永続化でUserは不要であり、CircleがUserを保持していると、メモリ領域を多く圧迫してしまう。

一方で、CircleがUserIdを保持するのであれば、Userを保持するよりはマシで、メモリ領域の少ない圧迫で済む。

リスト12.20：サークルの名前を変更する処理

```tsx
class CircleApplicationService {
  constructor(
    private readonly circleRepository: ICircleRepository,
    private readonly circleService: CircleService,
    private readonly prisma: PrismaClient,
  ) {}

  public async update(command: CircleUpdateCommand): Promise<void> {
    const id = new CircleId(command.id);

    const circle = await this.circleRepository.find(id);
    if (!circle) {
      throw new CircleNotFoundException(id);
    }

    if (command.name !== null && command.name !== undefined) {
      const name = new CircleName(command.name);
      circle.changeName(name);

      if (await this.circleService.exists(circle)) {
        throw new CanNotRegisterCircleException(
          circle,
          "サークルは既に存在しています。",
        );
      }
    }

    await this.prisma.$transaction([this.circleRepository.save(circle)]);
  }
}
```

**コラム**

これまでの話の中で、プロパティはパブリックではなくプライベートを使用するべきであるような話の流れであった。

ただ、Id（識別子）はビジネスルールには属さず、またパブリックのほうが利便性が高くなるため、パブリックでもいい。

リスト12.21：識別子をゲッターで公開する

```tsx
class Circle {
  private name: CircleName;
  private owner: UserId;
  private members: UserId[];
  public readonly id: CircleId;

  constructor(
    id: CircleId,
    name: CircleName,
    owner: UserId,
    members: UserId[],
  ) {
    if (!id) {
      throw new Error("ArgumentNullException: id");
    }
    if (!name) {
      throw new Error("ArgumentNullException: name");
    }
    if (!owner) {
      throw new Error("ArgumentNullException: owner");
    }
    if (!members) {
      throw new Error("ArgumentNullException: members");
    }

    this.id = id;
    this.name = name;
    this.owner = owner;
    this.members = members;
  }

  public notify(note: ICircleNotification): void {
    note.id(this.id);
    note.name(this.name);
    note.owner(this.owner);
    note.members(this.members);
  }
}
```

## 12.3 集約の大きさと操作の単位

集約の粒度は大きくならないように気を付ける。

大きいほど、単一のトランザクションの対象になるレコードが増えるため、レコードロックの範囲が大きくなる。

```
テーブル内のロックの範囲はいくつか種類があるが、筆者は言及していなかったため、ここではレコードロックとした
```

**コラム**

なんらかの事情で、Repositoryによる永続化の対象が複数の集約にどうしてもまたがってしまう場合、結果整合性で辻褄合わせしてもよい。

例えば、Cron処理で一日1回データベースを検査し、不整合のあるデータを書き換えてしまう。

![domain_driven_design_nyumon_bottom_up_chapter_12-05](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-05.png)

## 12.4 言葉との齟齬を消す

```
前章の「ビジネスルールの漏れだし」の続き？
```

isFull関数は、『サークルに所属するユーザの最大数はサークルのオーナーとなるユーザを含めて30名まで』というビジネスルールを表現したものである。

ロジックは間違っていないが、`29` と比較しており、ビジネスルールの誤解を招きやすく可読性が低い。

リスト12.22：30 ではなく 29 が現れている

```tsx
class Circle {
  private owner: User;
  private members: User[];

  constructor(owner: User, members: User[] = []) {
    this.owner = owner;
    this.members = members;
  }

  public isFull(): boolean {
    return this.members.length >= 29;
  }
}
```

そこで、countMembers関数を用意し、`30` と比較することで、可読性を高くするべきである。

リスト12.23：サークルのオーナーとメンバーの定義

```tsx
class Circle {
  private owner: User;
  private members: User[];

  constructor(owner: User, members: User[] = []) {
    this.owner = owner;
    this.members = members;
  }

  public isFull(): boolean {
    return this.countMembers() >= 30;
  }

  public countMembers(): number {
    return this.members.length + 1;
  }
}
```

## 12.5 まとめ

集約は機械的に決められるものではなく、集約とドメインは相互につながっており、境界線を引くのは難しい。

境界線を引いて集約を見つけることは、ドメインをとらえ、そこにある変更の単位を導き出し、最適解を目指す作業である。
