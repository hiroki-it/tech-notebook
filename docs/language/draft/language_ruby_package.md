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

#### ▼ セットアップ

```ruby
source 'https://rubygems.org'

gem "webrick", "~> 1.7"
gem "semantic_logger", "~> 4.16.1"
```

#### ▼ ログ構造

```yaml
{
  "host": "foo-fb5d575bc-65k2b",
  "application": "Foo Logger",
  "timestamp": "2025-04-15T13:49:54.101890Z",
  "level": "info",
  "level_index": 2,
  "pid": 1,
  "thread": "3440",
  "name": "Details",
  "message": "Do something successfully",
  "payload": {"trace_id": "340f39b78a31c1f999195198c436f158"},
}
```

#### ▼ add_appender

`formatter`を`json`とし、ログを構造化する。

```ruby
require 'semantic_logger'

# ログをメモリ上に保管せずにフラッシュする
$stdout.sync = true

# Semantic Loggerを設定する
SemanticLogger.add_appender(io: $stdout, formatter: :json)
logger = SemanticLogger['Foo']

server = WEBrick::HTTPServer.new(
  :BindAddress => '*',
  :Port => port,
  :AcceptCallback => -> (s) { s.setsockopt(Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1) },
  # SemanticLoggerをWEBrickで使用する
  :Logger => logger,
  # アクセスログを無効化する
  :AccessLog => []
)

server.mount_proc '/details' do |req, res|

  ...

  logger.info("Do something successfully")

  ...

end
```

> - https://logger.rocketjob.io/

#### ▼ フィールドの追加

```ruby
require 'webrick'
require 'json'
require 'net/http'
require 'semantic_logger'

# ログをメモリ上に保管せずにフラッシュする
$stdout.sync = true

# Semantic Loggerを設定する
SemanticLogger.add_appender(io: $stdout, formatter: :json)
logger = SemanticLogger['Foo']


server = WEBrick::HTTPServer.new(
  :BindAddress => '*',
  :Port => port,
  :AcceptCallback => -> (s) { s.setsockopt(Socket::IPPROTO_TCP, Socket::TCP_NODELAY, 1) },
  # SemanticLoggerをWEBrickで使用する
  :Logger => logger,
  # アクセスログを無効化する
  :AccessLog => []
)

server.mount_proc '/details' do |req, res|

  begin

    request = Net::HTTP::Get.new(uri.request_uri)
    response = http.request(request)
    json = JSON.parse(response.body)

    # フィールドを追加する
    logger.info("Do something successfully", trace_id: get_trace_id(req.headers))

  rescue => error

    # フィールドを追加する
    logger.error("#{error.message}", trace_id: get_trace_id(headers))

  end
end


def get_trace_id(headers)

  # 受信したリクエストのtraceparentヘッダーから値を取得する
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

> - https://logger.rocketjob.io/

<br>
