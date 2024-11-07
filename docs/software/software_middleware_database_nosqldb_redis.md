---
title: 【IT技術の知見】Redis＠NoSQL
description: Redis＠NoSQLの知見を記録しています。
---

# Redis＠NoSQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DBエンジンの種類

### インメモリ方式

メモリ上にデータを保管する。

揮発的なため、Redisを再起動するとデータが削除されてしまう。

> - https://qiita.com/KurosawaTsuyoshi/items/f7d74f2c60df188dbd6d

<br>

### オンディスク方式

ディスク上にデータを永続化する。

> - https://qiita.com/KurosawaTsuyoshi/items/f7d74f2c60df188dbd6d

<br>

## 02. ユースケース

### セッション

<br>

### クエリキャッシュ

<br>

### DB排他制御 (分散ロック)

**＊実装例＊**

```python
import redis

client = redis.Redis()

# ロックを定義する
client.setnx('LOCK_NAME', 'foo_lock')  # True

# 確認する
client.get('LOCK_NAME')  # 'foo_lock'

# 同じキーで登録を試みると失敗する。この判定を排他制御のために使用する。
client.setnx('LOCK_NAME', 'foo_lock')  # False

# アンロックする
client.delete('LOCK_NAME')
```

> - https://qiita.com/hharu/items/c8c2954290f920f8a2f6#%E5%88%86%E6%95%A3%E3%83%AD%E3%83%83%E3%82%AF

**＊実装例＊**

```go
func (c *Client) updateCache(ctx context.Context, contentID string) error {

	    // ロックする
	    // ロックのクライアントで障害が起こってアンロックできなくなることを防ぐために、ロックの失効時間を設定しておく
	    nx, err := c.cli.SetNX(ctx, "lock:"+contentID, true, lockTTL).Result()

		if err != nil {
                return err
        }

        if !nx {
                return errors.New("failed to lock")
        }

        // 処理の最後にアンロックする
        defer func() {
                c.cli.Del(ctx, "lock:"+contentID)
        }()

        // なんらかの永続処理
        // ...

        // 処理結果のキャッシュを作成する
        _, err = c.cli.Set(ctx, contentID, content, cacheTTL).Result()

        if err != nil {
                return err
        }

		return nil
}
```

> - https://christina04.hatenablog.com/entry/redis-distributed-locking

<br>
