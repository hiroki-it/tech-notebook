---
title: 【IT技術の知見】設定ファイル＠K3D
description: 設定ファイル＠K3Dの知見を記録しています。
---

# 設定ファイル＠K3D

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## apiVersion

```yaml
apiVersion: k3d.io/v1alpha5
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## kind

```yaml
kind: Simple
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## metadata

```yaml
metadata:
  name: foo-cluster
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## servers

```yaml
servers: 1
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## agents

```yaml
agents: 2
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## kubeAPI

```yaml
kubeAPI:
  host: example.com
  hostIP: 127.0.0.1
  hostPort: "6445"
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## image

```yaml
image: "rancher/k3s:v1.20.4-k3s1"
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## network

```yaml
network: foo-network
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## subnet

```yaml
subnet: 172.28.0.0/16
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## token

```yaml
token: superSecretToken
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## volumes

```yaml
volumes:
  - volume: "/foo/path:/path/node"
    nodeFilters:
      - "server:0"
      - "agent:*"
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## ports

```yaml
ports:
  - port: "8080:80"
    nodeFilters:
      - loadbalancer
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## env

```yaml
env:
  - envVar: foo=foo
    nodeFilters:
      - "server:0"
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## registries

### create

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
```

<br>

### use

```yaml
registries:
  use:
    - "foo-registries:5000"
```

<br>

### config

#### ▼ configとは

```yaml
registries:
  config: |
    ...
```

#### ▼ mirrors

Node内でイメージプルが起こる時に、デフォルトのイメージレジストリ (例：DockerHub) ではなく、代わりにミラーリングレジストリからプルするように変更する。

```yaml
registries:
  config: |
    mirrors:
      <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com:
        endpoint:
          - "https://<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com"
```

#### ▼ config

プライベートリポジトリからイメージをプルする場合に、これの認証情報を設定する。

```yaml
registries:
  config: |
    config:
      <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com:
        auth:
          username: AWS
          # aws ecr get-login-password --region ap-northeast-1コマンドから取得したパスワード
          password: <パスワード>
        # イメージレジストリとの通信がHTTPSの場合は、SSL証明書が必要になる
        tls:
          ca_file: <証明書>
          cert_file: <証明書>
          key_file: <証明書>
```

HTTPSの検証をスキップすることもできる

```yaml
registries:
  config: |
    config:
      <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com:
        auth:
          username: AWS
          # aws ecr get-login-password --region ap-northeast-1コマンドから取得したパスワード
          password: <パスワード> 
        tls:
          insecure_skip_verify: true
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example
> - https://github.com/sokube/kciss/blob/998654edac3bd7571a749ea95528ea5e847b7386/k3d-cluster-config-with-private-registry.yml#L23-L34

<br>

## hostAliases

```yaml
hostAliases:
  - ip: 1.2.3.4
    hostnames:
      - foo.example.com
      - bar.example.com
  - ip: 1.1.1.1
    hostnames:
      - cloud.flare.dns
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>

## options

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
      - arg: "--tls-san=foo.host.domain"
        nodeFilters:
          - "server:*"
    nodeLabels:
      - label: foo=foo
        nodeFilters:
          - "agent:1"
  kubeconfig:
    updateDefaultKubeconfig: true
    switchCurrentContext: true
  runtime:
    gpuRequest: all
    labels:
      - label: foo=foo
        nodeFilters:
          - "agent:1"
    ulimits:
      - name: nofile
        soft: 26677
        hard: 26677
```

> - https://k3d.io/v5.6.3/usage/configfile/#all-options-example

<br>
