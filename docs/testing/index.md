---
hide:
  - navigation
tags:
  - "テスト"
---

# セクションの目次

## 🧪 テスト

### ホワイトボックステスト

!!! cards ":material-test-tube: ホワイトボックステスト"

    <div class="grid cards compact" markdown>

    - **[ホワイトボックステスト](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox.html)**

      静的解析、ユニットテスト、テストダブル

    </div>

!!! cards ":simple-php: アプリ (PHP)"

    PHPStan、PHPUnit などの PHP のテストツール

    <div class="grid cards compact" markdown>

    - **[PHP のテストツール](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_php.html)**

      PHP のホワイトボックステストのツール

    - **[PHPStan (静的解析)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_php_lint_phpstan.html)**

      PHPStan による静的解析

    - **[PHPUnit (ユニットテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_php_unit_phpunit.html)**

      PHPUnit のアサーションと事前・事後処理

    - **[Phake (ユニットテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_php_unit_phake.html)**

      Phake によるテストダブル

    </div>

!!! cards ":simple-go: アプリ (Go)"

    golangci-lint、testify などの Go のテストツール

    <div class="grid cards compact" markdown>

    - **[Go のテストツール](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_go.html)**

      Go の標準テストツールと設計規約

    - **[golangci-lint (静的解析)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_go_lint_golangci_lint.html)**

      golangci-lint による静的解析

    - **[testify (ユニットテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_go_unit_testify.html)**

      testify の mock と assert

    </div>

!!! cards ":simple-typescript: アプリ (TypeScript)"

    Vitest と Cypress

    <div class="grid cards compact" markdown>

    - **[Vitest (ユニットテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_typescript_unit_vitest.html)**

      Vitest によるユニットテスト

    - **[Cypress (E2E テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_application_typescript_e2e_cypress.html)**

      Cypress による E2E テスト

    </div>

!!! cards ":material-server: インフラ"

    kubeconform、Kyverno、checkov などのインフラの静的解析

    <div class="grid cards compact" markdown>

    - **[静的解析ツール](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint.html)**

      YAML、IaC、コンテナの静的解析

    - **[kubeconform (文法違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_grammatical_mistake_kubeconform.html)**

      スキーマに基づくマニフェストの検証

    - **[confest (コード規約違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_code_conventions_violation_confest.html)**

      Rego のポリシーによる設定ファイルの検証

    - **[Kyverno (コード規約違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_code_conventions_kyverno.html)**

      Kyverno によるポリシーの適用

    - **[リソース定義 (コード規約違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_code_conventions_kyverno_resource_definition.html)**

      ClusterPolicy の定義

    - **[krr (ベストプラクティス違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_best_practice_violation_krr.html)**

      メトリクスから最適な CPU/メモリを算出

    - **[polaris (ベストプラクティス違反テスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_best_practice_violation_polaris.html)**

      マニフェストのベストプラクティス違反の検証

    - **[pluto (バージョンテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_version_pluto.html)**

      非推奨の API バージョンの検出

    - **[nova (バージョンテスト)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_version_nova.html)**

      古いチャートバージョンの検出

    - **[checkov (脆弱性診断)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_vulnerability_checkov.html)**

      IaC の脆弱性診断

    - **[kics (脆弱性診断)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_vulnerability_diagnosis_kics.html)**

      マニフェストの脆弱性診断

    - **[kube-score (脆弱性診断)](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_infrastructure_lint_vulnerability_diagnosis_kube_score.html)**

      マニフェストの設定漏れの検出

    </div>

!!! cards ":material-shield-search: アプリ/インフラ両方"

    trivy による脆弱性スキャン

    <div class="grid cards compact" markdown>

    - **[trivy](https://hiroki-it.github.io/tech-notebook/testing/testing_whitebox_lint_trivy.html)**

      パッケージ、IaC、イメージの脆弱性スキャン

    </div>

### ブラックボックステスト

!!! cards ":material-test-tube: ブラックボックステスト"

    <div class="grid cards compact" markdown>

    - **[ブラックボックステスト](https://hiroki-it.github.io/tech-notebook/testing/testing_blackbox.html)**

      ユニット、結合、回帰、システムテスト

    </div>

!!! cards ":material-speedometer: システムテスト"

    <div class="grid cards compact" markdown>

    - **[システムテスト](https://hiroki-it.github.io/tech-notebook/testing/testing_blackbox_system_test.html)**

      JMeter や Chaos Mesh によるシステムテスト

    - **[JMeter](https://hiroki-it.github.io/tech-notebook/testing/testing_blackbox_system_test_jmeter.html)**

      JMeter によるロードテストとストレステスト

    - **[Chaos Mesh](https://hiroki-it.github.io/tech-notebook/testing/testing_blackbox_system_test_chaos_mesh.html)**

      Chaos Mesh による障害の注入

    </div>

<br>
