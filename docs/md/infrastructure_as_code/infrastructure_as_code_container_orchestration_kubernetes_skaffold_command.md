# skaffoldコマンド

## 01. コマンド

### build

#### ・buildとは

全てのイメージをビルドする。

参考：https://skaffold.dev/docs/references/cli/#skaffold-build

```bash
$ skaffold build
```

#### ・--cache-artifacts

キャッシュを無効化し、```build```コマンドを実行する。

```bash
$ skaffold build --cache-artifacts=false
```

<br>

### dev

#### ・dev

アプリケーションのソースコードを監視し、変更が検出された時に、イメージの再ビルド/プッシュ/デプロイを実行する。また、ポートフォワーディングを実行する。

```bash
$ skaffold dev
```

#### ・--trigger

一定間隔でソースコードの変更を監視しつつ、```dev```コマンドを実行する。

```bash
$ skaffold dev --trigger=polling
```

#### ・--no-prune、--cache-artifacts

イメージをキャッシュせず、また後処理で全てのイメージを削除しつつ、```dev```コマンドを実行する。

```bash
$ skaffold dev --no-prune=false --cache-artifacts=false
```

#### ・--port-forward

ポートフォワードを実行しつつ、```dev```コマンドを実行する。

```bash
$ skaffold dev --port-forward
```

<br>

### run

#### ・run

バックグラウンドで、イメージのビルド/デプロイを実行する。

```bash
$ skaffold run
```

#### ・force

オブジェクトを強制的にデプロイしつつ、```run```コマンドを実行する。

```bash
$ skaffold run --force
```

#### ・--no-prune、--cache-artifacts

イメージをキャッシュせず、また後処理で全てのイメージを削除しつつ、```run```コマンドを実行する。

```bash
$ skaffold run --no-prune=false --cache-artifacts=false
```

#### ・--tail

フォアグラウンドで```run```コマンドを実行する。

```bash
$ skaffold run --tail
```

#### ・--port-forward

ポートフォワードを実行しつつ、```run```コマンドを実行する。

```bash
$ skaffold run --port-forward
```

<br>

## 02. ポートフォワーディング

### コマンド別

参考：https://skaffold.dev/docs/pipeline-stages/port-forwarding/

| コマンド                          | ポートフォワーディングの可否       |
| --------------------------------- | ---------------------------------- |
| ```skaffold dev```                    | ユーザー定義を参照                   |
| ```skaffold dev --port-forward```     | ユーザー定義を参照         |
| ```skaffold dev --port-forward=off``` | ポートフォワーディングを実行しない |
| ```skaffold run```                | ポートフォワーディングを実行しない |
| ```skaffold run --port-forward``` | ユーザー定義を参照         |
