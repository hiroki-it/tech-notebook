---
title: 【IT技術の知見】言語別の処理方式＠言語
description: 言語別の処理方式＠言語の知見を記録しています。
---

# 言語別の処理方式＠言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. エントリーポイント

### エントリーポイントとは

プログラムを実行する時の開始点となるファイルや関数のこと。

エントリーポイントのファイルや関数を開始点として、そのプログラムの全てのファイルの処理が実行される。



> ↪️ 参考：https://en.wikipedia.org/wiki/Entry_point

<br>

### 動的型付け型言語のエントリーポイント

#### ▼ 特徴

動的型付け言語では、エントリーポイントの定義方法が強制されず、指定したファイルの先頭行がエントリーポイントになる。



#### ▼ PHPの場合

慣例として、```index.php```ファイルをエントリーポイントとすることになっている。



#### ▼ Python

特になし。



<br>

### 静的型付け型言語のエントリーポイント

#### ▼ 特徴

静的型付け言語では、エントリーポイントの定義方法が強制される。

『```main```』という名前の関数でエントリーポイントを定義させる言語が多い。



#### ▼ Javaの場合

修飾子が『```public static```』、返却値型が『```void```』、引数名が『```args```』、引数型が『```String[]```』である```main```関数が、自動的にエントリーポイントになる。



```java
import java.util.*;

public class Main
{
    // エントリーポイントとなる関数
    public static void main(String[] args)
    {
        // 他の全ファイルに繋がる処理
    }
}
```

#### ▼ Goの場合

パッケージ名が『```main```』である```main.go```ファイルが、自動的にエントリーポイントとなる。



```go
package main

// エントリーポイントとなる関数
func main() {
    // 他の全ファイルに繋がる処理
}
```

<br>

## 02. 並行処理 (Concurrent processing) 

### 並行処理とは

プロセスでシングルスレッドが実行されている場合、複数の処理を『独立的』に実行すること。

開始も終了もバラバラであるが、処理の実行が重複する場合がある。



> ↪️ 参考：
>
> - https://techdifferences.com/difference-between-concurrency-and-parallelism.html
> - https://moz.hatenablog.jp/entry/2018/04/10/175643
> - https://zenn.dev/hsaki/books/golang-concurrency/viewer/term

<br>

### 言語別の並行処理

<br>

## 03. 並列処理 (Parallel processing) 

### 並列処理とは

プロセスでマルチスレッドが実行されている場合、各スレッド上で複数の処理を『同時発生的』に実行すること。

開始は同時であるが、終了はバラバラになる。



> ↪️ 参考：
>
> - https://techdifferences.com/difference-between-concurrency-and-parallelism.html
> - https://moz.hatenablog.jp/entry/2018/04/10/175643

<br>

### 言語別の並列処理

#### ▼ PHPの場合

parallelパッケージを使用する。



> ↪️ 参考：
>
> - https://github.com/krakjoe/parallel
> - https://qiita.com/WhiteGrouse/items/6fb906386b8fbabd6405

#### ▼ JavaScriptの場合

  Web Workerを使用する。



> ↪️ 参考：https://developer.mozilla.org/ja/docs/Web/API/Web_Workers_API/Using_web_workers

#### ▼ Goの場合

Goroutinesを使用する。

ただし、実行環境によっては並列処理にならずに、並行処理になってしまうことがある。

それが理由か否かはわからないが、Goのドキュメントでは、Goroutinesは```concurrency```の項目に記載されている。



> ↪️ 参考：
>
> - https://medium.com/sprocket-inc/goroutine-concurrent-and-parallel-programming-669eaae55e73
> - https://golang.org/doc/effective_go#concurrency
> - https://qiita.com/taigamikami/items/fc798cdd6a4eaf9a7d5e

<br>

## 04. 同期処理 (Synchronous processing) 

### 同期処理とは

完了を待ってから後続の処理が始まるような処理のこと。



<br>

## 05. 非同期処理 (Asynchronous processing) 

### 非同期処理とは

完了を待たずに後続の処理が始まり、後続の処理と同時に実行されるような処理のこと。



> ↪️ 参考：
>
> - https://qiita.com/kiyodori/items/da434d169755cbb20447
> - https://qiita.com/klme_u6/items/ea155f82cbe44d6f5d88

<br>

### 非同期処理の結果を使用する後続処理

#### ▼ 後続処理の定義

後続の全処理が非同期処理と無関係であれば、そのままで問題は起こらない。

しかし、後続の処理に非同期処理の結果を使用するものが含まれている場合、この処理だけは非同期処理の後に実行されるように定義する必要がある。

言語別に、非同期処理の成否を管理し、後続する処理を定義できる機能が提供されている。



#### ▼ JavaScriptの場合

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/language/language_js_logic_asynchronous_process.html

#### ▼ Node.jsの場合

JavaScriptと同じような記法で実装できるNode.jsについて、Node.jsのビルトイン関数 (特にI/O処理系) は、非同期処理化するための実装がなされている。

そのため、後続の処理に非同期処理の結果を使用するものが含まれている場合、この処理だけは非同期処理の後に実行されるように定義する必要がある。



> ↪️ 参考：
>
> - https://engineer.recruit-lifestyle.co.jp/techblog/2019-12-13-node-async-io/
> - https://blog.honjala.net/entry/2018/08/08/022027

```javascript
const input;

fs.readFile("/foo.txt", "utf8", function(err, data) {
  input = data;
});


// readFileメソッドの結果を使用する
// readFileメソッドの完了を待たずに実行されてしまう。
console.log(input);
```

<br>
