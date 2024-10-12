---
title: 【IT技術の知見】メッセージング系ミドルウェア
description: メッセージング系ミドルウェアの知見を記録しています。
---

# メッセージング系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 送信元と宛先の対応関係

### パブリッシュ/サブスクライブパターン

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

<br>

### プロデューサー/コンシューマーパターン

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

<br>

### ストリーミングパターン

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

<br>

## 02. 宛先のメッセージ受信方式

### プルベース

メッセージの宛先は、メッセージブローカーやメッセージキューにポーリングを実行し、メッセージを受信する。

宛先で障害が起こっていても、障害の回復後にメッセージを処理すればよいため、耐障害性が高い。

> - https://qiita.com/riita10069/items/40b1bcc36c25b197077c

<br>

### プッシュベース

メッセージブローカーやメッセージキューは、宛先にメッセージを送信する。

宛先で障害が起こっていると、メッセージが損失する可能性があるため、耐障害性が低い。

これに対処するために、メッセージブローカーやメッセージキューで、リトライやデッドレターキューが必要になる。

> - https://qiita.com/riita10069/items/40b1bcc36c25b197077c

<br>
