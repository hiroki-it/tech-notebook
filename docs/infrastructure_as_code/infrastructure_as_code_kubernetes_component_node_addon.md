---
title: 【IT技術の知見】アドオン＠Nodeコンポーネント
description: アドオン＠Nodeコンポーネントの知見を記録しています。
---

# アドオン＠Nodeコンポーネント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. 外部Ingressコントローラー

### 外部Ingressコントローラーの種類

| コントローラー名                                       | 開発環境 | 本番環境 |
|-------------------------------------------------|----------|----------|
| minikubeのingressアドオン（実体はNginx Ingressコントローラー） | ✅        |          |
| AWS LBコントローラー                                   |          | ✅        |
| GCP CLBコントローラー                                  |          | ✅        |
| Nginx Ingressコントローラー                            | ✅        | ✅        |
| Istio Ingress                                   | ✅        | ✅        |
| Istio Gateway                                   | ✅        | ✅        |
| ...                                             | ...      | ...      |


> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
> - https://www.nginx.com/blog/how-do-i-choose-api-gateway-vs-ingress-controller-vs-service-mesh/


<br>
