---
title: 【IT技術の知見】８章＠ドメイン駆動設計入門ボトムアップ
description: ８章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ８章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## サンプルコード

> - [itddd/SampleCodes/Chapter8 at master · nrslib/itddd · GitHub](https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter8)

<br>

## 8.1 インターフェース

- フロントエンド領域
- API
- CLI ツールのエントリーポイント

<br>

## 8.2 コマンドラインインターフェースに組み込んでみよう

### 全体像

```yaml
UserController、UserRequestDTO # インターフェース層
↓
UserUsecaseService # ユースケース層
↓
IUserRepository # ドメイン層
↑
UserRepository／InMemoryUserRepository # インフラストラクチャ層
```

<br>

### インターフェース層

#### ▼ UserController

=== "Go"

    ```go title="Go の場合の実装例"
    package controller

    import (
    	"encoding/json"
    	"net/http"

    	"app/application"
    	"app/application/dto"
    )

    type UserController struct {
    	service application.IUserApplicationService
    }

    func NewUserController(service application.IUserApplicationService) *UserController {
    	return &UserController{
    		service: service,
    	}
    }

    func (c *UserController) Register(w http.ResponseWriter, r *http.Request) {
    	var body struct {
    		Name  string `json:"name"`
    		Email string `json:"email"`
    	}
    	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
    		http.Error(w, err.Error(), http.StatusBadRequest)
    		return
    	}

    	dto := dto.NewUserRegisterDto(body.Name, body.Email)
    	if err := c.service.Register(dto); err != nil {
    		http.Error(w, err.Error(), http.StatusInternalServerError)
    		return
    	}

    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusOK)
    	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {Request, Response} from "express";
    import {createUserRegisterDto} from "../../application/dto/UserRegisterDto";
    import {IUserApplicationService} from "../../application/UserApplicationService";

    export interface UserController {
      register(req: Request, res: Response): Promise<void>;
    }
    export function createUserController(
      service: IUserApplicationService,
    ): UserController {
      async function register(req: Request, res: Response): Promise<void> {
        const dto = createUserRegisterDto(req.body.name, req.body.email);
        await service.register(dto);
        res.status(200).json({message: "User registered successfully"});
      }
      return {register};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    use App\Application\Dto\UserRegisterDto;
    use App\Application\IUserApplicationService;

    class UserController
    {
        public function __construct(private readonly IUserApplicationService $service)
        {
        }

        public function register(): void
        {
            $body = json_decode(file_get_contents("php://input"), true);
            $dto = new UserRegisterDto($body["name"], $body["email"]);
            $this->service->register($dto);
            http_response_code(200);
            header("Content-Type: application/json");
            echo json_encode(["message" => "User registered successfully"]);
        }
    }
    ```

#### ▼ RequestDTO

=== "Go"

    ```go title="Go の場合の実装例"
    package dto

    type UserRegisterDto struct {
    	Name  string
    	Email string
    }

    func NewUserRegisterDto(name string, email string) UserRegisterDto {
    	return UserRegisterDto{
    		Name:  name,
    		Email: email,
    	}
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    export interface UserRegisterDto {
      readonly name: string;

      readonly email: string;
    }
    export function createUserRegisterDto(
      name: string,
      email: string,
    ): UserRegisterDto {
      return {name, email};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    class UserRegisterDto
    {
        public function __construct(
            public readonly string $name,
            public readonly string $email,
        ) {
        }
    }
    ```

<br>

### ユースケース層

#### ▼ ApplicationService

=== "Go"

    ```go title="Go の場合の実装例"
    package application

    import "app/application/dto"

    type IUserApplicationService interface {
    	Register(dto dto.UserRegisterDto) error
    }

    type UserApplicationService struct{}

    func (s *UserApplicationService) Register(dto dto.UserRegisterDto) error {
    	// ここでUserRepositoryを実行する
    	return nil
    }
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    import {UserRegisterDto} from "./dto/UserRegisterDto";

    export interface IUserApplicationService {
      register(dto: UserRegisterDto): Promise<void>;
    }

    export interface UserApplicationService extends IUserApplicationService {
      register(dto: UserRegisterDto): Promise<void>;
    }
    export function createUserApplicationService(): UserApplicationService {
      async function register(dto: UserRegisterDto): Promise<void> {
        // ここでUserRepositoryを実行する
      }
      return {register};
    }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    use App\Application\Dto\UserRegisterDto;

    interface IUserApplicationService
    {
        public function register(UserRegisterDto $dto): void;
    }

    class UserApplicationService implements IUserApplicationService
    {
        public function register(UserRegisterDto $dto): void
        {
            // ここでUserRepositoryを実行する
        }
    }
    ```

<br>

### 依存性逆転の実装方法

#### ▼ IoC コンテナパターン

#### ▼ Service Locator パターン

依存関係がわかりにくくなるため、アンチパターンである。

#### ▼ Singleton パターン

依存関係がわかりにくくなるため、アンチパターンである。

#### ▼ パターンを使用しない

インターフェースの実装を動的に切り替える必要がなければ、パターンを使用しないほうがよい。

<br>
