---
title: 【IT技術の知見】設定ファイル＠K3d
description: 設定ファイル＠K3dの知見を記録しています。
---

# 設定ファイル＠K3d

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## config.yaml

```yaml
# k3d configuration file, saved as e.g. /home/me/myk3dcluster.yaml
apiVersion: k3d.io/v1alpha5 # this will change in the future as we make everything more stable
kind: Simple # internally, we also have a Cluster config, which is not yet available externally
metadata:
  name: mycluster # name that you want to give to your cluster (will still be prefixed with `k3d-`)
servers: 1 # same as `--servers 1`
agents: 2 # same as `--agents 2`
kubeAPI: # same as `--api-port myhost.my.domain:6445` (where the name would resolve to 127.0.0.1)
  host: "myhost.my.domain" # important for the `server` setting in the kubeconfig
  hostIP: "127.0.0.1" # where the Kubernetes API will be listening on
  hostPort: "6445" # where the Kubernetes API listening port will be mapped to on your host system
image: rancher/k3s:v1.20.4-k3s1 # same as `--image rancher/k3s:v1.20.4-k3s1`
network: my-custom-net # same as `--network my-custom-net`
subnet: "172.28.0.0/16" # same as `--subnet 172.28.0.0/16`
token: superSecretToken # same as `--token superSecretToken`
volumes: # repeatable flags are represented as YAML lists
  - volume: /my/host/path:/path/in/node # same as `--volume '/my/host/path:/path/in/node@server:0;agent:*'`
    nodeFilters:
      - server:0
      - agent:*
ports:
  - port: 8080:80 # same as `--port '8080:80@loadbalancer'`
    nodeFilters:
      - loadbalancer
env:
  - envVar: bar=baz # same as `--env 'bar=baz@server:0'`
    nodeFilters:
      - server:0
registries: # define how registries should be created or used
  create: # creates a default registry to be used with the cluster; same as `--registry-create registry.localhost`
    name: registry.localhost
    host: "0.0.0.0"
    hostPort: "5000"
    proxy: # omit this to have a "normal" registry, set this to create a registry proxy (pull-through cache)
      remoteURL: https://registry-1.docker.io # mirror the DockerHub registry
      username: "" # unauthenticated
      password: "" # unauthenticated
    volumes:
      - /some/path:/var/lib/registry # persist registry data locally
  use:
    - k3d-myotherregistry:5000 # some other k3d-managed registry; same as `--registry-use 'k3d-myotherregistry:5000'`
  config:
    | # define contents of the `registries.yaml` file (or reference a file); same as `--registry-config /path/to/config.yaml`
    mirrors:
      "my.company.registry":
        endpoint:
          - http://my.company.registry:5000
hostAliases: # /etc/hosts style entries to be injected into /etc/hosts in the node containers and in the NodeHosts section in CoreDNS
  - ip: 1.2.3.4
    hostnames:
      - my.host.local
      - that.other.local
  - ip: 1.1.1.1
    hostnames:
      - cloud.flare.dns
options:
  k3d: # k3d runtime settings
    wait: true # wait for cluster to be usable before returning; same as `--wait` (default: true)
    timeout: "60s" # wait timeout before aborting; same as `--timeout 60s`
    disableLoadbalancer: false # same as `--no-lb`
    disableImageVolume: false # same as `--no-image-volume`
    disableRollback: false # same as `--no-Rollback`
    loadbalancer:
      configOverrides:
        - settings.workerConnections=2048
  k3s: # options passed on to K3s itself
    extraArgs: # additional arguments passed to the `k3s server|agent` command; same as `--k3s-arg`
      - arg: "--tls-san=my.host.domain"
        nodeFilters:
          - server:*
    nodeLabels:
      - label: foo=bar # same as `--k3s-node-label 'foo=bar@agent:1'` -> this results in a Kubernetes node label
        nodeFilters:
          - agent:1
  kubeconfig:
    updateDefaultKubeconfig: true # add new cluster to your default Kubeconfig; same as `--kubeconfig-update-default` (default: true)
    switchCurrentContext: true # also set current-context to the new cluster's context; same as `--kubeconfig-switch-context` (default: true)
  runtime: # runtime (docker) specific options
    gpuRequest: all # same as `--gpus all`
    labels:
      - label: bar=baz # same as `--runtime-label 'bar=baz@agent:1'` -> this results in a runtime (docker) container label
        nodeFilters:
          - agent:1
    ulimits:
      - name: nofile
        soft: 26677
        hard: 26677
```

> - https://k3d.io/v5.5.1/usage/configfile/#all-options-example

<br>
