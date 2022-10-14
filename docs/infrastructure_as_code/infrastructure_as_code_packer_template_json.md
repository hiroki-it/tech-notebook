---
title: 【IT技術の知見】template.json＠Packer
description: template.json＠Packerの知見を記録しています。

---

# template.json＠Packer

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Packerの仕組み

### アーキテクチャ

調査中...

<br>

### ユースケース

#### ▼ AWSの場合

プロビジョナーを使用してEC2インスタンスをプロビジョニングし、そのEC2インスタンスからAMIを作成する。AMIの作成後、EC2を削除する。例えば、PackerでプロビジョナーとしてAnsibleを指定してAMIを作成しつつ、TerraformでAMIからEC2インスタンスを作成したとする。これにより、クラウドインフラのプロビジョニングでAnsibleとTerraformが共存できるようになる。注意点として、起動中のEC2インスタンスからAMIを作成するわけではなく、設定値が同じ新しいEC2インスタンスからAMIを作成するだけであり、AMIに内蔵されているEBSボリュームも新品であるため、バックアップツールとしては使用できない。

> ℹ️ 参考：
> 
> - https://aws.amazon.com/jp/blogs/mt/migrating-from-hashicorp-packer-to-ec2-image-builder/
> - https://qiita.com/mitzi2funk/items/c963483a11a1912e3c44#01-2-use-case

![packer_aws](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/packer_aws.png)

<br>

## 02. セットアップ

### インストール

#### ▼ aptリポジトリから

> ℹ️ 参考：https://www.packer.io/downloads

```bash
$ curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
$ sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
$ sudo apt-get update && sudo apt-get install packer
```

<br>

## 03. builders

### buildersとは

作成するマシンイメージやコンテナイメージの内容を設定する。

<br>

### typeがamazon-ebsの場合

#### ▼ region

AMIを作成するリージョンを設定する。

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "region": "ap-northeast-1",
    }
  ]
}
```

#### ▼ source_ami

AMIの基とするAMIを設定する。

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "source_ami": "ami-0b7546e839d7ace12", # Amazon Linux 2 AMI
    }
  ]
}
```

#### ▼ ami_name

AMIの名前を設定する。

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "ami_name": "bar-ami",
    }
  ]
}
```

#### ▼ ami_users


```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "ami_users": "<アカウントID>",
    }
  ]
}
```

#### ▼ snapshot_users

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "snapshot_users": "<アカウントID>",
    }
  ]
}
```


#### ▼ instance_type

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "instance_type": "t2.micro",
    }
  ]
}
```

#### ▼ ssh_username

EC2インスタンスへのSSH接続時に使用するユーザー名を設定する。

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "ssh_username": "ec2-user",
    }
  ]
}
```


#### ▼ ena_support

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "ena_support": true,
    }
  ]
}
```


#### ▼ encrypt_boot

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "encrypt_boot": false,
    }
  ]
}
```

#### ▼ force_deregister

同じ名前のマシンイメージが存在する場合に、既存のマシンイメージを登録解除してからこれを作成するようにするか否か、を設定する。Packerの作成するマシンイメージの名前は、ランダム値をつけない限り、常に同じである。マシンイメージの名前の重複を許可しないプロバイダー（例：AWS）では、一つの名前のマシンイメージを一回しか作成できないことになってしまう。そういった場合に必要になる。


```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "force_deregister": true,
    }
  ]
}
```


#### ▼ launch_block_device_mappings

EC2インスタンスに紐づけるルートデバイスボリュームを設定する。

```yaml
}
  "builders": [
    {
      "type": "amazon-ebs",
      "launch_block_device_mappings": [
        {
          "device_name": "/dev/xvda",
          "volume_type": "gp2",
          "delete_on_termination": "true",
          "volume_size": "300"
        }
      ]
    }
  ]
}
```

<br>

## 04. provisioners

### type

#### ▼ typeとは

サーバーやコンテナのプロビジョナーを設定する。

<br>

### ansibleの場合

#### ▼ playbook_file

```yaml
}
  "provisioners": [
    {
      "type": "ansible",
      "playbook_file": "./playbook.yml",
    }
  ]
}
```

#### ▼ user

```yaml
}
  "provisioners": [
    {
      "type": "ansible",
      "user": "ec2-user"
    }
  ]
}
```

<br>

### shellの場合

#### ▼ inline

```yaml
}
  "provisioners": [
    {
      "type": "shell",
      "inline": [
        "echo Hello World"
      ]
    },
  ]
}
```

<br>

## 05. variables

### variablesとは

ファイル内で使用する変数を設定する。

```yaml
{
  "variables": {
    "region": "ap-northeast-1",
  },
  "builders": [
    {
      "region": "{{ user `region` }}"
    }
  ]
}
```

<br>

