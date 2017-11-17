/*
 * @Author: Zero 
 * @Date: 2017-11-14 10:43:06 
 * @Last Modified by: Zero
 * @Last Modified time: 2017-11-16 18:48:18
 */
# 2.0.0-beta.5
* pack 动态给安卓添加配置信息。

# 2.0.0-beta.4
* 优化差分包逻辑，增加webpack输出提示。

# 2.0.0-beta.2
* 新增eros update

# 2.0.0-beta.1
### func
* 新增    eros init
* 新增    eros build
* 新增    eros dev     
* 新增    eros pack (--ios/android)
* 新增    eros install (--ios/android)

### bugfix
* 兼容windows
* minWeex 打包问题
* 打包js的时候 混淆会顺便删除map文件减少体积
* iconfont 打包路径问题
* 修改 eros NODE_env 搭配修复eros debug问题
* 支持stylus
* fix diff bug
* build assets 时候多调用了打 iconfont md5 方法
