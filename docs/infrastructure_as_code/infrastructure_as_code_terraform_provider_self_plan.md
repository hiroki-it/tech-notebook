---
title: 【IT技術の知見】terraform plan
description: 内製プロバイダーでの terraform plan の知見を記録しています。
tags:
  - "IaC"
  - "宣言型"
  - "Terraform"
  - "プロバイダー"
---

# terraform plan

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## ドリフトの検出

### Terraform の外で削除されたリソースの再作成

Terraform の外で管理対象のリソースが削除された場合、プロバイダーは `Read` で削除を検出し、state から対象を取り除く。Terraform の構成にリソースの定義が残っていれば、通常の `terraform plan` で再作成が提案される。

`404` と `NOT_FOUND` がそろった場合だけ、`resp.State.RemoveResource` で state から削除する。それ以外の `404` はエラーとして扱い、ルーティングミスで state から誤って削除しない。

```go
func (r *fooResource) Read(
	ctx context.Context,
	req resource.ReadRequest,
	resp *resource.ReadResponse,
) {
	var state fooResourceModel
	resp.Diagnostics.Append(req.State.Get(ctx, &state)...)
	if resp.Diagnostics.HasError() {
		return
	}

	res, err := r.client.GetFoo(ctx, state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Client error", err.Error())
		return
	}

	// API 固有のエラーコードも確認してから state から削除する。
	if res.StatusCode == http.StatusNotFound && res.Error != nil && res.Error.Code == "NOT_FOUND" {
		resp.State.RemoveResource(ctx)
		return
	}

	if res.StatusCode != http.StatusOK {
		resp.Diagnostics.AddError("Client error", fmt.Sprintf("unexpected status code: %d", res.StatusCode))
		return
	}

	// ...
}
```

> - [Resources - Read | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/plugin/framework/resources/read)
> - [RESTful API「ステータスコードとエラーコードによる判定」](../software/software_application_api_restful.md)

<br>
