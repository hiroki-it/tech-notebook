---
title: 【IT技術の知見】Vagrantfile＠Vagrant
description: Vagrantfile＠Vagrantの知見を記録しています。
---

# Vagrantfile＠Vagrant

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Vagrantの仕組み

### アーキテクチャ

> - http://delftswa.github.io/chapters/vagrant/

<br>

### ユースケース

Vagrantfileを使用して、プロバイダーとプロビジョナーを操作し、仮想環境を作成する。

Vagrantfile自体をプロビジョナーとして使用もできる。

プロビジョニングによりサーバー (物理サーバー、仮想サーバー) とコンテナを作成できる。

ただし、Vagrantは仮想サーバーの作成のために使用することが多い。

![vagrant_provider_provisioner](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vagrant_provider_provisioner.png)

> - https://computationalmodelling.bitbucket.io/tools/vagrant.html

<br>

### プロバイダー

#### ▼ プロバイダーとは

仮想環境を提供する。

> - https://www.vagrantup.com/docs/providers

#### ▼ プロバイダーの種類

| プロバイダー名 | 補足                                                  |
| -------------- | ----------------------------------------------------- |
| VirtualBox     | ・https://www.vagrantup.com/docs/providers/virtualbox |
| VMWare         | ・https://www.vagrantup.com/docs/providers/vmware     |
| Docker         | ・https://www.vagrantup.com/docs/providers/docker     |
| Hyper-V        | ・https://www.vagrantup.com/docs/providers/hyperv     |

<br>

### プロビジョナー

#### ▼ プロビジョナーとは

プロバイダーによって作成された仮想環境に、ソフトウェアをインストールできる (構成管理できる) 。

具体的には、プログラミング言語やファイアウォールをインストールする。

> - https://www.vagrantup.com/docs/provisioning

#### ▼ プロビジョナーの種類

| プロビジョナー名 | ユースケース                                                                          | 補足                                                       |
| ---------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| シェル           | Vagrantfile自体をプロビジョニングツールとして使用する。                               | ・https://www.vagrantup.com/docs/provisioning/shell        |
| Ansible          | Vagrantfileでプロビジョニングを実行する代わりに、Ansibleを使用する。                  | ・https://www.vagrantup.com/docs/provisioning/ansible      |
| CFEngine         | Vagrantfileでプロビジョニングを実行する代わりに、CFEngineを使用する。                 | ・https://www.vagrantup.com/docs/provisioning/cfengine     |
| Chef             | Vagrantfileでプロビジョニングを実行する代わりに、Chefを使用する。                     | ・https://www.vagrantup.com/docs/provisioning/chef_common  |
| Docker           | Vagrantfileでプロビジョニングを実行する代わりに、Dockerfile (に似た記述) を使用する。 | ・https://www.vagrantup.com/docs/provisioning/docker       |
| Puppet           | Vagrantfileでプロビジョニングを実行する代わりに、Puppetを使用する。                   | ・https://www.vagrantup.com/docs/provisioning/puppet_apply |

<br>

### Vagrantfile

プロバイダーとプロビジョナーの一連の操作内容を設定する。

チームメンバーが別々に仮想環境を作成する場合、プロバイダーとプロビジョナーの処理によって作られる仮想サーバーの環境に、違いが生じてしまう。

Vagrantfileにプロバイダーとプロビジョナーの操作を設定しておけば、チームメンバーが同じソフトウェアの下で、仮想サーバーを作成し、ソフトウェアをインストールできる。

<br>

## 02. Vagrant.configure

### Vagrant.configureとは

Vagrantfileのバージョンを設定する。

> - https://www.vagrantup.com/docs/vagrantfile/version

```ruby
Vagrant.configure("2") do |config|

  # その他の全てのオプションを設定する。

end
```

<br>

## 03. config.vm

### config.vmとは

仮想環境の構成を設定する。

<br>

### config.vm.box

#### ▼ boxとは

仮想環境のベースとするVirtualBoxのボックス名を設定する。

```ruby
Vagrant.configure("2") do |config|

  config.vm.box = "foo"

  config.vm.box_version = "<バージョン値>"

end
```

```ruby
Vagrant.configure("2") do |config|

  # Ubuntuベースの仮想サーバー
  config.vm.box = "ubuntu/trusty64"

  # バージョン
  config.vm.box_version = "20191107.0.0"

end
```

> - https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-box

<br>

### config.vm.hostname

#### ▼ hostnameとは

仮想環境にホスト名を設定する。

```ruby
Vagrant.configure("2") do |config|

  config.vm.host = "foo-server"

end
```

<br>

### config.vm.box_check_update

#### ▼ box_check_updateとは

Vagrantの更新通知を設定する。

```ruby
Vagrant.configure("2") do |config|

  config.vm.box_check_update = false

end
```

<br>

### config.vm.network

#### ▼ networkとは

仮想環境のネットワークを設定する。

> - https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-network

#### ▼ forwarded_port

ホストから仮想環境へポートフォワーディングを設定する。

```ruby
Vagrant.configure("2") do |config|

  config.vm.network "forwarded_port", guest: 80, host: 8080

end
```

```ruby
Vagrant.configure("2") do |config|

  # MySQLのために3306ポートをフォワーディングする
  config.vm.network "forwarded_port", guest: 3306, host: 3306

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y mysql-server
  SHELL

end

```

> - https://www.vagrantup.com/docs/networking/forwarded_ports

#### ▼ private_network

仮想環境にプライベートIPアドレスを設定する。

ローカルホスト以外で接続できるようになる。

また、同じプライベートネットワーク内の他の仮想環境とのみ、通信できるようになる。

他の仮想環境とIPアドレスが重複しないようにする必要がある。

```ruby
Vagrant.configure("2") do |config|

  # ローカルホストではなく、192.168.33.10 で接続できるようにする
  config.vm.network "private_network", ip: "192.168.33.10"

end
```

> - https://www.vagrantup.com/docs/networking/private_network

<br>

### config.vm.provider

#### ▼ providerとは

プロバイダー固有のオプションを設定する。

> - https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provider

#### ▼ virtualbox

```ruby
Vagrant.configure("2") do |config|

  config.vm.provider "virtualbox" do |vb|
    vb.cpus = "2"
    vb.gui = true
    vb.memory = "1024"
  end

end
```

> - https://www.vagrantup.com/docs/providers/virtualbox/configuration

#### ▼ docker

```ruby
Vagrant.configure("2") do |config|

  config.vm.provider "docker" do |docker|
    docker.build_dir = "./docker/Dockerfile"
    docker.has_ssh = true
  end

end
```

> - https://www.vagrantup.com/docs/providers/docker/configuration

<br>

### config.vm.provision

#### ▼ provisionとは

仮想環境のプロビジョニングを設定する。

> - https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provision

#### ▼ shell

shellを使用して、仮想環境のプロビジョニングを実行する。もしVagrantがサポートしていないプロビジョニングツールを使用する場合は、これ自体をインストールしておく必要がある。シェルが複数行に渡る場合は、Rubyのヒアドキュメント形式 (`<<-`) を使用すると良い。

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    # fooというプロビジョニングツールをインストールする。
    apt-get install -y foo
  SHELL

end
```

> - https://www.vagrantup.com/docs/provisioning/shell
> - https://monologu.com/vagrant-shell-provisioning/

#### ▼ ansible

ホスト側にAnsibleをインストールし、加えて仮想環境のプロビジョニングを実行する。

開発環境ではこのオプションを使用することは非推奨で、`ansible_local`オプションを使用することが推奨である。

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "playbook.yml"
    ansible.inventory_path = "inventory.yml"
  SHELL

end
```

> - https://www.vagrantup.com/docs/provisioning/ansible

#### ▼ ansible_local

仮想環境側にAnsibleをインストールし、加えて仮想環境のプロビジョニングを実行する。

注意点としては、開発環境ではコントロールノードと管理対象ノードが同じサーバー (仮想環境) になるため、コントロールノードは自分で自分を指定してプロビジョニングを実行することになる。

開発環境ではこのオプションを使用することが推奨されており、`ansible`オプションを使用することが非推奨とされている。

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "ansible_local" do |ansible|
    ansible.playbook = "playbook.yml"
    ansible.inventory_path = "inventory.yml"
  SHELL

end
```

ただし、Vagrantからではなく、Ansibleを直接的に操作したい場合は、shellオプションでAnsibleをインストールする必要がある。

こちらが推奨である。

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    # Ansibleをインストールする。
    apt-get install -y ansible
    # Ansibleを直接的に操作する。
    ansible-playbook /etc/ansible/playbook.yml -i inventory.yml
  SHELL

end
```

> - https://www.vagrantup.com/docs/provisioning/ansible_local
> - https://blog.shin1x1.com/entry/ansible_local-provisioner-in-vagrant

<br>

### config.vm.synced_folder

#### ▼ synced_folderとは

ホストのディレクトリを仮想環境にマウントする。

```ruby
Vagrant.configure("2") do |config|

  config.vm.synced_folder ".", "/var/www/foo"

end
```

> - https://www.vagrantup.com/docs/synced-folders/basic_usage

#### ▼ type

マウント方法を設定する。

デフォルト値は、VirtualBox共有ディレクトリである。

その他、NFS、RSync、SMBを設定できる。

```ruby
Vagrant.configure("2") do |config|

  config.vm.synced_folder ".", "/var/www/foo", type: "nfs"

end
```

> - https://www.vagrantup.com/docs/synced-folders/basic_usage#type

ホストと仮想環境間のファイルのIOPSによって、性能に差がある。

以下のリンクで、ロードテストを実施したところ、『`RSync > SMB > VirtualBox共有ディレクトリ`』の順で性能が良かった。

> - http://tech.respect-pal.jp/vagrant-synced_folder-type/

また、『`RSync > NFS`』『`NFS > SMB`』である。

これらから、おおよそ『`RSync > NFS > SMB > VirtualBox共有ディレクトリ`』の順で性能が良くなると考えておけばよい。

> - https://serverfault.com/questions/268369/why-rsync-is-faster-than-nfs
> - https://milestone-of-se.nesuke.com/sv-advanced/file-server/nfs-cifs-smb-summary/

<br>
