---
title: 【知見を記録するサイト】コンポーネント＠Symfony
description: コンポーネント＠Symfonyの知見をまとめました．
---

# コンポーネント＠Symfony

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 参考になるリファレンス

参考：https://symfony.com/doc/current/the-fast-track/ja/

<br>

## 01-02. ディレクトリ構成

```bash
symfony/
├── config/ # 設定ファイル（カーネルのためのルート定義ファイル等）
│
├── bin/ # コマンドラインツール
│   ├── console/ #bin/consoleコマンドの実行ファイル
│   └── symfony_requirements/
│
├── public/
|   ├── index.php # 本番環境で，カーネルとして動く
|   └── index_dev.php # 開発環境で，カーネルとして動く
│
├── src/ # 主要なPHPファイル
│   ├── AppBundle/ # アプリケーションのコード
│   │  ├── Controller/ # UserCase層
│   │  ├── Entity/ # エンティティ　⇒　Domain層
│   │  ├── Repository/ # リポジトリ ⇒ Infrastructure層
│   │  ├── Form/ # フォーム
│   │  └── Resources/
│   │       └── views/ # 画面テンプレート（※本書では扱わない） 
│   │           
│   └── その他のBundle/ # 汎用的なパッケージのコード（※本書では扱わない）
|
├── templates/ # UserInterface層
│   
├── test/ # 自動テスト（Unit tests等）
│  
├── var/ # 自動生成されるファイル
│   ├── cache/ # キャッシュファイル
│   ├── logs/ # ログファイル
│   └── sessions/
│
├── vendor/ # 外部パッケージ
│   ├── doctrine/ # パッケージ
│   ├── league/ # パッケージ
│   ├── sensio/
│   ├── swiftmailer/ # パッケージ
│   ├── symfonyコンポーネント/
│   └── twig/ # パッケージ
│
└── asset/ #ブラウザコンソールに公開されるファイル（css, javascript, image等）
    ├── admin/
    ├── bootstrap/
    ├── css/
    ├── fontawesome/
    ├── img/ # 画像ファイル
    ├── jquery/ # jquery（javascriptフレームワーク）
    └── js/ # javascriptファイル
```

<br>

## 02. 特に汎用的なコンポーネント

### Console

```php
<?php
    
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
```

<br>

### HttpFoundation

```php
<?php
    
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
```

<br>

### HttpKernel

```php
<?php
    
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
```

<br>

### Pimple

```php
<?php
    
use Pimple\ConfigSupport;
use Pimple\Container;
use Pimple\DiSupport;
use Pimple\ServiceProviderInterface;
```

<br>

### Security

```php
<?php
    
use Symfony\Component\Security\Core\AuthenticationEvents;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManager;
```

<br>

### EventDispatcher

```php
<?php
    
use Symfony\Component\EventDispatcher\Event;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
```

<br>

### Routing

```php
<?php
    
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;
```

<br>

### Cache

```php
<?php
    
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
```

<br>


## 03. Console

### CLI：Command Line Interface

#### ・CLIとは

シェルスクリプト（```.sh```），またはバッチファイル（```.bat```）におけるコマンドの処理内容を定義できる．

**＊実装例＊**

```php
<?php
    
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class createExampleCommand extends \Symfony\Component\Console\Command\Command
{
    // オプションの設定
    protected function configure()
    {
        // コマンド名
        $this->setName("create:example");

        // コマンド名の後に追加したい引数名
        $this->addArgument(
          "year-month",
          InputArgument::REQUIRED,
          "処理年月を設定してください．"
        );
    }
  
    // コマンドの処理内容
    protected function execute(InputeInterface $input, OutputInterface $output)
    {
        try {
                // 日時フォーマットからCarbonインスタンスを作成する．
                $year_month = Carbon::createFromFormat(
                  "Y-m",
                  $input->getArgument("year-month")
                );
        
        } catch (\Exception $e) {
            // エラーログの文章を作成
        }
    }
}
```

<br>

### CLIをコールするバッチファイル

#### ・```for```

```bash
# txtファイルを変数fに繰り返し格納し，処理を行う．
for f in *txt do echo $f; done;
```

#### ・Cronによるコマンドの自動実行

**＊例＊**

10秒ごとに，コマンドを自動実行する．

```bash
# 10秒ごとに，コマンド処理を実行．
for f in `seq 0 10 59`; do (sleep {$f}; create:example) & done;
```

```bash
# 15時ごとに，コマンド処理を実行．
0 15 * * * * create:example;
```

<br>

## 03-02. HttpFoundation

### AppKernel

![図2-9-ver2](https://user-images.githubusercontent.com/42175286/57711074-08c21b00-76a9-11e9-959e-b3777f70d2c6.png)

#### ・カーネルに必要なオブジェクト

1. Requestオブジェクト

   グローバル変数から収集した情報やHTTPリクエストのヘッダ情報やコンテンツ情報を保持

1. カーネルオブジェクトの```handle```メソッド

   送られてきたURLを基にしたコントローラー/アクションへのルートの特定，特定されたコントローラー/アクションの実行，テンプレートのレンダリング

1. Responseオブジェクト

   HTTPレスポンスのヘッダ情報やコンテンツ情報などの情報を保持

#### ・オブジェクトから取り出されたメソッドの役割

1. カーネルが，クラアントからのHTTPリクエストをリクエストオブジェクトとして受け取る．
1. カーネルが，送られてきたURLとルート定義を基に，リクエストに対応するコントローラーアクションを探し，実行させる．その後，テンプレートがURLを生成．
1. カーネルが，その結果をレスポンスオブジェクトとしてクライアントに返す．
   このカーネルを，特別に『HTTPカーネル』と呼ぶ．

**【app.phpの実装例】**

```php
<?php
    
use Symfony\Component\HttpFoundation\Request;


$kernel = new AppKernel("dev", true);

if (PHP_VERSION_ID < 70000) {
    $kernel->loadClassCache();
}

$request = Request::createFromGlobals();  //（１）

// 以下の実装ファイルも参照せよ．
$response = $kernel->handle($request); //（２）

$response->send(); //（３）

$kernel->terminate($request, $response);
```

上記の```handle```メソッドが定義されているファイル．ここで定義された```handle```メソッドが，C/Aへのルートの特定，特定されたC/Aの実行，テンプレートのレンダリングを行う．

```php
<?php
    
public function handle
(
    Request $request,
    $type = HttpKernelInterface::MASTER_REQUEST,
    $catch = true
)
{
    $this->boot();
    
    ++$this->requestStackSize;
    
    $this->resetServices = true;

    try {
        return $this->getHttpKernel()->handle($request, $type, $catch);
    
    } finally {
        --$this->requestStackSize;
    }
}
```

<br>

### Request，Response

#### ・リクエストメッセージからのデータ取得，JSON型データのレスポンス

1. Ajaxによるリクエストの場合，JSON型データをレスポンスし，かつページレンダリング．
2. Ajaxによるリクエストでない場合，ページレンダリングのみ

```php
<?php
    
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\FooReposiroy;

class ExampleController extends AbstractController 
{
    public function get(Request $req)
    {
        // Ajaxによるリクエストの場合．
        if ($req->headers->get("content-type") === "application/json") {
            
            $fooRepository = new FooRepository;
            $entityObject = $FooRepository->getEntity();
            
            //-- entityをObject型からArray型に変換する何らかの処理．--//
            
            // Ajaxにレンスポンス．
            return new JsonResponse([ 
                "value" => $entityArray
              ]);
        }
    
        return $this->render(".../foo.twig")->setStatusCode(200);
    }
}
```

#### ・リクエストヘッダーの取得

```php
<?php
    
// $_GET['foo']
$request->query->get('foo');
 
// $_POST['foo']
$request->request->get('foo');
 
// ルーティングパラメータ / ex) @Route('/{foo}')
$request->attributes->get('foo');
 
// $_COOKIE['foo']
$request->cookies->get('foo');
 
// $_FILES['foo']
$request->files->get('foo');
 
// $_SERVER['SCRIPT_FILENAME']
$request->server->get('SCRIPT_FILENAME');
 
// $_SERVER['HTTP_USER_AGENT']
$request->headers->get('User-Agent');
 
// query > attribute  > request の順で検索
$request->get('foo');
```

<br>

## 03-03. HttpKernel

### HttpKernelによるリクエストとレスポンス

![SymfonyのHttpKernelの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SymfonyのHttpKernelの仕組み.png)

<br>

## 03-04. Pimple

### Service Container

Symfonyから提供されるDIコンテナのこと．

<br>

## 03-05. Routing

### RoutingConfigurator

#### ・RoutingConfiguratorとは

コントローラーへのルーティングを設定する．

```php
<?php
    
use App\Controller\BlogApiController; // ルーティング先のコントローラーを読み出し
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

return function (RoutingConfigurator $routes) {
    $routes->add("api_post_show", "/api/posts/{id}")
        ->controller([BlogApiController::class, "show"])
        ->methods(["GET", "HEAD"])
    ;
    $routes->add("api_post_edit", "/api/posts/{id}")
        ->controller([BlogApiController::class, "edit"])
        ->methods(["PUT"])
    ;
};
```

<br>

## 03-06. Cache

### FilesystemAdapter

#### ・FilesystemAdapterとは

データをキャッシングできる．オプションで，名前空間，キャッシュ存続時間，キャッシュルートパスを指定できる．

```php
<?php
    
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

$cache = new FilesystemAdapter("", 0, "example/cache/");

// キャッシュIDに紐付くキャッシュアイテムオブジェクトを取得
$cacheItemObj = $cache->getItem("stats.products_count");

// キャッシュIDに紐付くキャッシュアイテムオブジェクトに，データが設定されていない場合
if (!$cacheItemObj->isHit()) {
  // キャッシュアイテムオブジェクトに，データを設定
  $cacheItemObj->set(777);
  // キャッシュアイテムオブジェクトを紐付ける．
  $cache->save($cacheItemObj);
}

// キャッシュIDに紐付くデータがあった場合，キャッシュアイテムオブジェクトを取得．
$cacheItemObj = $cache->get();

```

