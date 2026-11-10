---
title: 【IT技術の知見】13章
description: 13章の知見を記録しています。
---

# 13章

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter13 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter13)

<br>

## 01. Specification パターンとは

## 02. 使用方法

### 仕様条件オブジェクトとして

エンティティから切り分けたドメインルール条件オブジェクトとして実装する。

複数のエンティティをまたぐドメインルールの検証は Specification パターンに切り分けるのがよい。

単一のエンティティに関する単一のドメインルールの場合は、Specification パターンとして切り分けずに、そのエンティティに boolean 値関数 (`isFoo()` 関数) をもたせる。

=== "Go"

    ```go title="Go の場合の実装例"
    type CircleFullSpecification struct {
    	userRepository IUserRepository
    }

    func NewCircleFullSpecification(userRepository IUserRepository) *CircleFullSpecification {
    	return &CircleFullSpecification{userRepository: userRepository}
    }

    func (s *CircleFullSpecification) IsSatisfiedBy(circle *Circle) (bool, error) {
    	users, err := s.userRepository.Find(circle.Members)
    	if err != nil {
    		return false, err
    	}

    	premiumUserNumber := 0
    	for _, user := range users {
    		if user.IsPremium {
    			premiumUserNumber++
    		}
    	}

    	circleUpperLimit := 50
    	if premiumUserNumber < 10 {
    		circleUpperLimit = 30
    	}

    	return circle.CountMembers() >= circleUpperLimit, nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface CircleFullSpecification {
      isSatisfiedBy(circle: Circle): Promise<boolean>;
    }
    export function createCircleFullSpecification(
      userRepository: IUserRepository,
    ): CircleFullSpecification {
      async function isSatisfiedBy(circle: Circle): Promise<boolean> {
        const users = await userRepository.find(circle.members);

        const premiumUserNumber = users.filter((user) => user.isPremium).length;

        const circleUpperLimit = premiumUserNumber < 10 ? 30 : 50;

        return circle.countMembers() >= circleUpperLimit;
      }
      return {isSatisfiedBy};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final class CircleFullSpecification
    {
        public function __construct(
            private readonly IUserRepository $userRepository,
        ) {
        }

        public function isSatisfiedBy(Circle $circle): bool
        {
            $users = $this->userRepository->find($circle->members);

            $premiumUserNumber = count(array_filter($users, fn (User $user) => $user->isPremium));

            $circleUpperLimit = $premiumUserNumber < 10 ? 30 : 50;

            return $circle->countMembers() >= $circleUpperLimit;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type CircleApplicationService struct {
    	circleFactory    ICircleFactory
    	circleRepository ICircleRepository
    	circleService    *CircleService
    	userRepository   IUserRepository
    }

    func NewCircleApplicationService(
    	circleFactory ICircleFactory,
    	circleRepository ICircleRepository,
    	circleService *CircleService,
    	userRepository IUserRepository,
    ) *CircleApplicationService {
    	return &CircleApplicationService{
    		circleFactory:    circleFactory,
    		circleRepository: circleRepository,
    		circleService:    circleService,
    		userRepository:   userRepository,
    	}
    }

    func (s *CircleApplicationService) Join(command CircleJoinCommand) error {
    	circleId := NewCircleId(command.CircleId)

    	circle, err := s.circleRepository.Find(circleId)
    	if err != nil {
    		return err
    	}

    	users, err := s.userRepository.Find(circle.Members)
    	if err != nil {
    		return err
    	}

    	// サークルに所属しているプレミアムユーザの人数により上限が変わる
    	premiumUserNumber := 0
    	for _, user := range users {
    		if user.IsPremium {
    			premiumUserNumber++
    		}
    	}
    	circleUpperLimit := 50
    	if premiumUserNumber < 10 {
    		circleUpperLimit = 30
    	}

    	if circle.CountMembers() >= circleUpperLimit {
    		return NewCircleFullException(circleId)
    	}

    	memberId := NewUserId(command.UserId)
    	member, err := s.userRepository.FindById(memberId)
    	if err != nil {
    		return err
    	}

    	if member == nil {
    		return NewUserNotFoundException(
    			memberId,
    			"ユーザが見つかりませんでした。",
    		)
    	}

    	circle.Join(member)
    	return s.circleRepository.Save(circle)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface CircleApplicationService {
      join(command: CircleJoinCommand): Promise<void>;
    }
    export function createCircleApplicationService(
      circleFactory: ICircleFactory,
      circleRepository: ICircleRepository,
      circleService: CircleService,
      userRepository: IUserRepository,
    ): CircleApplicationService {
      async function join(command: CircleJoinCommand): Promise<void> {
        const circleId = createCircleId(command.circleId);

        const circle = await circleRepository.find(circleId);

        const users = await userRepository.find(circle.members);

        // サークルに所属しているプレミアムユーザの人数により上限が変わる
        const premiumUserNumber = users.filter((user) => user.isPremium).length;
        const circleUpperLimit = premiumUserNumber < 10 ? 30 : 50;

        if (circle.countMembers() >= circleUpperLimit) {
          throw new CircleFullException(circleId);
        }

        const memberId = createUserId(command.userId);
        const member = await userRepository.find(memberId);

        if (!member) {
          throw new UserNotFoundException(
            memberId,
            "ユーザが見つかりませんでした。",
          );
        }

        circle.join(member);
        await circleRepository.save(circle);
      }
      return {join};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final class CircleApplicationService
    {
        public function __construct(
            private readonly ICircleFactory $circleFactory,
            private readonly ICircleRepository $circleRepository,
            private readonly CircleService $circleService,
            private readonly IUserRepository $userRepository,
        ) {
        }

        public function join(CircleJoinCommand $command): void
        {
            $circleId = new CircleId($command->circleId);

            $circle = $this->circleRepository->find($circleId);

            $users = $this->userRepository->find($circle->members);

            // サークルに所属しているプレミアムユーザの人数により上限が変わる
            $premiumUserNumber = count(array_filter($users, fn (User $user) => $user->isPremium));
            $circleUpperLimit = $premiumUserNumber < 10 ? 30 : 50;

            if ($circle->countMembers() >= $circleUpperLimit) {
                throw new CircleFullException($circleId);
            }

            $memberId = new UserId($command->userId);
            $member = $this->userRepository->find($memberId);

            if ($member === null) {
                throw new UserNotFoundException(
                    $memberId,
                    "ユーザが見つかりませんでした。",
                );
            }

            $circle->join($member);
            $this->circleRepository->save($circle);
        }
    }
    ```

### クエリ検索条件オブジェクトとして

リポジトリの引数に渡すクエリ検索条件オブジェクトとして実装する。

Criteria パターンと呼ぶこともある。

=== "Go"

    ```go title="Go の場合の実装例"
    type CircleRecommendSpecification struct {
    	executeDateTime time.Time
    }

    func NewCircleRecommendSpecification(executeDateTime time.Time) *CircleRecommendSpecification {
    	return &CircleRecommendSpecification{executeDateTime: executeDateTime}
    }

    func (s *CircleRecommendSpecification) IsSatisfiedBy(circle *Circle) bool {
    	if circle.CountMembers() < 10 {
    		return false
    	}
    	oneMonthAgo := s.executeDateTime.AddDate(0, -1, 0)
    	return circle.Created.After(oneMonthAgo)
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface CircleRecommendSpecification {
      isSatisfiedBy(circle: Circle): boolean;
    }
    export function createCircleRecommendSpecification(
      executeDateTime: Date,
    ): CircleRecommendSpecification {
      function isSatisfiedBy(circle: Circle): boolean {
        if (circle.countMembers() < 10) {
          return false;
        }
        const oneMonthAgo = new Date(executeDateTime);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return circle.created > oneMonthAgo;
      }
      return {isSatisfiedBy};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final class CircleRecommendSpecification
    {
        public function __construct(
            private readonly DateTimeImmutable $executeDateTime,
        ) {
        }

        public function isSatisfiedBy(Circle $circle): bool
        {
            if ($circle->countMembers() < 10) {
                return false;
            }
            $oneMonthAgo = $this->executeDateTime->modify("-1 month");
            return $circle->created > $oneMonthAgo;
        }
    }
    ```

===! "Go"

    ```go title="Go の場合の実装例"
    type CircleApplicationService struct {
    	circleFactory    ICircleFactory
    	circleRepository ICircleRepository
    	circleService    *CircleService
    	userRepository   IUserRepository
    	now              time.Time
    }

    func NewCircleApplicationService(
    	circleFactory ICircleFactory,
    	circleRepository ICircleRepository,
    	circleService *CircleService,
    	userRepository IUserRepository,
    	now time.Time,
    ) *CircleApplicationService {
    	return &CircleApplicationService{
    		circleFactory:    circleFactory,
    		circleRepository: circleRepository,
    		circleService:    circleService,
    		userRepository:   userRepository,
    		now:              now,
    	}
    }

    func (s *CircleApplicationService) GetRecommend(
    	request CircleGetRecommendRequest,
    ) (*CircleGetRecommendResult, error) {
    	circleRecommendSpecification := NewCircleRecommendSpecification(
    		s.now,
    	)

    	// リポジトリに仕様を引き渡して抽出（フィルタリング）
    	circles, err := s.circleRepository.FindBySpecification(circleRecommendSpecification)
    	if err != nil {
    		return nil, err
    	}
    	recommendCircles := circles[:min(len(circles), 10)]

    	return NewCircleGetRecommendResult(recommendCircles), nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface CircleApplicationService {
      getRecommend(
        request: CircleGetRecommendRequest,
      ): Promise<CircleGetRecommendResult>;
    }
    export function createCircleApplicationService(
      circleFactory: ICircleFactory,
      circleRepository: ICircleRepository,
      circleService: CircleService,
      userRepository: IUserRepository,
      now: Date,
    ): CircleApplicationService {
      async function getRecommend(
        request: CircleGetRecommendRequest,
      ): Promise<CircleGetRecommendResult> {
        const circleRecommendSpecification =
          createCircleRecommendSpecification(now);

        // リポジトリに仕様を引き渡して抽出（フィルタリング）
        const recommendCircles = (
          await circleRepository.find(circleRecommendSpecification)
        ).slice(0, 10);

        return createCircleGetRecommendResult(recommendCircles);
      }
      return {getRecommend};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final class CircleApplicationService
    {
        public function __construct(
            private readonly ICircleFactory $circleFactory,
            private readonly ICircleRepository $circleRepository,
            private readonly CircleService $circleService,
            private readonly IUserRepository $userRepository,
            private readonly DateTimeImmutable $now,
        ) {
        }

        public function getRecommend(
            CircleGetRecommendRequest $request,
        ): CircleGetRecommendResult {
            $circleRecommendSpecification = new CircleRecommendSpecification(
                $this->now,
            );

            // リポジトリに仕様を引き渡して抽出（フィルタリング）
            $recommendCircles = array_slice(
                $this->circleRepository->find($circleRecommendSpecification),
                0,
                10,
            );

            return new CircleGetRecommendResult($recommendCircles);
        }
    }
    ```

<br>
