# Helmfile＠Helm

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. helmfile.yaml

### releases

#### ▼ name

```yaml
releases:
  - name: ingress-nginx
```

#### ▼ namespace

```yaml
releases:
  - namespace: ingress-nginx
```

#### ▼ createNamespace

```yaml
releases:
  - createNamespace: true
```

#### ▼ chart

```yaml
releases:
  - chart: ingress-nginx/ingress-nginx
```

#### ▼ version

```yaml
releases:
  - version: n.n.n
```

#### ▼ values


```yaml
releases:
  - values:
      - ./foo-values.yaml
```

#### ▼ secrets

```yaml
secrets:
      - ./foo-secrets.yaml
```

<br>

### repositories

#### ▼ name

```yaml
repositories:
  - name: ingress-nginx
```

#### ▼ url

```yaml
repositories:
  - url: https://kubernetes.github.io/ingress-nginx
```

