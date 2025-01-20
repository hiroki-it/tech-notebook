---
title: 【IT技術の知見】設定ファイル＠Lima
description: 設定ファイル＠Limaの知見を記録しています。
---

# 設定ファイル＠Lima

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

```yaml
vmType: null
```

```yaml
arch: null
```

```yaml
images:
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release-20241212/ubuntu-24.10-server-cloudimg-amd64.img
    arch: x86_64
    digest: "sha256:457f02ad36ef64f8f2cbfcc4855a0d401294d9b4727ae239e21c4104cca0bae2"
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release-20241212/ubuntu-24.10-server-cloudimg-arm64.img
    arch: aarch64
    digest: "sha256:fb39312ffd2b47b97eaef6ff197912eaa3e0a215eb3eecfbf2a24acd96ee1125"
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release-20241212/ubuntu-24.10-server-cloudimg-riscv64.img
    arch: riscv64
    digest: "sha256:c85b26b69b742dca1541293d960e4b87713085567cf8942ade9029860ab0b195"
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release-20241212/ubuntu-24.10-server-cloudimg-armhf.img
    arch: armv7l
    digest: "sha256:229e893f4ca5f775fa8fda6d27caf78c86b13cc1b00bb9e002147cd1a04d98fc"
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release/ubuntu-24.10-server-cloudimg-amd64.img
    arch: x86_64
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release/ubuntu-24.10-server-cloudimg-arm64.img
    arch: aarch64
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release/ubuntu-24.10-server-cloudimg-riscv64.img
    arch: riscv64
  - location: >-
      https://cloud-images.ubuntu.com/releases/24.10/release/ubuntu-24.10-server-cloudimg-armhf.img
    arch: armv7l
```

```yaml
cpus: null
```

```yaml
memory: null
```

```yaml
disk: null
```

```yaml
mounts:
  - location: "~"
    mountPoint: null
    writable: null
    sshfs:
      cache: null
      followSymlinks: null
      sftpDriver: null
    9p:
      securityModel: null
      protocolVersion: null
      msize: null
      cache: null
  - location: /tmp/lima
    writable: true
```

```yaml
mountTypesUnsupported:
  - "9p"
```

```yaml
mountType: null
```

```yaml
mountInotify: null
```

```yaml
additionalDisks:
```

```yaml
ssh:
  localPort: null
  loadDotSSHPubKeys: null
  forwardAgent: null
  forwardX11: null
  forwardX11Trusted: null
```

```yaml
caCerts:
  removeDefaults: null
  files: null
  certs: null
```

```yaml
upgradePackages: null
```

```yaml
containerd:
  system: null
  user: null
```

```yaml
minimumLimaVersion: null
```

```yaml
user:
  name: null
  comment: null
  uid: null
  home: null
```

```yaml
vmOpts:
  qemu:
    minimumVersion: null
```

```yaml
os: null
```

```yaml
cpuType:
```

```yaml
rosetta:
  enabled: null
  binfmt: null
```

```yaml
timezone: null
```

```yaml
firmware:
  legacyBIOS: null
```

```yaml
audio:
  device: null
```

```yaml
video:
  display: null
  vnc:
    display: null
```

```yaml
networks:
```

```yaml
propagateProxyEnv: null
```

```yaml
hostResolver:
  enabled: null
  ipv6: null
  hosts:
```

```yaml
guestInstallPrefix: null
```

```yaml
plain: null
```

```yaml
nestedVirtualization: null
```

<br>
