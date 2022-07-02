---
title: 【IT技術の知見】Uvicorn＠ミドルウェア
description: Uvicorn＠ミドルウェアの知見を記録しています。
---

# Uvicorn＠ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Uvicornの仕組み

### アーキテクチャ

調査中...

<br>

## 02. 設計ポリシー

### 開発環境でのUvicornの実行方法

#### ▼ uvicornコマンドを使用する場合

アプリケーションのエントリーポイントを```uvicorn```コマンドで指定する。開発のしやすさから、開発環境ではUvicornを直接的に実行し、その時に```reload```オプションを使用した方が良い。

参考：https://www.uvicorn.org/deployment/#running-from-the-command-line

```dockerfile
FROM python:3.10-slim

# 〜 中略 〜

CMD ["uvicorn", "main:app", "--reload", "--port" "8000"]
```

#### ▼ uvicornパッケージの```run```関数を使用する場合

アプリケーションのエントリーポイントを```python```コマンドで直接的に指定する場合、Uvicornを実行できるように、uvicornパッケージの```run```関数をエントリーポイントで実行する。ただし、他の```.py```ファイルからエントリーポイントを読み込んだ場合（```from main import app```）に、Uvicornを再実行する必要はないため、『```__name__ == "__main__"```』内にこれを実行する。

参考：https://www.uvicorn.org/deployment/#running-programmatically

```bash
$ python main.py
```

```python
import uvicorn
from src import create_app

app = create_app()

# 他の.pyファイルからUvicornを再実行しないようにする。
if __name__ == "__main__":
  
    # または、uvicorn.run("main:app", host="0.0.0.0", port=8000)
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

<br>

### 本番環境でのUvicornの実行方法

#### ▼ Gunicornを使用する場合

![uvicorn_with-gunicorn](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/uvicorn_with-gunicorn.png)

パフォーマンス上の理由で、本番環境ではGunicornを使用してUvicornのプロセスを管理し、プロセスを間接的に実行した方が良い。```w```オプションを使用して、プロセスの並列数を設定できる。

参考：

- https://www.uvicorn.org/#running-with-gunicorn
- https://www.uvicorn.org/deployment/#gunicorn
- https://breezymind.com/uvicorn-0-16-0-performance-problem/

```dockerfile
FROM python:3.10-slim

# 〜 中略 〜

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000" ]
```

なお、Gunicornを使用する場合には、standardタイプのUvicornをインストールする必要がある。

参考：https://www.uvicorn.org/#quickstart

```bash
$ pip3 install uvicorn[standard]
```

<br>

## 03. uvicornコマンド

### オプション無し

ルートディレクトリにエントリーポイントのファイルを配置している場合は、```<モジュール名>.<インスタンス名>```となる。

```bash
$ uvicorn main:app
```

もし、サブディレクトリ配下にこのファイルを配置している場合は、```<ディレクトリ名>.<モジュール名>.<インスタンス名>```となる。

```bash
$ uvicorn src.main:app
```

<br>

### --reload

#### ▼ --reloadとは

ソースコードが変更された場合に、再読み出しする。

```bash
$ uvicorn main:app --reload
```

<br>

### --port

#### ▼ --portとは

インバウンド通信を受け付けるポート番号を設定する。

```bash
$ uvicorn main:app --port 8000
```

<br>
