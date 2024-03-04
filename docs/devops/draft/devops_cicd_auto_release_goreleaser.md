---
title: 【IT技術の知見】goreleaser＠自動リリースツール
description: goreleaser＠自動リリースツールの知見を記録しています。
---

# goreleaser＠自動リリースツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 設定ファイル

### archives

```yaml
archives:
  - format: tar.gz
    name_template: >-
      {{ .ProjectName }}_
      {{- title .Os }}_
      {{- if eq .Arch "amd64" }}x86_64
      {{- else if eq .Arch "386" }}i386
      {{- else }}{{ .Arch }}{{ end }}
      {{- if .Arm }}v{{ .Arm }}{{ end }}
    format_overrides:
      - goos: windows
        format: zip
```

> - https://goreleaser.com/customization/archive/

<br>

### before

```yaml
before:
  hooks:
    - go mod tidy
    - go generate ./...
```

<br>

### build

```yaml
builds:
  - env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin
```

<br>

### changelog

```yaml
changelog:
  sort: asc
  filters:
    exclude:
      - "^docs:"
      - "^test:"
```

<br>

### version

```yaml
version: 1
```

<br>

## 02. goreleaserコマンド

記入中...

<br>
