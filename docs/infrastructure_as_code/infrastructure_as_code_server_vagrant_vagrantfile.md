---
title: 【知見を記録するサイト】Vagrantfile＠Vagrant
description: Vagrantfile＠Vagrantの知見をまとめました．
---

# Vagrantfile＠Vagrant

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Vagrantの仕組み

### プロバイダーとプロビジョナーの操作

Vagrantfileを用いて，プロバイダーとプロビジョナーを操作し，仮想環境を構築する．Vagrantfile自体をプロビジョナーとして用いることもできる．仮想環境として仮想サーバーとコンテナを選択できるが，Vagrantは仮想サーバーの構築のために用いることが多い．

参考：https://computationalmodelling.bitbucket.io/tools/vagrant.html

![vagrant_provider_provisioner](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vagrant_provider_provisioner.png)

<br>

### プロバイダー

#### ・プロバイダーとは

仮想サーバー/コンテナを提供する．

参考：https://www.vagrantup.com/docs/providers

#### ・種類

| プロバイダー名 | 補足                                                      |
| -------------- | --------------------------------------------------------- |
| VirtualBox     | 参考：https://www.vagrantup.com/docs/providers/virtualbox |
| VMWare         | 参考：https://www.vagrantup.com/docs/providers/vmware     |
| Docker         | 参考：https://www.vagrantup.com/docs/providers/docker     |
| Hyper-V        | 参考：https://www.vagrantup.com/docs/providers/hyperv     |

<br>

### プロビジョナー

#### ・プロビジョナーとは

プロバイダーによって構築された仮想環境に，ソフトウェアをインストールできる（構成管理できる）．具体的には，プログラミング言語やファイアウォールをインストールする．

参考：https://www.vagrantup.com/docs/provisioning

#### ・種類

| プロビジョナー名 | 説明                                                         | 補足                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| シェル           | Vagrantfile自体をプロビジョニングツールとして用いる．        | 参考：https://www.vagrantup.com/docs/provisioning/shell      |
| Ansible          | Vagrantfileでプロビジョニングを実行する代わりに，Ansibleを用いる． | 参考：https://www.vagrantup.com/docs/provisioning/ansible    |
| CFEngine         | Vagrantfileでプロビジョニングを実行する代わりに，CFEngineを用いる． | 参考：https://www.vagrantup.com/docs/provisioning/cfengine   |
| Chef             | Vagrantfileでプロビジョニングを実行する代わりに，Chefを用いる． | 参考：https://www.vagrantup.com/docs/provisioning/chef_common |
| Docker           | Vagrantfileでプロビジョニングを実行する代わりに，Dockerfile（に似た記述）を用いる． | 参考：https://www.vagrantup.com/docs/provisioning/docker     |
| Puppet           | Vagrantfileでプロビジョニングを実行する代わりに，Puppetを用いる． | 参考：https://www.vagrantup.com/docs/provisioning/puppet_apply |

<br>

### Vagrantfile

プロバイダーとプロビジョナーの一連の操作内容を設定する．チームメンバーが別々に仮想環境を構築する場合，プロバイダーとプロビジョナーの処理によって作られる仮想サーバーの環境に，違いが生じてしまう．Vagrantfileにプロバイダーとプロビジョナーの操作を設定しておけば，チームメンバーが同じソフトウェアの下で，仮想サーバーを構築し，ソフトウェアをインストールできる．

<br>

## 02. Vagrant.configure

### Vagrant.configureとは

Vagrantfileのバージョンを設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/version

```bash
Vagrant.configure("2") do |config|

  # その他の全てのオプションを設定する．

end
```

<br>

## 03. config.vm

### config.vmとは

仮想環境の構成を設定する．

<br>

### config.vm.box

#### ・boxとは

仮想環境のベースとするボックス名を設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-box

```bash
config.vm.box = "foo"
```

<br>

### config.vm.box_check_update

#### ・box_check_updateとは

Vagrantの更新通知を設定する．

```bash
config.vm.box_check_update = false
```

<br>

### config.vm.network

#### ・networkとは

仮想環境のネットワークを設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-network

#### ・forwarded_port

ホストから仮想環境へポートフォワーディングを設定する．

参考；https://www.vagrantup.com/docs/networking/forwarded_ports

```bash
config.vm.network "forwarded_port", guest: 80, host: 8080
```

#### ・private_network

仮想環境のプライベートIPアドレスを設定する．他の仮想環境とIPアドレスが重複しないようにする必要がある．

参考：https://www.vagrantup.com/docs/networking/private_network

```bash
config.vm.network "private_network", ip: "10.0.0.2"
```

<br>

### config.vm.provider

#### ・providerとは

プロバイダー固有のオプションを設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provider

#### ・virtualbox

参考：https://www.vagrantup.com/docs/providers/virtualbox/configuration

```bash
config.vm.provider "virtualbox" do |vb|
  vb.cpus = "2"
  vb.gui = true
  vb.memory = "1024"
end
```

#### ・docker

参考：https://www.vagrantup.com/docs/providers/docker/configuration

```bash
config.vm.provider "docker" do |docker|
  docker.build_dir = "./docker/Dockerfile"

  docker.has_ssh = true
end
```

<br>

### config.vm.provision

#### ・provisionとは

仮想環境のプロビジョニングを設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provision

```bash
config.vm.provision "shell", inline: <<-SHELL
  apt-get update
  apt-get install -y ansible
SHELL
```

<br>

### config.vm.synced_folder

#### ・synced_folderとは

ホスト上のディレクトリを仮想環境にマウントする．

```bash
config.vm.synced_folder ".", "/var/www/foo"
```

