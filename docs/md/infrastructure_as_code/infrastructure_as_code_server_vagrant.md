# Vagrant

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. Vagrantとは

Vagrantfileを用いて、プロバイダーとプロビジョナーを操作し、仮想サーバーを構築する。

参考：https://computationalmodelling.bitbucket.io/tools/vagrant.html

![vagrant_provider_provisioner](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vagrant_provider_provisioner.png)

<br>

## 02. プロバイダー

### プロバイダーとは

基本ソフトウェアの制御プログラムや一連のハードウェアを仮想的に構築できる。これを、仮想サーバー（仮想マシンとも）という。構築方法の違いによって、『ホスト型』、『ハイパーバイザ型』に分類できる。

参考：https://www.vagrantup.com/docs/providers

<br>

### 種類

#### ・VirtualBox

参考：https://www.vagrantup.com/docs/providers/virtualbox

#### ・VMWare

参考：https://www.vagrantup.com/docs/providers/vmware

#### ・Docker

参考：https://www.vagrantup.com/docs/providers/docker

#### ・Hyper-V

参考：https://www.vagrantup.com/docs/providers/hyperv

<br>

## 03. プロビジョナー

### プロビジョナー

プロバイダーによって構築された仮想サーバーに、Web開発のためのソフトウェアをインストールできる（構成管理できる）。具体的には、プログラミング言語やファイアウォールをインストールする。

参考：https://www.vagrantup.com/docs/provisioning

<br>

### 種類

#### ・シェル

参考：https://www.vagrantup.com/docs/provisioning/shell

#### ・Ansible

参考：https://www.vagrantup.com/docs/provisioning/ansible

#### ・CFEngine

参考：https://www.vagrantup.com/docs/provisioning/cfengine

#### ・Chef

参考：https://www.vagrantup.com/docs/provisioning/chef_common

#### ・Docker

参考：https://www.vagrantup.com/docs/provisioning/docker

#### ・Puppet

参考：https://www.vagrantup.com/docs/provisioning/puppet_apply
