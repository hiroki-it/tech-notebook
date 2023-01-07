---
title: 【IT技術の知見】PagerDuty＠インシデント管理ツール
description: PagerDuty＠インシデント管理ツールオンコールとインシデント管理の知見を記録しています。
---

# PagerDuty＠インシデント管理ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. PagerDutyの仕組み

![pagerduty_on-call](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pagerduty_on-call.png)


ここでは、PagerDutyをインシデント管理ツールとして、PagerDutyに通知されたアラートをオンコール担当者が作業したとする。



（１）CloudWatchアラームからPagerDutyのServiceに、アラートが通知される。

（２）PagerDutyのServiceから。インシデントがメールや電話として通知される。執筆時点（2022/12/26）では、電話での通知は英語である。

（３）オンコール担当者は、PagerDutyのServiceを確認する。

（４）解決フェーズがOpenになっているインシデント


> ℹ️ 参考：https://blog.mapbox.com/building-on-call-mapboxs-managed-incident-response-tool-59fadd87317a


<br>

## 02. インシデント

### インシデントの解決フェーズ

#### ▼ PagerDutyの解決フェーズ

インシデントには解決フェーズがあり、PagerDutyではそれ管理できる。



#### ▼ 解決フェーズの種類

PagerDutyでは、以下の解決フェーズを設定できる。



| 解決フェーズ     | 説明                                                                                                  |
|--------------|-----------------------------------------------------------------------------------------------------|
| Triggered    | アラートがインシデントとして見なされ、タスクが作成された。再現性の低い瞬間的なインシデントであれば、Acknowledgedフェーズを経ずに、そのままResolvedにしてもよい。 |
| Acknowledged | インシデントのタスクに対応中であるが、まだ解決できていない。一定期間、Resolvedフェーズに移行しない場合は、再びTriggeredフェーズに戻る。           |
| Resolved     | インシデントのタスクを解決した。                                                                                    |

![pagerduty_incident_phase](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/pagerduty_incident_phase.png)


> ℹ️ 参考：
>
> - https://thinkit.co.jp/article/13420
> - https://support.pagerduty.com/docs/incidents#incident-statuses

#### ▼ Resolvedへの自動的な移行

解決フェーズが一定時間TriggeredフェーズのままでResolvedに移行しない場合、自動的にResolvedに移行するように設定できる。

注意点として、自動移行でResolvedになったインシデントは、同じインシデントが発生しない限り、Triggeredフェーズに戻ることはない。



> ℹ️ 参考：https://support.pagerduty.com/docs/configurable-service-settings#auto-resolution

<br>

### インシデントの通知抑制

- 特定のシステムを無視
- インシデントの一時無効化
- エラーイベントの重要度レベルの調節
- インシデントのグループ化

> ℹ️ 参考：https://thinkit.co.jp/article/13558

<br>
