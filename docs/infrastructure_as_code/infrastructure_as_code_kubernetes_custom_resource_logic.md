---
title: 【IT技術の知見】ロジック＠custom-controller
description: ロジック＠custom-controllerの知見を記録しています。
---

# ロジック＠custom-controller

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Fooリソースのcustom-controller

### CRD

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foos.samplecontroller.k8s.io
spec:
  group: samplecontroller.k8s.io
  version: v1alpha1
  names:
    kind: Foo
    plural: foos
  scope: Namespaced
```

> - https://github.com/kubernetes/sample-controller/blob/master/artifacts/examples/crd.yaml

<br>

### カスタムリソース

Deploymentを管理するFooリソースとする。

```go
package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)


// Foo
type Foo struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   FooSpec   `json:"spec"`
	Status FooStatus `json:"status"`
}

// Foo.spec
type FooSpec struct {
	DeploymentName string `json:"deploymentName"`
	Replicas       *int32 `json:"replicas"`
}


// Foo.status
type FooStatus struct {
	AvailableReplicas int32 `json:"availableReplicas"`
}

// Fooのリスト
type FooList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata"`

	Items []Foo `json:"items"`
}
```

```yaml
apiVersion: samplecontroller.k8s.io
kind: Foo
metadata:
  name: foos.samplecontroller.k8s.io
spec:
  deploymentName: foo-deployment
  replicas: 2
  status:
    availableReplicas: 2
```

> - https://github.com/kubernetes/sample-controller/blob/master/artifacts/examples/example-foo.yaml

<br>

### custom-controller

#### ▼ controller.go

このcustom-controllerは、FooリソースをReconciliationし、またDeploymentの状態をwatchする。

```go
package main

import (
	"context"
	"fmt"
	"time"

	"golang.org/x/time/rate"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	"k8s.io/apimachinery/pkg/util/wait"
	appsinformers "k8s.io/client-go/informers/apps/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/scheme"
	typedcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	appslisters "k8s.io/client-go/listers/apps/v1"

    // リソースイベントハンドラー
	"k8s.io/client-go/tools/cache"

    "k8s.io/client-go/tools/record"

    // ワークキュー
	"k8s.io/client-go/util/workqueue"

    "k8s.io/klog/v2"

	samplev1alpha1 "k8s.io/sample-controller/pkg/apis/samplecontroller/v1alpha1"
	clientset "k8s.io/sample-controller/pkg/generated/clientset/versioned"
	samplescheme "k8s.io/sample-controller/pkg/generated/clientset/versioned/scheme"
	informers "k8s.io/sample-controller/pkg/generated/informers/externalversions/samplecontroller/v1alpha1"
	listers "k8s.io/sample-controller/pkg/generated/listers/samplecontroller/v1alpha1"
)

const controllerAgentName = "sample-controller"

const (
	SuccessSynced = "Synced"
	ErrResourceExists = "ErrResourceExists"
	MessageResourceExists = "Resource %q already exists and is not managed by Foo"
	MessageResourceSynced = "Foo synced successfully"
)

type Controller struct {
	kubeclientset kubernetes.Interface
	sampleclientset clientset.Interface
	deploymentsLister appslisters.DeploymentLister
	deploymentsSynced cache.InformerSynced
	foosLister        listers.FooLister
	foosSynced        cache.InformerSynced
	workqueue workqueue.RateLimitingInterface
	recorder record.EventRecorder
}

func NewController(ctx context.Context, kubeclientset kubernetes.Interface, sampleclientset clientset.Interface, deploymentInformer appsinformers.DeploymentInformer, fooInformer informers.FooInformer) *Controller {

	logger := klog.FromContext(ctx)
	utilruntime.Must(samplescheme.AddToScheme(scheme.Scheme))
	logger.V(4).Info("Creating event broadcaster")
	eventBroadcaster := record.NewBroadcaster()
	eventBroadcaster.StartStructuredLogging(0)
	eventBroadcaster.StartRecordingToSink(&typedcorev1.EventSinkImpl{Interface: kubeclientset.CoreV1().Events("")})

	// イベントレコーダーを作成する
	recorder := eventBroadcaster.NewRecorder(
		scheme.Scheme,
		corev1.EventSource{Component: controllerAgentName},
	)

	ratelimiter := workqueue.NewMaxOfRateLimiter(
		workqueue.NewItemExponentialFailureRateLimiter(5 * time.Millisecond, 1000 * time.Second),
		&workqueue.BucketRateLimiter{Limiter: rate.NewLimiter(rate.Limit(50), 300)},
	)

	controller := &Controller{
		// クライアント
		kubeclientset:     kubeclientset,
		sampleclientset:   sampleclientset,
		// インフォーマー
		deploymentsLister: deploymentInformer.Lister(),
		deploymentsSynced: deploymentInformer.Informer().HasSynced,
		foosLister:        fooInformer.Lister(),
		foosSynced:        fooInformer.Informer().HasSynced,
		// ワークキュー
		workqueue:         workqueue.NewRateLimitingQueue(ratelimiter),
		// イベントレコーダー
		recorder:          recorder,
	}

	logger.Info("Setting up event handlers")

	// 作成するコントローラーのインフォーマーにイベントハンドラーを設定する
	// このイベントハンドラーは、Fooリソースの状態をwatchし、状態が変化した時に発火する
	fooInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: controller.enqueueFoo,
		UpdateFunc: func(old, new interface{}) {
			controller.enqueueFoo(new)
		},
	})

	// 作成するコントローラーのインフォーマーにイベントハンドラーを設定する
	// このイベントハンドラーは、Deploymentの状態をwatchし、状態が変化した時に発火する
	deploymentInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: controller.handleObject,
		UpdateFunc: func(old, new interface{}) {
			newDepl := new.(*appsv1.Deployment)
			oldDepl := old.(*appsv1.Deployment)
			if newDepl.ResourceVersion == oldDepl.ResourceVersion {
				return
			}
			controller.handleObject(new)
		},
		DeleteFunc: controller.handleObject,
	})

	return controller
}

func (c *Controller) Run(ctx context.Context, workers int) error {

	defer utilruntime.HandleCrash()
	defer c.workqueue.ShutDown()

    logger := klog.FromContext(ctx)
	logger.Info("Starting Foo controller")
	logger.Info("Waiting for informer caches to sync")

	if ok := cache.WaitForCacheSync(ctx.Done(), c.deploymentsSynced, c.foosSynced); !ok {
		return fmt.Errorf("Failed to wait for caches to sync")
	}

	logger.Info("Starting workers", "count", workers)

	// 無限ループを定義し、Reconciliationループを実行する
	for i := 0; i < workers; i++ {
		// Goroutineを宣言して並列化
		go wait.UntilWithContext(
			ctx,
			// ワークキューから継続的にアイテムを取得し、syncHandlerをコールして処理する
			c.runWorker,
			time.Second,
		)
	}

	logger.Info("Started workers")
	<-ctx.Done()
	logger.Info("Shutting down workers")

	return nil
}

// ワークキューから継続的にアイテムを取得し、syncHandlerをコールして処理する
func (c *Controller) runWorker(ctx context.Context) {

	for c.processNextWorkItem(ctx) {
	}
}

// ワークキューからアイテムを取得して処理し、syncHandlerをコールして処理する
func (c *Controller) processNextWorkItem(ctx context.Context) bool {

	obj, shutdown := c.workqueue.Get()
	logger := klog.FromContext(ctx)

	if shutdown {
		return false
	}

	err := func(obj interface{}) error {
		defer c.workqueue.Done(obj)
		var key string
		var ok bool
		if key, ok = obj.(string); !ok {
			c.workqueue.Forget(obj)
			utilruntime.HandleError(fmt.Errorf("expected string in workqueue but got %#v", obj))
			return nil
		}
		// Reconciliationを実行する
		if err := c.syncHandler(ctx, key); err != nil {
			c.workqueue.AddRateLimited(key)
			return fmt.Errorf("error syncing '%s': %s, requeuing", key, err.Error())
		}
		c.workqueue.Forget(obj)
		logger.Info("Successfully synced", "resourceName", key)
		return nil
	}(obj)

	if err != nil {
		utilruntime.HandleError(err)
		return true
	}

	return true
}

// Reconciliationを実行する
func (c *Controller) syncHandler(ctx context.Context, key string) error {

	logger := klog.LoggerWithValues(klog.FromContext(ctx), "resourceName", key)
	namespace, name, err := cache.SplitMetaNamespaceKey(key)

	if err != nil {
		utilruntime.HandleError(fmt.Errorf("invalid resource key: %s", key))
		return nil
	}

    // kube-apiserverからFooリソースの望ましい状態を取得する
	foo, err := c.foosLister.Foos(namespace).Get(name)

    if err != nil {
  		if errors.IsNotFound(err) {
			utilruntime.HandleError(fmt.Errorf("foo '%s' in work queue no longer exists", key))
			return nil
		}

		return err
	}

	deploymentName := foo.Spec.DeploymentName

	if deploymentName == "" {
		utilruntime.HandleError(fmt.Errorf("%s: deployment name must be specified", key))
		return nil
	}

    // kube-apiserverからDeploymentの望ましい状態を取得する
	deployment, err := c.deploymentsLister.Deployments(foo.Namespace).Get(deploymentName)

	// kube-apiserverから取得したFooの実体がない場合、Deploymentを作成する
	if errors.IsNotFound(err) {
		deployment, err = c.kubeclientset.AppsV1().Deployments(foo.Namespace).Create(context.TODO(), newDeployment(foo), metav1.CreateOptions{})
	}

	if err != nil {
		return err
	}

	if !metav1.IsControlledBy(deployment, foo) {
		msg := fmt.Sprintf(MessageResourceExists, deployment.Name)
		c.recorder.Event(foo, corev1.EventTypeWarning, ErrResourceExists, msg)
		return fmt.Errorf("%s", msg)
	}

	// kube-apiserverから取得したFooリソースと実体の状態が異なる場合、望ましい状態に修復する
	if foo.Spec.Replicas != nil && *foo.Spec.Replicas != *deployment.Spec.Replicas {
		logger.V(4).Info("Update deployment resource", "currentReplicas", *foo.Spec.Replicas, "desiredReplicas", *deployment.Spec.Replicas)
		deployment, err = c.kubeclientset.AppsV1().Deployments(foo.Namespace).Update(context.TODO(), newDeployment(foo), metav1.UpdateOptions{})
	}

	if err != nil {
		return err
	}

	// FooカスタムリソースのステータスとDeploymentのステータスが一致していない場合、FooカスタムリソースのステータスがDeploymentに合致するように更新する
	err = c.updateFooStatus(foo, deployment)

	if err != nil {
		return err
	}

    // custom-controllerの処理結果をイベントとして登録する
    // kubectl eventsコマンドで確認できるようになる
	c.recorder.Event(foo, corev1.EventTypeNormal, SuccessSynced, MessageResourceSynced)
	return nil
}

// FooカスタムリソースのステータスとDeploymentのステータスが一致していない場合、FooカスタムリソースのステータスがDeploymentに合致するように更新する
func (c *Controller) updateFooStatus(foo *samplev1alpha1.Foo, deployment *appsv1.Deployment) error {

	fooCopy := foo.DeepCopy()
	fooCopy.Status.AvailableReplicas = deployment.Status.AvailableReplicas

	_, err := c.sampleclientset.SamplecontrollerV1alpha1().Foos(foo.Namespace).UpdateStatus(
		context.TODO(),
		fooCopy,
		metav1.UpdateOptions{},
	)

	return err
}

// Deploymentオブジェクトのキーをワークキューに追加する
func (c *Controller) enqueueFoo(obj interface{}) {

    var key string
	var err error

	// <Namespace>/<Deploymentの名前>の形式でキーを作成する
    if key, err = cache.MetaNamespaceKeyFunc(obj); err != nil {
		utilruntime.HandleError(err)
		return
	}

	c.workqueue.Add(key)
}

// Deploymentを参照し、親がFooリソースであれば、enqueueFoo関数を実行する
func (c *Controller) handleObject(obj interface{}) {

	var object metav1.Object
	var ok bool

	logger := klog.FromContext(context.Background())

    if object, ok = obj.(metav1.Object); !ok {
		tombstone, ok := obj.(cache.DeletedFinalStateUnknown)

		if !ok {
			utilruntime.HandleError(fmt.Errorf("error decoding object, invalid type"))
			return
		}

        object, ok = tombstone.Obj.(metav1.Object)

        if !ok {
			utilruntime.HandleError(fmt.Errorf("error decoding object tombstone, invalid type"))
			return
		}

        logger.V(4).Info("Recovered deleted object", "resourceName", object.GetName())
	}

    logger.V(4).Info("Processing object", "object", klog.KObj(object))

    if ownerRef := metav1.GetControllerOf(object); ownerRef != nil {

		if ownerRef.Kind != "Foo" {
			return
		}

		foo, err := c.foosLister.Foos(object.GetNamespace()).Get(ownerRef.Name)

		if err != nil {
			klog.V(4).Infof("ignoring orphaned object '%s' of foo '%s'", object.GetSelfLink(), ownerRef.Name)
			return
		}

		c.enqueueFoo(foo)
		return
	}
}

// FooカスタムリソースのCRDに基づいて、Fooカスタムリソースの子Deploymentを作成する
func newDeployment(foo *samplev1alpha1.Foo) *appsv1.Deployment {

	labels := map[string]string{
		"app":        "nginx",
		"controller": foo.Name,
	}

	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      foo.Spec.DeploymentName,
			Namespace: foo.Namespace,
            // リソースの親子関係を定義する
            // FooリソースはDeploymentを管理するため、Fooリソースを親、Deploymentを子、として定義する
			// ガベージコレクションにより、親のFooカスタムリソースを削除すると、子のDeploymentも削除する
			OwnerReferences: []metav1.OwnerReference{
				*metav1.NewControllerRef(foo, samplev1alpha1.SchemeGroupVersion.WithKind("Foo")),
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: foo.Spec.Replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "nginx",
							Image: "nginx:latest",
						},
					},
				},
			},
		},
	}
}
```

> - https://github.com/kubernetes/sample-controller/blob/master/controller.go
> - https://scrapbox.io/osamtimizer/%E5%AE%9F%E8%B7%B5%E5%85%A5%E9%96%80_Kubernetes_%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E3%82%B3%E3%83%B3%E3%83%88%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%BC%E3%81%B8%E3%81%AE%E9%81%93
> - https://github.com/bells17/k8s-controller-example/blob/main/pkg/controller/controller.go
> - https://kk-river108.hatenablog.com/entry/2020/12/16/184915
> - https://zenn.dev/ap_com/articles/45f7a646f62f52#main%E9%96%A2%E6%95%B0

#### ▼ main.go

![kubernetes_custome-controller_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_custome-controller_architecture.png)

main.goの処理の流れは、custome-controllerの仕組みとおおよそ一致している。

アーキテクチャ図の番号をコメントアウトで記載した。

```go
package main

import (
	"flag"
	"time"

	kubeinformers "k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/klog/v2"
	"k8s.io/sample-controller/pkg/signals"

	clientset "k8s.io/sample-controller/pkg/generated/clientset/versioned"
	informers "k8s.io/sample-controller/pkg/generated/informers/externalversions"
)

var (
	masterURL  string
	kubeconfig string
)

func main() {

	klog.InitFlags(nil)
	flag.Parse()

	// SIGINTとSIGTERMが発生した場合に、処理を停止できるようにする
	ctx := signals.SetupSignalHandler()
	logger := klog.FromContext(ctx)

	// kubeconfigを作成する
	cfg, err := clientcmd.BuildConfigFromFlags(masterURL, kubeconfig)

	if err != nil {
		logger.Error(err, "Error building kubeconfig")
		klog.FlushAndExit(klog.ExitFlushTimeout, 1)
	}

	// Deploymentを操作するために、kube-apiserverにクライアントを作成する
	kubeClient, err := kubernetes.NewForConfig(cfg)

	if err != nil {
		logger.Error(err, "Error building kubernetes clientset")
		klog.FlushAndExit(klog.ExitFlushTimeout, 1)
	}

	// Fooカスタムリソースを操作するために、kube-apiserverのクライアントのセットを作成する
	exampleClient, err := clientset.NewForConfig(cfg)

	if err != nil {
		logger.Error(err, "Error building kubernetes clientset")
		klog.FlushAndExit(klog.ExitFlushTimeout, 1)
	}

	// Deploymentを操作するために、インフォーマーを作成する
	kubeInformerFactory := kubeinformers.NewSharedInformerFactory(kubeClient, time.Second * 30)

	// Fooカスタムリソースを操作するために、インフォーマーを作成する
	exampleInformerFactory := informers.NewSharedInformerFactory(exampleClient, time.Second * 30)

	// custom-controllerを作成する
	controller := NewController(
		ctx,
		// クライアント
		kubeClient,
		exampleClient,
		// インフォーマー
		kubeInformerFactory.Apps().V1().Deployments(),
		exampleInformerFactory.Samplecontroller().V1alpha1().Foos(),
	)

	// (4) 〜 (7)
	// Deploymentを操作するために、インフォーマーをGoroutineで実行する
	// Deploymentでイベントが発生すれば、イベントハンドラーがワークキューにオブジェクトキーを格納する
	kubeInformerFactory.Start(ctx.Done())

	// (4) 〜 (7)
	// Fooカスタムリソースを操作するために、インフォーマーをGoroutineで実行する
	// Fooカスタムリソースでイベントが発生すれば、イベントハンドラーがワークキューにオブジェクトキーを格納する
	exampleInformerFactory.Start(ctx.Done())

	// (1) 〜 (3) 、(8) 〜 (9)
	// custom-controllerを実行する
	// ワークキュー以降の処理を実行する
	// https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md
	if err = controller.Run(ctx, 2); err != nil {
		logger.Error(err, "Error running controller")
		klog.FlushAndExit(klog.ExitFlushTimeout, 1)
	}
}

func init() {

	// kubeconfigを設定する
	flag.StringVar(
		&kubeconfig,
		"kubeconfig",
		"",
		"Path to a kubeconfig. Only required if out-of-cluster.",
	)

	// kube-apiserverのURLを設定する
	flag.StringVar(
		&masterURL,
		"master",
		"",
		"The address of the Kubernetes API server. Overrides any value in kubeconfig. Only required if out-of-cluster."
	)
}
```

> - https://zenn.dev/ap_com/articles/45f7a646f62f52#main%E9%96%A2%E6%95%B0

<br>
