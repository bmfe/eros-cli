<!--
@Author: songqi
@Date:   2016-07-19
@Email:  songqi@benmu-health.com
@Last modified by:   songqi
@Last modified time: 2017-09-12

-->

# 0.5.0
* minWeex 打包问题
* 打包js的时候 混淆会顺便删除map文件减少体积

# 0.4.36
* iconfont 打包路径问题

# 0.4.35
* 修改 eros NODE_env 搭配修复eros debug问题
* 去除警告

# 0.4.34
* bm update 命令问题

# 0.4.33
* node-sass问题

# 0.4.32
* node-sass问题

# 0.4.31
* 支持stylus

# 0.4.30
* diff bug

# 0.4.29
* 依赖报错问题

# 0.4.28
* 修复依赖的问题

# 0.4.27
* 保证老版本可用

# 0.4.26
* 支持eros 新版 旧版不兼容

# 0.4.23
* 支持eros vue文件作为入口

# 0.4.22
* 差分包bug

# 0.4.21
* 差分包bug

# 0.4.20
* 差分包bug

# 0.4.19
* 差分包bug

# 0.4.18
* build assets 时候多调用了打 iconfont md5 方法

# 0.4.17
* 急速修复 eros 打内置包的问题 原因是 ios目录为\ windows是/ 醉了 +1

# 0.4.16
* 急速修复 eros 打内置包的问题 原因是 ios目录为\ windows是/ 醉了

# 0.4.15
* 修复 eros update 权限

# 0.4.14
* 修复 eros update bug

# 0.4.13
* 修改 vue-loader 配置

# 0.4.12
* 修改 vue-loader 配置

# 0.4.11
* 修改 gulp-sass 的版本依赖

# 0.4.9
* 如果配置中不传默认打开页面路径 ，就不调用openServer方法

# 0.4.8
* 修改 app 兼容编译

# 0.4.7
* weex-eros 整体兼容 windows
* 新增 bm eros init
* 新增 bm eros update
* 新增 bm eros build
* 新增 bm eros pack --ios/android
* 新增 bm eros install --ios/android
* 新增组件更新逻辑 bm eros install --fe

# 0.4.6
* weex-eros 重构代码分层
* 增加bm eros init 指令直接下载模板
* 支持assets资源文件打包

# 0.4.5
* weex-eros 删除多页配置信息log

# 0.4.4
* weex-eros 打内置包时候丢失版本信息bug

# 0.4.3
* weex-eros-version bug

# 0.4.2
* 优化 eros 提示和部分逻辑

# 0.4.1
* eros 指令更新，并兼容以前版本
* bm eros dev
* bm eros pack
* bm eros install
* 优化控制台打印和交互

# 0.4.0
* eros 指令全面更新
* bm eros server
* bm eros min
* bm eros init
* 优化控制台打印和交互

# 0.3.9
* BM eros init ios/android 在控制台打印进度

# 0.3.8
* 添加init中weex-eros相关逻辑

# 0.3.7
* update -> init
* 新增 BM eros min 发送 eros zip包到conifg中对应的文件目录下
* 新增 BM eros init ios 加载和更新ios依赖
* 新增 BM eros init android 加载和更新android依赖
* 添加init中weex-eros相关逻辑

# 0.3.6
* 优化eros打包逻辑
* 新增 BM eros min 发送 eros zip包到conifg中对应的文件目录下
* 新增 BM eros update ios 加载和更新ios依赖
* 新增 BM eros update android 加载和更新android依赖

# 0.3.5
* 修改weex-eros中android传输路径错误的bug

# 0.3.4
* 兼容weex-eros

# 0.3.3
* 转发由于各种问题还无法实现

# 0.3.2
* 非当前开发目录转发到线上

# 0.3.1
* 调整 init 和 update 命令设计

# 0.3.0
* 发布完整版本

# 0.2.53
* 修复 export css 报错的问题

# 0.2.52
* 支持less引入及其编译

# 0.2.51
* 打包加入file-loader 加入vue预编译

# 0.2.50
* js中支持import scss css文件

# 0.2.51
* 打包加入file-loader 加入vue预编译

# 0.2.50
* js中支持import scss css文件

# 0.2.49
* 区分上传环境

# 0.2.48
* weex 是否创建差分包

# 0.2.47
* weex 将所有相关信息压到 zip 中

# 0.2.46
* weex 加上 iconfont 的打包

# 0.2.45
* weex diff 增加 jsPath 参数

# 0.2.44
* weex 生成的 zip 包是 diff 的

# 0.2.43
* weex 时生成标准的 MD5 文件 map

# 0.2.42
* 兼容使用 babel-runtime

# 0.2.41
* 修复 weex zip 包版本更新 bug 不要再有 bug 了

# 0.2.40
* 修复 weex zip 包版本更新 bug

# 0.2.39
* weex 服务器发送地址

# 0.2.38
* 支持 babel stage-0

# 0.2.37
* weex 发布的版本更新服务，通过配置可以生成服务

# 0.2.36
* 添加 update 命令

# 0.2.35
* 初始化项目之后，添加 gitignore 文件

# 0.2.34
* 添加初始化一个 vue2 为基础的框架底层

# 0.2.33
* 删除对 ngAnnotate 的依赖，不知道为什么报错，引入这个包就会报错

# 0.2.32
* 不配置监控时，展示正常的 html

# 0.2.31
* 自动化监控，加载资源时间无法获取

# 0.2.30
* 自动化监控的支持

# 0.2.29
* 添加 weex 中 Vue 对 sass 的支持

# 0.2.28
* 添加 css 和 js 的组件化命令 fetchCss 和 fetchJs

# 0.2.27
* minWeex 添加 framework 配置

# 0.2.26
* 去掉 webpack 的热加载，减小体积

# 0.2.25
* 增加对 baseLibs 的编译忽略

# 0.2.24
* 修改 vue 并对 weex 提供支持

# 0.2.23
* 对 weex 的打包压缩时，获取去 osVersion 参数

# 0.2.22
* 对 weex 的打包压缩时，文件目录不对应的 bug

# 0.2.21
* 对 weex 的打包压缩，便于之后做版本控制

# 0.2.20
* 对 weex 的服务支持

# 0.2.19
* 添加对 we 文件的编译支持

# 0.2.18
* fetchcss 命令集成

# 0.2.17
* 兼容老发布和 vue2 的支持

# 0.2.16
* 增加对 vue2 的支持

# 0.2.15
* BM mock 时本地支持 https 的服务

# 0.2.14
* BM mock 时支持 https 的转发

# 0.2.13
* BM mock 时写入 path 未引入 bug

# 0.2.12
* BM min 时写入 html version 多线程问题

# 0.2.11
* BM min 时写入 html version 号由于异步问题写入失败

# 0.2.10
* BM min 时新增日志

# 0.2.9
* BM server 和 min 使用不同 webpack devtool

# 0.2.8
* webpack devtool 修改 参数为 eval

# 0.2.7
* webpack devtool 修改

# 0.2.6
* 删除 map 文件前判断是否存在

# 0.2.5
* 单独加上一个代理的命令

# 0.2.4
* 代理的返回加上 header

# 0.2.3
* 打包后，删除 MD5 之前的资源文件

# 0.2.2
* 增加代理对于 https 的支持

# 0.2.1
* 增加对于 https 的支持

# 0.2.0
* 修改 gulp-md5 的 bug

# 0.1.9
* 修改 gulp-md5 的 bug

# 0.1.8
* 修改文件引用

# 0.1.7
* min 代码压缩开启多进程，进一步压缩时间

# 0.1.6
* babel 编译 exclude 增加 base_libs 目录

# 0.1.5
* 需要进一步优化只支持特定资源的跨域

# 0.1.4
* 支持跨域代理，cors 中间件支持跨域访问任何资源

# 0.1.3
* 修改 dependence

# 0.1.2
* 修改 dependence

# 0.1.1
* 去掉配置文件的 jsExt 配置，导出的 js 文件只能以 .js 结尾，其他的 js 文件可以使用其他后缀
* 支持 .vue 的编译，注意实际开发的项目需要安装编译环境

# 0.1.0
* webpack 的 babel-loader 优化，es6 可编译成 es5
* js 文件后缀名可配置，es6 的文件以 .es6 结尾

# 0.0.9
* 修改命令注册方式（commands文件夹下 不以‘_’开头 的 一级子文件 为命令）
* 添加install命令（根据当前项目中的config.js文件配置，安装bower依赖、设置bower私有服务器）

# 0.0.8
* 修改多层级 js/css 的 MD5 映射到 html 中 MD5 不变的 bug

# 0.0.7
* 修改对 angular 的依赖

# 0.0.6
* 修改代理的 bug

# 0.0.5
* 加上打包时对 jshint 的支持

# 0.0.4
* 去掉对约 loader 的依赖，新增对 angular、es6 的支持

# 0.0.3
* server 无法读取配置文件
* 修复：配置文件的异步读取，webpack loader 文件解决方案

# 0.0.2
* 发布上去连用都不能用，迅速发布第二版
* 修复：bin 没有加 shell 脚本读取方式；dependencies 无法加载

# 0.0.1
* 第一版发布，试运行
