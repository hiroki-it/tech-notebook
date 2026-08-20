---
title: 【IT技術の知見】独自プロバイダー＠Terraform
description: 独自プロバイダー＠Terraformの知見を記録しています。
---

# 独自プロバイダー＠Terraform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 最小限のプロバイダー実装

Terraform Plugin Framework を使用すると、Go で独自プロバイダーを実装できる。

```go
package provider

import (
	"context"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/provider"
	providerschema "github.com/hashicorp/terraform-plugin-framework/provider/schema"
	"github.com/hashicorp/terraform-plugin-framework/resource"
)

type exampleProvider struct{}

func (p *exampleProvider) Metadata(
	_ context.Context,
	_ provider.MetadataRequest,
	resp *provider.MetadataResponse,
) {
	// fooリソースを定義する
	resp.TypeName = "foo"
}

func (p *exampleProvider) Schema(
	_ context.Context,
	_ provider.SchemaRequest,
	resp *provider.SchemaResponse,
) {
	resp.Schema = providerschema.Schema{}
}

func (p *exampleProvider) Configure(
	context.Context,
	provider.ConfigureRequest,
	*provider.ConfigureResponse,
) {
}

func (p *exampleProvider) Resources(context.Context) []func() resource.Resource {
	return []func() resource.Resource{
		func() resource.Resource { return &fooResource{} },
	}
}

func (p *exampleProvider) DataSources(context.Context) []func() datasource.DataSource {
	return []func() datasource.DataSource{
		func() datasource.DataSource { return &barDataSource{} },
	}
}

func New() provider.Provider {
	return &exampleProvider{}
}
```

## 最小限のResource

Resource は、Terraform で作成、読み取り、更新、削除する対象を表す。

次のような `resource` を定義するための Data Source を実装する。

```terraform
resource "foo_bar" "this" {}
```

```go
package provider

import (
	"context"

	"github.com/hashicorp/terraform-plugin-framework/resource"
	"github.com/hashicorp/terraform-plugin-framework/resource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type fooResource struct{}

type fooResourceModel struct {
	ID types.String `tfsdk:"id"`
}

func (r *fooResource) Metadata(
	_ context.Context,
	req resource.MetadataRequest,
	resp *resource.MetadataResponse,
) {
	// barタイプを定義する
	// fooリソースはプロバイダーのMetadataで定義している
	// resource "foo_bar" になる
	resp.TypeName = req.ProviderTypeName + "_bar"
}

func (r *fooResource) Schema(
	_ context.Context,
	_ resource.SchemaRequest,
	resp *resource.SchemaResponse,
) {
	resp.Schema = schema.Schema{
		Attributes: map[string]schema.Attribute{
			"id": schema.StringAttribute{Computed: true},
		},
	}
}

func (r *fooResource) Create(
	ctx context.Context,
	_ resource.CreateRequest,
	resp *resource.CreateResponse,
) {
	resp.Diagnostics.Append(resp.State.Set(ctx, &fooResourceModel{
		ID: types.StringValue("example-id"),
	})...)
}

func (r *fooResource) Read(
	context.Context,
	resource.ReadRequest,
	*resource.ReadResponse,
) {
}

func (r *fooResource) Update(
	context.Context,
	resource.UpdateRequest,
	*resource.UpdateResponse,
) {
}

func (r *fooResource) Delete(
	ctx context.Context,
	_ resource.DeleteRequest,
	resp *resource.DeleteResponse,
) {
	resp.State.RemoveResource(ctx)
}
```

## 最小限のData Source

Data Source は、既存の情報を読み取って State に保存する。

次のような `data` を定義するための Data Source を実装する。

```terraform
data "foo_bar" "this" {}
```

```go
package provider

import (
	"context"

	"github.com/hashicorp/terraform-plugin-framework/datasource"
	"github.com/hashicorp/terraform-plugin-framework/datasource/schema"
	"github.com/hashicorp/terraform-plugin-framework/types"
)

type barDataSource struct{}

type barDataSourceModel struct {
	Message types.String `tfsdk:"message"`
}

func (d *barDataSource) Metadata(
	_ context.Context,
	req datasource.MetadataRequest,
	resp *datasource.MetadataResponse,
) {
	// barタイプを定義する
	// fooリソースはプロバイダーのMetadataで定義している
	// data "foo_bar" になる
	resp.TypeName = req.ProviderTypeName + "_bar"
}

func (d *barDataSource) Schema(
	_ context.Context,
	_ datasource.SchemaRequest,
	resp *datasource.SchemaResponse,
) {
	resp.Schema = schema.Schema{
		Attributes: map[string]schema.Attribute{
			"message": schema.StringAttribute{Computed: true},
		},
	}
}

func (d *barDataSource) Read(
	ctx context.Context,
	_ datasource.ReadRequest,
	resp *datasource.ReadResponse,
) {
	resp.Diagnostics.Append(resp.State.Set(ctx, &barDataSourceModel{
		Message: types.StringValue("Hello, Terraform!"),
	})...)
}
```

## 受け入れテスト

Go 標準の `testing` パッケージと `terraform-plugin-testing` を組み合わせ、Terraform Provider の受け入れテストを実装する。

受け入れテストは、次のように `TF_ACC=1` を設定する必要がある。

```bash
TF_ACC=1 go test ./internal/provider/... -v
```

```go
package provider_test

import (
	"testing"

	"github.com/hashicorp/terraform-plugin-framework/providerserver"
	"github.com/hashicorp/terraform-plugin-go/tfprotov6"
	"github.com/hashicorp/terraform-plugin-testing/helper/resource"

	exampleprovider "example.com/example/internal/provider"
)

var testProviderFactories = map[string]func() (tfprotov6.ProviderServer, error){
	"foo": providerserver.NewProtocol6WithError(exampleprovider.New()),
}

func TestAccProvider(t *testing.T) {
	resource.Test(t, resource.TestCase{
		ProtoV6ProviderFactories: testProviderFactories,
		Steps: []resource.TestStep{
			{
				Config: `
terraform {
  required_providers {
    foo = {
      source = "example.com/example/example"
    }
  }
}

resource "foo_bar" "this" {}

data "foo_bar" "this" {}
`,
				Check: resource.ComposeAggregateTestCheckFunc(
					resource.TestCheckResourceAttr(
						"foo_bar.this", "id", "example-id",
					),
					resource.TestCheckResourceAttr(
						"data.foo_bar.this", "message", "Hello, Terraform!",
					),
				),
			},
		},
	})
}
```
