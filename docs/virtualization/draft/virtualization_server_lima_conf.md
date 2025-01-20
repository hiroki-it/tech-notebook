---
title: 【IT技術の知見】設定ファイル＠Lima
description: 設定ファイル＠Limaの知見を記録しています。
---

# 設定ファイル＠Lima

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

### vmType

```yaml
vmType: null
```

<br>

### arch

```yaml
arch: null
```

<br>

### images

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

<br>

### cpus

```yaml
cpus: null
```

<br>

### memory

```yaml
memory: null
```

<br>

### disk

```yaml
disk: null
```

<br>

### mounts

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

<br>

### mountTypesUnsupported

```yaml
mountTypesUnsupported:
  - "9p"
```

<br>

### mountType

```yaml
mountType: null
```

<br>

### mountInotify

```yaml
mountInotify: null
```

<br>

### additionalDisks

```yaml
additionalDisks:
```

<br>

### ssh

```yaml
ssh:
  localPort: null
  loadDotSSHPubKeys: null
  forwardAgent: null
  forwardX11: null
  forwardX11Trusted: null
```

<br>

### caCerts

```yaml
caCerts:
  removeDefaults: null
  files: null
  certs: null
```

<br>

### upgradePackages

```yaml
upgradePackages: null
```

<br>

### containerd

```yaml
containerd:
  system: null
  user: null
```

<br>

### minimumLimaVersion

```yaml
minimumLimaVersion: null
```

<br>

### user

```yaml
user:
  name: null
  comment: null
  uid: null
  home: null
```

<br>

### vmOpts

```yaml
vmOpts:
  qemu:
    minimumVersion: null
```

<br>

### os

```yaml
os: null
```

<br>

### cpuType

```yaml
cpuType:
```

<br>

### rosetta

```yaml
rosetta:
  enabled: null
  binfmt: null
```

<br>

### timezone

```yaml
timezone: null
```

<br>

### firmware

```yaml
firmware:
  legacyBIOS: null
```

<br>

### audio

```yaml
audio:
  device: null
```

<br>

### video

```yaml
video:
  display: null
  vnc:
    display: null
```

<br>

### networks

```yaml
networks:
```

<br>

### propagateProxyEnv

```yaml
propagateProxyEnv: null
```

<br>

### hostResolver

```yaml
hostResolver:
  enabled: null
  ipv6: null
  hosts:
```

<br>

### guestInstallPrefix

```yaml
guestInstallPrefix: null
```

<br>

### plain

```yaml
plain: null
```

<br>

### nestedVirtualization

```yaml
nestedVirtualization: null
```

<br>
