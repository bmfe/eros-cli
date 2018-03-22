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
#### **install**

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
