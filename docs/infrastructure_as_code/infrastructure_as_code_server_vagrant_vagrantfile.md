---
title: 【知見を記録するサイト】Vagrantfile＠Vagrant
description: Vagrantfile＠Vagrantの知見をまとめました．
---

# Vagrantfile＠Vagrant

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Vagrantfileとは

プロバイダーとプロビジョナーの一連の操作内容を設定する．チームメンバーが別々に仮想環境を構築する場合，プロバイダーとプロビジョナーの処理によって作られる仮想サーバーの環境に，違いが生じてしまう．Vagrantfileにプロバイダーとプロビジョナーの操作を設定しておけば，チームメンバーが同じソフトウェアの下で，仮想サーバーを構築し，ソフトウェアをインストールできる．

<br>

## 01. Vagrant.configure

### Vagrant.configureとは

Vagrantfileのバージョンを設定する．

参考：https://www.vagrantup.com/docs/vagrantfile/version

```bash
Vagrant.configure("2") do |config|

  # その他の全てのオプションを設定する．

end
```

<br>

## 02. config.vm

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

