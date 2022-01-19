# Vagrant

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. Vagrantとは

Vagrantfileを用いて，プロバイダーとプロビジョナーを操作し，仮想サーバーを構築する．Vagrantfile自体をプロビジョナーとして用いることもできる．

参考：https://computationalmodelling.bitbucket.io/tools/vagrant.html

![vagrant_provider_provisioner](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vagrant_provider_provisioner.png)

<br>

## 02. プロバイダー

### プロバイダーとは

仮想環境（仮想サーバー/コンテナ）を提供する．

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

プロバイダーによって構築された仮想環境に，ソフトウェアをインストールできる（構成管理できる）．具体的には，プログラミング言語やファイアウォールをインストールする．

参考：https://www.vagrantup.com/docs/provisioning

<br>

### 種類

#### ・シェル

Vagrantfile自体をプロビジョニングツールとして用いる．

参考：https://www.vagrantup.com/docs/provisioning/shell

#### ・Ansible

Vagrantfileでプロビジョニングを実行する代わりに，Ansibleを用いる．

参考：https://www.vagrantup.com/docs/provisioning/ansible

#### ・CFEngine

Vagrantfileでプロビジョニングを実行する代わりに，CFEngineを用いる．

参考：https://www.vagrantup.com/docs/provisioning/cfengine

#### ・Chef

Vagrantfileでプロビジョニングを実行する代わりに，Chefを用いる．

参考：https://www.vagrantup.com/docs/provisioning/chef_common

#### ・Docker

Vagrantfileでプロビジョニングを実行する代わりに，Dockerfile（に似た記述）を用いる．

参考：https://www.vagrantup.com/docs/provisioning/docker

#### ・Puppet

Vagrantfileでプロビジョニングを実行する代わりに，Puppetを用いる．

参考：https://www.vagrantup.com/docs/provisioning/puppet_apply

