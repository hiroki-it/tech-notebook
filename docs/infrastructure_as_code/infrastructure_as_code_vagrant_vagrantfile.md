---
title: 【IT技術の知見】Vagrantfile＠Vagrant
description: Vagrantfile＠Vagrantの知見を記録しています。
---

# Vagrantfile＠Vagrant

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Vagrantの仕組み

### アーキテクチャ

> ↪️ 参考：http://delftswa.github.io/chapters/vagrant/

### ユースケース

Vagrantfileを使用して、プロバイダーとプロビジョナーを操作し、仮想環境を作成する。

Vagrantfile自体をプロビジョナーとして使用もできる。

仮想環境として仮想サーバーとコンテナを選択できるが、Vagrantは仮想サーバーの作成のために使用することが多い。

> ↪️ 参考：https://computationalmodelling.bitbucket.io/tools/vagrant.html

![vagrant_provider_provisioner](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/vagrant_provider_provisioner.png)

<br>

### プロバイダー

#### ▼ プロバイダーとは

仮想環境を提供する。

> ↪️ 参考：https://www.vagrantup.com/docs/providers

#### ▼ プロバイダーの種類

| プロバイダー名 | 補足                                                         |
| -------------- | ------------------------------------------------------------ |
| VirtualBox     | ↪️ 参考：https://www.vagrantup.com/docs/providers/virtualbox |
| VMWare         | ↪️ 参考：https://www.vagrantup.com/docs/providers/vmware     |
| Docker         | ↪️ 参考：https://www.vagrantup.com/docs/providers/docker     |
| Hyper-V        | ↪️ 参考：https://www.vagrantup.com/docs/providers/hyperv     |

<br>

### プロビジョナー

#### ▼ プロビジョナーとは

プロバイダーによって作成された仮想環境に、ソフトウェアをインストールできる (構成管理できる) 。

具体的には、プログラミング言語やファイアウォールをインストールする。

> ↪️ 参考：https://www.vagrantup.com/docs/provisioning

#### ▼ プロビジョナーの種類

| プロビジョナー名 | ユースケース                                                                              | 補足                                                              |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| シェル           | Vagrantfile自体をプロビジョニングツールとして使用する。                                   | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/shell        |
| Ansible          | Vagrantfileでプロビジョニングを実行する代わりとして、Ansibleを使用する。                  | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/ansible      |
| CFEngine         | Vagrantfileでプロビジョニングを実行する代わりとして、CFEngineを使用する。                 | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/cfengine     |
| Chef             | Vagrantfileでプロビジョニングを実行する代わりとして、Chefを使用する。                     | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/chef_common  |
| Docker           | Vagrantfileでプロビジョニングを実行する代わりとして、Dockerfile (に似た記述) を使用する。 | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/docker       |
| Puppet           | Vagrantfileでプロビジョニングを実行する代わりとして、Puppetを使用する。                   | ↪️ 参考：https://www.vagrantup.com/docs/provisioning/puppet_apply |

<br>

### Vagrantfile

プロバイダーとプロビジョナーの一連の操作内容を設定する。

チームメンバーが別々に仮想環境を作成する場合、プロバイダーとプロビジョナーの処理によって作られる仮想サーバーの環境に、違いが生じてしまう。

Vagrantfileにプロバイダーとプロビジョナーの操作を設定しておけば、チームメンバーが同じソフトウェアの下で、仮想サーバーを作成し、ソフトウェアをインストールできる。

<br>

## 02. Vagrant.configure

### Vagrant.configureとは

Vagrantfileのバージョンを設定する。

> ↪️ 参考：https://www.vagrantup.com/docs/vagrantfile/version

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

仮想環境のベースとするボックス名を設定する。

> ↪️ 参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-box

```ruby
Vagrant.configure("2") do |config|

  config.vm.box = "foo"

end
```

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

> ↪️ 参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-network

#### ▼ forwarded_port

ホストから仮想環境へポートフォワーディングを設定する。

> ↪️ 参考：https://www.vagrantup.com/docs/networking/forwarded_ports

```ruby
Vagrant.configure("2") do |config|

  config.vm.network "forwarded_port", guest: 80, host: 8080

end
```

#### ▼ private_network

仮想環境にプライベートIPアドレスを設定する。

同じプライベートネットワーク内の他の仮想環境とのみ、通信できるようになる。

他の仮想環境とIPアドレスが重複しないようにする必要がある。

> ↪️ 参考：https://www.vagrantup.com/docs/networking/private_network

```ruby
Vagrant.configure("2") do |config|

  config.vm.network "private_network", ip: "10.0.0.2"

end
```

<br>

### config.vm.provider

#### ▼ providerとは

プロバイダー固有のオプションを設定する。

> ↪️ 参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provider

#### ▼ virtualbox

> ↪️ 参考：https://www.vagrantup.com/docs/providers/virtualbox/configuration

```ruby
Vagrant.configure("2") do |config|

  config.vm.provider "virtualbox" do |vb|
    vb.cpus = "2"
    vb.gui = true
    vb.memory = "1024"
  end

end
```

#### ▼ docker

> ↪️ 参考：https://www.vagrantup.com/docs/providers/docker/configuration

```ruby
Vagrant.configure("2") do |config|

  config.vm.provider "docker" do |docker|
    docker.build_dir = "./docker/Dockerfile"
    docker.has_ssh = true
  end

end
```

<br>

### config.vm.provision

#### ▼ provisionとは

仮想環境のプロビジョニングを設定する。

> ↪️ 参考：https://www.vagrantup.com/docs/vagrantfile/machine_settings#config-vm-provision

#### ▼ shell

shellを使用して、仮想環境のプロビジョニングを実行する。もしVagrantがサポートしていないプロビジョニングツールを使用する場合は、これ自体をインストールしておく必要がある。シェルが複数行に渡る場合は、Rubyのヒアドキュメント形式 (`<<-`) を使用すると良い。

> ↪️ 参考：
>
> - https://www.vagrantup.com/docs/provisioning/shell
> - https://monologu.com/vagrant-shell-provisioning/

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    # fooというプロビジョニングツールをインストールする。
    apt-get install -y foo
  SHELL

end
```

#### ▼ ansible

ホスト側にAnsibleをインストールし、加えて仮想環境のプロビジョニングを実行する。

開発環境ではこのオプションを使用することは非推奨で、`ansible_local`オプションを使用することが推奨されている。

> ↪️ 参考：https://www.vagrantup.com/docs/provisioning/ansible

```ruby
Vagrant.configure("2") do |config|

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "playbook.yml"
    ansible.inventory_path = "inventory.yml"
  SHELL

end
```

#### ▼ ansible_local

仮想環境側にAnsibleをインストールし、加えて仮想環境のプロビジョニングを実行する。

注意点としては、開発環境ではコントロールノードと管理対象ノードが同じサーバー (仮想環境) になるため、コントロールノードは自分で自分を指定してプロビジョニングを実行することになる。

開発環境ではこのオプションを使用することが推奨されており、`ansible`オプションを使用することが非推奨とされている。

> ↪️ 参考：
>
> - https://www.vagrantup.com/docs/provisioning/ansible_local
> - https://blog.shin1x1.com/entry/ansible_local-provisioner-in-vagrant

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

<br>

### config.vm.synced_folder

#### ▼ synced_folderとは

ホストのディレクトリを仮想環境にマウントする。

> ↪️ 参考：https://www.vagrantup.com/docs/synced-folders/basic_usage

```ruby
Vagrant.configure("2") do |config|

  config.vm.synced_folder ".", "/var/www/foo"

end
```

#### ▼ type

マウント方法を設定する。

デフォルト値は、VirtualBox共有ディレクトリである。

その他、NFS、RSync、SMBを設定できる。

> ↪️ 参考：https://www.vagrantup.com/docs/synced-folders/basic_usage#type

```ruby
Vagrant.configure("2") do |config|

  config.vm.synced_folder ".", "/var/www/foo", type: "nfs"

end
```

ホストと仮想環境間のファイルの入出力の速度差によって、パフォーマンスに差がある。

以下のリンクで、ロードテストを実施したところ、『`RSync > SMB > VirtualBox共有ディレクトリ`』の順でパフォーマンスが良かった。

> ↪️ 参考：http://tech.respect-pal.jp/vagrant-synced_folder-type/

また、『`RSync > NFS`』『`NFS > SMB`』である。

> ↪️ 参考：
>
> - https://serverfault.com/questions/268369/why-rsync-is-faster-than-nfs
> - https://milestone-of-se.nesuke.com/sv-advanced/file-server/nfs-cifs-smb-summary/

これらから、おおよそ『`RSync > NFS > SMB > VirtualBox共有ディレクトリ`』の順でパフォーマンスが良くなると考えておけばよい。

<br>
