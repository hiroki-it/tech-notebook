# serverlessコマンド

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/

<br>

## 01. コマンド

### print

#### ・printとは

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/print

#### ・オプション無し

```bash
$ serverless print
```

#### ・パラメータ有

```bash
$ serverless print --FOO foo
```

<br>

### deploy

#### ・deployとは

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy

#### ・オプション無し

クラウドインフラを構築する。

```bash
$ serverless deploy
```

#### ・パラメータ

パラメータを```serverless.yml```ファイルに渡し、```deploy```コマンドを実行する。

```bash
$ serverless deploy --FOO foo
```

#### ・-v

実行ログを表示しつつ、```deploy```コマンドを実行する。

```bash
$ serverless deploy -v
```

