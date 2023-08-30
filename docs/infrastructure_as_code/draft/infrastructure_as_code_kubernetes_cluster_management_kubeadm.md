---
title: 【IT技術の知見】Kubeadm＠Kubernetesオーケストレーションツール
description: Kubeadm＠Kubernetesオーケストレーションツールの知見を記録しています。
---

# Kubeadm＠Kubernetesオーケストレーションツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたする。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Clusterの作成

### プリフライトチェック

#### ▼ プリフライトチェックとは

Kubeadmは、Clusterを作成する前に、作成のセットアップが完了しているかどうかを検証する。

> - https://medium.com/@vbmade2000/since-almost-a-week-i-was-fighting-to-setup-a-kubernetes-cluster-using-a-tool-called-kubeadm-bc77e894476f

#### ▼ root user check

kubeadmを実行しているユーザーがroot userであることを確認する。

現在のユーザーのUIDをチェックすることで行う。

#### ▼ システム検証チェック

このチェックでは、その他にも複数のチェックを行っています。

unameの値をspecで指定されたものと比較し、OSがLinuxであることを確認する。

その後、カーネルに関連するチェックを行う。

カーネルリリースの値を仕様で指定されたものと比較し、カーネルをチェックする。

また、指定されたパスからカーネルコンフィグをロードするか、ファイルが見つからない場合はカーネルコンフィグモジュールをロードして、さまざまなカーネルコンフィグをチェックする。

次に、"cpu", "cpuacct", "cpuset", "devices", "freezer", "memory" CGroups が現在存在するかどうかをチェックする。このカテゴリの最後のチェックは、Dockerについてです。DockerのバージョンとGraphドライバをチェックする。

現在は、"aufs", "overlay", "devicemapper "がチェックされます。

#### ▼ ホスト名チェック

ノードのホスト名をチェックする。

小文字で、かつ到達可能であることが必要です。

#### ▼ サービスチェック

指定されたサービスがロードされ、アクティブであることを確認する。

現在は、DockerとKubeletのサービスをチェックする。

#### ▼ ファイアウォールチェック

firewalldが有効かどうかをチェックする。

#### ▼ ポートチェック

現在、ポート`6443`、`10250、`10251`、`10252`をチェックしています。

#### ▼ HTTPプロキシチェック

ホストがプロキシの後ろにいるかどうかをチェックする。

#### ▼ ディレクトリチェック

ディレクトリが利用可能かどうか、また、空であるか否かをチェックする。

ディレクトリが空でない場合は、エラーになります。

現在は、kubernetesのマニフェストディレクトリと/var/lib/kubeletをチェックする。

#### ▼ ファイル内容チェック

ファイル /proc/sys/net/bridge/bridge-nf-call-iptables の値があるか否かチェックする。

値1が含まれている必要がある。

sysctlコマンドで一時的に設定するか、/etc/sysctl.confファイルにそのパラメータを設定することで恒久的に設定できる。

#### ▼ 実行可能ファイルの存在チェック

このチェックでは、PATHにある様々な実行可能ファイルを探す。

現在、ip, iptables, mount, nsenter, ebtables, ethtool, socat, tc, touchの実行ファイルがあるか否かをチェックする。

#### ▼ Extra Arguments Checks

API Server、Controller Manager、Schedulerの追加引数が有効かどうかをチェックする。

#### ▼ Etcdチェック

etcdのバージョンチェックを行います。

#### ▼ Authorization Mode Checks

指定された認証モードの設定をチェックする。

ABACモードであれば、<kubernetes_directory>/abac_policy.jsonを確認する。

WebHooksの場合は、<kubernetes_directory>/webhook_authz.confを探す。

<br>
