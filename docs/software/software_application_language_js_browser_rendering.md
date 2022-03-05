---
title: 【知見を記録するサイト】ブラウザレンダリング
description: ブラウザレンダリングの知見をまとめました．
---

# ブラウザレンダリング

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ブラウザレンダリングの仕組み

### 構成する処理

以下の8つの処理からなる．クライアントの操作のたびにイベントが発火し，Scriptingプロセスが繰り返し実行される．

- Downloading
- Parse
- Scripting
- Rendering
- CalculateStyle
- Paint
- Rasterize
- Composite

![browser-rendering](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/browser-rendering.png)

<br>

## 01-02. マークアップ言語

#### ・マークアップ言語とは

ハードウェアが読み込むファイルには，バイナリファイルとテキストファイルがある．このうち，テキストファイルをタグとデータによって構造的に表現し，ハードウェアが読み込める状態する言語のこと．

#### ・マークアップ言語の歴史

Webページをテキストによって構成するための言語をマークアップ言語という．1970年，IBMが，タグによって，テキスト文章に構造や意味を持たせるGML言語を発表した．

![markup-language-history](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/markup-language-history.png)

<br>

### XML形式：Extensible Markup Language

#### ・XML形式とは

テキストファイルのうち，何らかのデータの構造を表現することに特化している．

#### ・スキーマ言語とは

マークアップ言語の特にXML形式で，タグの付け方は自由である．しかし，利用者間で共通のルールを設けた方が良い．ルールを定義するための言語をスキーマ言語という．スキーマ言語に，DTD：Document Type Definition（文書型定義）がある．

**＊実装例＊**

```xml
<!DOCTYPE Employee[
    <!ELEMENT Name (First, Last)>
    <!ELEMENT First (#PCDATA)>
    <!ELEMENT Last (#PCDATA)>
    <!ELEMENT Email (#PCDATA)>
    <!ELEMENT Organization (Name, Address, Country)>
    <!ELEMENT Name (#PCDATA)>
    <!ELEMENT Address (#PCDATA)>
    <!ELEMENT Country (#PCDATA)>
    ]>
```

<br>

### HTML形式：HyperText Markup Language

#### ・HTML形式とは

テキストファイルのうち，Webページの構造を表現することに特化している．

<br>

## 01-03. JavaScript

### マークアップ言語へのJavaScriptの組み込み

#### ・インラインスクリプト

JavaScriptファイルを直接組み込む方法．

```html
<script>
document.write("JavaScriptを直接組み込んでいます。")
</script>
```

#### ・外部スクリプト

外部JavaScriptファイルを組み込む方法．

```html
<script src="sample.js"></sc
    ript>
```

CDNの仕組みを用いて，Web上からリソースを取得することもできる．

```html
<script src="https://cdn.jsdelivr.net/npm/lazyload@2.0.0-rc.2/lazyload.min.js" integrity="sha256-WzuqEKxV9O7ODH5mbq3dUYcrjOknNnFia8zOyPhurXg=" crossorigin="anonymous"></script>
```

#### ・scriptタグが複数ある場合

1つのWebページのHTMLファイル内で，scriptタグが複数に分散していても，Scriptingプロセスでは，1つにまとめて実行される．そのため，より上部のscriptタグの処理は，より下部のscriptに引き継がれる．

1．例えば，以下のコードがある．

```html
localNum<p>見出し１</p>

<script>
var globalNum = 10;
</script>

<p>見出し２</p>

<script>
globalNum = globalNum * 10;
</script>

<p>見出し３</p>

<script>
document.write("<p>結果は" + globalNum + "です</p>");
var foo = true;
</script>

<script src="sample.js"></script>
```

```javascript
// sample.js
// 無名関数の即時実行．定義と呼び出しを同時に行う．
(function () {
    
    // 外側の変数（foo）を参照できる．
    if(foo) {
      console.log("外部ファイルを読み出しました");
    }
    
    var localNum = 20;
    function localMethod() {
        // 外側の変数（localNum）を参照できる．
        console.log("localNum");
    }
    
    // 定義したメソッドを実行
    localMethod();
}());
```

2. 実行時には以下の様に，まとめて実行される．ここでは，htmlファイルで定義した関数の外にある変数は，グローバル変数になっている．1つのページを構成するHTMLファイルを別ファイルとして分割していても，同じである．

```html
<script>
var globalNum = 10;
    
localNum = localNum * 10;
    
document.write("<p>結果は" + num + "です</p>");
var foo = true;

// 無名関数の即時実行．定義と呼び出しを同時に行う．
(function () {
    
    // 外側の変数（foo）を参照できる．
    if(foo) {
      console.log("外部ファイルを読み出しました");
    }
    
    var localNum = 20;
    function localMethod() {
        // 外側の変数（localNum）を参照できる．
        console.log("localNum");
    }
    
    // 定義したメソッドを実行
    localMethod();
}());
</script>
```

<br>

## 01-04. ブラウザのバージョン

### Polyfill

#### ・Polyfillとは

JavaScriptやHTMLの更新にブラウザが追いついていない場合，それを補完するように実装されたパッケージのこと．『Polyfilla』に由来している．

<br>

## 02. Downloading処理

### Downloading処理とは

#### ・非同期的な読み出し

まず，サーバーサイドからリソース（HTMLファイル，CSSファイル，JavaScriptファイル，画像ファイル）は，分割されながら，バイト形式でレスポンスされる．これは，メッセージボディに含まれている．これを優先度を基に読み込む処理．分割でレスポンスされたリソースを，随時読み込んでいく．そのため，各リソースの読み出しは非同期的に行われる．Downloading処理が終了したリソースから，次のParse処理に進んでいく．

#### ・リソースの優先順位

1. HTML
2. CSS
3. JS
4. 画像

<br>

### Pre-Loading

#### ・Pre-Loadingとは

Downloading処理の優先順位を上げるように宣言する方法．優先度の高い分割リソースは，次のParse処理，Scripting処理も行われる．そのため，JSファイルのScripting処理が，以降のimageファイルのDownloading処理よりも早くに行われることがある．

```html
<head>
  <meta charset="utf-8">
  <title>Title</title>
  <!-- preloadしたいものを宣言 -->
  <link rel="preload" href="style.css" as="style">
  <link rel="preload" href="main.js" as="script">
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <h1>Hello World</h1>
  <script src="main.js" defer></script>
</body>
```

<br>

### Lazy Loading（遅延読み出し）

#### ・Lazy Loadingとは

条件に合致した要素を随時読み込む方法．条件の指定方法には，```scroll```/```resize```イベントに基づく方法と，Intersection Observerによる要素の交差率に基づく方法がある．画像ファイルの遅延読み出しでは，読み出し前にダミー画像を表示させておき，遅延読み出し時にダミー画像パスを本来の画像パスに上書きする．

#### ・scrollイベントとresizeイベントに基づく読み出し

scrollイベントとresizeイベントを監視し，これらのイベントの発火をトリガーにして，画面内に新しく追加された要素を随時読み込む方法．

#### ・Intersection Observerによる要素の交差率に基づく読み出し

Intersection Observerによる要素の交差率を監視し，指定の交差率を超えた要素を随時読み込む方法．例えば，交差率の閾値を『```0.5```』と設定すると，ターゲットエレメントの交差率が『```0.5```』を超えた要素を随時読み込む．

![intersection-observer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/intersection-observer.png)

<br>

### Eager Loading

#### ・Eager Loadingとは

<br>

## 02-02. Parse処理

### Parse処理とは

Downloading処理によって読み込まれたリソースを翻訳するプロセス

<br>

### HTML形式テキストファイルの構造解析

#### ・構造解析の流れ

Downloading処理で読みこまれたバイト形式ファイルは，文字コードを基に，一連の文字列に変換される．ここでは，以下のHTML形式ファイルとCSS形式ファイル（```style.css```）に変換されたとする．

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
    <div style="width: 50%">
      <div style="width: 50%">Hello world!</div>
    </div>
  </body>
</html>
```

```css
/* style.css */
body { font-size: 16px }
p { font-weight: bold }
span { color: red }
p span { display: none }
img { float: right }
```

リソースの文字列からHTMLタグが認識され，トークンに変換される．各トークンは，1つのオブジェクトに変換される．

![DOMツリーが生成されるまで](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DOMツリーが生成されるまで.png)

HTMLパーサーは，オブジェクトをノードとして，DOMツリーを生成する．DOMツリーを生成する途中でscriptタグに到達すると，一旦，JSファイルを読み込んでScripting処理を終えてから，DOMツリーの生成を再開する．DOMのインターフェースについては，以下のリンクを参考にせよ．

参考：https://developer.mozilla.org/ja/docs/Web/API/Document_Object_Model

![DOMツリー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DOMツリー.png)

同時に，CSSパーサーは，headタグにあるlinkタグを基にサーバーにリクエストを行う．レスポンスされたCSSファイルに対してDownloading処理を行った後，オブジェクトをノードとして，CSSOMツリーを生成する．

![CSSOMツリー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CSSOMツリー.png)

<br>


### XML形式テキストファイルの構造解析

#### ・構造解析の流れ

レンダリングエンジンは，最初に出現するルート要素を根（ルート），またすべての要素や属性を，そこから延びる枝葉として意味づけ，レンダリングツリーを生成する．

**＊例＊**

![DOMによるツリー構造化](https://user-images.githubusercontent.com/42175286/59778015-a59f5600-92f0-11e9-9158-36cc937876fb.png)

参考：https://www.researchgate.net/publication/228930844_Real-time_Generalization_of_Geodata_in_the_WEB

<br>

## 03. Scripting処理

### Scripting処理とは

JavaScriptエンジンによって，JavaScriptコードが機械語に翻訳され，実行される．この処理は，初回アクセス時だけでなく，イベントが発火した時にも実行される．

<br>

### JavaScriptエンジン

#### ・JavaScriptエンジンとは

JavaScriptのインタプリタのこと．JavaScriptエンジンは，レンダリングエンジンからHTMLファイルに組み込まれたJavaScriptのコードを受け取る．JavaScriptエンジンは，これを機械語に翻訳し，ハードウェアに対して，命令を実行する．

![JavascriptEngine](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/JavascriptEngine.png)

#### ・機械語翻訳

JavaScriptエンジンは，コードを，字句解析，構造解析，意味解釈，命令の実行，をコード一行ずつに対し，繰り返し行う．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_language_processor.html

## 03-02. イベント

### イベント

#### ・イベントとは

ブラウザの各操作はイベントとしてJavaScriptまたはHTMLに紐付けられている．

参考：https://developer.mozilla.org/ja/docs/Web/Events

#### ・イベントハンドラ関数とは

イベントの発火に伴ってコールされる関数のこと．イベントハンドラ関数が実行されるたびにScripting処理が繰り返される．

<br>

### HTML形式におけるイベントハンドラ関数のコール

#### ・```onload```

『Webページのローディング』というイベントが発火すると，イベントハンドラ関数をコールする．

#### ・```onclick```

『要素のクリック』というイベントが発火すると，イベントハンドラ関数をコールする．

```html
<input type="button" value="ボタン1" onclick="methodA()">

<script>
function methodA(){
	console.log("イベントが発火しました");
}
</script>
```

<br>

### JS形式におけるイベントハンドラ関数のコール


#### ・```document.getElementById.onclick```関数

指定したIDに対して，1つのイベントと1つのイベントハンドラ関数を紐付ける．

**＊実装例＊**

```javascript
// 指定したIDで，クリックイベントが発火した時に，処理を行う．
document.getElementById("btn").onclick = () => {
	console.log("イベントが発火しました");
}
```


#### ・```document.addEventListener```関数

1つのイベントに対して，1つ以上のイベントハンドラ関数を紐付ける．第一引数で，```click```などのイベントを設定し，第二引数でメソッド（無名関数でも可）を渡す．```false```を設定することで，イベントバブリングを行わせない．

**＊実装例＊**

```html
<button id="btn">表示</button>

<script>
const btn = document.getElementById("btn");
btn.addEventListener("click", () => {
    console.log("クリックされました！");
},false);
</script>
```

```javascript
// DOMContentLoadedイベントが発火した時に，処理を行う．
document.addEventListener("DOMContentLoaded", () => {
	console.log("イベントが発火しました");
});
```

```javascript
// 1つ目
document.getElementById("btn").addEventListener("click", () => {
	console.log("イベントが発火しました（１）");
}, false);

// 二つ目
document.getElementById("btn").addEventListener("click", () => {
	console.log("イベントが発火しました（２）");
}, false);
```



<br>


## 04. Rendering処理

### Rendering処理とは

レンダリングツリーが生成され，ブラウザ上のどこに何を描画するのかを計算する．CalculateStyle処理とLayout処理に分けられる．

<br>

## 04-02. CalculateStyle処理

### CalculateStyle処理とは

レンダリングエンジンは，DOMツリーのルートのノードから順にCSSOSツリーを適用し，Renderツリーを生成する．

![Renderツリー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Renderツリー.png)

<br>

## 04-03. Layout処理

### Layout処理とは

上記で読み込まれたHTML形式テキストファイルには，ネストされた 2 つの div がある．1 つ目（親）の```div```より，ノードの表示サイズをビューポートの幅の 50% に設定し，この親に含まれている 2 つ目（子）の```div```より，その幅を親の50%，つまりビューポートの幅の25%になるようにレイアウトされる．

![Layout処理](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Layout処理.png)

<br>

## 05. Paint処理

### Paint処理とは

DOMツリーの各ノードを，ブラウザ上に描画する．

<br>

## 05-02. Rasterize処理

### Rasterize処理とは

<br>

## 05-03. CompositeLayers処理

### CompositeLaysers処理とは

<br>

## 06. キャッシュ

### キャッシュとは

静的コンテンツ（HTML，JavaScript，CSS，画像）をデータを保存しておき，再利用することによって，処理速度を高める仕組みのこと．

<br>

### キャッシュの保存場所の種類

#### ・ブラウザにおけるキャッシュ

クライアントのブラウザで，レスポンスされた静的コンテンツのキャッシュが作成される．Chromeの場合は，CacheStorageに保持される．確認方法については，以下のリンクを参考にせよ．

参考：https://developer.chrome.com/docs/devtools/storage/cache/

![ブラウザのキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ブラウザのキャッシュ.png)

#### ・リバースプロキシサーバーにおけるキャッシュ

リバースプロキシサーバーで，レスポンスされた静的コンテンツのキャッシュが作成される．AWSでは，CloudFrontにおけるキャッシュがこれに相当する．

#### ・アプリケーションにおけるキャッシュ

オブジェクトのプロパティで，メソッド処理結果のキャッシュが作成される．必要な場合，これを取り出して再利用する．Laravelのキャッシュ機能については，以下のリンクを参考にせよ．

参考：https://readouble.com/laravel/8.x/ja/cache.html

<br>

### サーバー側でキャッシュすべきでないデータ

リバースプロキシサーバー/アプリケーションで，キャッシュすべきでないデータを持つWebページがある．

| ページ                                       | 理由                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| Form認証ページ                               | 無関係のユーザーに認証済みのWebページが返信されてしまう．         |
| 緯度経度/フリーワードに基づく検索結果ページ | パターン数が多く，全てのページを網羅することが現実的でない． |

<br>

### ブラウザキャッシュ使用/不使用の検証

#### ・ETag値による検証

![EtagとIf-NoneMach](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ETagとIf-None-Match.png)

=== （１）キャッシュの有効時間が切れるまで ===

1. クライアントのブラウザは，リクエストをサーバーに送信する．
2. サーバーは，特定のアルゴリズムを用いてハッシュ値を生成し，これをコンテンツのETag値とする．
3. サーバーは，ETagヘッダーにETag値を設定し，コンテンツとともにレスポンスをクライアントに送信する．
4. クライアントのブラウザは，コンテンツとETag値をキャッシュする．
5. キャッシュの有効時間が切れるまで，ブラウザキャッシュを使用し続ける．

=== （２）キャッシュの有効時間が切れた後 ===

1. キャッシュの有効時間が切れる．
2. クライアントのブラウザは，リクエストをサーバーに送信する．この時，If-None-MatchヘッダーにキャッシュしておいたETag値を設定する．
3. サーバーは，送信されたETag値とコンテンツのETag値を比較検証する．

=== （３）検証により，ブラウザキャッシュを使用 ===

1. ETag値の比較検証の結果，一致する．
2. サーバーは，両方の値が一致する場合，```304```ステータスでレスポンスをクライアントに送信する．
3. クライアントのブラウザは，キャッシュを用いる．

=== （４）検証により，ブラウザキャッシュを用いず ===

1. ETag値の比較検証の結果，一致しない．
2. サーバーは，両方の値が一致しない場合，ETag値を生成し，これをコンテンツの新しいETag値とする．
3. サーバーは，ETagヘッダーにETag値を設定し，コンテンツとともにレスポンスをクライアントに送信する．
4. クライアントのブラウザは，コンテンツとETag値をキャッシュする．

<br>

### ブラウザキャッシュ時間の定義

#### ・ブラウザキャッシュなし

レスポンスヘッダーにて，Cache-Controlヘッダーに```no-store```を設定する．この場合，ETag値が無効になり，ブラウザキャッシュを用いなくなる．

```http
HTTP/1.1 200
# ～ 中略 ～
Cache-Control: no-store
# ～ 中略 ～

# ボディ
ここにサイトのHTMLのコード
```

#### ・ブラウザキャッシュあり（有効時間あり）

レスポンスヘッダーにて，Cache-Controlヘッダーに```max-age=31536000```を設定する．Expireヘッダーに有効時間を設定しても良いが，Cache-Controlヘッダーの有効時間が優先される．この場合，有効時間を過ぎると，ETag値を比較検証するようになる．

```http
HTTP/1.1 200
# ～ 中略 ～
Cache-Control: max-age=31536000
# ～ 中略 ～

# ボディ
ここにサイトのHTMLのコード
```

#### ・ブラウザキャッシュあり（有効時間なし）

レスポンスヘッダーにて，Cache-Controlヘッダーに```max-age=0```を設定する．また，Expireヘッダーに期限切れの日時を設定する．この場合，毎回のリクエスト時にETag値を比較検証するようになる．

```http
HTTP/1.1 200
# ～ 中略 ～
Cache-Control: max-age=0
Expires: Sat, 01 Jan 2000 00:00:00 GMT
# ～ 中略 ～

# ボディ
ここにサイトのHTMLのコード
```



