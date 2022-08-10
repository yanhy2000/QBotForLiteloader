console.log(require == publicRequire);
// const guild_bot = require("qq-guild-bot");
const group_bot = require("oicq");
const fs = require("fs");
let path = require("path");
var log4js = require("log4js");
var logger = log4js.getLogger();

//==================================Config=================================
var bot_path = "plugins/QQ-bot/",
  conf_path = bot_path + "config.json",
  prefix = "[QBot]";
log4js.configure({
  appenders: {
    ruleConsole: { type: "console" },
    ruleFile: {
      type: "dateFile",
      filename: bot_path + "logs/server",
      pattern: "yyyy-MM-dd.log",
      maxLogSize: 10 * 1000 * 1000,
      numBackups: 100,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ["ruleConsole", "ruleFile"], level: "info" },
  },
});
function info() {
  let str = "";
  for (let i = 0; i < arguments.length; i++) {
    str = str + arguments[i];
  }
  logger.info(prefix, str);
  str = "";
}
function init() {
  if (!fs.existsSync(conf_path)) {
    // fs.mkdirSync(bot_path);
  }
  try {
    if (fs.openSync(conf_path, "r")) {
      //配置文件创建
      info("检测配置文件存在，准备启动BOT...");
    }
  } catch (err) {
    info("配置文件不存在！准备自动创建...");
    let jsonData = {
      //   server_name: "生存服务器",
      useQQGroup: false,
      // useQQGuild: false,
      bds: { cmd_prefix: "#", chat_prefix: "c", ServerChat: true, QQChat: 1, ServerEvent: true, group_cmd: true },
      qq: {
        useQRcode: true,
        my_group: 12121212,
        admin: [114514, 1919810],
        account: 114514,
        password: "如果启用了扫码，这里可以不填写",
      },
      // guild: {
      //   my_guild: "114114114114114514114",
      //   appID: 11451411514,
      //   token: "阿巴阿巴阿巴阿巴",
      //   intents: ["GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGE"],
      //   sandbox: false,
      // },
    };
    let AdvjsonData = {
      qq_group: {
        log_level: "warn",
        platform: 2,
        ignore_self: true,
        resend: true,
        brief: true,
        data_dir: bot_path + "bot_data",
      },
    };
    let text = JSON.stringify(jsonData, null, "\t");
    let file = path.join(bot_path, "config.json");
    var fd = fs.openSync(conf_path, "w");
    fs.writeSync(fd, text);
    info("文件创建成功！文件路径:" + file);
    info("-------------------------");
    info("第一次文件创建完成请手动关闭服务器并修改配置文件后使用！");
    info("-------------------------");
    fs.closeSync(fd);
    text = JSON.stringify(AdvjsonData, null, "\t");
    fd = fs.openSync(bot_path + "Advanced_Config.json", "w");
    fs.writeSync(fd, text);
    fs.closeSync(fd);
  }
}
function qq_group_init(bot, Conf) {
  if (Conf.qq.useQRcode) {
    //使用二维码登陆(推荐，可记录token多次登陆使用)
    bot
      .on("system.login.qrcode", function (e) {
        this.logger.mark("扫码后按Enter完成登录");
        process.stdin.once("data", () => {
          this.login();
        });
      })
      .on("system.login.error", function (e) {
        if (e.code < 0) this.login();
      })
      .login();
  } else {
    //使用密码登陆，可能要求滑块
    bot
      .on("system.login.slider", function (event) {
        this.logger.mark("需要验证滑块登陆！");
        process.stdin.once("data", (input) => {
          this.sliderLogin(input);
        });
      })
      .on("system.login.device", function (event) {
        this.logger.mark("验证完成后按回车登录");
        process.stdin.once("data", () => {
          this.login();
        });
      })
      .login(password);
  }
}
function qq_guild_init(ws, Conf) {
  ws.on("READY", (data) => {
    info("[bot启动] 版本:", data.msg.version);
    info("[bot启动] 用户id:", data.msg.user.id);
    info("[bot启动] 用户名:", data.msg.user.username);
    info("[bot启动] bot状态:", data.msg.user.bot);
  });
}

info("==========开始加载GBot机器人==========");
init();
var groupBot = "",
  g_client = "",
  g_ws = "";

var Conf = JSON.parse(fs.readFileSync(conf_path)),
  advConf = JSON.parse(fs.readFileSync(bot_path + "Advanced_Config.json"));

if (Conf.useQQGroup) {
  //启用群机器人
  try {
    groupBot = group_bot.createClient(Conf.qq.account, advConf.qq_group);
  } catch (e) {
    logger.warn(e);
  }
  qq_group_init(groupBot, Conf);

  function SendMsg(group_id, str) {
    groupBot.sendGroupMsg(group_id, str).catch((e) => {});
  }

  groupBot.on("message", (e) => {
    // console.log(e);
  });

  groupBot.on("message.group", (e) => {
    if (Conf.qq.my_group == e.group_id) {
      //筛选指定群===第一个版本仅支持单群
      if (e.sender.card != "") {
        info("[", e.group_id, "] ", e.group_name, " <", e.sender.card, "> ", e.raw_message);
      } else {
        info("[", e.group_id, "] ", e.group_name, " <", e.sender.nickname, "> ", e.raw_message);
      }
      // console.log(e);
    }
  });
  if (Conf.bds.ServerEvent) {
    //是否允许转发服务器事件（玩家进出服）
    mc.listen("onJoin", (pl) => {
      info("[bot事件]玩家 ", pl.name, " 进入服务器");
      let str = "玩家 <" + pl.name + "> 进入服务器";
      SendMsg(Conf.qq.my_group, str);
    });
    mc.listen("onLeft", (pl) => {
      info("[bot事件]玩家 ", pl.name, " 离开服务器");
      let str = "玩家 <" + pl.name + "> 离开服务器";
      SendMsg(Conf.qq.my_group, str);
    });
  } else {
    info("已关闭服务器事件转发!");
  }
  if (Conf.bds.ServerChat) {
    //是否允许转发服务器内聊天到群聊
    mc.listen("onChat", (pl, msg) => {
      info("[bot事件] <", pl.name, "> ", msg);
      let str = "<" + pl.name + "> " + msg;
      SendMsg(Conf.qq.my_group, str);
    });
  } else {
    info("已关闭服务器聊天转发!");
  }
  if (Conf.bds.QQChat == 1) {
    //状态为1：启用全部聊天转发，2：仅指定前缀消息转发(先不做)，0：不转发
    groupBot.on("message.group", (e) => {
      if (Conf.qq.my_group == e.group_id && e.raw_message.charAt(0) != Conf.bds.cmd_prefix) {
        //这里填充为bds的指令，用于转发到服内
        if (e.sender.card != "") {
          let str = 'tellraw @a {"rawtext":[{"text":"§2<' + e.sender.card + "> " + e.raw_message + '"}]}';
          mc.runcmdEx(str);
        } else {
          let str = 'tellraw @a {"rawtext":[{"text":"§2<' + e.sender.nickname + "> " + e.raw_message + '"}]}';
          mc.runcmdEx(str);
        }
      }
    });
  } else if (Conf.bds.QQChat == 2) {
    groupBot.on("message.group", (e) => {
      if (
        Conf.qq.my_group == e.group_id &&
        e.raw_message.charAt(0) != Conf.bds.cmd_prefix &&
        e.raw_message.charAt(0) == Conf.bds.chat_prefix
      ) {
        //这里填充为bds的指令，用于转发到服内
        let cont = e.raw_message.split(Conf.bds.chat_prefix)[1];
        if (e.sender.card != "") {
          let str = 'tellraw @a {"rawtext":[{"text":"§2<' + e.sender.card + "> " + cont + '"}]}';
          mc.runcmdEx(str);
        } else {
          let str = 'tellraw @a {"rawtext":[{"text":"§2<' + e.sender.nickname + "> " + cont + '"}]}';
          mc.runcmdEx(str);
        }
      }
    });
  } else if (Conf.bds.QQChat == 0) {
    info("已关闭QQ群聊天转发!");
  }
  if (Conf.bds.group_cmd) {
    groupBot.on("message.group", (e) => {
      if (Conf.qq.admin.indexOf(e.user_id) != -1) {
        //判断发言者是否为管理员
        // if (cmd_prefix.test(e.raw_message))
        if (e.raw_message.charAt(0) == Conf.bds.cmd_prefix) {
          //当bds指令处理，前缀默认为#
          if (e.raw_message == "#stop") {
            SendMsg(Conf.qq.my_group, "服务器即将关闭...");
            setTimeout(() => {
              mc.runcmdEx("stop");
              process.exit(0);
            }, 1000);
          } else {
            let str = e.raw_message.split(Conf.bds.cmd_prefix);
            let res = mc.runcmdEx(str[1]);
            let pattern =
              /Unknown command: (.+). Please check that the command exists and that you have permission to use it./;
            let err_cmd = res.output.match(pattern);
            if (pattern.test(res.output)) {
              //判断指令返回有没有错误，
              SendMsg(Conf.qq.my_group, "指令错误:" + err_cmd[1]);
            } else {
              SendMsg(Conf.qq.my_group, res.output);
            }
          }
        }
      }
    });
  }

  //=============
} else {
  info("已禁用QQ群机器人！");
}

// if (Conf.useQQGuild) {
//   try {
//     g_client = guild_bot.createOpenAPI(Conf.guild);
//     g_ws = guild_bot.createWebsocket(Conf.guild);
//   } catch (e) {
//     logger.warn(e);
//   }
//   qq_guild_init(g_ws, Conf);
// } else {
//   info("已禁用QQ频道机器人！");
// }
info("==========GBot机器人加载完成==========");