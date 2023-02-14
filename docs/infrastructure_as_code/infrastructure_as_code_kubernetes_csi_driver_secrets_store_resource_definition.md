---
title: 【IT技術の知見】リソース定義＠SecretsストアCSIドライバー
description: リソース定義＠SecretsストアCSIドライバーの知見を記録しています。
---

# リソース定義＠SecretsストアCSIドライバー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。


```bash
$ helm repo add <チャートリポジトリ名> https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts

$ helm repo update

$ helm install <リリース名> <チャートリポジトリ名>/secrets-store-csi-driver -n kube-system --version <バージョンタグ>
```

> ↪️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/getting-started/installation.html


#### ▼ AWS EKS専用のチャートとして


AWS EKSでSecretsストアCSIドライバーを簡単にセットアップするために、それ専用のチャートを使用する。


```bash
$ helm repo add <チャートリポジトリ名> https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts

$ helm repo update

$ helm install <リリース名> <チャートリポジトリ名>/secrets-store-csi-driver -n kube-system --version <バージョンタグ>
```

また、AWS EKSのために必要なマニフェストをインストールする。

```bash
$ kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml
```

> ↪️ 参考：https://github.com/aws/secrets-store-csi-driver-provider-aws

<br>

## 02. Pod＠Kubernetesでの設定

SecretsストアCSIドライバーによって、PodではSecretを介さずに、プロバイダーから変数を直接的にマウントする。

別途、Podに紐づくServiceAccountに、プロバイダーのSecretへの認可スコープを付与する必要がある。



```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
  namespace: foo-namespace
spec:
  containers:
    - name: foo-gin
      image: foo-gin:1.0.0
      ports:
        - containerPort: 8080
      # Podにマウントする。
      volumeMounts:
        - name: foo-secrets-store-csi-volume
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    # CSIボリュームを設定する。
    - name: foo-secrets-store-csi-volume
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          # SecretProviderClassを指定する。
          secretProviderClass: foo-aws-secret-provider-class
```


> ↪️ 参考：
>
> - https://developer.mamezou-tech.com/blogs/2022/07/13/secrets-store-csi-driver-intro/#aws-secrets-manager%E3%81%AE%E3%82%B7%E3%83%BC%E3%82%AF%E3%83%AC%E3%83%83%E3%83%88%E6%83%85%E5%A0%B1%E3%82%92%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88%E3%81%99%E3%82%8B
> - https://innablr.com.au/blog/what-is-secret-management-and-how-to-integrate-with-k8s-part-2/


<br>

## 03. SecretProviderClass

### .metadata

#### ▼ namespace

Namespaceを設定する。

Secretのマウント対象となるPodと同じNamespaceにする必要がある。




```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  namespace: foo-namespace # Podと同じNamespace
```

> ↪️ 参考：https://www.bigtreetc.com/column/eks-secrets/


<br>

### .spec.provider

#### ▼ providerとは

Secretのプロバイダーを設定する。




```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
```

> ↪️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html


<br>

### .spec.parameters

#### ▼ parametersとは

プロバイダーに応じて、参照するSecretのデータを設定する。



> ↪️ 参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

#### ▼ objects (AWSプロバイダーの場合) 

AWSプロバイダー上のSecret (AWS Secrets Manager、AWS Systems Manager) を識別する情報を設定する。



```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWS Secrets Managerから取得する。
    # objectNameキーに、ARN (arn:aws:secretsmanager:ap-northeast-1:<アカウントID>:secret:<Secretストア名>) を指定しても良い。
    # その場合、objectTypeキーは不要になる。
    objects: |
      - objectName: "<Secret名>"
      - objectType: "secretsmanager"
```


> ↪️ 参考：
>
> - https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_SecretProviderClass
> - https://developer.mamezou-tech.com/blogs/2022/07/13/secrets-store-csi-driver-intro/#aws-secrets-manager%E3%81%AE%E3%82%B7%E3%83%BC%E3%82%AF%E3%83%AC%E3%83%83%E3%83%88%E6%83%85%E5%A0%B1%E3%82%92%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88%E3%81%99%E3%82%8B

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWS Systems Managerから取得する。
    objects: |
      - objectName: "/foo/USERNAME"
        objectType: "ssmparameter"
      - objectName: "/foo/PASSWORD"
        objectType: "ssmparameter"
```



> ↪️ 参考：
>
> - https://docs.aws.amazon.com/systems-manager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_mount
> - https://developer.mamezou-tech.com/blogs/2022/07/13/secrets-store-csi-driver-intro/#aws-systems-manager-parameter-store%E3%81%AE%E3%82%B7%E3%83%BC%E3%82%AF%E3%83%AC%E3%83%83%E3%83%88%E6%83%85%E5%A0%B1%E3%82%92%E3%83%9E%E3%82%A6%E3%83%B3%E3%83%88%E3%81%99%E3%82%8B


#### ▼ objects (GCPプロバイダーの場合) 

GCPプロバイダー上のSecret (GCP Secret Manager) を識別する情報を設定する。



```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-gcp-secret-provider-class
spec:
  provider: gcp
  parameters:
    # GCP Secret Managerから取得する。
    objects: |
      - resourceName: "projects/<プロジェクトID>/secrets/<Secret名>"
```

<br>
