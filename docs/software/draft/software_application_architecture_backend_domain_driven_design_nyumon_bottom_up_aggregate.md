---
title: 【IT技術の知見】12章
description: 12章の知見を記録しています。
---

# 12章

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter12 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter12)

<br>

## 12.1 集約とは

集約は、「ほかとの境界をもつ同種ドメインオブジェクトのグループ」のこと。

集約には、次の概念がある。

<table>
  <thead>
    <tr>
      <th>概念</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>集約</td>
      <td>ドメインオブジェクトのグループ</td>
    </tr>
    <tr>
      <td>境界</td>
      <td>それぞれの集約を区別する境目</td>
    </tr>
    <tr>
      <td>集約ルート</td>
      <td>境界内の親ドメインオブジェクトに相当するルート</td>
    </tr>
  </tbody>
</table>

### 12.1.1 集約の基本的構造

ユーザー集約を例に挙げて、集約の概念を説明すると次のとおり。

- 集約：青塗り
- 境界：枠
- 集約ルート：User オブジェクト

![domain_driven_design_nyumon_bottom_up_chapter_12-01](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-01.png)

集約内のドメインオブジェクトは集約ルートを通じてのみ操作できる。

```
“親のオブジェクトを通じて、親が所有する子のオブジェクトを操作するべき”
というプラクティスを『デメテルの法則』という。
```

例えば、ユーザー集約と User 集約ルートを考えてみる。

UserName の状態を変更するときは、User に UserName を渡さないといけない。

これにより、ユーザー名のない不正なユーザーの作成を防げる。

リスト 12.1：ユーザ名の変更は User オブジェクトに依頼する

=== "Go"

    ```go title="Go の場合の実装例"
    // 誤った方法
    // これをできないように実装するべき
    user := &User{}
    user.name = userName

    // 正しい方法
    userName := NewUserName("NewName")
    user := NewUser(NewUserName("OldName"))
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    // 誤った方法：名前を直接書き換える
    // nameを読み取り専用として公開すれば、この代入はコンパイルエラーになる
    user.name = createUserName("NewName");

    // 正しい方法：ドメインの操作を通して名前を変更する
    user.changeName(createUserName("NewName"));
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    // 誤った方法
    // これをできないように実装するべき
    $user = new User();
    $user->name = $userName;

    // 正しい方法
    $userName = new UserName("NewName");
    $user = new User(new UserName("OldName"));
    ```

次に、サークル集約と Circle 集約ルートを考えてみる。

Circle と User は異なる集約に属し、それぞれが集約ルートである。

![domain_driven_design_nyumon_bottom_up_chapter_12-02](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-02.png)

このとき、ユーザーを作成し、メンバーとして所属させるようなユースケースを考える。

Members を作成したいとき、次のような処理はダメである。

なぜなら、サークル集約内のドメインオブジェクトの操作は Circle 集約ルートが実施しないといけない

Circle が Members を作成しないといけないはずが、Circle 内の Members を直接操作し、Members を作成してしまっているためである。

リスト 12.2：第 11 章で登場したサークルにメンバーを追加するコード

=== "Go"

    ```go title="Go の場合の実装例"
    circle.members = append(circle.members, member)
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    circle.members.add(member);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    $circle->members[] = $member;
    ```

次のように Circle が Members を作成するべきである。

ここでは、Members は User の配列としている。

リスト 12.3：メンバーを追加するコードをエンティティに追加

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	id    CircleId
    	owner *User
    	// MembersはUserの配列
    	members []*User
    }

    func NewCircle(id CircleId, owner *User) *Circle {
    	return &Circle{
    		id:      id,
    		owner:   owner,
    		members: []*User{}, // ここ
    	}
    }

    func (c *Circle) Join(member *User) error {
    	if member == nil {
    		return errors.New("ArgumentNullException: member")
    	}
    	if len(c.members) >= 29 {
    		return NewCircleFullException(c.id)
    	}
    	c.members = append(c.members, member) // ここ
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      join(member: User): void;
    }
    function createCircle(id: CircleId, owner: User): Circle {
      const state: {id: CircleId; owner: User; members: User[]} = {
        id,
        owner,
        members: [],
      };

      // ここ

      function join(member: User): void {
        if (!member) {
          throw new Error("ArgumentNullException: member");
        }
        if (state.members.length >= 29) {
          throw new CircleFullException(state.id);
        }
        state.members.push(member); // ここ
      }
      return {join};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private readonly CircleId $id;
        private User $owner;
        // MembersはUserの配列
        private array $members;

        public function __construct(CircleId $id, User $owner)
        {
            $this->id = $id;
            $this->owner = $owner;
            $this->members = []; // ここ
        }

        public function join(?User $member): void
        {
            if ($member === null) {
                throw new Exception("ArgumentNullException: member");
            }
            if (count($this->members) >= 29) {
                throw new CircleFullException($this->id);
            }
            $this->members[] = $member; // ここ
        }
    }
    ```

次のように Circle を通じて Members を作成する。

これは『デメテルの法則』を満たしている。

リスト 12.4：メンバー追加のために Circle の関数を呼び出す

=== "Go"

    ```go title="Go の場合の実装例"
    if err := circle.Join(user); err != nil {
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    circle.join(user);
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    $circle->join($user);
    ```

一方で、Members という User 配列を定義しない方法もある。

この方法は誤っているわけではない。

ただ、Members を介さずに Circle が User を直接操作できてしまうため、サークル集約とユーザー集約の境界が曖昧になってしまう。

![domain_driven_design_nyumon_bottom_up_chapter_12-03](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-03.png)

リスト 12.5：データストアを直接操作してコレクションを生成する

=== "Go"

    ```go title="Go の場合の実装例"
    import (
    	"context"
    	"database/sql"
    	"errors"
    	"fmt"
    	"os"
    )

    var db, _ = sql.Open("mysql", os.Getenv("DATABASE_DSN"))

    type Circle struct {
    	id CircleId
    }

    func NewCircle(id CircleId) *Circle {
    	return &Circle{
    		id: id,
    	}
    }

    func (c *Circle) GetMembers(ctx context.Context) ([]*User, error) {
    	// Membersを介さずにCircleがUserを直接操作できてしまう
    	var circleId string
    	err := db.QueryRowContext(
    		ctx,
    		"SELECT id FROM circles WHERE id = ?",
    		c.id.Value(),
    	).Scan(&circleId)
    	if errors.Is(err, sql.ErrNoRows) {
    		return nil, fmt.Errorf("Circle not found: %s", c.id.Value())
    	}
    	if err != nil {
    		return nil, err
    	}

    	rows, err := db.QueryContext(
    		ctx,
    		`SELECT users.id, users.name
    		FROM circle_members
    		INNER JOIN users ON users.id = circle_members.user_id
    		WHERE circle_members.circle_id = ?`,
    		circleId,
    	)
    	if err != nil {
    		return nil, err
    	}
    	defer rows.Close()

    	members := []*User{}
    	for rows.Next() {
    		var id, name string
    		if err := rows.Scan(&id, &name); err != nil {
    			return nil, err
    		}
    		members = append(members, NewUser(NewUserId(id), NewUserName(name)))
    	}

    	return members, rows.Err()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {PrismaClient} from "@prisma/client";

    const prisma = new PrismaClient();

    interface Circle {
      getMembers(): Promise<User[]>;
    }
    function createCircle(id: CircleId): Circle {
      async function getMembers(): Promise<User[]> {
        // Membersを介さずにCircleがUserを直接操作できてしまう
        const circle = await prisma.circle.findUnique({
          where: {id: id.value},
          include: {
            circleMembers: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!circle) {
          throw new Error(`Circle not found: ${id.value}`);
        }

        return circle.circleMembers.map((cm) =>
          createUser(createUserId(cm.user.id), createUserName(cm.user.name)),
        );
      }
      return {getMembers};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private readonly CircleId $id;
        private PDO $pdo;

        public function __construct(CircleId $id)
        {
            $this->id = $id;
            $this->pdo = new PDO(getenv("DATABASE_DSN"));
        }

        /**
         * @return User[]
         */
        public function getMembers(): array
        {
            // Membersを介さずにCircleがUserを直接操作できてしまう
            $statement = $this->pdo->prepare("SELECT id FROM circles WHERE id = :id");
            $statement->execute(["id" => $this->id->value]);
            $circle = $statement->fetch(PDO::FETCH_ASSOC);

            if ($circle === false) {
                throw new Exception("Circle not found: {$this->id->value}");
            }

            $statement = $this->pdo->prepare(
                "SELECT users.id, users.name
                FROM circle_members
                INNER JOIN users ON users.id = circle_members.user_id
                WHERE circle_members.circle_id = :circleId"
            );
            $statement->execute(["circleId" => $circle["id"]]);

            return array_map(
                fn (array $cm) => new User(new UserId($cm["id"]), new UserName($cm["name"])),
                $statement->fetchAll(PDO::FETCH_ASSOC),
            );
        }
    }
    ```

### 12.1.2 オブジェクトの操作に関する基本的な原則

次はデメテルの法則に違反する実装である。

Circle が Members の数を検証しないといけないはずが、Circle 内の Members を直接操作し、Members の数を検証してしまっているためである。

リスト 12.6：メンバーを追加する際の上限チェックを行うコード

=== "Go"

    ```go title="Go の場合の実装例"
    if len(circle.members) >= 29 {
    	return NewCircleFullException(s.id)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    if (circle.members.length >= 29) {
      throw new CircleFullException(circleId);
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    if (count($circle->members) >= 29) {
        throw new CircleFullException($this->id);
    }
    ```

次の isFull 関数のように、Circle が Members の数を検証するべきである。

リスト 12.7：デメテルの法則にしたがい、オブジェクトへふるまいを追加する

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	id      CircleId
    	members []*User
    }

    func NewCircle(id CircleId) *Circle {
    	return &Circle{
    		id:      id,
    		members: []*User{},
    	}
    }

    // CircleがMembersの数を検証するべきである
    func (c *Circle) IsFull() bool {
    	return len(c.members) >= 29
    }

    func (c *Circle) Join(user *User) error {
    	if user == nil {
    		return errors.New("ArgumentNullException: user")
    	}
    	if c.IsFull() {
    		return NewCircleFullException(c.id)
    	}
    	c.members = append(c.members, user)
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      isFull(): boolean;
      join(user: User): void;
    }
    function createCircle(id: CircleId): Circle {
      const state: {id: CircleId; members: User[]} = {id, members: []};

      // CircleがMembersの数を検証するべきである
      function isFull(): boolean {
        return state.members.length >= 29;
      }

      function join(user: User): void {
        if (!user) {
          throw new Error("ArgumentNullException: user");
        }
        if (isFull()) {
          throw new CircleFullException(state.id);
        }
        state.members.push(user);
      }
      return {isFull, join};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private readonly CircleId $id;
        private array $members;

        public function __construct(CircleId $id)
        {
            $this->id = $id;
            $this->members = [];
        }

        // CircleがMembersの数を検証するべきである
        public function isFull(): bool
        {
            return count($this->members) >= 29;
        }

        public function join(?User $user): void
        {
            if ($user === null) {
                throw new Exception("ArgumentNullException: user");
            }
            if ($this->isFull()) {
                throw new CircleFullException($this->id);
            }
            $this->members[] = $user;
        }
    }
    ```

次のように Circle を通じて Members の数を検証する。

これは『デメテルの法則』を満たしている。

リスト 12.8：リスト 12.7 の IsFull 関数を利用して上限チェックを行う

=== "Go"

    ```go title="Go の場合の実装例"
    if circle.IsFull() {
    	return NewCircleFullException(circleId)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    if (circle.isFull()) {
      throw new CircleFullException(circleId);
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    if ($circle->isFull()) {
        throw new CircleFullException($circleId);
    }
    ```

上限数の仕様が変われば、次のように 29 から 49 に変更する。

リスト 12.9：上限数の変更

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	members []*User
    }

    func NewCircle() *Circle {
    	return &Circle{
    		members: []*User{},
    	}
    }

    // 上限数の仕様が変わったので、49に変更するような場面もある
    func (c *Circle) IsFull() bool {
    	return len(c.members) >= 49
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      isFull(): boolean;
    }
    function createCircle(): Circle {
      const state: {members: User[]} = {members: []};

      // 上限数の仕様が変わったので、49に変更するような場面もある
      function isFull(): boolean {
        return state.members.length >= 49;
      }
      return {isFull};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private array $members;

        public function __construct()
        {
            $this->members = [];
        }

        // 上限数の仕様が変わったので、49に変更するような場面もある
        public function isFull(): bool
        {
            return count($this->members) >= 49;
        }
    }
    ```

### 12.1.3 内部データを隠蔽するために

オブジェクトのプロパティはプライベートにしたほうがよい。

ただ、プライベートにすると、永続化するときにオブジェクトからデータを取り出せなくなってしまう。

リスト 12.10：リポジトリの永続化処理

=== "Go"

    ```go title="Go の場合の実装例"
    type EFUserRepository struct {
    	db *sql.DB
    }

    var _ IUserRepository = (*EFUserRepository)(nil)

    func NewEFUserRepository(db *sql.DB) *EFUserRepository {
    	return &EFUserRepository{
    		db: db,
    	}
    }

    func (r *EFUserRepository) Save(ctx context.Context, user *User) error {
    	userDataModel := UserDataModel{
    		// データを永続化したいが、idやnameがプライベートだとここで取り出せずにエラーになってしまう
    		Id:   user.id.Value(),
    		Name: user.name.Value(),
    	}

    	_, err := r.db.ExecContext(
    		ctx,
    		"INSERT INTO users (id, name) VALUES (?, ?)",
    		userDataModel.Id,
    		userDataModel.Name,
    	)
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface EFUserRepository extends IUserRepository {
      save(user: User): Promise<void>;
    }
    function createEFUserRepository(prisma: PrismaClient): EFUserRepository {
      async function save(user: User): Promise<void> {
        const userDataModel = {
          // データを永続化したいが、idやnameがプライベートだとここで取り出せずにエラーになってしまう
          id: user.id.value,
          name: user.name.value,
        };

        await prisma.user.create({
          data: userDataModel,
        });
      }
      return {save};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class EFUserRepository implements IUserRepository
    {
        public function __construct(private readonly PDO $pdo)
        {
        }

        public function save(User $user): void
        {
            $userDataModel = [
                // データを永続化したいが、idやnameがプライベートだとここで取り出せずにエラーになってしまう
                "id" => $user->id->value,
                "name" => $user->name->value,
            ];

            $statement = $this->pdo->prepare("INSERT INTO users (id, name) VALUES (:id, :name)");
            $statement->execute($userDataModel);
        }
    }
    ```

その対処方法として、データモデル（DTO ともいう）を使用するのがよい。

まずは、データモデルインターフェースを定義する。

例えば、IUserNotification とする。

リスト 12.11：通知のためのインターフェース

=== "Go"

    ```go title="Go の場合の実装例"
    type IUserNotification interface {
    	Id(id UserId)
    	Name(name UserName)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface IUserNotification {
      id(id: UserId): void;
      name(name: UserName): void;
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    interface IUserNotification
    {
        public function id(UserId $id): void;
        public function name(UserName $name): void;
    }
    ```

次に、実装データモデルを定義する。

実装データモデルでは、ドメインオブジェクトをデータモデルに変換する

リスト 12.12：リスト 12.11 を実装した通知オブジェクト

=== "Go"

    ```go title="Go の場合の実装例"
    type UserDataModelBuilder struct {
    	// ドメインオブジェクトをプロパティに設定する
    	id   UserId
    	name UserName
    }

    var _ IUserNotification = (*UserDataModelBuilder)(nil)

    func (b *UserDataModelBuilder) Id(id UserId) {
    	b.id = id
    }

    func (b *UserDataModelBuilder) Name(name UserName) {
    	b.name = name
    }

    // ドメインオブジェクトをデータモデルに変換する
    func (b *UserDataModelBuilder) Build() *UserDataModel {
    	return &UserDataModel{
    		Id:   b.id.Value(),
    		Name: b.name.Value(),
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface UserDataModelBuilder extends IUserNotification {
      build(): UserDataModel;
    }

    function createUserDataModelBuilder(): UserDataModelBuilder {
      let userId: UserId | undefined;
      let userName: UserName | undefined;
      return {
        id(id) {
          userId = id;
        },
        name(name) {
          userName = name;
        },
        build() {
          if (!userId || !userName) {
            throw new Error("ユーザのIDと名前を通知してください");
          }
          return createUserDataModel({id: userId.value, name: userName.value});
        },
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class UserDataModelBuilder implements IUserNotification
    {
        // ドメインオブジェクトをプロパティに設定する
        private UserId $id;
        private UserName $name;

        public function id(UserId $id): void
        {
            $this->id = $id;
        }

        public function name(UserName $name): void
        {
            $this->name = $name;
        }

        // ドメインオブジェクトをデータモデルに変換する
        public function build(): UserDataModel
        {
            return new UserDataModel(
                id: $this->id->value,
                name: $this->name->value,
            );
        }
    }
    ```

ドメインオブジェクトには、ドメインオブジェクトを実装データモデルに渡す処理を持たせる。

リスト 12.13：通知オブジェクトを受け取る関数を追加する

=== "Go"

    ```go title="Go の場合の実装例"
    type User struct {
    	id   UserId
    	name UserName
    }

    func NewUser(id UserId, name UserName) *User {
    	return &User{
    		id:   id,
    		name: name,
    	}
    }

    func (u *User) Notify(note IUserNotification) {
    	// ドメインオブジェクトを実装データモデルに渡す
    	note.Id(u.id)
    	note.Name(u.name)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface User {
      notify(note: IUserNotification): void;
    }
    function createUser(id: UserId, name: UserName): User {
      function notify(note: IUserNotification): void {
        // ドメインオブジェクトを実装データモデルに渡す
        note.id(id);
        note.name(name);
      }
      return {notify};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class User
    {
        private readonly UserId $id;
        private UserName $name;

        public function __construct(UserId $id, UserName $name)
        {
            $this->id = $id;
            $this->name = $name;
        }

        public function notify(IUserNotification $note): void
        {
            // ドメインオブジェクトを実装データモデルに渡す
            $note->id($this->id);
            $note->name($this->name);
        }
    }
    ```

実装データモデルを ORM に渡すと、ORM は実装データモデルのプロパティに設定されたドメインオブジェクトを読み取り、データを永続化する。

結果、ドメインオブジェクトや実装データモデルのプロパティをプライベートにしたままで、データを永続化できた。

リスト 12.14：通知オブジェクトを利用してデータモデルを取得する

=== "Go"

    ```go title="Go の場合の実装例"
    type EFUserRepository struct {
    	db *sql.DB
    }

    var _ IUserRepository = (*EFUserRepository)(nil)

    func NewEFUserRepository(db *sql.DB) *EFUserRepository {
    	return &EFUserRepository{
    		db: db,
    	}
    }

    func (r *EFUserRepository) Save(ctx context.Context, user *User) error {
    	userDataModelBuilder := &UserDataModelBuilder{}
    	user.Notify(userDataModelBuilder)

    	userDataModel := userDataModelBuilder.Build()

    	// 実装データモデルをORMに渡す
    	_, err := r.db.ExecContext(
    		ctx,
    		"INSERT INTO users (id, name) VALUES (?, ?)",
    		userDataModel.Id,
    		userDataModel.Name,
    	)
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface EFUserRepository extends IUserRepository {
      save(user: User): Promise<void>;
    }
    function createEFUserRepository(prisma: PrismaClient): EFUserRepository {
      async function save(user: User): Promise<void> {
        const userDataModelBuilder = createUserDataModelBuilder();
        user.notify(userDataModelBuilder);

        const userDataModel = userDataModelBuilder.build();

        // 実装データモデルをORMに渡す
        await prisma.user.create({
          data: {
            id: userDataModel.id,
            name: userDataModel.name,
          },
        });
      }
      return {save};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class EFUserRepository implements IUserRepository
    {
        public function __construct(private readonly PDO $pdo)
        {
        }

        public function save(User $user): void
        {
            $userDataModelBuilder = new UserDataModelBuilder();
            $user->notify($userDataModelBuilder);

            $userDataModel = $userDataModelBuilder->build();

            // 実装データモデルをORMに渡す
            $statement = $this->pdo->prepare("INSERT INTO users (id, name) VALUES (:id, :name)");
            $statement->execute([
                "id" => $userDataModel->id,
                "name" => $userDataModel->name,
            ]);
        }
    }
    ```

ちなみに、Scala にはこれを少ない実装で解決できる便利機能がある。

それは、特定のオブジェクトにだけ、プライベートプロパティの参照を許可する機能である。

つぎのように実装すると、IUserRepository 型のオブジェクト（つまり、IUserRepository そのものと実装 UserRepository）にだけプライベートプロパティの参照を許可できる。

そのため、先ほどのデータモデルのような仲介役が不要になる。

リスト 12.15：よりきめ細やかなアクセス制御（Scala）

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

次の実装では、Circle が Members 内の User の名前を変更しようとしている。

Circle では、User を Members 配列で保持することで、Circle から User を操作できる。

リスト 12.16：サークル集約を通じてユーザ集約のふるまいを呼び出す

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	members []*User
    }

    func NewCircle() *Circle {
    	return &Circle{
    		members: []*User{},
    	}
    }

    func (c *Circle) ChangeMemberName(id UserId, name UserName) {
    	for _, target := range c.members {
    		if target.id.Equals(id) {
    			target.ChangeName(name)
    			return
    		}
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      changeMemberName(id: UserId, name: UserName): void;
    }
    function createCircle(): Circle {
      const state: {members: User[]} = {members: []};

      function changeMemberName(id: UserId, name: UserName): void {
        const target = state.members.find((x) => x.id.equals(id));
        if (target) {
          target.changeName(name);
        }
      }
      return {changeMemberName};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private array $members;

        public function __construct()
        {
            $this->members = [];
        }

        public function changeMemberName(UserId $id, UserName $name): void
        {
            foreach ($this->members as $target) {
                if ($target->id->equals($id)) {
                    $target->changeName($name);
                    return;
                }
            }
        }
    }
    ```

CircleRepository で User を永続化しようとしている。

一見問題なさそうに見える。

しかし、実のところ UserRepository にも同じようなコードがあり、保存先のテーブルが衝突してしまっている。

つまり、CircleRepository がサークル集約を超えてユーザー集約に関する責務も持ってしまったため、衝突してしまったということになる。

リスト 12.18：サークル集約越しに操作されたユーザ集約に対する変更をサポートする

=== "Go"

    ```go title="Go の場合の実装例"
    type CircleRepository struct {
    	db *sql.DB
    }

    var _ ICircleRepository = (*CircleRepository)(nil)

    func NewCircleRepository(db *sql.DB) *CircleRepository {
    	return &CircleRepository{
    		db: db,
    	}
    }

    func (r *CircleRepository) Save(ctx context.Context, circle *Circle) error {
    	// Userを永続化
    	for _, user := range circle.members {
    		_, err := r.db.ExecContext(
    			ctx,
    			"UPDATE users SET name = ? WHERE id = ?",
    			user.name.Value(),
    			user.id.Value(),
    		)
    		if err != nil {
    			return err
    		}
    	}

    	// Circleを永続化
    	var ownerId sql.NullString
    	if circle.owner != nil {
    		ownerId = sql.NullString{String: circle.owner.id.Value(), Valid: true}
    	}

    	_, err := r.db.ExecContext(
    		ctx,
    		"UPDATE circles SET name = ?, owner_id = ? WHERE id = ?",
    		circle.name.Value(),
    		ownerId,
    		circle.id.Value(),
    	)
    	return err
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface CircleRepository extends ICircleRepository {
      save(circle: Circle): Promise<void>;
    }
    function createCircleRepository(prisma: PrismaClient): CircleRepository {
      async function save(circle: Circle): Promise<void> {
        // Userを永続化
        for (const user of circle.members) {
          await prisma.user.update({
            where: {id: user.id.value},
            data: {
              name: user.name.value,
            },
          });
        }

        // Circleを永続化
        await prisma.circle.update({
          where: {id: circle.id.value},
          data: {
            name: circle.name.value,
            ownerId: circle.owner ? circle.owner.id.value : null,
          },
        });
      }
      return {save};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class CircleRepository implements ICircleRepository
    {
        public function __construct(private readonly PDO $pdo)
        {
        }

        public function save(Circle $circle): void
        {
            // Userを永続化
            foreach ($circle->members as $user) {
                $statement = $this->pdo->prepare("UPDATE users SET name = :name WHERE id = :id");
                $statement->execute([
                    "id" => $user->id->value,
                    "name" => $user->name->value,
                ]);
            }

            // Circleを永続化
            $statement = $this->pdo->prepare("UPDATE circles SET name = :name, owner_id = :ownerId WHERE id = :id");
            $statement->execute([
                "id" => $circle->id->value,
                "name" => $circle->name->value,
                "ownerId" => $circle->owner?->id->value,
            ]);
        }
    }
    ```

### 12.2.1 ID によるコンポジション

これまでの Circle は、User を Members 配列で保持することで、User を操作していた。

これをやめ、Members を作成したい場合は、CircleRepository だけでなく UserRepository も呼ばなければいけないように実装してみる。

まずは、Circle の Members 配列の中身を User ではなく UserId に変更する。

これにより、事前に UserRepository を実行して User を作成したうえで、Circle はその User の UserId を使用するようになる。

リスト 12.19：識別子をインスタンスの代わりとして保持する

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	id   CircleId
    	name CircleName

    	// UserではなくUserIdを配列で保持する
    	members []UserId
    }

    func NewCircle(id CircleId, name CircleName, members []UserId) *Circle {
    	if members == nil {
    		members = []UserId{}
    	}

    	return &Circle{
    		id:      id,
    		name:    name,
    		members: members,
    	}
    }

    func (c *Circle) Id() CircleId {
    	return c.id
    }

    func (c *Circle) GetName() CircleName {
    	return c.name
    }

    func (c *Circle) GetMembers() []UserId {
    	return slices.Clone(c.members)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      readonly id: CircleId;
      getName(): CircleName;
      getMembers(): UserId[];
    }
    function createCircle(
      id: CircleId,
      name: CircleName,
      members: UserId[] = [],
    ): Circle {
      function getName(): CircleName {
        return name;
      }

      function getMembers(): UserId[] {
        return [...members];
      }
      return {
        get id() {
          return id;
        },
        getName,
        getMembers,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        public readonly CircleId $id;
        private CircleName $name;

        // UserではなくUserIdを配列で保持する
        private array $members;

        public function __construct(CircleId $id, CircleName $name, array $members = [])
        {
            $this->id = $id;
            $this->name = $name;
            $this->members = $members;
        }

        public function getName(): CircleName
        {
            return $this->name;
        }

        /**
         * @return UserId[]
         */
        public function getMembers(): array
        {
            return $this->members;
        }
    }
    ```

UserId を使用するようにしたメリットはほかにもある。

サークル名を変更するような永続化で User は不要であり、Circle が User を保持していると、メモリ領域を多く圧迫してしまう。

一方で、Circle が UserId を保持するのであれば、User を保持するよりはマシで、メモリ領域の少ない圧迫で済む。

リスト 12.20：サークルの名前を変更する処理

=== "Go"

    ```go title="Go の場合の実装例"
    type CircleApplicationService struct {
    	circleRepository ICircleRepository
    	circleService    *CircleService
    	db               *sql.DB
    }

    func NewCircleApplicationService(
    	circleRepository ICircleRepository,
    	circleService *CircleService,
    	db *sql.DB,
    ) *CircleApplicationService {
    	return &CircleApplicationService{
    		circleRepository: circleRepository,
    		circleService:    circleService,
    		db:               db,
    	}
    }

    func (s *CircleApplicationService) Update(ctx context.Context, command *CircleUpdateCommand) error {
    	id := NewCircleId(command.Id)

    	circle, err := s.circleRepository.Find(ctx, id)
    	if err != nil {
    		return err
    	}
    	if circle == nil {
    		return NewCircleNotFoundException(id)
    	}

    	if command.Name != nil {
    		name := NewCircleName(*command.Name)
    		circle.ChangeName(name)

    		exists, err := s.circleService.Exists(ctx, circle)
    		if err != nil {
    			return err
    		}
    		if exists {
    			return NewCanNotRegisterCircleException(
    				circle,
    				"サークルは既に存在しています。",
    			)
    		}
    	}

    	return s.circleRepository.Save(ctx, circle)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface CircleApplicationService {
      update(command: CircleUpdateCommand): Promise<void>;
    }
    function createCircleApplicationService(
      circleRepository: ICircleRepository,
      circleService: CircleService,
      prisma: PrismaClient,
    ): CircleApplicationService {
      async function update(command: CircleUpdateCommand): Promise<void> {
        const id = createCircleId(command.id);

        const circle = await circleRepository.find(id);
        if (!circle) {
          throw new CircleNotFoundException(id);
        }

        if (command.name !== null && command.name !== undefined) {
          const name = createCircleName(command.name);
          circle.changeName(name);

          if (await circleService.exists(circle)) {
            throw new CanNotRegisterCircleException(
              circle,
              "サークルは既に存在しています。",
            );
          }
        }

        await circleRepository.save(circle);
      }
      return {update};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class CircleApplicationService
    {
        public function __construct(
            private readonly ICircleRepository $circleRepository,
            private readonly CircleService $circleService,
            private readonly PDO $pdo,
        ) {
        }

        public function update(CircleUpdateCommand $command): void
        {
            $id = new CircleId($command->id);

            $circle = $this->circleRepository->find($id);
            if ($circle === null) {
                throw new CircleNotFoundException($id);
            }

            if ($command->name !== null) {
                $name = new CircleName($command->name);
                $circle->changeName($name);

                if ($this->circleService->exists($circle)) {
                    throw new CanNotRegisterCircleException(
                        $circle,
                        "サークルは既に存在しています。",
                    );
                }
            }

            $this->circleRepository->save($circle);
        }
    }
    ```

**コラム**

これまでの話のなかで、プロパティはパブリックではなくプライベートを使用するべきであるような話の流れであった。

識別子にはドメインルールを持たせないほうがよいため、ドメインルール上の識別子（例：書籍の ISBN）はエンティティの識別子にしないほうがいい。

また、パブリックのほうが便利である。

そのため、パブリックでもよい。

リスト 12.21：識別子をゲッターで公開する

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	name    *CircleName
    	owner   *UserId
    	members []*UserId
    	id      *CircleId
    }

    func NewCircle(
    	id *CircleId,
    	name *CircleName,
    	owner *UserId,
    	members []*UserId,
    ) (*Circle, error) {
    	if id == nil {
    		return nil, errors.New("ArgumentNullException: id")
    	}
    	if name == nil {
    		return nil, errors.New("ArgumentNullException: name")
    	}
    	if owner == nil {
    		return nil, errors.New("ArgumentNullException: owner")
    	}
    	if members == nil {
    		return nil, errors.New("ArgumentNullException: members")
    	}

    	return &Circle{
    		id:      id,
    		name:    name,
    		owner:   owner,
    		members: members,
    	}, nil
    }

    func (c *Circle) Id() *CircleId {
    	return c.id
    }

    func (c *Circle) Notify(note ICircleNotification) {
    	note.Id(c.id)
    	note.Name(c.name)
    	note.Owner(c.owner)
    	note.Members(c.members)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      readonly id: CircleId;
      notify(note: ICircleNotification): void;
    }
    function createCircle(
      id: CircleId,
      name: CircleName,
      owner: UserId,
      members: UserId[],
    ): Circle {
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

      function notify(note: ICircleNotification): void {
        note.id(id);
        note.name(name);
        note.owner(owner);
        note.members(members);
      }
      return {
        get id() {
          return id;
        },
        notify,
      };
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private CircleName $name;
        private UserId $owner;
        private array $members;
        public readonly CircleId $id;

        public function __construct(
            ?CircleId $id,
            ?CircleName $name,
            ?UserId $owner,
            ?array $members,
        ) {
            if ($id === null) {
                throw new Exception("ArgumentNullException: id");
            }
            if ($name === null) {
                throw new Exception("ArgumentNullException: name");
            }
            if ($owner === null) {
                throw new Exception("ArgumentNullException: owner");
            }
            if ($members === null) {
                throw new Exception("ArgumentNullException: members");
            }

            $this->id = $id;
            $this->name = $name;
            $this->owner = $owner;
            $this->members = $members;
        }

        public function notify(ICircleNotification $note): void
        {
            $note->id($this->id);
            $note->name($this->name);
            $note->owner($this->owner);
            $note->members($this->members);
        }
    }
    ```

## 12.3 集約の大きさと操作の単位

集約の粒度は大きくならないように気を付ける。

大きいほど、単一のトランザクションの対象になるレコードが増えるため、レコードロックの範囲が大きくなる。

```
テーブル内のロックの範囲はいくつか種類があるが、筆者は言及していなかったため、ここではレコードロックとした
```

### 12.3.1 トランザクション範囲の定義 (長谷川が追加したセクション)

トランザクション処理はユースケース層で定義するとよい。

例えば、`READ` 処理と `UPDATE` 処理の両方が必要な更新系ユースケースでは、`READ` 処理と `UPDATE` 処理の間のタイミングで、ほかのユーザーがデータを更新してしまう可能性がある。

そのため、ユースケース層でトランザクション処理を定義し、定義したトランザクション範囲内でリポジトリを呼び出す。

=== "Go"

    ```go title="Go の場合の実装例"
    type CircleApplicationService struct {
    	db               *sql.DB
    	circleRepository ICircleRepository
    	userRepository   IUserRepository
    }

    func NewCircleApplicationService(
    	db *sql.DB,
    	circleRepository ICircleRepository,
    	userRepository IUserRepository,
    ) *CircleApplicationService {
    	return &CircleApplicationService{
    		db:               db,
    		circleRepository: circleRepository,
    		userRepository:   userRepository,
    	}
    }

    func (s *CircleApplicationService) Join(ctx context.Context, command *CircleJoinCommand) error {
    	// トランザクション処理を実行
    	tx, err := s.db.BeginTx(ctx, nil)
    	if err != nil {
    		return err
    	}
    	defer tx.Rollback()

    	circleRepository := NewCircleRepository(tx)
    	userRepository := NewUserRepository(tx)

    	// READ処理
    	circle, err := circleRepository.Find(
    		ctx,
    		NewCircleId(command.CircleId),
    	)
    	if err != nil {
    		return err
    	}
    	user, err := userRepository.Find(ctx, NewUserId(command.UserId))
    	if err != nil {
    		return err
    	}

    	if circle == nil || user == nil {
    		return errors.New("Circle or User not found.")
    	}

    	if err := circle.Join(user); err != nil {
    		return err
    	}

    	// UPDATE処理
    	if err := circleRepository.Save(ctx, circle); err != nil {
    		return err
    	}

    	return tx.Commit()
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface CircleApplicationService {
      join(command: CircleJoinCommand): Promise<void>;
    }
    function createCircleApplicationService(
      prisma: PrismaClient,
      circleRepository: ICircleRepository,
      userRepository: IUserRepository,
    ): CircleApplicationService {
      async function join(command: CircleJoinCommand): Promise<void> {
        // トランザクション処理を実行
        await prisma.$transaction(async (tx) => {
          const circleRepository = createCircleRepository(tx);
          const userRepository = createUserRepository(tx);

          // READ処理
          const circle = await circleRepository.find(
            createCircleId(command.circleId),
          );
          const user = await userRepository.find(createUserId(command.userId));

          if (!circle || !user) {
            throw new Error("Circle or User not found.");
          }

          circle.join(user);

          // UPDATE処理
          await circleRepository.save(circle);
        });
      }
      return {join};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class CircleApplicationService
    {
        public function __construct(
            private readonly PDO $pdo,
            private readonly ICircleRepository $circleRepository,
            private readonly IUserRepository $userRepository,
        ) {
        }

        public function join(CircleJoinCommand $command): void
        {
            // トランザクション処理を実行
            $this->pdo->beginTransaction();

            try {
                $circleRepository = new CircleRepository($this->pdo);
                $userRepository = new UserRepository($this->pdo);

                // READ処理
                $circle = $circleRepository->find(
                    new CircleId($command->circleId),
                );
                $user = $userRepository->find(new UserId($command->userId));

                if ($circle === null || $user === null) {
                    throw new Exception("Circle or User not found.");
                }

                $circle->join($user);

                // UPDATE処理
                $circleRepository->save($circle);

                $this->pdo->commit();
            } catch (Throwable $e) {
                $this->pdo->rollBack();
                throw $e;
            }
        }
    }
    ```

> - [【戦術的DDD】なぜトランザクションをユースケース層で張るのか - Yappli Tech Blog](https://tech.yappli.io/entry/ddd_usecase)

**コラム**

なんらかの事情で、Repository による永続化の対象が複数の集約にどうしてもまたがってしまう場合、結果整合性で辻褄合わせしてもよい。

例えば、Cron 処理で一日 1 回データベースを検査し、不整合のあるデータを書き換えてしまう。

![domain_driven_design_nyumon_bottom_up_chapter_12-05](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/domain_driven_design_nyumon_bottom_up_chapter_12-05.png)

## 12.4 言葉との齟齬を消す

```
前章の「ドメインルールの漏れだし」の続き？
```

isFull 関数は、『サークルに所属するユーザの最大数はサークルのオーナーとなるユーザを含めて 30 名まで』というドメインルールを表現したものである。

ロジックは間違っていないが、`29` と比較しており、ドメインルールの誤解を招きやすく可読性が低い。

リスト 12.22：30 ではなく 29 が現れている

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	owner   *User
    	members []*User
    }

    func NewCircle(owner *User, members []*User) *Circle {
    	if members == nil {
    		members = []*User{}
    	}

    	return &Circle{
    		owner:   owner,
    		members: members,
    	}
    }

    func (c *Circle) IsFull() bool {
    	return len(c.members) >= 29
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      isFull(): boolean;
    }
    function createCircle(owner: User, members: User[] = []): Circle {
      function isFull(): boolean {
        return members.length >= 29;
      }
      return {isFull};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private User $owner;
        private array $members;

        public function __construct(User $owner, array $members = [])
        {
            $this->owner = $owner;
            $this->members = $members;
        }

        public function isFull(): bool
        {
            return count($this->members) >= 29;
        }
    }
    ```

そこで、countMembers 関数を用意し、`30` と比較することで、可読性を高くするべきである。

リスト 12.23：サークルのオーナーとメンバーの定義

=== "Go"

    ```go title="Go の場合の実装例"
    type Circle struct {
    	owner   *User
    	members []*User
    }

    func NewCircle(owner *User, members []*User) *Circle {
    	if members == nil {
    		members = []*User{}
    	}

    	return &Circle{
    		owner:   owner,
    		members: members,
    	}
    }

    func (c *Circle) IsFull() bool {
    	return c.CountMembers() >= 30
    }

    func (c *Circle) CountMembers() int {
    	return len(c.members) + 1
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    interface Circle {
      isFull(): boolean;
      countMembers(): number;
    }
    function createCircle(owner: User, members: User[] = []): Circle {
      function isFull(): boolean {
        return countMembers() >= 30;
      }

      function countMembers(): number {
        return members.length + 1;
      }
      return {isFull, countMembers};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class Circle
    {
        private User $owner;
        private array $members;

        public function __construct(User $owner, array $members = [])
        {
            $this->owner = $owner;
            $this->members = $members;
        }

        public function isFull(): bool
        {
            return $this->countMembers() >= 30;
        }

        public function countMembers(): int
        {
            return count($this->members) + 1;
        }
    }
    ```

## 12.5 まとめ

集約は機械的に決められるものではなく、集約とドメインは相互につながっており、境界線を引くのは難しい。

境界線を引いて集約を見つけることは、ドメインをとらえ、そこにある変更の単位を導き出し、最適解を目指す作業である。
