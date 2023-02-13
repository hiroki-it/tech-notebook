---
title: 【IT技術の知見】コマンド＠FluentBit
description: コマンド＠FluentBitの知見を記録しています。
---

# コマンド＠FluentBit

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。


> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## fluent-bitコマンド

### fluent-bitコマンドとは

コマンドでセクションを実行できる。

```bash
$ /fluent-bit/bin/fluent-bit --help

Available Options
  -b  --storage_path=PATH specify a storage buffering path
  -c  --config=FILE       specify an optional configuration file
  -d, --daemon            run Fluent Bit in background mode
  -D, --dry-run           dry run
  -f, --flush=SECONDS     flush timeout in seconds (default: 5)
  -F  --filter=FILTER     set a filter
  -i, --input=INPUT       set an input
  -m, --match=MATCH       set plugin match, same as '-p match=abc'
  -o, --output=OUTPUT     set an output
  -p, --prop="A=B"        set plugin configuration property
  -R, --parser=FILE       specify a parser configuration file
  -e, --plugin=FILE       load an external plugin (shared lib)
  -l, --log_file=FILE     write log info to a file
  -t, --tag=TAG           set plugin tag, same as '-p tag=abc'
  -T, --sp-task=SQL       define a stream processor task
  -v, --verbose           increase logging verbosity (default: info)
  -w, --workdir           set the working directory
  -H, --http              enable monitoring HTTP server
  -P, --port              set HTTP server TCP port (default: 2020)
  -s, --coro_stack_size   set coroutines stack size in bytes (default: 24576)
  -q, --quiet             quiet mode
  -S, --sosreport         support report for Enterprise customers
  -V, --version           show version number
  -h, --help              print this help
```

<br>

### -c

設定ファイルのバリデーションは、開発環境にて、以下サイトや再起動を伴う```--config```オプションから行う。

これら以外に再起動を伴わない```--dry-run```オプションがあるが、このオプションは経験則で精度が低いため、参考程度にする。

> ↪️ 参考：https://cloud.calyptia.com/visualizer

```bash
$ /fluent-bit/bin/fluent-bit --config=/fluent-bit/etc/fluent-bit_custom.conf
```

<br>
