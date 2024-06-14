---
title: 【IT技術の知見】設定ファイル＠K3D
description: 設定ファイル＠K3Dの知見を記録しています。
---

# 設定ファイル＠K3D

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## config.yaml

### apiVersion

```yaml
apiVersion: k3d.io/v1alpha5
```

<br>

### kind

```yaml
kind: Simple
```

<br>

### metadata

```yaml
metadata:
  name: mycluster
```

<br>

### servers

```yaml
servers: 1
```

<br>

### agents

```yaml
agents: 2
```

<br>

### kubeAPI

```yaml
kubeAPI:
  host: myhost.my.domain
  hostIP: 127.0.0.1
  hostPort: "6445"
```

<br>

### image

```yaml
image: "rancher/k3s:v1.20.4-k3s1"
```

<br>

### network

```yaml
network: my-custom-net
```

<br>

### subnet

```yaml
subnet: 172.28.0.0/16
```

<br>

### token

```yaml
token: superSecretToken
```

<br>

### volumes

```yaml
volumes:
  - volume: "/my/host/path:/path/in/node"
    nodeFilters:
      - "server:0"
      - "agent:*"
```

<br>

### ports

```yaml
ports:
  - port: "8080:80"
    nodeFilters:
      - loadbalancer
```

<br>

### env

```yaml
env:
  - envVar: bar=baz
    nodeFilters:
      - "server:0"
```

<br>

### registries

```yaml
registries:
  create:
    name: registry.localhost
    host: 0.0.0.0
    hostPort: "5000"
    proxy:
      remoteURL: "https://registry-1.docker.io"
      username: ""
      password: ""
    volumes:
      - "/some/path:/var/lib/registry"
  use:
    - "k3d-myotherregistry:5000"
  config: |
    mirrors:
      "my.company.registry":
        endpoint:
          - http://my.company.registry:5000
```

<br>

### hostAliases

```yaml
hostAliases:
  - ip: 1.2.3.4
    hostnames:
      - my.host.local
      - that.other.local
  - ip: 1.1.1.1
    hostnames:
      - cloud.flare.dns
```

<br>

### options

```yaml
options:
  k3d:
    wait: true
    timeout: 60s
    disableLoadbalancer: false
    disableImageVolume: false
    disableRollback: false
    loadbalancer:
      configOverrides:
        - settings.workerConnections=2048
  k3s:
    extraArgs:
      - arg: "--tls-san=my.host.domain"
        nodeFilters:
          - "server:*"
    nodeLabels:
      - label: foo=bar
        nodeFilters:
          - "agent:1"
  kubeconfig:
    updateDefaultKubeconfig: true
    switchCurrentContext: true
  runtime:
    gpuRequest: all
    labels:
      - label: bar=baz
        nodeFilters:
          - "agent:1"
    ulimits:
      - name: nofile
        soft: 26677
        hard: 26677
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>
