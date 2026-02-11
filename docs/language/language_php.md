---
title: 【IT技術の知見】PHP
description: PHPの知見を記録しています。
---

# PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PHPとは

記入中...

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

```bash
# 外部リポジトリをインストールする。
$ apt -y install software-properties-common

# PHPのリポジトリを登録する。
$ add-apt-repository ppa:ondrej/php

$ apt-get update

# PHPをインストールする。
$ apt -y install php=1.0.0
```

> - https://loop-never-ends.com/ubuntu-php-install/

<br>

### Dockerfile

#### ▼ Laravel、PHP-FPMを使用する場合

```dockerfile
#===================
# Global ARG
#===================
ARG PHP_FPM_VERSION="<バージョン>"
ARG PHP_COMPOSER_VERSION="<バージョン>"
ARG LABEL="Hiroki <example@gmail.com>"

#===================
# Base Stage
#===================
FROM php:${PHP_FPM_VERSION}-fpm as base

RUN apt-get update -y \
  && apt-get install -y \
      git \
      vim \
      unzip \
      zip \
  && docker-php-ext-install \
      bcmath \
      pdo_mysql \
  && apt-get clean

COPY --from=composer:${PHP_COMPOSER_VERSION} /usr/bin/composer /usr/bin/composer

#===================
# Development Stage
#===================
FROM base as development
LABEL mantainer=${LABEL}

#===================
# Production Stage
#===================
FROM base as production
LABEL mantainer=${LABEL}

COPY ../software /var/www/foo/
```

<br>

## 03. 拡張機能

### OPcache

#### ▼ OPcacheとは

通常、PHPのコードは実行の度にバイナリ形式のコードに変換される。

バイナリ形式のコードのキャッシュを作成しておき、コードが変更された時だけ変換する。

これにより、PHPのコードの実行が高速化される。

> - https://weblabo.oscasierra.net/php-opcache/

<br>

## 04. 実装スタイル

### クラスベースオブジェクト指向型

振る舞いは内部に状態を持つ。

副作用はあってもなくともよい（同じ入力の時に、出力は同じでも異なってもよい）。

状態／振る舞いが結合している。

ほかの型と共存できる。

```php
<?php

class User {
    // オブジェクトの状態を設定する
    public string $name;
    public int $age;

    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age = $age;
    }

    // 振る舞い
    public function isAdult(): bool {
        return $this->age >= 18;
    }
}

$user = new User("Alice", 20);
echo $user->isAdult() ? "true" : "false"; // true
```

<br>

### 関数型

振る舞いは状態をもたず、外部から状態を注入する。

副作用をなくす必要がある（同じ入力であれば、出力も同じである）。

状態／振る舞いが分離している。

ほかの型と共存できる。

```php
<?php

// オブジェクトの状態を設定する
$user = [
    "name" => "Alice",
    "age" => 20,
];

// 振る舞い
function isAdult(array $user): bool {
    return $user["age"] >= 18;
}

echo isAdult($user) ? "true" : "false"; // true
```

<br>
