---
title: 【IT技術の知見】13章＠ドメイン駆動設計入門ボトムアップ
description: 13章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# 13章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter13

<br>

## 01. Specificationパターンとは

## 02. 使用方法

### 仕様条件オブジェクトとして

エンティティから切り分けたドメインルール条件オブジェクトとして実装する。

複数のエンティティをまたぐビジネスルールの検証はSpecificationパターンに切り分けるのがよい。

単一のエンティティに関する単一のビジネスルールの場合は、Specificationパターンとして切り分けずに、そのエンティティにboolean値メソッド (`isFoo`メソッド) をもたせる。

```typescript
export class CircleFullSpecification {
  constructor(private readonly userRepository: IUserRepository) {}

  public async isSatisfiedBy(circle: Circle): Promise<boolean> {
    const users = await this.userRepository.find(circle.members);

    const premiumUserNumber = users.filter((user) => user.isPremium).length;

    const circleUpperLimit = premiumUserNumber < 10 ? 30 : 50;

    return circle.countMembers() >= circleUpperLimit;
  }
}
```

```typescript
export class CircleApplicationService {
  constructor(
    private readonly circleFactory: ICircleFactory,
    private readonly circleRepository: ICircleRepository,
    private readonly circleService: CircleService,
    private readonly userRepository: IUserRepository,
  ) {}

  public async join(command: CircleJoinCommand): Promise<void> {
    const circleId = new CircleId(command.circleId);

    const circle = await this.circleRepository.find(circleId);

    const users = await this.userRepository.find(circle.members);

    // サークルに所属しているプレミアムユーザの人数により上限が変わる
    const premiumUserNumber = users.filter((user) => user.isPremium).length;
    const circleUpperLimit = premiumUserNumber < 10 ? 30 : 50;

    if (circle.countMembers() >= circleUpperLimit) {
      throw new CircleFullException(circleId);
    }

    const memberId = new UserId(command.userId);
    const member = await this.userRepository.find(memberId);

    if (!member) {
      throw new UserNotFoundException(
        memberId,
        "ユーザが見つかりませんでした。",
      );
    }

    circle.join(member);
    await this.circleRepository.save(circle);
  }
}
```

### クエリ検索条件オブジェクトとして

リポジトリに渡すクエリ検索条件オブジェクトとして実装する。

Criteriaパターンと呼ぶこともある。

```typescript
export class CircleRecommendSpecification {
  constructor(private readonly executeDateTime: Date) {}

  public isSatisfiedBy(circle: Circle): boolean {
    if (circle.countMembers() < 10) {
      return false;
    }
    const oneMonthAgo = new Date(this.executeDateTime);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return circle.created > oneMonthAgo;
  }
}
```

```typescript
export class CircleApplicationService {
  constructor(
    private readonly circleFactory: ICircleFactory,
    private readonly circleRepository: ICircleRepository,
    private readonly circleService: CircleService,
    private readonly userRepository: IUserRepository,
    private readonly now: Date,
  ) {}

  public async getRecommend(
    request: CircleGetRecommendRequest,
  ): Promise<CircleGetRecommendResult> {
    const circleRecommendSpecification = new CircleRecommendSpecification(
      this.now,
    );

    // リポジトリに仕様を引き渡して抽出（フィルタリング）
    const recommendCircles = (
      await this.circleRepository.find(circleRecommendSpecification)
    ).slice(0, 10);

    return new CircleGetRecommendResult(recommendCircles);
  }
}
```

<br>
