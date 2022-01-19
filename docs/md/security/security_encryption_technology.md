# 通信データの暗号化技術

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. 通信データを暗号化する目的

### 盗聴（通信データの盗み取り）を防ぐため

『共通鍵暗号方式』や『公開鍵暗号方式』によって実現される．暗号アルゴリズムに基づく暗号方式を用いてデータを暗号化することによって，通信データの盗聴を防ぐ．

![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_1.png)

<br>

### 改竄（通信データの書き換え）を防ぐため

『デジタル署名』や『ハッシュ関数』によって実現される．相手に送ったデータと相手が受け取ったデータが同じかどうかを確認することによって，通信データの改竄を防ぐ．

![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_2.png)

<br>

### 成りすましを防ぐため

『デジタル署名』によって実現される．正しい相手であることを証明することによって，成りすましを防ぐ．

![盗聴_改竄_成りすまし](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/盗聴_改竄_成りすまし_3.png)

<br>

## 01-02. 暗号アルゴリズム

通信データの暗号化のほとんどは，『共通鍵暗号方式』や『公開鍵暗号方式』によって実現される．それらの方式は，以下のアルゴリズムによって実装される．

<br>

### 共通鍵暗号アルゴリズム

共通鍵暗号方式を実装するためのアルゴリズム

#### ・DES 暗号：Data Encryption Standard

#### ・AES 暗号：Advanced Encryption Standard

<br>

### 公開鍵暗号アルゴリズム

公開鍵暗号方式を実装するためのアルゴリズム

#### ・RSA 暗号：Rivest-Shamir-Adleman cryptosystem

<br>

## 01-03. 暗号アルゴリズムに基づく暗号方式

### 暗号方式の種類一覧

|                        |       共通鍵暗号方式       |     公開鍵暗号方式     |
| ---------------------- | :------------------------: | :--------------------: |
| **暗号化アルゴリズム** |   共通鍵暗号アルゴリズム   | 公開鍵暗号アルゴリズム |
| **アルゴリズムの種類** |    RC4，DES，3DES，AES     |      RSA，ElGamal      |
| **暗号化に要する時間** |          より短い          |        より長い        |
| **生成される暗号鍵**   |           共通鍵           |     秘密鍵，公開鍵     |
| **鍵の配布方法**       | メール（盗聴に気を付ける） |      メール，PKI       |
| **鍵の再利用**         |   再利用するべきではない   |    再利用してもよい    |

<br>

### 共通鍵暗号方式

#### ・共通鍵暗号方式とは

サーバーから受信者（クライアント）にあらかじめ秘密鍵を渡しておく．鍵の受け渡しを工夫しないと，共通鍵が盗聴される可能性がある（**鍵配送問題**）．

**＊例＊**

エクセルのファイルロック

**長所**：処理が速い

**短所**：鍵の配布が大変

![p437](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p437.png)

#### ・共通鍵の再利用の可否

各受信者（クライアント）は，サーバーから，受信者ごとに生成された共通鍵をもらう．鍵の再利用をするべきではない．

![共通鍵の再利用](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/共通鍵の再利用.png)

<br>

### 公開鍵暗号方式

#### ・公開鍵暗号方式とは

![公開鍵暗号方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/公開鍵暗号方式.png)

公開鍵暗号方式でも記載の通り，共通鍵暗号方式の鍵配送問題を解決すべく開発された．『RSA暗号』などによって実装される．受信者（クライアント）の公開鍵で暗号化した場合，受信者の秘密鍵でのみ復号可能．すなわち，第三者に復号（解読）されることはないと判断可能．

**＊サーバーが行うこと＊**

1. サーバーは，受信者（クライアント）から公開鍵をもらう．
2. 公開鍵を用いて，情報を暗号化する．

**＊受信者（クライアント）が行うこと＊**

1. 受信者（クライアント）は，秘密鍵で情報を復号する．  

#### ・公開鍵の再利用の可否

各受信者（クライアント）は，サーバーから，異なるサーバーで再利用される公開鍵をもらう．ただし，サーバーごとに異なる秘密鍵と公開鍵を用いてもよい．

![公開鍵の再利用](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/公開鍵の再利用.png)

<br>

### ハイブリッド暗号方式

共通鍵暗号方式と公開鍵暗号方式を組み合わせた暗号方式．両方の方式の長所と短所を補う．

 ![ハイブリッド暗号](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ハイブリッド暗号.png)

<br>

## 02. 暗号化方式に基づくセキュアプロトコル

### セキュアプロトコルの種類と扱われる階層

プロトコルとしての暗号化技術である『セキュアプロトコル』は，赤色で示してある．

![セキュアプロトコル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/セキュアプロトコル.png)

<br>

### セキュアプロトコルで扱われる通信データ

#### ・通信データの種類

Webコンテンツデータ，メールデータ，その他

#### ・通信データの作成，ヘッダ情報追加，カプセル化

パケット交換方式におけるパケットのヘッダ情報は，パソコンの各概念層のプロトコルによって追加されていく．

![パケットの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットの構造.jpg)

<br>

## 02-02. アプリケーション層におけるメールデータの暗号化技術

### S/MIME：Secure MIME

#### ・S/MINEとは

暗号化ダイジェスト（デジタル署名）を含むデジタル証明書をメールに添付することによって，公開鍵の成りすましを防ぐセキュリティ技術．

![S_MIME](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/S_MIME.png)

#### ・S/MIMEにおけるデジタル証明書

デジタル証明書をS/MIMEに用いる場合，特にS/MIME証明書という．詳しくは，暗号ダイジェスト（デジタル署名）を参照．

<br>

## 02-03. アプリケーション層におけるリモート接続/操作やファイル転送の暗号化技術

### SSH：Secure Shell

#### ・SSHとは

公開鍵暗号方式に基づくセキュアプロトコル．公開鍵暗号方式と，公開鍵認証方式やパスワード認証方式の技術を用いて，インターネットを経由して，サーバーのリモート接続/操作を行う．物理Webサーバーであっても，Webサーバーであっても，SSHによるリモート接続/操作の仕組みは同じである．

![ssh接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh接続.png)

#### ・SSH接続/操作する側に必要なソフトウェア

『OpenSSH』，『TeraTerm』，『Putty』がある．

#### ・SSH接続/操作される側に必要なソフトウェア

『OpenSSH』，『Apache MINA/SSHD』

#### ・SSHポートフォワーディング（SSHポート転送）

ローカルサーバーと踏み台サーバーのSSH接続と，ポートフォワーディングを組み合わせることによって，外部ネットワークのプライベートネットワーク内リモートサーバーのアプリケーションに間接的に通信を行う方法．

**＊例＊**

踏み台サーバー（例：EC2）を用いて，ローカルサーバー（例：自身のパソコン）の```20000```番ポートが開放されたアプリケーションと，リモートサーバー（例：RDS）の```3306```番ポートが開放されたアプリケーションをマッピングできるようになる．DBMSクライアントソフトでは，リモートにあるDBサーバーに接続するために，この仕組みがよく用いられる．

```bash
# ローカルの20000番ポートが割り当てられたアプリケーションに対する通信を，RDSの3306番ポートのアプリケーションに転送．
[local pc] $ ssh -L20000:*****.rds.amazonaws.com:3306 username@fumidai.com 
```

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh-port-forward.png)

**＊例＊**

このリモートサーバーが，仮想環境の場合もあり，ホストと仮想環境の接続でもSSHポートフォワーディングが用いられている．ホスト外部のパソコンから，ホスト上の仮想環境に接続したい場合，SSHポートフォワーディングを用いることによって，ホストを踏み台とした仮想環境への接続が行えるようになる．

![docker_port-fowarding](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_port-fowarding.png)

<br>

### SCP：Secure Copy Protocol

#### ・SCPとは

SSHを介して，ファイル転送を行う．SSHの機能をより拡張したプロトコルである．

1. クライアントは，リモート接続先のサーバーにファイル送信を命令する．
2. サーバーは，Shellを用いてSCPプログラムを起動し，クライアントにファイルを送信する．

![SCPの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SCPの仕組み.png)

#### ・ファイルを要求する側に必要なソフトウェア

『WinSCP』，『Filezilla』

#### ・ファイルを送信する側に必要なソフトウェア

<br>

### SFTP：SSH File Transfer Protocol

#### ・SFTPとは

SSHを介して，ファイル転送を行う．SSHとFTPを組み合わせたプロトコルではなく，SSHの機能をより拡張したものである．

#### ・ファイル要求側のクライアントソフトウェア

『WinSCP』，『Filezilla』

#### ・ファイル送信側のクライアントソフトウェア

<br>

## 02-04. トランスポート層におけるヘッダ情報の暗号化技術

### SSL/TLS：Secure Sockets Layer / Transport Layer Security

#### ・SSL/TLSとは

ハイブリッド暗号方式に基づくセキュアプロトコル．トランスポート層で，パケットのヘッダ情報の暗号化を担う．具体的には，HTTPプロトコルで，GET送信のヘッダ部分，またPOST送信のヘッダ部分とボディ部分を暗号化する．

![SSL_TLSプロトコル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSL_TLSプロトコル.png)

**＊例＊**

Chromeでは，HTTPSプロトコルの使用時にSSL証明書に不備がある（例えば，オレオレ証明書を用いている）と，以下のような警告が表示される．SSL証明書については，公開鍵基盤の説明を参照せよ．

![SSL接続に不備がある場合の警告](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSL接続に不備がある場合の警告.jpg)

#### ・SSL/TLSにおけるデジタル証明書とドメイン認証

デジタル証明書をSSLに用いる場合，特にSSL証明書という．提供される秘密鍵と組み合わせて，ドメインの認証に用いられる．詳しくは，暗号ダイジェスト（デジタル署名）を参照．

<br>

### VPN：Virtual Private Network（仮想プライベートネットワーク）

#### ・VPNとは

異なるネットワーク間で安全な通信を行うための仕組み．IPsecやSSL/TLSによって実現される．

![VPN（ネットワーク間）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPN（ネットワーク間）.png)

#### ・インターネットVPNでのSSL/TLS通信の利用

VPNゲートウェイとのSSL/TLS通信によって，インターネットVPNを実現できる．

![SSLによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SSLによるインターネットVPN.jpg)

<br>

## 02-05. 暗号ダイジェスト（デジタル署名）について

### 暗号ダイジェスト（デジタル署名）を用いた暗号化技術

#### ・暗号ダイジェスト（デジタル署名）とは

『公開鍵暗号方式とは逆の仕組み（※つまり，公開鍵暗号方式ではない）』と『ハッシュ関数』を利用した暗号化．『成りすまし』と『改竄』を防げる．

![デジタル署名](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル署名.png)

**＊サーバーが行うこと＊**

1. サーバーは，受信者（クライアント）にあらかじめ公開鍵を配布しておく．
2. 平文をハッシュ化し，ダイジェストにする．
3. ダイジェストを秘密鍵で暗号化し，暗号ダイジェスト（デジタル署名）を作成する．
4. 『平文』，『暗号ダイジェスト（デジタル署名）』を送信する．

**＊受信者（クライアント）が行うこと＊**

1. 受信者（クライアント）は，『平文』と『暗号ダイジェスト（デジタル署名）』を受信する．
2. 平文をハッシュ化し，ダイジェストにする．
3. 上記2つのダイジェストが同一なら，『成りすまし』と『改竄』が行われていないと判断

#### ・暗号ダイジェスト（デジタル署名）のメリット

1．改竄を防げる

  サーバーから送られた『平文』と『暗号ダイジェスト』のどちらかが，通信の途中で改竄された場合，これらのダイジェストが同じになることは確率的にありえない．したがって，確かに改竄されていないと判断可能．

2．成りすましを防げる

  特定の秘密鍵を持つのは，特定のサーバーだけ．したがって，確かにサーバーによって暗号化されたものだと判断可能．

#### ・暗号ダイジェスト（デジタル署名）のデメリット

**★★公開鍵の成りすましを防ぐことができない★★**

二者間だけのやり取りでは，あらかじめ受信者に渡される公開鍵が偽の送信者のものであっても，確かめる術がない．これを保障する仕組みに，PKI（公開鍵基盤）がある．



### 暗号ダイジェスト（デジタル署名）と公開鍵暗号方式を用いた暗号化技術

『成りすまし』と『改竄』を防げるデジタル署名に，『盗聴』を防げる公開鍵暗号方式を組み込んだ暗号化技術．

![デジタル署名と暗号化](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル署名と暗号化.png)

<br>

### ハッシュ関数によるハッシュ化

何かのデータを入力すると，規則性のない一定の桁数の値を出力する演算手法．

![ハッシュ関数](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ハッシュ関数.png)

<br>

### PKI：Public Key Infrastructure（公開鍵基盤）による公開鍵の検証

#### ・ドメインの正当性の検証

秘密鍵とデジタル証明書はドメインの正当性（偽のサイトではないこと）を担保するものである．デジタル署名に用いた秘密鍵に対応する公開鍵は，成りすました人物による偽の公開鍵である可能性がある．第三者機関の認証局によって，公開鍵を検証するインフラのことを，公開鍵基盤という．

#### ・公開鍵の検証の仕組み

![デジタル証明書（SSL証明書）](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デジタル証明書（SSL証明書）.gif)

多くの場合，サーバーの提供会社が中間認証局をもっている．中間認証局とルート認証局の関係については，認証局そのもののなりすましの防止策を参照．

**＊例＊**

| サーバー提供者 | 自社の中間認証局名    | ルート認証局名 |
| ------------ | --------------------- | -------------- |
| AWS          | Amazon Trust Services | Starfield社    |
| GCP          | Google Trust Services |                |

**＊サーバーが行うこと＊**

1. サーバーは，公開鍵と秘密鍵を作り，認証局に公開鍵とデジタル署名を提出．
2. 認証局から，暗号ダイジェスト（デジタル署名）を含むデジタル証明書（S/MIME証明書，SSL証明書）を発行してもらう．デジタル証明書が，公開鍵の本人証明になる．デジタル証明書は，S/MIMEで用いる場合には，『S/MIME証明書』，SSL/TLSで用いる場合には，『SSL証明書』という．
3. 受信者（クライアント）にメール，暗号ダイジェスト（デジタル署名）を含むデジタル証明書を送信．

**＊受信者（クライアント）が行うこと＊**

1. 受信者（クライアント）は，暗号ダイジェスト（デジタル署名）を含むデジタル証明書（S/MIME証明書，SSL証明書）を受信．
2. 認証局からもらった公開鍵を用いて，デジタル証明書の暗号ダイジェスト（デジタル署名）部分を復号し，ハッシュ値が同じなら，認証局そのものが成りすましでないと判断する．

#### ・認証局そのものの成りすましの防止策

デジタル証明書（S/MIME証明書，SSL証明書）を発行する認証局そのものが，成りすましの可能性がある．そこで，認証局をランク付けし，ルート認証局が下位ランクの認証局に権限を与えることで，下位の認証局の信頼性を持たせている．なお，ルート認証局は専門機関から厳しい審査を受けているため，ルート認証局自体がなりすましである可能性は非常に低い．

![認証局自体の成りすまし防止](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/認証局自体の成りすまし防止.png)

<br>

## 02-06. ネットワーク層におけるヘッダ情報の暗号化技術

### IPsec：Internet Protocol Security

#### ・IPSecとは

共通鍵暗号方式に基づくセキュアプロトコル．ネットワーク層で，パケットのヘッダ情報の暗号化を担う．例えば，リモートワーク時に，自宅PCと会社のネットワークをVPN接続するために用いられる．VPN接続されると，自宅PCからのTCPプロトコルのリクエストが会社のルーターを通過するため，送信元IPアドレスが会社のものにかわる．盗聴を防げる．

![IPsecによるインターネットVPN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるインターネットVPN.jpg)

#### ・IPsecによるパケットのカプセル化

![IPsecによるカプセル化](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IPsecによるカプセル化.jpg)

<br>

### VPN：Virtual Private Network（仮想プライベートネットワーク）

#### ・VPNとは

異なるネットワーク間で安全な通信を行うための仕組み．使用されているセキュアプロトコルに基づいて，『PPTP-VPN』，『SSL/TLS-VPN』，『IPsec-VPN』がある．

![i](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPN（ネットワーク間）.png)

#### ・PPTP-VPNの例

『PPTP』

#### ・SSL/TLS-VPNの例

『OpenVPN』

#### ・IPsec-VPNの例

『L2TP/IPSec』

<br>

## 03. その他のセキュリティ技術

### メール受信におけるセキュリティ

#### ・OP25B（Outbound Port 25 Blocking）

#### ・SPF（Sender Policy Framework）

<br>

### パスワードの保存方法

平文で保存しておくと，流出した時に勝手に使用されてしまうため，ハッシュ値で保存するべきである．

![ハッシュ値で保存](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ハッシュ値で保存.png)

<br>

### 生体認証

![生体認証-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/生体認証-1.png)

![生体認証-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/生体認証-2.png)

<br>

### Web beacon

webページに，サーバーに対してHTTPリクエストを送信するプログラムを設置し，送信されたリクエストを集計するアクセス解析方法．例えば，1x1の小さなGif『画像』などを設置する．

<br>

### Penetration テスト

既知のサイバー攻撃を意図的に行い，システムの脆弱性を確認するテストのこと．

**＊例＊**

株式会社LACによるPenetration テストサービス

![ペネトレーションテスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ペネトレーションテスト.png)
