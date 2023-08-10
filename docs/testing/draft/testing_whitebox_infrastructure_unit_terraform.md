---
title: 【IT技術の知見】Terratest＠単体テスト
description: Terratest＠単体テストの知見を記録しています。
---

# Terratest＠単体テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ホワイトボックステストのツール

### 整形

- `terraform fmt`コマンド

<br>

### 静的解析

- `terraform validate`コマンド

<br>

### 単体テスト

- Terratest
- Goss
- Serverspec

> - https://abstraction.blog/2021/06/20/terraform-testing-tools-comparison

<br>

## 02. Terratest

### コマンド

<br>

## 02-02. テストケース

### 単体テストの場合

#### ▼ 正常系テストの場合

EC2インスタンスの動作が正しいかを検証する。

```go
package test

import (
	"fmt"
	"testing"
	"time"

	http_helper "github.com/gruntwork-io/terratest/modules/http-helper"

	"github.com/gruntwork-io/terratest/modules/terraform"
)

func TestTerraformAwsHelloWorldExample(t *testing.T) {
    // テストを並列的に実行する。
	t.Parallel()

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../examples/terraform-aws-hello-world-example",
	})

    // 処理の最後に、terraform destroyコマンドを実行し、リソースを削除する。
	defer terraform.Destroy(t, terraformOptions)

    // terraform initコマンドとterraform applyコマンドを実行する。
	terraform.InitAndApply(t, terraformOptions)

    // 作成したEC2インスタンスからパブリックIPアドレスを参照する。
	publicIp := terraform.Output(t, terraformOptions, "public_ip")

	url := fmt.Sprintf("http://%s:8080", publicIp)

    // 「Hello World」がレスポンスされるか否かを確認する。
	http_helper.HttpGetWithRetry(t, url, nil, 200, "Hello, World!", 30, 5*time.Second)
}
```

> - https://github.com/gruntwork-io/terratest/tree/master/examples/terraform-aws-hello-world-example
> - https://github.com/gruntwork-io/terratest/blob/master/test/terraform_aws_hello_world_example_test.go

<br>
