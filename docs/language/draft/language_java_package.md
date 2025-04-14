---
title: 【IT技術の知見】パッケージ＠Java
description: パッケージ＠Javaの知見を記録しています。
---

# パッケージ＠Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 構造化ログ

### logback

#### ▼ logback.xml

logbackを設定する。

ここでは、slf4jを介してlogbackのロガーを使用し、LogstashEncoderで構造化する。

```xml
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
    </appender>

    <root level="info">
        <appender-ref ref="STDOUT" />
    </root>
</configuration>
```

#### ▼ info、error

指定のログレベルのメッセージを出力する。

```java
package application.rest;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.HttpHeaders;

@Path("/")
public class Foo extends Application{

    private static final Logger logger = LoggerFactory.getLogger(LibertyRestEndpoint.class);

    @Path("/{id}")
    public getFoo(@PathParam("id") int id, @Context HttpHeaders requestHeaders) {

        try {
            Client client = cb.build()
            Invocation.Builder builder = client.target("example.com").request(MediaType.APPLICATION_JSON)
            Response res = builder.get();
            int statusCode = res.getStatusInfo().getStatusCode();
            JsonObject json = Json.createReader(new StringReader(r.readEntity(String.class)).readObject();
            logger.info(json.toString());
            return Response.status(statusCode).type(MediaType.APPLICATION_JSON).entity(json).build();
        } catch (ProcessingException e) {
            logger.error(e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).type(MediaType.APPLICATION_JSON).entity("{\"error\": \"Failed to do something.\"}").build();
        } finally {
            MDC.clear();
        }

        return Response.ok().type(MediaType.APPLICATION_JSON).entity(jsonResStr).build();
    }
}
```

#### ▼ MDC

ログに独自フィールドを追加する。

```java
package application.rest;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.HttpHeaders;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

@Path("/")
public class Foo extends Application{

    private static final Logger logger = LoggerFactory.getLogger(LibertyRestEndpoint.class);

    @Path("/{id}")
    public getFoo(@PathParam("id") int id, @Context HttpHeaders requestHeaders) {

        // トレースIDを取得してMDCに設定する
        String traceId = getTraceId(requestHeaders);
        MDC.put("trace_id", traceId);

        try {
            Client client = cb.build()
            Invocation.Builder builder = client.target("example.com").request(MediaType.APPLICATION_JSON)
            Response res = builder.get();
            int statusCode = res.getStatusInfo().getStatusCode();
            JsonObject response = Json.createReader(new StringReader(r.readEntity(String.class)).readObject();
            logger.info(response.toString());
            return Response.status(statusCode).type(MediaType.APPLICATION_JSON).entity(json).build();
        } catch (ProcessingException e) {
            logger.error(e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).type(MediaType.APPLICATION_JSON).entity("{\"error\": \"Failed to do something.\"}").build();
        } finally {
            MDC.clear();
        }

        return Response.ok().type(MediaType.APPLICATION_JSON).entity(jsonResStr).build();
    }

    private String getTraceId(HttpHeaders headers) {

        // Envoyの作成したtraceparent値を取得する
        String traceparent = headers.getHeaderString("traceparent");
        if (traceparent != null) {
            // W3C Trace Context
            // traceparent: 00-<trace_id>-<span_id>-01
            String[] parts = traceparent.split("-");
            if (parts.length >= 2) {
                return parts[1];
            }
        }
        return "unknown";
    }
}
```

<br>
