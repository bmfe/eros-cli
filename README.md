# eros-cli
A simple CLI for scaffolding [weex](http://weex.apache.org/cn/) projects, we provide [eros-template](https://github.com/bmfe/eros-template) to quickly build small and medium sized app.

## Installation
Prerequisites: Node.js (>=4.x, 6.x preferred), npm version 3+ and Git.

```
$ npm install -g eros-cli
```

If you were in China, we recommand you install [cnpm](https://npm.taobao.org/) before.

```
$ cnpm install -g eros-cli
```

## Usage
You can code `eros -h` to show a profile.
```
eros-cli:
The following instructions are provided to help you build app !

 build      | build for eros project.
 dev        | start dev server.
 init       | generate eros template.
 install    | install eros platform and components' librarys.
 pack       | pack full dose zip and send to eros platform project.
 update     | update eros-template file by path.
 mock       | start a mock server.
```

## Command
#### **build**: 

eros cli build prod's full zip, contain js bundle, assets/images and iconfont. 
```
$ eros build
```
build full zip and copy to specified path, post full zip info to your server, you can use [eros-publish](https://github.com/bmfe/eros-publish) for collocation.
```
$ eros build -s url
```
build full zip and copy to specified path, generate full zip and diff zip in  [eros-template](https://github.com/bmfe/eros-template)'s dist folder.
```
$ eros build -d
```
build full zip and copy to specified path, generate full zip and diff zip in  [eros-template](https://github.com/bmfe/eros-template)'s dist folder， post full zip info to your server at same time.
```
$ eros build -s url -d
```
#### **dev**:

start dev server, you can change default `server.path` and `server.port` in `eros-template/config/eros.dev.js`, eros' app can refresh current view when your local code is changed and saved, **You can debug by forward agent software in real machine.**

forward agent software recommand:

* windows: fidder
* ios: charles

```
$ eros dev
```
#### **init**:

generate [eros-template](https://github.com/bmfe/eros-template) in current execution directory, you can quickly build your app through
 it.
```
$ eros init
```
#### **~install~** (abandon)

eros developed many functions based on weex (self-module), you don't have to worry about the version of the weex update, we will update weex in time, every time we have a change ( new module / bugfix / weex update and so on), you can install them to use it.
```
$ eros install
```

install eros ios sdk.
```
$ eros install ios
```
install eros android sdk.
```
$ eros install android
```
install both sdk.
```
$ eros install all
```
#### **pack**
build prod's full zip and send it to platforms's ios/android built-in package storage path.
```
$ eros pack
```

pack eros ios inner js bundle.
```
$ eros pack ios
```
pack eros android inner js bundle.
```
$ eros pack android 
```
pack eros ios && android inner js bundle.
```
$ eros pack all
```
#### **update**
you can update [eros-template](https://github.com/bmfe/eros-template)'s every file/path when eros-template has updated, **`but your must use it be careful, when the file/path has be changed by yourself that you want to update`**. 
```
$ eros update
```

update eros ios sdk.
```
$ eros update ios
```
update eros android sdk.
```
$ eros update android 
```
update template by path.
```
$ eros update template path
```
#### **mock**
start mock server, you can change default `proxy` and `mockServer` in `eros-template/config/eros.dev.js`.
```
$ eros mock
```

## Develop & Test

* cd eros-template or eros init project `parent directory`.
* git clone https://github.com/bmfe/eros-cli
* cd eros-cli && git checkout dev
* npm/cnpm i
* cd eros-template or eros init project
* node ../eros-cli/bin/eros.js + command

## Change Log

### 2.0.8-beta
* [bugfix] remove eros pack android umeng appid.
* [bugfix] jsServer undefined when packing inner zip.

### 2.0.7
* [remove] eros install.
* [remove] eros update ios/android (eros update tempate still in there).
* [bugfix] ip.txt send to template.
* [bugfix] newPack.config.js -> newpack.config.js.
* [bugfix] gulp in not deined.
* [bugfix] cannot find module.
* [bugfix] sass less stylus not effect.
* [feature] add socketServer.
* [feature] add `$ eros config reload`.
* [feature] eros init support choose pure template.
* [optimize] change babel to happypack.
* [optimize] make process.env.NODE_ENV customizable.

### 2.0.6-beta.4
* [bugfix] weex-loader down to 0.5.2.

### 2.0.6-beta.2/3
* [feature] update `weex-loader` to newest，support `recyle-list`.
* [feature] add socket server, start to develop save auto refresh.
* [bugfix] eros build -d report wrong info.

### 2.0.6-beta.1
* [bugfix] eros pack and eros build generate different zip.
* [bugfix] eros dev not add app board file.

### 2.0.6
* [optimize] support weex debug.
* [feature] add eros run ios.


### 2.0.5
* cli[add]: eros install all 可同时下载两端的 eros-sdk
* cli[add]: 支持在 init 的时候输入安卓的包名
* cli[fix]: eros mock 报错问题
* cli[mod]: eros cli 的帮助日志更新
* cli[del]: 由于 widget 已提交到 npm 上，目录下不在存在 widget，所以去掉 eros update widget 指令

### 2.0.4
* fix: eros pack all 失效问题
* fix: eros pack ios 失效问题
* fix: eros pack android 失效问题

### 2.0.3
* add: eros pack all
* add: eros pack ios
* add: eros pack android

### 2.0.2
* add: eros install ios
* add: eros install android
* add: eros update ios
* add: eros update android
* add: eros update template your_path
* add: eros update widget

### 2.0.1
* fix: eros build 会打内置包的情况
* add: eros pack --all 同时打两端的内置包

### 2.0.0-beta.14-16
* 添加 eslint 编译

### 2.0.0-beta.13
* 修复 windows 上报打包解析错误的bug

### 2.0.0-beta.12
* eros pack 没有打包本地静态资源

### 2.0.0-beta.11
* eros pack 没有打包本地静态资源

### 2.0.0-beta.10
* eros pack 没有打包本地静态资源

### 2.0.0-beta.9
* fix 脚手架 dev 报错的问题

### 2.0.0-beta.8
* 删除组件更新

### 2.0.0-beta.7
* bugfix: 修复 eros init 报错的问题

### 2.0.0-beta.6
* 脚手架更新： 加密算法
* 脚手架更新： 添加tree-shaking
* 脚手架更新： 精简体积，删除无用代码
* 脚手架更新： eros update 可选择不再覆盖


### 2.0.0-beta.5
* pack 动态给安卓添加配置信息。

### 2.0.0-beta.4
* 优化差分包逻辑，增加webpack输出提示。

### 2.0.0-beta.2
* 新增eros update

### 2.0.0-beta.1
* add eros init
* add eros build
* add eros dev
* add eros pack (--ios/android)
* add eros install (--ios/android)
* 兼容 windows
* minWeex 打包问题
* 打包js的时候 混淆会顺便删除map文件减少体积
* iconfont 打包路径问题
* 修改 eros NODE_env 搭配修复eros debug问题
* fix diff bug
* build assets 时候多调用了打 iconfont md5 方法
