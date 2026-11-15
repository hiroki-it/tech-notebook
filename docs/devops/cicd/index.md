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

<div class="grid cards compact" markdown>

- **[CI/CD](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd.html)**

  CI/CD の必要性、パイプライン設計、CIOps と GitOps

- **[デプロイ手法](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_deploy.html)**

  ローリング、ブルー/グリーン、カナリアなどのデプロイ手法

</div>

<br>

### CI ツール

<div class="grid cards compact" markdown>

- **[GitHub Actions](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_github_actions.html)**

  GitHub Actions のワークフローの書き方と仕組み

- **[GitLab CI](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_gitlab_ci.html)**

  GitLab CI のジョブ定義と処理の共通化

- **[Capistrano](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_capistrano.html)**

  Capistrano によるインプレースデプロイ

- **[CircleCI](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci.html)**

  CircleCI の config.yml と orbs

  [config.yml](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_config_yml.html) ・ [orbs](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_orbs.html) ・ [プラクティス集](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_circleci_practices.html)

- **Skaffold**

  Skaffold による Kubernetes 開発の自動化

  [skaffold.yaml](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_skaffold_yaml.html) ・ [コマンド](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_ci_skaffold_command.html)

</div>

<br>

### CD ツール

<div class="grid cards compact" markdown>

- **[ArgoCD](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd.html)**

  ArgoCD の仕組み、リソース定義、運用のプラクティス

  [コマンド](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_command.html) ・ [プラクティス集](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_practices.html) ・ リソース定義（[リソース定義](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition.html)・[共通項目](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_common.html)・[プラグイン](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_plugin.html)・[認証／認可系](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_auth.html)・[ConfigMap 系](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_configmap.html)・[Secret 系](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_secret.html)・[Job 系](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_resource_definition_job.html)） ・ [Image Updater](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argocd_image_updater_resource_definition.html)

- **[Argo Rollouts](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argorollouts.html)**

  Argo Rollouts によるカナリアなどの段階的リリース

  [リソース定義](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_cd_argorollouts_resource_definition.html)

</div>

<br>

### 自動レビューツール

<div class="grid cards compact" markdown>

- **[github-comment](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_github_comment.html)**

  ツールの実行結果を GitHub にコメントするツール

- **[reviewdog](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_reviewdog.html)**

  静的解析の結果を GitHub のレビューにコメントするツール

- **[tfnotify](https://hiroki-it.github.io/tech-notebook/devops/devops_cicd_auto_review_tfnotify.html)**

  Terraform の実行結果を通知するツール

</div>

<br>
