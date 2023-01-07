---
title: 【IT技術の知見】ストレージ＠Docker
description: ストレージ＠Dockerの知見を記録しています。
---

# ストレージ＠Docker

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Dockerマウント

### Dockerマウントとは

コンテナのファイルデータをホストのストレージに一時化/非永続化/永続化するための方法である。



> ℹ️ 参考：
>
> - https://geekylane.com/what-is-docker-storage-learn-everything-about-docker-storage-theory/
> - https://maku77.github.io/docker/mount/

![docker_storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_storage.png)

<br>

## 02. バインドマウント

### バインドマウントとは

![docker_bind-mount](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_bind-mount.png)

ホスト側のストレージ上のディレクトリを、コンテナ側にマウントすることにより、データを永続化する。

ホストで作成されるデータが継続的に変化する場合に適しており、例えば開発環境でアプリケーションをホストコンテナ間と共有する方法として推奨である。

しかし、ホスト側のデータを永続化する方法としては不適である。



> ℹ️ 参考：
>
> - https://docs.docker.com/storage/bind-mounts/
> - https://www.takapy.work/entry/2019/02/24/110932

<br>


### 使用方法

Dockerfileや```docker-compose.yml```ファイルへの定義、```docker```コマンドの実行、で使用できるが、```docker-compose.yml```ファイルでの定義が推奨である。

**＊例＊**

```bash
# ホストをコンテナ側にバインドマウント
$ docker run -d -it --name <コンテナ名> /bin/bash \
    --mount type=bind, src=home/projects/<ホスト側のディレクトリ名>, dst=/var/www/<コンテナ側のディレクトリ名>
```

<br>


### マウント元として指定できるディレクトリ

以下の通り、ホスト側のマウント元のディレクトリにはいくつか選択肢がある。

Docker for Desktopの設定画面で変更する。



![mount_host-directory](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mount_host-directory.png)

マウント元の詳細なディレクトリ名は、```/Users/<ユーザー名>/Library/Group Containers/group.com.docker/setting.json```ファイルから確認できる。

```yaml
$ cat settings.json

{

  ...

  "dataFolder": "/Users/<ユーザー名>/Library/Containers/com.docker.docker/Data/vms/0/data",
  
  ...
  
  "filesharingDirectories": [
      "/tmp",
      "/Users",
      "/Volumes",
      "/private"
  ],

  ...

}
```

<br>

## 03. ボリュームマウント

### ボリュームマウントとは

![docker_volume-mount](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_volume-mount.png)

ホスト側のストレージ上にあるdockerエリア（```/var/lib/docker/volumes```ディレクトリ）のマウントポイント（```/var/lib/docker/volumes/<ボリューム名>/_data```）を、コンテナ側にマウントすることより、データを永続化する。ホストで作成されるデータをめったに変更しない場合に適しており、例えばDBのデータをホストコンテナ間と共有する方法として推奨である。しかし、例えばアプリケーションやパッケージといったような変更されやすいデータを共有する方法としては不適である。

> ℹ️ 参考：
>
> - https://docs.docker.com/storage/volumes/
> - https://www.takapy.work/entry/2019/02/24/110932

<br>

### ボリューム、マウントポイントとは

dockerエリア（```/var/lib/docker/volumes```ディレクトリ）に保存される永続データをボリュームという。また、デバイスファイルに紐づくディレクトリ（```/var/lib/docker/volumes/<ボリューム名>/_data```）をマウントポイントといい、マウントポイントに対してマウント処理が必要である。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1802/23/news024.html

<br>

### 使用方法

Dockerfileや```docker-compose.yml```ファイルへの定義、```docker```コマンドの実行、で使用できるが、```docker-compose.yml```ファイルでの定義が推奨である。

**＊例＊**

```bash
# ホストをコンテナ側にバインドマウント
$ docker run -d -it --name <コンテナ名> /bin/bash \
    --mount type=volume, src=home/projects/<ホスト側のディレクトリ名>, dst=/var/www/<コンテナ側のディレクトリ名>
```

<br>

### Data Volumeコンテナによる永続化データの提供

ボリュームを使用する場合のコンテナ配置手法の一種。

dockerエリアのボリュームをData Volumeをコンテナのディレクトリにマウントしておく。

ボリュームを使用する時は、dockerエリアを参照するのではなく、Data Volumeコンテナを参照する。



![data-volumeコンテナ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/data-volumeコンテナ.png)

<br>

## 04. tmpfsマウント

### tmpfsマウントとは

Docker on Linuxでのみ使用できる。

ホスト側のメモリ上にあるディレクトリを、コンテナ側にマウントすることにより、データを非永続化する。

コンテナが停止すると、tmpfsマウントは終了し、ディレクトリは削除される。



> ℹ️ 参考：https://docs.docker.com/storage/tmpfs/

<br>

## 05. バインドマウント、ボリュームマウント、```COPY```、NFS

### 脆弱性の比較

本番環境で、ホストからコンテナにバインドマウントを実行できる。

しかしバインドマウントでは、ホスト側のコードが隔離されておらず、コンテナ側のコードからホスト側のマウントに関係ないファイルへもアクセスできてしまう（例：```cd```コマンドによって、ホスト側のマウントに関係ないディレクトリにアクセスできてしまう）。

一方でボリュームマウントでは、ホスト側のコードはdockerエリア内に隔離されており、ホストの他のファイルからは切り離されている。

これにより、マウントに関係のないファイルへはアクセスできないようになっている。

そのため、バインドマウントより安全である。



> ℹ️ 参考：
>
> - https://geekylane.com/what-is-docker-storage-learn-everything-about-docker-storage-theory/
> - https://blog.logrocket.com/docker-volumes-vs-bind-mounts/
> - https://devops4solutions.com/storage-options-in-docker/
> - https://www.takapy.work/entry/2019/02/24/110932

<br>

### 本番環境での使いやすさの比較

脆弱性の観点から、本番環境ではボリュームマウント（```VOLUME```）や```COPY```を使用して、アプリケーションをコンテナイメージに組み込むようにする。



> ℹ️ 参考：https://docs.docker.com/develop/dev-best-practices/#differences-in-development-and-production-environments

その上で、ボリュームマウントでは、組み込んだアプリケーションのコードをコンテナ起動後しか参照できないため、コードの組み込みとコンテナ起動の間にアプリケーションを加工する（例：ディレクトリの実行権限を変更するなど）場合は```COPY```の方が便利である。

方法として、コンテナイメージレジストリ内のプライベートリポジトリにデプロイするイメージのビルド時に、ホスト側のアプリケーションをイメージ側に```COPY```しておく。

これにより、本番環境ではこのコンテナイメージをプルしさえすれば、アプリケーションを使用できるようになる。



> ℹ️ 参考：
>
> - https://www.nyamucoro.com/entry/2018/03/15/200412
> - https://blog.fagai.net/2018/02/22/docker%E3%81%AE%E7%90%86%E8%A7%A3%E3%82%92%E3%81%84%E3%81%8F%E3%82%89%E3%81%8B%E5%8B%98%E9%81%95%E3%81%84%E3%81%97%E3%81%A6%E3%81%84%E3%81%9F%E8%A9%B1/

<br>

### パフォーマンスの比較

アプリケーションが処理を実行する時、多くのパッケージが読み出される。

この時、ホスト上で稼働するコンテナのパフォーマンスは、『```COPY、NFS > ボリュームマウント > バインドマウント```』の順で高い。



| コンテナへのコードの組み込み方 | パフォーマンスに関する説明                                                                                                                                                                                   | 補足                                                                                                                                                                                    |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| バインドマウント           | バインドマウントでは、ホストとコンテナ間のライフサイクルは同じであり、ファイルの状態が同期されている。この時、コンテナからホストにアウトプット処理、またホストからコンテナにインプット処理が発生する。そのため、コンテナではアプリケーションの処理を実行しながら、合わせてホスト間とI/O処理も実行することになり、コンテナのパフォーマンスは悪い。 | ℹ️ 参考：<br>・https://stackoverflow.com/questions/64629569/docker-bind-mount-directory-vs-named-volume-performance-comparison <br>・https://qiita.com/ucan-lab/items/a88e2e5c2a79f2426163 |
| ボリュームマウント          | ボリュームマウントでは、ホストとコンテナ間のライフサイクルは分離されており、ファイルの状態は同期されていない。そのため、ボリュームマウントよりはコンテナのパフォーマンスが良い。                                                                                                   | ℹ️ 参考：https://qiita.com/ucan-lab/items/a88e2e5c2a79f2426163                                                                                                                           |
| ```COPY```         | ```COPY```では、コンテナイメージのビルド時にコードを組み込むのみで、以降、ホストとコンテナ間でコードのI/O処理は発生しない。そのため、バインドマウントやボリュームマウントと比べて、コンテナのパフォーマンスが良い。このことは、DockerのみでなくKubernetesでも同様である。                                  |                                                                                                                                                                                         |
| NFS                | NFSを使用したマウントでは、高速でI/O処理が実行される。そのため、コンテナのパフォーマンスが良い。                                                                                                                                       | ℹ️ 参考：https://qiita.com/kunit/items/36d9e5fa710ad26f8010                                                                                                                              |

<br>
