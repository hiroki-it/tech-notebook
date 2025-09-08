---
title: 【IT技術の知見】８章＠ドメイン駆動設計入門ボトムアップ
description: ６章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ８章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 8.1 ユーザーインターフェース

- フロントエンド領域
- API
- CLIツールのエントリーポイント

<br>

## 8.2 コマンドラインインターフェースに組み込んでみよう

### 全体像

```yaml
UserController、UserRequestDTO # ユーザーインターフェース層
↓
UserApplicationService # アプリケーション層
↓
IUserRepository # ドメイン層
↑
UserRepository／InMemoryUserRepository # インフラ層
```

<br>

### ユーザーインターフェース層

#### ▼ UserController

```typescript
import {Request, Response} from "express";
import {UserRegisterDto} from "../../application/dto/UserRegisterDto";
import {IUserApplicationService} from "../../application/UserApplicationService";

export class UserController {
  constructor(private readonly service: IUserApplicationService) {}

  async register(req: Request, res: Response): Promise<void> {
    const dto = new UserRegisterDto(req.body.name, req.body.email);
    await this.service.register(dto);
    res.status(200).json({message: "User registered successfully"});
  }
}
```

#### ▼ RequestDTO

```typescript
export class UserRegisterDto {
  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}
```

<br>

### アプリケーション層

#### ▼ ApplicationService

```typescript
import {UserRegisterDto} from "./dto/UserRegisterDto";

export interface IUserApplicationService {
  register(dto: UserRegisterDto): Promise<void>;
}

export class UserApplicationService implements IUserApplicationService {
  async register(dto: UserRegisterDto): Promise<void> {
    // ここでUserRepositoryを実行する
  }
}
```

<br>

### DI

#### ▼ IoCコンテナパターン

#### ▼ Service Locatorパターン

依存関係がわかりにくくなるため、アンチパターンである。

#### ▼ Singletonパターン

依存関係がわかりにくくなるため、アンチパターンである。

#### ▼ パターンを使用しない

インターフェースの実装を動的に切り替える必要がなければ、パターンを使用しない方が良い。

<br>
