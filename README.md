# QBotForLiteloader 简介

本插件用于在Liteloader加载下在MCBDS服务端内使用QQ群Bot与QQ频道Bot（后者暂未开发）

Bot框架采用[oicq](https://github.com/takayama-lily/oicq),目前使用[Liteloader](https://github.com/LiteLDev/LiteLoaderBDS)加载本插件，开发时使用2.4.3-dev版本

## v0.0.3 更新说明
1. 新增Motd模块，用于查询服务器，默认两种模式：查服、查服+参数，可用于查询本机或其他BE服
2. 移除频道部分，后续再做打算
3. 适配Liteloader 2.5.0版本，可用于BDS1.19.20版本

# 使用方法
将**支持node插件的Liteloader版本**装载至BDS-Win版后，下载[Release](https://github.com/yanhy2000/QBotForLiteloader/releases)中的.llplugin文件，并将其放置BDS文件夹内的plugins文件夹（不需要改名）,启动服务端即可
第一次启动后请关服并手动修改配置文件，修改后再次开服，如果遇到扫码登陆发现控制台的二维码不整齐，可以去 plugins/QBot/bot_data/qq号/ 文件夹内手动打开图片扫码，后续会进行优化，静等开发

# 配置文件说明
第一次启动本插件会由Liteloader自动装载相关依赖，且插件会生成配置文件在*BDS/plugins/QBot*内，您需要修改**Config.json**文件内相关内容，详解如下：

*机器人管理员与群管理员不同，前者需要在配置文件手动设置*
```
{
	"useQQGroup": false,//默认为禁用，使用群机器人时请启用，设置为true
	"qq": {
		"useQRcode": true,//是否使用扫码登陆，为true时最下面的密码失效，否则请手动填写密码
		"my_group": 12121212,//群号（目前只开放这一个，多群等后续开放）
		"admin": [//机器人管理员，可在群内发指令到后台
			114514,
			1919810
		],
		"account": 114514,//机器人账号
		"password": "如果启用了扫码，这里可以不填写"
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
