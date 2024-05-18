---
title: 【IT技術の知見】Python＠クライアントパッケージ
description: Python＠クライアントパッケージの知見を記録しています。
---

# Python＠クライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 概要

### otelクライアントパッケージ

記入中...

<br>

### 拡張otelクライアントパッケージ

記入中...

<br>

### 分散トレースSDK

記入中...

<br>

## 02. アプリでgRPCを使わない場合

### 宛先がGoogle Cloud Traceの場合

#### ▼ パッケージの初期化

ここでは、FlaskというフレームワークでPythonのアプリケーションを作成したとする。

otelクライアントパッケージを初期化する。

初期化の段階で、トレースコンテキストを抽出する。

```python
import time

from opentelemetry import trace
from opentelemetry.propagate import set_global_textmap
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.propagators.cloud_trace_propagator import (CloudTraceFormatPropagator,)

# ダウンストリーム側マイクロサービスのリクエストからトレースコンテキストを抽出する。
set_global_textmap(CloudTraceFormatPropagator())

# 任意のトレースコンテキストを設定する
resource = Resource.create({
        "service.name": "flask_e2e_client",
        "service.namespace": "examples",
        "service.instance.id": "instance554",
    })

tracer_provider = TracerProvider()

# Exporter (スパンの宛先) として、Google Cloud Traceを設定する。
cloud_trace_exporter = CloudTraceSpanExporter()

tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))

trace.set_tracer_provider(tracer_provider)

tracer = trace.get_tracer(__name__)
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L1-L65
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L1-L79
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=16

ここでは、`requests`パッケージでリクエストを送信するため、`RequestsInstrumentor`関数による初期化も必要である。

```python
import requests
from opentelemetry.instrumentation.requests import RequestsInstrumentor

RequestsInstrumentor().instrument()

response = requests.get("http://flask-app:6000")

print(response.text)
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://opentelemetry-python-kinvolk.readthedocs.io/en/latest/instrumentation/requests/requests.html
> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L67-L69

#### ▼ 親スパン作成

親スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

ここでは、Flaskでリクエストを受信するため、`FlaskInstrumentor`関数でスパンを処理している。

```python
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

FlaskInstrumentor().instrument_app(app)

@app.route("/")
def hello_world():

    ...

    # Carrierにトレースコンテキストを注入する。
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    ...
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/flask/flask.html
> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L81-L97

#### ▼ トレースコンテキスト注入と子スパン作成

Carrierにトレースコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```python
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

FlaskInstrumentor().instrument_app(app)

@app.route("/")
def hello_world():

    ...

    # Carrierにトレースコンテキストを注入する。
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    ...
```

<br>
