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

### セッション管理

記入中...

<br>

### クエリキャッシュ管理

記入中...

<br>

### データキャッシュ管理

<br>

### リーダー選出 (分散排他制御、分散ロック)

#### ▼ Python

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

#### ▼ TypeScript

```typescript
import redisClient from "redis";

const newLock = (client: ReturnType<typeof redisClient>, timeout = 50000) => {
  return async (
    lockName: string,
    onLockSuccess: () => Promise<void>,
    onLockFailed: () => Promise<void>,
  ) => {
    const keyName = `lock:${lockName}`;
    try {
      // キー名を指定し、Redisにキャッシュを保存する
      // 成功時は"OK" 、失敗時はnullが返却される
      const result = await client.set(keyName, "{}", {
        // PXオプションで、ロックの有効期限を設定する
        PX: timeout,
        // NX（Redisのキーが存在しない場合のみ設定）オプションで、キーによる排他制御を実現する
        NX: true,
      });
      // resultがnullでない場合、ロックを開始したことを意味する
      if (result !== null) {
        // onLockSuccessパラメーターの関数を実行する
        await onLockSuccess();
        // resultがnullの場合、ロックに失敗したことを意味する
      } else {
        // onLockFailedパラメーターの関数を実行する
        await onLockFailed();
      }
    } catch (e) {
      logger.error(`failed to connect redis ${e}`);
      await onLockSuccess();
    }
  };
};

await redisClient.connect();
newLock(redisClient, 10000);
```

> - https://redis.io/docs/latest/commands/set/

#### ▼ Go

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
