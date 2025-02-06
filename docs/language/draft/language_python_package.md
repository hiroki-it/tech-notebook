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

```python
from loguru import logger

# serializeを有効化する
logger.add(custom_sink_function, serialize=True)

context_logger.info("Contextualize your logger easily")
```

> - https://github.com/Delgan/loguru?tab=readme-ov-file#structured-logging-as-needed

<br>
