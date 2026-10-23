# 【導入】DDD とクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説

# 01. はじめに

どうも、Istio のマスコットやってますカイルくんです。

![Windowsイルカ.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudnative_microservices/Windows%E3%82%A4%E3%83%AB%E3%82%AB.png)

近年、先輩エンジニアのおかげで、マイクロサービスアーキテクチャの実装方法やより最適なデザインパターンの情報を得られるようになりました。

[Microservices Patterns: With examples in Java](https://www.amazon.co.jp/dp/1617294543)

[Building Microservices: Designing Fine-Grained Systems (English Edition)](https://www.amazon.co.jp/dp/B09B5L4NVT)

また、マイクロサービスアーキテクチャを支える DDD についても、先輩エンジニアがより具体的な知見を提供してくれています。

[ドメイン駆動設計をはじめよう ―ソフトウェアの実装と事業戦略を結びつける実践技法](https://www.amazon.co.jp/dp/481440073X)

それと同時に、クラウドネイティブのコミュニティは進化しており、マイクロサービスアーキテクチャのデザインパターンとして採用できる様々なツールがあります。

[Platform Engineering on Kubernetes](https://www.amazon.co.jp/dp/1617299324)

一方で、これらを組み合わせ、マイクロサービスアーキテクチャを設計しようとする情報はまだまだ少ないように思います。

そこで、様々な以下の情報

- 現場で携わっている実際のマイクロサービスアーキテクチャ
- 今まで読んできた書籍
- 事例記事
- GitHub のサンプル実装

を集約しつつ、DDD とクラウドネイティブをどのように組み合わせれば、マイクロサービスアーキテクチャを設計できるのかを概説します。

> 💡 ぶっちゃけ、高尚な意義なんてなくて、俺が好きなものを語るだけの記事っすわーーーーー

# 02. ソフトウェアのアーキテクチャスタイルの歴史

## アーキテクチャスタイルとは

![architecture_map.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudnative_microservices/a19bfc23-74da-4347-b34d-3fe523fbe866.png)

アーキテクチャスタイルは、ソフトウェアアーキテクチャを取り巻く技術的なトピックの 1 つです。

アーキテクチャパターンとも呼びます。

アーキテクチャスタイルとは、とあるアーキテクチャ特性をもつアーキテクチャのことです。

以下は、アーキテクチャスタイルのトピックです。

- マイクロサービスアーキテクチャ
- モノリスアーキテクチャ
- レイヤードアーキテクチャ
- …

今回は、特にマイクロサービスアーキテクチャを語っていきます。

> 💡 アーキテクチャ特性は話が外れるため、ソフトウェアアーキテクチャの基礎 を確認してくれよな！🤚🏻
> [ソフトウェアアーキテクチャの基礎](https://www.oreilly.co.jp//books/9784873119823/)

## マイクロサービスアーキテクチャに関する歴史

マイクロサービスアーキテクチャに関連するアーキテクチャスタイルがいくつかあります。

マイクロサービスアーキテクチャが提唱されたのは 2014 年のことです。

マイクロサービスアーキテクチャは銀の弾丸ではありません。

マイクロサービスアーキテクチャの提唱以降も、各人が様々なアーキテクチャスタイルを提唱しています。

また、開発組織の規模やアプリケーションの特徴によって、適切なアーキテクチャを採用すべきです。

(まぁ、俺はマイクロサービスアーキテクチャが好きってこと。それだけの話や。)

以下の表で、マイクロサービスアーキテクチャに関する歴史を解説しました。

<table>
  <thead>
    <tr>
      <th>年代</th>
      <th>アーキテクチャスタイル</th>
      <th>説明</th>
      <th>参考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1999 年</td>
      <td>モノリシックアーキテクチャ</td>
      <td>バックエンドのアーキテクチャとしてモノリシックアーキテクチャが台頭していた。</td>
      <td><a href="https://en.wikipedia.org/wiki/Monolithic_application">https://en.wikipedia.org/wiki/Monolithic_application</a></td>
    </tr>
    <tr>
      <td>1900 年後半〜2000 年前半</td>
      <td>サービス指向アーキテクチャ</td>
      <td>Michael Bell や Thomas Erl らが、アプリを機能の粒度で分割するアーキテクチャを提唱した。ただ『機能』という粒度に分割の指針がなかった。様々な課題があったため、概念としては提唱されていても、実装方法の確立にまでは至らなかった。</td>
      <td>・<a href="https://en.wikipedia.org/wiki/Service-oriented_architecture">https://en.wikipedia.org/wiki/Service-oriented_architecture</a> ・<a href="https://www.amazon.co.jp/dp/B09B5L4NVT">https://www.amazon.co.jp/dp/B09B5L4NVT</a></td>
    </tr>
    <tr>
      <td>2003 年</td>
      <td>DDD</td>
      <td>Eric Evans は DDD を提唱した。DDD は、オブジェクト指向分析設計から派生した分析設計の方法の一種である。特に機能要件を解決するアプリケーションに有効である。オブジェクト指向分析設計のベタープラクティスを集め、より強化することにつながった。</td>
      <td>・<a href="https://www.amazon.co.jp/dp/481440073X">https://www.amazon.co.jp/dp/481440073X</a><br>・<a href="https://en.wikipedia.org/wiki/Domain-driven_design">https://en.wikipedia.org/wiki/Domain-driven_design</a></td>
    </tr>
    <tr>
      <td>2014 年</td>
      <td>マイクロサービスアーキテクチャ</td>
      <td>Simon Brown は、モノリシックアーキテクチャは、時間経過とともに、無秩序でつぎはぎだらけになり得ることを指摘した。Martin Fowler と James Lewis は、サービス指向アーキテクチャと DDD を統合し、アプリを独立したマイクロサービスの集まりに分割するアーキテクチャを提唱した。サービス指向アーキテクチャに DDD の高凝集/低結合の考え方を取り入れることで、サービス指向アーキテクチャを実装可能な理論に昇華させた。</td>
      <td>・<a href="https://dzone.com/articles/distributed-big-balls-mud">https://dzone.com/articles/distributed-big-balls-mud</a><br>・<a href="https://martinfowler.com/articles/microservices.html">https://martinfowler.com/articles/microservices.html</a></td>
    </tr>
    <tr>
      <td>2015 年</td>
      <td>モジュラーモノリス</td>
      <td>Martin Flowler はモジュラーモノリスを提唱した。モジュラモノリスでは、マイクロサービスアーキテクチャとモノリスアーキテクチャの間をとった粒度で、アプリを細かいモジュールに分割する。最初にモジュラーモノリスとして設計し、マイクロサービスアーキテクチャに移行していくという選択肢もある。</td>
      <td>・<a href="https://martinfowler.com/bliki/MonolithFirst.html">https://martinfowler.com/bliki/MonolithFirst.html</a></td>
    </tr>
  </tbody>
</table>

## マイクロサービスアーキテクチャのデザインパターン

マイクロサービスアーキテクチャでは特有の技術 / 組織的な問題が起こります。

これを解決するためのデザインパターンがたくさんあり、本記事ではこれらを取り上げます。

取り上げるデザインパターンの多くは、 https://www.amazon.co.jp/dp/1617294543 にも登場します。

![MicroservicePatternLanguage.jpg](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudnative_microservices/MicroservicePatternLanguage.jpg)

[Microservices Pattern: A pattern language for microservices](https://microservices.io/patterns/)

[Microservices Pattern: Microservice Architecture pattern](https://microservices.io/patterns/microservices.html#related-patterns)

# 03. クラウドネイティブ

## CNCF による定義づけ

CNCF は、クラウドネイティブを以下のように定義づけしています。

マイクロサービスアーキテクチャを構築するために適した技術であることがわかります。

> クラウドネイティブ技術は、パブリッククラウド、プライベートクラウド、ハイブリッドクラウドなどの近代的でダイナミックな環境において、スケーラブルなアプリケーションを構築して実行するための能力を組織にもたらします。 このアプローチの代表例に、コンテナ、サービスメッシュ、マイクロサービス、イミュータブルインフラストラクチャ、および宣言型 API があります。

[https://github.com/cncf/toc/blob/main/DEFINITION.md](https://github.com/cncf/toc/blob/main/DEFINITION.md)

## クラウドネイティブに関する歴史

<table>
  <thead>
    <tr>
      <th>年代</th>
      <th>技術</th>
      <th>説明</th>
      <th>参考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2004</td>
      <td>AWS</td>
      <td>AWS は、同社初のクラウドサービスとして SQS を公開した。</td>
      <td><a href="https://en.wikipedia.org/wiki/Amazon_Web_Services">https://en.wikipedia.org/wiki/Amazon_Web_Services</a></td>
    </tr>
    <tr>
      <td>2008</td>
      <td>Google Cloud</td>
      <td>Google Cloud は、同社初のクラウドサービスとして App Engine を公開した。</td>
      <td><a href="https://en.wikipedia.org/wiki/Google_Cloud_Platform">https://en.wikipedia.org/wiki/Google_Cloud_Platform</a></td>
    </tr>
    <tr>
      <td>2010</td>
      <td>Azure</td>
      <td>Azure は、同社初のクラウドサービスとして Windows Azure を公開した。</td>
      <td><a href="https://en.wikipedia.org/wiki/Microsoft_Azure">https://en.wikipedia.org/wiki/Microsoft_Azure</a></td>
    </tr>
    <tr>
      <td>2013</td>
      <td>Docker</td>
      <td>dotCloud が、仮想化技術としてコンテナを公開した。</td>
      <td><a href="https://en.wikipedia.org/wiki/Docker_(software)">https://en.wikipedia.org/wiki/Docker_(software)</a></td>
    </tr>
    <tr>
      <td>2014</td>
      <td>Kubernetes</td>
      <td>Google が Kubernetes を発表した。</td>
      <td><a href="https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/">https://kubernetes.io/blog/2024/06/06/10-years-of-kubernetes/</a></td>
    </tr>
    <tr>
      <td>2014-2024</td>
      <td>CNCF プロジェクト 21 分野</td>
      <td>Kubernetes の登場後、CNCF では 21 分野に渡るクラウドネイティブ技術のプロジェクトが登場した。</td>
      <td><a href="https://landscape.cncf.io/">https://landscape.cncf.io/</a></td>
    </tr>
  </tbody>
</table>

## CNCF によるツール分類

CNCF では、ツールを以下で分類しています。

本記事で登場するツールの一部を例として紹介しました。

<table>
  <thead>
    <tr>
      <th>分類</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>アプリケーション定義とイメージビルド</td>
      <td>Docker Compose、Helm、OpenAPI</td>
    </tr>
    <tr>
      <td>継続的インテグレーションとデリバリー</td>
      <td>ArgoCD (CD)、GitHub Actions (CI)</td>
    </tr>
    <tr>
      <td>DB</td>
      <td>Amazon Aurora</td>
    </tr>
    <tr>
      <td>ストリーミングとメッセージング</td>
      <td>今回は言及しません</td>
    </tr>
    <tr>
      <td>スケジューリングとオーケストレーション</td>
      <td>Amazon EKS</td>
    </tr>
    <tr>
      <td>サービスメッシュ</td>
      <td>Istio🐬</td>
    </tr>
    <tr>
      <td>リモートプロシージャーコール</td>
      <td>gRPC</td>
    </tr>
    <tr>
      <td>サービスプロキシ</td>
      <td>Envoy</td>
    </tr>
    <tr>
      <td>API Gateway</td>
      <td>今回はサービスプロキシの Nginx で代替</td>
    </tr>
    <tr>
      <td>調整とサービスディスカバリー</td>
      <td>CoreDNS</td>
    </tr>
    <tr>
      <td>クラウドネイティブネットワーク</td>
      <td>Amazon VPC CNI</td>
    </tr>
    <tr>
      <td>コンテナランタイム</td>
      <td>Containerd</td>
    </tr>
    <tr>
      <td>セキュリティとコンプライアンス</td>
      <td>Keycloak、OAuth2 Proxy</td>
    </tr>
    <tr>
      <td>コンテナレジストリ</td>
      <td>Amazon ECR</td>
    </tr>
    <tr>
      <td>自動化と設定</td>
      <td>Terraform</td>
    </tr>
    <tr>
      <td>キー管理</td>
      <td>AWS KMS</td>
    </tr>
    <tr>
      <td>可観測性</td>
      <td>Amazon CloudWatch、Fluentd / FluentBit、Grafana、Kiali、OpenTelemetry、Prometheus</td>
    </tr>
    <tr>
      <td>カオスエンジニアリング</td>
      <td>今回は言及しません</td>
    </tr>
    <tr>
      <td>継続的最適化</td>
      <td>今回は言及しません</td>
    </tr>
    <tr>
      <td>機能フラグ</td>
      <td>今回は言及しません</td>
    </tr>
  </tbody>
</table>

[CNCF Landscape](https://landscape.cncf.io/)

# 04. マイクロサービスアーキテクチャ設計の全体像

## マイクロサービスアーキテクチャパターンとクラウドネイティブ

### 凡例

```mermaid
flowchart LR

  親グループ([親グループ]) --- 起点(( ))
  起点 ---- パターン1
  起点 --- 子グループ([子グループ])
  子グループ --- パターン2
  子グループ --- パターン3

```

### フロントエンド領域

マイクロサービスアーキテクチャのフロントエンド領域のデザインパターンは以下のとおりです。

```mermaid
flowchart LR

  フロントエンド[フロントエンド<br>領域] --- フロントエンドの基点(( ))
  フロントエンドの基点 --- フロントエンド分割方法
  フロントエンドの基点 --- フロントエンドアプリ実装
  フロントエンドの基点 --- クラウドデザインパターン



```

### API Gateway 領域

マイクロサービスアーキテクチャの API Gateway 領域のデザインパターンは以下のとおりです。

```mermaid
flowchart LR

  API-Gateway領域([API Gateway<br>領域]) ---- API-Gateway分割方法([API Gateway<br>分割方法])

```

### マイクロサービス領域

マイクロサービスアーキテクチャのマイクロサービス領域のデザインパターンは以下のとおりです。

```mermaid
flowchart LR

  マイクロサービス領域([マイクロサービス<br>領域]) --- マイクロサービス領域の基点(( ))
  マイクロサービス領域の基点 --- マイクロサービス間通信方法([マイクロサービス間<br>通信方法])
  マイクロサービス領域の基点 --- マイクロサービス分割方法([マイクロサービス<br>分割方法])
  マイクロサービス領域の基点 --- マイクロサービス設計方法([マイクロサービス<br>設計方法])
  マイクロサービス領域の基点 --- ドメインモデリング方法([ドメインモデリング方法])
  マイクロサービス領域の基点 --- トランザクション管理方法([トランザクション<br>管理方法])
  マイクロサービス領域の基点 --- 設定管理方法([設定<br>管理方法])
  マイクロサービス領域の基点 --- 認証認可([認証認可])

```

### ストレージ領域

マイクロサービスアーキテクチャのストレージ領域のデザインパターンは以下のとおりです。

### インフラ領域

マイクロサービスアーキテクチャのインフラ領域のデザインパターンは以下のとおりです。

### アプリ・インフラ間横断領域

## システム全体から概説

マイクロサービスアーキテクチャをシステム全体から概説します。

![DDDとクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説-クラウドインフラ設計.drawio.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudnative_microservices/DDDとクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説-クラウドインフラ設計.drawio.png)

主に以下のツールからなります。

<table>
  <thead>
    <tr>
      <th>ユースケース (五十音順)</th>
      <th>ツール (アルファベット順)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>IaC</td>
      <td>Helm、Kubernetes、Terraform</td>
    </tr>
    <tr>
      <td>L7 ロードバランサー</td>
      <td>AWS ALB</td>
    </tr>
    <tr>
      <td>L7/L4 ロードバランサー</td>
      <td>Istio EgressGateway、Istio IngressGateway、Nginx Ingress Controller</td>
    </tr>
    <tr>
      <td>コンテナオーケストレーション</td>
      <td>Amazon EKS</td>
    </tr>
    <tr>
      <td>コンテナランタイム</td>
      <td>Containerd</td>
    </tr>
    <tr>
      <td>サービスメッシュ</td>
      <td>Istio🐬</td>
    </tr>
    <tr>
      <td>CI/CD</td>
      <td>ArgoCD、GitHub Actions</td>
    </tr>
    <tr>
      <td>テレメトリー</td>
      <td>Fluentd / FluentBit、Grafana、Kiali、OpenTelemetry、Prometheus</td>
    </tr>
    <tr>
      <td>認証関連</td>
      <td>OAuth2 Proxy、Keycloak</td>
    </tr>
    <tr>
      <td>Node 管理</td>
      <td>Karpenter</td>
    </tr>
    <tr>
      <td>Pod 管理</td>
      <td>descheduler</td>
    </tr>
    <tr>
      <td>インシデント管理</td>
      <td>Slack、<a href="http://Incident.io">Incident.io</a></td>
    </tr>
    <tr>
      <td>その他</td>
      <td>周辺の AWS リソース</td>
    </tr>
  </tbody>
</table>

## マイクロサービスアーキテクチャから概説

マイクロサービスアーキテクチャをより詳細に概説します。

![DDDとクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説-アプリ全体設計.drawio.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloudnative_microservices/DDD%E3%81%A8%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%83%8D%E3%82%A4%E3%83%86%E3%82%A3%E3%83%96%E3%81%AB%E3%82%88%E3%82%8B%E3%83%9E%E3%82%A4%E3%82%AF%E3%83%AD%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E8%A8%AD%E8%A8%88%E3%81%AE%E6%A6%82%E8%AA%AC-%E3%82%A2%E3%83%97%E3%83%AA%E5%85%A8%E4%BD%93%E8%A8%AD%E8%A8%88.drawio.png)

主に以下のツールからなります。(五十音順)

<table>
  <thead>
    <tr>
      <th>ユースケース (五十音順)</th>
      <th>ツール (アルファベット順)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>API Gateway</td>
      <td>Nginx</td>
    </tr>
    <tr>
      <td>L7 ロードバランサー</td>
      <td>AWS ALB</td>
    </tr>
    <tr>
      <td>L7/L4 ロードバランサー</td>
      <td>Istio EgressGateway、Istio IngressGateway</td>
    </tr>
    <tr>
      <td>ID プロバイダー</td>
      <td>Google、Keycloak</td>
    </tr>
    <tr>
      <td>コンテナオーケストレーション</td>
      <td>Amazon EKS</td>
    </tr>
    <tr>
      <td>コンテナランタイム</td>
      <td>Containerd</td>
    </tr>
    <tr>
      <td>サービスメッシュ</td>
      <td>Istio🐬</td>
    </tr>
    <tr>
      <td>DB</td>
      <td>Aurora MySQL</td>
    </tr>
    <tr>
      <td>フロントエンドアプリ</td>
      <td>任意の言語</td>
    </tr>
    <tr>
      <td>マイクロサービス</td>
      <td>任意の言語、Keycloak (認証マイクロサービス) 、Temporal (Saga オーケストレーター)</td>
    </tr>
    <tr>
      <td>その他</td>
      <td>周辺の AWS リソース</td>
    </tr>
  </tbody>
</table>

# 05-15. アプリ領域を参照

[【アプリ領域】DDD とクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説](https://example.com)

# 16-19. インフラ領域を参照

[【インフラ領域】DDD とクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説](https://example.com)

# 20-26. 横断領域を参照

[【横断領域】DDD とクラウドネイティブによるマイクロサービスアーキテクチャ設計の概説](https://example.com)

# 27. おわりに

マイクロサービスアーキテクチャのことになると、早口になるタイプのオタクです。

どうかこの想い、同志に届いてほしいです。

# 謝辞

この歌をよ…

お前たちにさ…

捧げるぜ🥴

概説の基礎になる知識をくれた人たち (順不同)

- 長澤氏 (Kubernetes) @Tsubasa Nagasawa
- bells17 氏 (Kubernetes) @bells17(Daiki Hayakawa)
- 青山氏 (Kubernetes) @Masaya Aoyama
- Satoken 氏 (Kubernetes) @Kengo Sato
- 寺岡氏 (Istio) @Yoshinori Teraoka
- 河野氏 (認証認可) @Takeshi Kono
- 中楯氏 (トランザクション管理) @Naoki Nakadate
- 山田氏 (マイクロフロントエンド) @Yunosuke Yamada
- 現場のアプリエンジニアの方々

人生をお世話になっている友達たち (順不同)

- nwiizo くん @Shuya Motouchi
- 逆井くん
