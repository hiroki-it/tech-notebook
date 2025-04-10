---
title: 【IT技術の知見】goreleaser＠CDツール
description: goreleaser＠CDツールの知見を記録しています。
---

# goreleaser＠CDツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## arhives

### format

作成するパッケージの圧縮形式を設定する。

```yaml
archives:
  - format: zip
    name_template: "{{ .ProjectName }}_{{ .Version }}_{{ .Os }}_{{ .Arch }}"
```

<br>

## builds

### id

```yaml
builds:
  - id: "my-build"
```

<br>

### main

```yaml
builds:
  - main: ./cmd/my-app
```

<br>

### binary

```yaml
builds:
  - binary: program
```

<br>

### flags

```yaml
builds:
  - flags:
      - -tags=dev
      - -v
```

<br>

### asmflags

```yaml
builds:
  - asmflags:
      - -D mysymbol
      - all=-trimpath={{.Env.GOPATH}}
```

<br>

### gcflags

```yaml
builds:
  - gcflags:
      - all=-trimpath={{.Env.GOPATH}}
      - ./dontoptimizeme=-N
```

<br>

### ldflags

```yaml
builds:
  - ldflags:
      - -s -w -X main.build={{.Version}}
      - ./usemsan=-msan
```

<br>

### buildmode

```yaml
builds:
  - buildmode: c-shared
```

<br>

### tags

```yaml
builds:
  - tags:
      - osusergo
      - netgo
      - static_build
      - feature
```

<br>

### env

```yaml
builds:
  - env:
      - CGO_ENABLED=0
      - >-
        {{- if eq .Os "darwin" }}
          {{- if eq .Arch "amd64"}}CC=o64-clang{{- end }}
          {{- if eq .Arch "arm64"}}CC=aarch64-apple-darwin20.2-clang{{- end }}
        {{- end }}
        {{- if eq .Os "windows" }}
          {{- if eq .Arch "amd64" }}CC=x86_64-w64-mingw32-gcc{{- end }}
        {{- end }}
```

<br>

### goos

作成するパッケージの対応OSを設定する。

```yaml
builds:
  - goos:
      - linux
      - darwin
      - windows
```

<br>

### goarch

作成するパッケージのCPUアーキテクチャを設定する。

```yaml
builds:
  - goarch:
      - amd64
      - arm
      - arm64
```

<br>

### goarm

```yaml
builds:
  - goarm:
      - 6
      - 7
```

<br>

### goamd64

```yaml
builds:
  - goamd64:
      - v2
      - v3
```

<br>

### goarm64

```yaml
builds:
  - goarm64:
      - v9.0
```

<br>

### gomips

```yaml
builds:
  - gomips:
      - hardfloat
      - softfloat
```

<br>

### go386

```yaml
builds:
  - go386:
      - sse2
      - softfloat
```

<br>

### goppc64

```yaml
builds:
  - goppc64:
      - power8
      - power9
```

<br>

### goriscv64

```yaml
builds:
  - goriscv64:
      - rva22u64
```

<br>

### ignore

```yaml
builds:
  - ignore:
      - goos: darwin
        goarch: 386
      - goos: linux
        goarch: arm
        goarm: 7
      - goarm: mips64
      - gomips: hardfloat
      - goamd64: v4
```

<br>

### targets

```yaml
builds:
  - targets:
      - go_first_class
      - go_118_first_class
      - linux_amd64_v1
      - darwin_arm64
      - linux_arm_6
```

<br>

### tool

```yaml
builds:
  - tool: "go1.13.4"
```

<br>

### command

```yaml
builds:
  - command: test
```

<br>

### mod_timestamp

```yaml
builds:
  - mod_timestamp: "{{ .CommitTimestamp }}"
```

<br>

### hooks

```yaml
builds:
  - hooks:
      pre: rice embed-go
      post: ./script.sh {{ .Path }}
```

<br>

### skip

```yaml
builds:
  - skip: false
```

<br>

### no_unique_dist_dir

```yaml
builds:
  - no_unique_dist_dir: true
```

<br>

### no_main_check

```yaml
builds:
  - no_main_check: true
```

<br>

### dir

```yaml
builds:
  - dir: go
```

<br>

### builder

```yaml
builds:
  - builder: prebuilt
```

<br>

### overrides

```yaml
builds:
  - overrides:
      - goos: darwin
        goarch: amd64
        goamd64: v1
        goarm: ""
        goarm64: ""
        gomips: ""
        go386: ""
        goriscv64: ""
        goppc64: ""
        ldflags:
          - foo
        tags:
          - bar
        asmflags:
          - foobar
        gcflags:
          - foobaz
        env:
          - CGO_ENABLED=1
```

<br>

### gobinary

```yaml
builds:
  - gobinary: "go1.13.4"
```

<br>
