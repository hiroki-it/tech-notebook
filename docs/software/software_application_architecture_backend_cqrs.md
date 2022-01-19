# CQRS：Command Query Responsibility Segregation

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. CQRS

### CQRSとは

『Command Query Responsibility Segregation（コマンドクエリ責務分離）』の略．リポジトリパターンにおける更新系と参照系の処理を分離する設計のこと．更新系のオブジェクトはそのままリポジトリとしてインフラ層に置く．一方で参照系のオブジェクトは，参照のユースケースに応じて『QueryServiceオブジェクト』として設計し，ユースケース層に置く（これ重要）．ソフトウェアに部分的に組み込める．```N+1```問題にも対処できる．

参考：

- https://vaadin.com/learn/tutorials/ddd/tactical_domain_driven_design
- https://little-hands.hatenablog.com/entry/2019/12/02/cqrs

![cqrs](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cqrs.png)

<br>

### メリット

一覧画面に表示するデータは複数の集約からなるため，それぞれの集約に対応するリポジトリの参照系処理を順々にコールし，取得したデータを組み合わせる必要がある．そのため，一覧表示の度に複数のリポジトリをコールすることとなり，ソフトウェアのパフォーマンスに悪影響が出る可能性がある．また，異なるリポジトリをまたいでWHERE句を用いることはできないため，複数の集約に渡る絞り込み検索を実装できない．しかしCQRSを用いると，更新系のオブジェクトはリポジトリ，一方で参照系のオブジェクトはユースケースに応じたQueryServiceオブジェクトとして設計することになる．そのため，更新系では集約の単位をそのままにして，集約とは無関係な参照系処理を設計できる．

参考：https://little-hands.hatenablog.com/entry/2019/12/02/cqrs

<br>

## 01-02. 処理系の種類

### Command（更新系）

#### ・Commandとは

CREATE，UPDATE，DELETE処理を実行する処理フローのこと．今回，クリーンアーキテクチャを前提としてCQRSを説明する．概念や実装方法は以下のリンク先を参考にせよ．

参考：

- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design_clean_architecture.html
- https://github.com/hiroki-it/ddd-api-with-laravel#ddd-api-with-laravel

#### ・処理順序

1. インターフェース層のコントローラーにて，リクエストパラメータからリクエストモデルを作成する．
2. ユースケース層のインターラクターにて，リクエストモデルからデータを取り出し，ドメインモデルを作成する．これをインフラ層のリポジトリに渡す．
3. インフラ層の書き込み/読み出しリポジトリにて，IDモデルのデータを用いて，読み出し/書き込みリポジトリでSELECT文を実行し，DBからレコードを配列として取得する．続けて，ドメインモデルからデータを取り出し，配列の値を上書きする．この配列でINSERT/UPDATE文を実行する．インフラ層の実装は，全てを自前で実装せずにORMで代用できる．void型をユースケース層のインターラクターに渡す．
4. ユースケース層のインターラクターにて，リクエストモデルから作成した時に用いたドメインモデルを用いて，レスポンスモデルを作成する．レスポンスモデルをインタフェース層のコントローラーに渡す．
5. インターフェース層のコントローラーにて，レスポンスモデルをJSONに変換し，レスポンスを返信する．

<br>

### Query（参照系）

#### ・Queryとは

READ処理を実行するオブジェクトのこと．今回，クリーンアーキテクチャを前提としてCQRSを説明する．Queryでは概念や実装方法は以下のリンク先を参考にせよ．

参考：

- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design_clean_architecture.html
- https://github.com/hiroki-it/ddd-api-with-laravel#ddd-api-with-laravel

#### ・処理順序

1. インターフェース層のコントローラーにて，リクエストパラメータからリクエストモデルを作成する．

2. ユースケース層のインターラクターにて，リクエストモデルからデータを取り出し，QueryCriteriaオブジェクト（参照系検索条件）を作成する．ユースケースに応じたQueryServiceオブジェクトでは，QueryCriteriaオブジェクトを用いて，DBからレコードを配列として取得する．この配列からそのユースケースに対応するDTOを作成する．DTOをレスポンスモデルと見なし，そのままインタフェース層のコントローラーに渡す．

   参考：

   - https://stackoverflow.com/questions/19620404/entity-vs-dto-in-cqrs
   - https://softwareengineering.stackexchange.com/questions/378909/in-what-layer-are-the-dtos-stored-with-cqrs

3. インターフェース層のコントローラーにて，DTOをJSONに変換し，レスポンスを返信する．

<br>

## 02. CQRSに基づくイベント駆動アーキテクチャ

### CQRSとイベントソーシングの関係

イベントソーシングの実装方法は様々ある．イベントソーシングではDBアクセスの処理を更新系と参照系に分離することになるため，CQRSの方法論と相性が良い．

参考：

- https://little-hands.hatenablog.com/entry/2019/12/02/cqrs
- https://postd.cc/using-cqrs-with-event-sourcing/
