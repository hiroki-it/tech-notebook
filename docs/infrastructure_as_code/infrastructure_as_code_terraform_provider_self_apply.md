---
title: 【IT技術の知見】terraform apply
description: 内製プロバイダーでの terraform apply の知見を記録しています。
tags:
  - "IaC"
  - "宣言型"
  - "Terraform"
  - "プロバイダー"
---

# terraform apply

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## リソースの削除

### `Delete` でリソースの不存在を確認した場合

`404` と `NOT_FOUND` がそろった場合は、削除済みとしてエラーを返さない。Terraform Plugin Framework が state からリソースを削除するため、`Delete` では `RemoveResource` を呼び出す必要はない。

次の例では、削除に成功した API が `204` を返すものとする。

```go
func (r *fooResource) Delete(
	ctx context.Context,
	req resource.DeleteRequest,
	resp *resource.DeleteResponse,
) {
	var state fooResourceModel
	resp.Diagnostics.Append(req.State.Get(ctx, &state)...)
	if resp.Diagnostics.HasError() {
		return
	}

	res, err := r.client.DeleteFoo(ctx, state.ID.ValueString())
	if err != nil {
		resp.Diagnostics.AddError("Client error", err.Error())
		return
	}

	// エラーなしで終了すると、Framework が state からリソースを削除する。
	if res.StatusCode == http.StatusNoContent {
		return
	}

	// ルーティングミスによる 404 と区別するため、エラーコードも確認する。
	if res.StatusCode == http.StatusNotFound && res.Error != nil && res.Error.Code == "NOT_FOUND" {
		return
	}

	resp.Diagnostics.AddError("Client error", fmt.Sprintf("unexpected status code: %d", res.StatusCode))
}
```

> - [Resources - Delete | Terraform | HashiCorp Developer](https://developer.hashicorp.com/terraform/plugin/framework/resources/delete)

<br>
