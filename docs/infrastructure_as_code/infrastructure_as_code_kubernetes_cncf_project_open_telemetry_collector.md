---
title: 【IT技術の知見】OpenTelemetryコレクター＠CNCF
description: OpenTelemetryコレクター＠CNCFの知見を記録しています。
---

# OpenTelemetryコレクター＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. マニフェスト

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: opentelemetry-collector
data:
  config: |
    ...
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/configmap.yaml

<br>

### DaemonSet (DaemonSetモード)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: opentelemetry-collector-agent
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: opentelemetry-collector
      app.kubernetes.io/instance: example
      component: agent-collector
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      annotations:
        checksum/config: 9e2c733798733e804f0f3840abda595a272a852f3ed54c14212a18bbcbe14d10
      labels:
        app.kubernetes.io/name: opentelemetry-collector
        app.kubernetes.io/instance: example
        component: agent-collector
    spec:
      serviceAccountName: opentelemetry-collector
      containers:
        - name: opentelemetry-collector
          command:
            - /otelcol-contrib
            - --config=/conf/config.yaml
          image: "otel/opentelemetry-collector-contrib:0.93.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: jaeger-compact
              containerPort: 6831
              protocol: UDP
              hostPort: 6831
            - name: jaeger-grpc
              containerPort: 14250
              protocol: TCP
              hostPort: 14250
            - name: jaeger-thrift
              containerPort: 14268
              protocol: TCP
              hostPort: 14268
            - name: otlp
              containerPort: 4317
              protocol: TCP
              hostPort: 4317
            - name: otlp-http
              containerPort: 4318
              protocol: TCP
              hostPort: 4318
            - name: zipkin
              containerPort: 9411
              protocol: TCP
              hostPort: 9411
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.podIP
          livenessProbe:
            httpGet:
              path: /
              port: 13133
          readinessProbe:
            httpGet:
              path: /
              port: 13133
          volumeMounts:
            - mountPath: /conf
              name: opentelemetry-collector-configmap
      volumes:
        - name: opentelemetry-collector-configmap
          configMap:
            name: opentelemetry-collector-agent
            items:
              - key: config
                path: config.yaml
      hostNetwork: false
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/daemonset-only/rendered/daemonset.yaml
> - https://medium.com/opentelemetry/deploying-the-opentelemetry-collector-on-kubernetes-2256eca569c9

<br>

### Deployment (Deploymentモード)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opentelemetry-collector
spec:
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      app.kubernetes.io/name: opentelemetry-collector
      app.kubernetes.io/instance: example
      component: standalone-collector
  strategy:
    type: RollingUpdate
  template:
    metadata:
      annotations:
        checksum/config: 53da0e3c13d88832e551b80c5e4058ab64e37b0b6a27d08a06a3f09c105a9f15
      labels:
        app.kubernetes.io/name: opentelemetry-collector
        app.kubernetes.io/instance: example
        component: standalone-collector
    spec:
      serviceAccountName: opentelemetry-collector
      containers:
        - name: opentelemetry-collector
          command:
            - /otelcol-contrib
            - --config=/conf/config.yaml
          image: "otel/opentelemetry-collector-contrib:0.93.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: otlp
              containerPort: 4317
              protocol: TCP
            - name: otlp-http
              containerPort: 4318
              protocol: TCP
          env:
            - name: MY_POD_IP
              valueFrom:
                fieldRef:
                  apiVersion: v1
                  fieldPath: status.podIP
          livenessProbe:
            httpGet:
              path: /
              port: 13133
          readinessProbe:
            httpGet:
              path: /
              port: 13133
          volumeMounts:
            - mountPath: /conf
              name: opentelemetry-collector-configmap
      volumes:
        - name: opentelemetry-collector-configmap
          configMap:
            name: opentelemetry-collector
            items:
              - key: config
                path: config.yaml
      hostNetwork: false
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/deployment.yaml
> - https://medium.com/opentelemetry/deploying-the-opentelemetry-collector-on-kubernetes-2256eca569c9

<br>

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: opentelemetry-collector
spec:
  type: ClusterIP
  ports:
    - name: otlp
      port: 4317
      targetPort: 4317
      protocol: TCP
      appProtocol: grpc
    - name: otlp-http
      port: 4318
      targetPort: 4318
      protocol: TCP
  selector:
    app.kubernetes.io/name: opentelemetry-collector
    app.kubernetes.io/instance: example
    component: standalone-collector
  internalTrafficPolicy: Cluster
```

> - https://github.com/open-telemetry/opentelemetry-helm-charts/blob/opentelemetry-collector-0.80.0/charts/opentelemetry-collector/examples/deployment-otlp-traces/rendered/service.yaml

<br>

### StatefulSet (StatefulSetモード)

記入中...

<br>

## 02. カスタムリソースを使用する場合

カスタムリソースを使用して、OpenTelemetryを定義することもできる。

この場合、OpenTelemetry OperatorがInitContainerを介して、アプリコンテナにOpenTelemetryの実装を挿入する。

> - https://medium.com/opentelemetry/using-opentelemetry-auto-instrumentation-agents-in-kubernetes-869ec0f42377
> - https://speakerdeck.com/k6s4i53rx/getting-started-auto-instrumentation-with-opentelemetry?slide=52

<br>
