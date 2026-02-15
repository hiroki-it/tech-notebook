---
title: 【IT技術の知見】パッケージ管理＠Python
description: パッケージ管理＠Pythonの知見を記録しています。
---

# パッケージ管理＠Python

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 構造化ログ

### 自前

```python
import logging
import json

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            # その他の必要な情報を追加
        }
        return json.dumps(log_data)

logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)

# ログを出力する
logger.info("<メッセージ>")
```

<br>

### python-json-logger

```python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# ログを出力する
logger.info("<メッセージ>")
```

> - https://github.com/madzak/python-json-logger

<br>

### structlog

```python
import logging
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S", utc=False),
        structlog.dev.ConsoleRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.NOTSET),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=False
)

log = structlog.get_logger()

# ログを出力する
log.info("<メッセージ>")
```

> - https://github.com/hynek/structlog
> - https://www.structlog.org/en/stable/getting-started.html

<br>

### loguru

#### ▼ ログ構造

```yaml
{
  "text": "Do something successfully",
  "record":
    {
      "elapsed": {"repr": "2:59:13.507632", "seconds": 10753.507632},
      "exception": null,
      "extra": {"trace_id": "6e42ca5d6b7fa1dad79cec9ef860102a"},
      "file": {"name": "foo.py", "path": "foo.py"},
      "function": "home",
      "level": {"icon": "ℹ️", "name": "INFO", "no": 20},
      "line": 308,
      "message": "Do something successfully",
      "module": "foo",
      "name": "foo",
      "process": {"id": 9, "name": "MainProcess"},
      "thread": {"id": 281473384371584, "name": "Dummy-53"},
      "time":
        {
          "repr": "2025-04-15 13:59:39.014135+00:00",
          "timestamp": 1744725579.014135,
        },
    },
}
```

#### ▼ add

loguruを設定する。

```python
from loguru import logger

logger.add(
    # 無名関数で設定を作成する
    lambda message: print(
        json.dumps({
            # タイムスタンプの形式を変更する
            "timestamp": message.record["time"].isoformat(),
            "level": message.record["level"].name,
            "message": message.record["message"],
            # extraフィールドを展開する
            **message.record["extra"],
        }),
        file=sys.stdout,
        flush=True
    )
)
```

> - https://github.com/Delgan/loguru?tab=readme-ov-file#structured-logging-as-needed

#### ▼ info、error

指定のログレベルのメッセージを出力する。

```python
import requests
from loguru import logger

# loguruの設定
logger.remove()
logger.add(
    lambda message: print(
        json.dumps({
            # タイムスタンプの形式を変更する
            "timestamp": message.record["time"].isoformat(),
            "level": message.record["level"].name,
            "message": message.record["message"],
            # extraフィールドを展開する
            **message.record["extra"],
        }),
        file=sys.stdout,
        flush=True
    )
)

def getFoo():
    try:
        res = requests.get("example.com")
        logger.info("Do something successfully")

        ...

        return res

    except BaseException as e:
        logger.error(f"{repr(e)}")
```

#### ▼ bind

`logger.add` 関数で `format="{extra[<フィールド名>]}"` を設定したうえで、構造ログに独自フィールドを設定できる。

```python
import requests
from loguru import logger

# loguruの設定
logger.remove()
logger.add(
    lambda message: print(
        json.dumps({
            # タイムスタンプの形式を変更する
            "timestamp": message.record["time"].isoformat(),
            "level": message.record["level"].name,
            "message": message.record["message"],
            # extraフィールドを展開する
            **message.record["extra"],
        }),
        file=sys.stdout,
        flush=True
    )
)

def getFoo():
    try:
        res = requests.get("example.com")
        logger.bind(trace_id=get_trace_id()).info("Do something successfully")

        ...

        return res

    except BaseException as e:
        logger.bind(trace_id=get_trace_id()).error(f"{repr(e)}")


def get_trace_id():
    # 受信したリクエストのtraceparentヘッダーから値を取得する
    traceparent = request.headers.get("traceparent")
    if traceparent:
        # W3C Trace Context
        # traceparent: 00-<trace_id>-<span_id>-01
        parts = traceparent.split("-")
        if len(parts) >= 2:
            return parts[1]
    return "unknown"
```

<br>

<br>
