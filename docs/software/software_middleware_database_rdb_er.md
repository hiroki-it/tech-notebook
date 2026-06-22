---
title: 【IT技術の知見】ER図＠RDB
description: ER図＠RDBの知見を記録しています。
---

# ER図＠RDB

## マルチテナントの場合

マルチテナントでは、Tenantモデルをデータ分離の境界として扱う。

UserモデルやWorkspaceモデルなどのテナント配下のテーブルは `tenantId` を持つ。

これにより、認可後のRead処理をTenant単位で絞り込める。

Workspaceモデル配下のデータも `tenantId` を含むキーで親子関係を表す。

RoleモデルとPolicyモデルはUserモデルやTenantTokenモデルに紐づけ、画面操作やAPI操作の権限を表現する。


| モデル | 役割 |
| --- | --- |
| `Tenant` | マルチテナントにおけるデータ分離の単位 |
| `User` | Tenantに所属する利用者。Roleを通じて操作権限を持つ |
| `TenantToken` | Tenantに紐づくAPIアクセス用のトークン。Userと同様にRoleを持つ |
| `Role` | UserやTenantTokenに割り当てる権限のまとまり |
| `Policy` | 画面やAPIに対する操作可否を表すルール |
| `RolePolicy` | RoleとPolicyを多対多で紐づける中間モデル |
| `Workspace` | Tenant配下で業務データをまとめる作業領域 |
| `Quota` | Tenantごとの利用上限 |
| `Foo` | Workspace配下に作成される業務データの例 |


```mermaid
erDiagram
  Tenant ||--o{ User : has
  Tenant ||--o{ TenantToken : has
  Tenant ||--o{ Workspace : owns
  Tenant ||--o{ Quota : has

  User }o--|| Role : assigned
  TenantToken }o--|| Role : assigned
  Role ||--o{ RolePolicy : has
  Policy ||--o{ RolePolicy : used_by

  Workspace ||--o{ Foo : has

  Tenant {
    string id PK
    string name UK
    string defaultRole
  }

  User {
    string id PK
    string tenantId FK
    string email
    string roleName FK
  }

  TenantToken {
    string tenantId PK,FK
    string name PK
    string token UK
    string roleName FK
  }

  Role {
    string name PK
    string scope
  }

  Policy {
    string name PK
    string context
  }

  RolePolicy {
    string roleName PK,FK
    string policyName PK,FK
  }

  Workspace {
    string tenantId PK,FK
    string name PK
  }

  Quota {
    string tenantId PK,FK
    string resource PK
  }

  Foo {
    string tenantId PK,FK
    string workspaceName PK,FK
    string name PK
  }
```

<br>
