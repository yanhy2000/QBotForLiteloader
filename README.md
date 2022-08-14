# QBotForLiteloader 简介

本插件用于在Liteloader加载下在MCBDS服务端内使用QQ群Bot（频道Bot暂未开发）

Bot框架采用[oicq](https://github.com/takayama-lily/oicq),目前使用[Liteloader](https://github.com/LiteLDev/LiteLoaderBDS)加载本插件，开发时使用2.5.0版本，推荐使用版本>2.5.0

## v0.0.4 更新说明
1. 修复密码登陆模块，新增错误监听事件
2. 由于二维码是OICQ框架发起，因此在部分控制台上无法正确显示且无法修复，在win桌面环境、面板服终端环境下推荐使用**密码登陆**，默认配置文件已修改为密码登陆
3. **由于tx扫码登陆策略更改，现在只能在同一个IP内的手机电脑进行扫码**，推荐在本地电脑扫码后，将*plugins/QBot/bot_data*文件夹打包上传至服务器进行替换，即可正常使用
4. 密码登陆时请在配置文件输入账号及密码，并将扫码设置为false即可；正常情况下只需要打开链接在浏览器扫码即可，如遇到需要滑块输入ticket可配合[TxCaptchaHelper](https://github.com/mzdluo123/TxCaptchaHelper)，密码登陆后可长期使用
5. 修复在BDS输入stop后一直卡在*Quit correctly*的问题(如依然存在卡住的问题请提issus并截图最后几行，这个问题较为玄学，疑似log4js日志造成)



## 功能
1. 群聊聊天内容转发至服聊(可全部转发或者自定义前缀转发）
2. BDS服务器聊天转发至Q群
3. Bot管理员可在群内发出指令至BDS控制台（自定义操作指令前缀）
4. 群内查服指令，可查询本机或者其他服（可自定义指令内容）
5. （正在开发）查询服务器系统相关状态

# 使用环境
- Liteloader >=2.5.0
- BDS 1.19.20

# 使用方法
- 配置一个 Liteloader>=2.5.0 版本的BDS服务端(过程请参考[Liteloader安装](https://github.com/LiteLDev/LiteLoaderBDS/blob/main/README_zh-cn.md#-%E5%AE%89%E8%A3%85))
- 下载本项目中[Release](https://github.com/yanhy2000/QBotForLiteloader/releases)的最新版本插件，后缀为.llplugin格式
- 将插件放置在 BDS根目录/plugins 文件夹内，不需要改名以及其他操作
- 启动服务端，会自动进行插件初始化安装，等待开服完成后再手动关服
- 打开文件夹 BDS根目录/plugins/QBot ,打开*config.json*配置文件，对照下方详解进行修改，其中高级配置文件*Advanced_Config.json*无需修改，高级配置文件后续会更新详解
- 保存后重新开服，开服完成后自动进入登录模式，如扫码登陆异常请切换其他方式

# 配置文件说明
*机器人管理员与群管理员不同，前者需要在配置文件手动设置*

第一次启动本插件会由Liteloader自动装载相关依赖，且插件会生成配置文件在*BDS/plugins/QBot*内，您需要修改**Config.json**文件内相关内容，详解如下：

```
{
	"useQQGroup": false,//默认为禁用，使用群机器人时请启用，设置为true
	"qq": {
		"useQRcode": true,//是否使用扫码登陆，为true时最下面的密码失效，否则请手动填写密码，如要扫码需要在自己电脑上扫码后再上传服务器，tx现在不允许异地登录扫码
		"my_group": 12121212,//群号（目前只开放这一个，多群等后续开放）
		"admin": [//机器人管理员，可在群内发指令到后台
			114514,
			1919810
		],
		"account": 114514,//机器人账号
		"password": "扫码仅支持在同一个IP的手机扫码！如果启用了扫码，这里可以不填写"
	}
	"bds": {
		"ServerChat": true,//是否开启服务器聊天转发至群
		"chat_prefix": "c",//用户从群内发聊天信息至BDS的前缀
		"QQChat": 1,//QQ群聊天设置，0=不转发至服务器；1=全部聊天转发至服务器(小卡片、图片等会简化为[图片]等传输);2=不全部转发，而是使用前面设置的聊天前缀来转发至服内
		"ServerEvent": true,//是否转发服务器事件，目前的事件有：玩家进出服
		"group_cmd": true//是否开启机器人管理员在群内发指令到BDS后台
		"cmd_prefix": "#",//机器人管理员从群内向BDS发指令的前缀
		motd: true,//是否开启群聊内全部人使用查服的权限（功能含查本机和查其他服，例如"查服","查服 a.abc.com 19132"，端口可不输入）
		motd_cmd: "查服",//群内使用查服指令的前缀，可以用符号、文字、数字等，不能有空格在指令内
	},
	server: {
		ip: "localhost",//目前用于查询服务器时设置本机ip，后续可能用于多服联动
		port: 19132,//同上
	},
}
```

高级设置不需要修改，涉及到群机器人设置，默认使用apad设备...

### 更多内容待补充，本插件正在开发中...