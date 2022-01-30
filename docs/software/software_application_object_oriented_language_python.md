---
title: 【知見を記録するサイト】Python
description: Pythonの知見をまとめました。
---

# Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 実装ポリシー

### ファイルの要素

#### ・パッケージ，サブパッケージ

パッケージとして扱うディレクトリには．```__init__.py```ファイルを配置する必要がある．

参考：

- https://rinatz.github.io/python-book/ch04-02-packages/
- https://qiita.com/msi/items/d91ea3900373ff8b09d7

v3.3以降であれば，サブパッケージには必要になる．

参考：

- https://shino-tec.com/2019/04/21/init-py-necessity/
- https://isolution.pro/q/so50137584/python-3-3-iko-no-pakke-ji-ni-wa-init-py-wa-hitsuyo-arimasen-ka
- https://stackoverflow.com/questions/37139786/is-init-py-not-required-for-packages-in-python-3-3

#### ・モジュール

パッケージ内の各ファイルのこと．

参考：

- https://rinatz.github.io/python-book/ch04-01-modules/
- https://qiita.com/msi/items/d91ea3900373ff8b09d7

#### ・インポート

```python
from <パッケージ名>.<サブパッケージ名>.<モジュール名> import <関数名>
```

参考：https://qiita.com/papi_tokei/items/bc34d798dc7a6d49df30

アスタリスクによるインポートは非推奨である．

参考：https://python.civic-apps.com/wildcard-import/

<br>

### 命名規則

参考：https://qiita.com/naomi7325/items/4eb1d2a40277361e898b

|    対象    |                  ルール                   |          例          |
| :--------: | :---------------------------------------: | :------------------: |
| パッケージ | 全小文字 なるべく短くアンダースコア非推奨 |  tqdm, requests ...  |
| モジュール |   全小文字 なるべく短くアンダースコア可   |     sys, os,...      |
|   クラス   |         最初大文字 + 大文字区切り         |   MyFavoriteClass    |
|    例外    |         最初大文字 + 大文字区切り         |    MyFuckingError    |
|   型変数   |         最初大文字 + 大文字区切り         |    MyFavoriteType    |
|  メソッド  |      全小文字 + アンダースコア区切り      |  my_favorite_method  |
|    関数    |      全小文字 + アンダースコア区切り      | my_favorite_funcion  |
|    変数    |      全小文字 + アンダースコア区切り      | my_favorite_instance |
|    定数    |    **全大文字** + アンダースコア区切り    |  MY_FAVORITE_CONST   |