---
title: 【IT技術の知見】６章＠ドメイン駆動設計入門ボトムアップ
description: ６章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ６章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter6 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter6)

<br>

## 6.1 アプリケーションサービスとは

アプリケーションサービスとは、ドメインオブジェクト（エンティティや値オブジェクト）を使用してユースケースを実現するオブジェクトである。

作成したドメインオブジェクトをインターフェース層に返却する。

<br>

## 6.2 アプリケーションサービスの実装方法（関数型）

=== "Go"

    ```go title="Go の場合の実装例"
    type UserRepositoryDI struct {
    	UserRepository UserRepository
    }

    type RegisterUserInput struct {
    	Name  string
    	Email string
    }

    func RegisterUser(
    	userRepositoryDI UserRepositoryDI,
    	input RegisterUserInput,
    ) (*User, error) {
    	name, err := CreateUserName(input.Name)

    	if err != nil {
    		return nil, err
    	}

    	email, err := CreateEmail(input.Email)

    	if err != nil {
    		return nil, err
    	}

    	exists, err := userRepositoryDI.UserRepository.FindByEmail(email)

    	if err != nil {
    		return nil, err
    	}

    	if exists != nil {
    		return nil, errors.New("Email already registered")
    	}

    	user := CreateUser(name, email)

    	if err := userRepositoryDI.UserRepository.Save(user); err != nil {
    		return nil, err
    	}

    	return user, nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export type userRepositoryDI = Readonly<{
      userRepository: UserRepository;
    }>;

    export type RegisterUserInput = Readonly<{
      name: string;
      email: string;
    }>;

    export const registerUser = async (
      userRepositoryDI: UserRepositoryDI,
      input: RegisterUserInput,
    ): Promise<Result<User>> => {
      const name = createUserName(input.name);

      if (name instanceof Error) {
        return err(name);
      }

      const email = createEmail(input.email);

      if (email instanceof Error) {
        return err(email);
      }

      const exists = await userRepositoryDI.userRepository.findByEmail(email);

      if (exists) {
        return err(new Error("Email already registered"));
      }

      const user = createUser(name, email);

      await userRepositoryDI.userRepository.save(user);

      return ok(user);
    };
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    final class UserRepositoryDI
    {
        public function __construct(
            public readonly UserRepository $userRepository,
        ) {
        }
    }

    final class RegisterUserInput
    {
        public function __construct(
            public readonly string $name,
            public readonly string $email,
        ) {
        }
    }

    function registerUser(
        UserRepositoryDI $userRepositoryDI,
        RegisterUserInput $input,
    ): Result {
        $name = createUserName($input->name);

        if ($name instanceof Error) {
            return err($name);
        }

        $email = createEmail($input->email);

        if ($email instanceof Error) {
            return err($email);
        }

        $exists = $userRepositoryDI->userRepository->findByEmail($email);

        if ($exists) {
            return err(new Error("Email already registered"));
        }

        $user = createUser($name, $email);

        $userRepositoryDI->userRepository->save($user);

        return ok($user);
    }
    ```

<br>

## 6.3 アプリケーションサービスで実装するべきロジックの見つけ方

ユーザーや外部クライアントから要求を受け、ユースケースを表現するロジックはアプリケーションサービスに適する。

<br>
