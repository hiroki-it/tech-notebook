---
title: 【IT技術の知見】パッケージ＠Ruby
description: パッケージ＠Rubyの知見を記録しています。
---

# パッケージ＠Ruby

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 構造化ログ

### semantic_logger

#### ▼ add_appender

`formatter`を`json`とし、ログを構造化する。

```ruby
require 'semantic_logger'

# Semantic Loggerの設定
SemanticLogger.add_appender(io: $stdout, formatter: :json)
logger = SemanticLogger['Foo']

logger.info("Do something successfully")
```

> - https://logger.rocketjob.io/

#### ▼ フィールドの追加

```ruby
require 'semantic_logger'

# Semantic Loggerの設定
SemanticLogger.add_appender(io: $stdout, formatter: :json)
logger = SemanticLogger['Foo']

server.mount_proc '/details' do |req, res|

  begin

    ...

    logger.info("Do something successfully", trace_id: get_trace_id(req.headers))
  rescue => error

    ...

    logger.error("#{error.message}", trace_id: get_trace_id(headers))
  end
end


def get_trace_id(headers)

  # Envoyの作成したtraceparent値を取得する
  traceparent = headers['traceparent']

  if traceparent
    # W3C Trace Context
    # traceparent: 00-<trace_id>-<span_id>-01
    parts = traceparent.split('-')
    if parts.length >= 2
      return parts[1]
    end
  end

  return 'unknown'
end
```

<br>
