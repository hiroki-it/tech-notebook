---
hide:
  - navigation
tags:
  - "CI/CD"
---

# セクションの目次

!!! info "このセクションについて"

    **量が多いため、[DevOpsセクション](https://hiroki-it.github.io/tech-notebook/devops/index.html) から切り分けています**

<br>

## 🔄 CI/CD

### CI/CD

!!! cards ":material-pipe: CI/CD"

    <div class="grid cards compact" markdown>

    - **[CI/CD](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd.html)**

      CI/CD の必要性、パイプライン設計、CIOps と GitOps

    </div>

!!! cards ":material-rocket-launch-outline: デプロイ手法"

    <div class="grid cards compact" markdown>

    - **[デプロイ手法](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_deploy.html)**

      ローリング、ブルー/グリーン、カナリアなどのデプロイ手法

    </div>

<br>

### CI ツール

!!! cards ":simple-githubactions: GitHub Actions"

    <div class="grid cards compact" markdown>

    - **[GitHub Actions](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_github_actions.html)**

      GitHub Actions のワークフローの書き方と仕組み

    </div>

!!! cards ":simple-gitlab: GitLab CI"

    <div class="grid cards compact" markdown>

    - **[GitLab CI](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_gitlab_ci.html)**

      GitLab CI のジョブ定義と処理の共通化

    </div>

!!! cards ":material-rocket-launch-outline: Capistrano"

    <div class="grid cards compact" markdown>

    - **[Capistrano](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_capistrano.html)**

      Capistrano によるインプレースデプロイ

    </div>

!!! cards ":simple-circleci: CircleCI"

    <div class="grid cards compact" markdown>

    - **[CircleCI](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci.html)**

      CircleCI の config.yml と orbs

    - **[config.yml](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_config_yml.html)**

      jobs、commands、workflow などの config.yml

    - **[orbs](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_orbs.html)**

      aws-ecr や slack などの orbs

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_practices.html)**

      CircleCI の脆弱性対策と事後処理

    </div>

!!! cards ":simple-skaffold: Skaffold"

    Skaffold による Kubernetes 開発の自動化

    <div class="grid cards compact" markdown>

    - **[skaffold.yaml](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_skaffold_yaml.html)**

      build、test、deploy などのステージの設定

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_skaffold_command.html)**

      skaffold コマンドとポートフォワーディング

    </div>

<br>

### CD ツール

!!! cards ":simple-argo: ArgoCD"

    <div class="grid cards compact" markdown>

    - **[ArgoCD](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd.html)**

      ArgoCD の仕組み、リソース定義、運用のプラクティス

    - **[コマンド](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_command.html)**

      argocd app、cluster、repo コマンド

    - **[プラクティス集](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_practices.html)**

      コンポーネントの冗長化と Cluster の設計パターン

    - **[リソース定義 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition.html)**

      Application、ApplicationSet、AppProject

    - **[共通項目 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_common.html)**

      ArgoCD のラベル

    - **[プラグイン (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_plugin.html)**

      Helm や Helmfile と連携するプラグイン

    - **[認証／認可系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_auth.html)**

      ArgoCD の Role、RoleBinding、ServiceAccount

    - **[ConfigMap 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_configmap.html)**

      argocd-cm、argocd-rbac-cm などの ConfigMap

    - **[Secret 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_secret.html)**

      argocd-repo などの Secret

    - **[Job 系 (リソース定義)](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_job.html)**

      Sync に伴う処理を実行する Job

    - **[Image Updater](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_image_updater_resource_definition.html)**

      コンテナイメージの自動更新

    </div>

!!! cards ":simple-argo: Argo Rollouts"

    <div class="grid cards compact" markdown>

    - **[Argo Rollouts](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argorollouts.html)**

      Argo Rollouts によるカナリアなどの段階的リリース

    - **[リソース定義](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argorollouts_resource_definition.html)**

      Rollout による段階的なリリース

    </div>

<br>

### 自動レビューツール

!!! cards ":simple-github: github-comment"

    <div class="grid cards compact" markdown>

    - **[github-comment](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_github_comment.html)**

      ツールの実行結果を GitHub にコメントするツール

    </div>

!!! cards ":material-dog: reviewdog"

    <div class="grid cards compact" markdown>

    - **[reviewdog](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_reviewdog.html)**

      静的解析の結果を GitHub のレビューにコメントするツール

    </div>

!!! cards ":simple-terraform: tfnotify"

    <div class="grid cards compact" markdown>

    - **[tfnotify](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_tfnotify.html)**

      Terraform の実行結果を通知するツール

    </div>

<br>
