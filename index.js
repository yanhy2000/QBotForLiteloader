// console.log(require == publicRequire);
// const guild_bot = require("qq-guild-bot");
var version = 0.6;
const group_bot = require("oicq");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const { Server } = require("./Motd");
const log4js = require("log4js");
const logger = log4js.getLogger();
//==================================Config=================================
var bot_path = "plugins/QBot/",
  conf_path = bot_path + "config.json",
  photo_view = process.cwd() + "\\plugins\\nodejs\\QBot\\view\\ImagePreview.exe",
  prefix = "[QBot]";
var Conf = {
  useQQGroup: false,
  // useQQGuild: false,
  qq: {
    my_group: 123123,
    admin: [123123],
    account: 123123,
    password: "",
  },
  bds: {
    ServerChat: true, //服聊->群聊
    chat_prefix: "chat",
    QQChat: 2, // 0：不转发群->服  1：群->服 全部聊天都转发 2：群->服 限定前缀转发，如"chat 你好"
    ServerEvent: true, //进出服事件
    group_cmd: true, //群内管理员指令
    private_cmd: true, //私聊管理员指令
    cmd_prefix: "cmd", //指令前缀,如"cmd list"
    motd: true, //查服功能，可查本服、其他服
    motd_cmd: "查服", //查服前缀，如"查服" "查服 server.com" "查服 server.com 19132"
  },

  server: {
    ip: "localhost",
    port: 19132,
  },
  format: {
    ServerChat: "<{name}> {msg}",
    QQChat: "§2[QQ]{name}> {msg}",
    ServerEvent_leave: "玩家 <{name}> 离开服务器",
    ServerEvent_join: "玩家 <{name}> 进入服务器",
    cmd_error: "指令错误: {cmd_err}",
    cmd_succ: "指令输出:{cmd_out}",
  },
  config_version: version,
};

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
function warn() {
  let str = "";
  for (let i = 0; i < arguments.length; i++) {
    str = str + arguments[i];
  }
  logger.warn(prefix, str);
  str = "";
}
function init() {
  if (!fs.existsSync(conf_path)) {
  }
  try {
    if (fs.openSync(conf_path, "r")) {
      //配置文件创建
      if (JSON.parse(fs.readFileSync(conf_path)).config_version == version) {
        info("配置文件存在，准备启动BOT...");
      } else {
        info("配置文件版本不符(v", version, ")，请移出旧版配置文件重新生成！");
        process.exit(0);
      }
    }
  } catch (err) {
    info("配置文件不存在！准备创建...");
    let jsonData = Conf;
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

mc.regConsoleCmd("botlogin", "重新登录机器人", (e) => {
  groupBot.login(Conf.qq.password);
});

function qq_group_init(bot, Conf) {
  if (Conf.qq.password == "") {
    //使用二维码登陆(仅在本地登陆，需同一个IP)
    info("本次使用二维码扫码进行登陆");
    info("扫码后输入 botlogin 完成登录");
    info("如果在win下二维码显示异常请输入 qrcode 打开弹窗扫码(不支持面板服),扫码仅支持在同一个IP的手机扫码!");
    bot.login();
    mc.listen("onConsoleCmd", (e) => {
      if (e == "qrcode") {
        info("准备打开窗口二维码...");
        let qr_path =
          photo_view + " " + process.cwd() + "\\plugins\\QBot\\bot_data\\" + Conf.qq.account + "\\qrcode.png";
        childProcess.exec(qr_path, (err, stdout, stderr) => {
          if (err) {
            info("弹窗扫码打开失败，请前往", qr_path, "手动扫码！");
          } else {
            bot.login();
          }
        });
        return false;
      }
    });
  } else {
    //使用密码登陆，可能要求滑块(可使用短信验证）
    info("本次使用密码进行登陆");
    bot
      .on("system.login.qrcode", (a) => {
        // info(a.image)
      })
      .on("system.login.slider", (e) => {
        let url_ = e.url.replace("ssl.captcha.qq.com", "txhelper.glitch.me");
        info(
          "==================\n可使用txhelper进行辅助获取ticket(使用帮助https://txhelper.glitch.me/),浏览器打开该url配合APP便于获取ticket:",
          url_
        );
        info("输入指令:ticket <ticket>");
        mc.listen("onConsoleCmd", (ticket) => {
          if (ticket.startsWith("ticket")) {
            bot.submitSlider(String(ticket.split(" ")[1]).trim());
            return false;
          }
        });
      })
      .on("system.login.device", () => {
        info("输入密保手机收到的短信验证码后按下回车键继续(如果显示未知指令需再输入一次)");
        bot.sendSmsCode();
        info("输入指令:sms <smscode>");
        mc.listen("onConsoleCmd", (input) => {
          if (input.startsWith("sms")) {
            bot.submitSlider(String(input.split(" ")[1]).trim());
            return false;
          }
        });
      })

      .on("system.offline", () => {
        info("账号已退出！等待自动重连或者输入 relogin 即可重新登录！");
      })
      .on("system.login.error", (e) => {
        info("登录时遇到错误！详细信息：", e.message);
      })
      .login(Conf.qq.password);
  }
}

info("==========开始加载GBot机器人==========");
init();
var groupBot = "";
(Conf = JSON.parse(fs.readFileSync(conf_path))),
  (advConf = JSON.parse(fs.readFileSync(bot_path + "Advanced_Config.json")));
mc.listen("onServerStarted", () => {
  if (Conf.useQQGroup && Conf.qq.my_group != 123123 && Conf.qq.account != 123123) {
    //启用群机器人
    try {
      groupBot = group_bot.createClient(Conf.qq.account, advConf.qq_group);
      qq_group_init(groupBot, Conf);
    } catch (e) {
      warn("机器人实例创建失败，请检查配置文件中的机器人账户与群号!");
      process.exit(0);
    }

    groupBot.on("message.group", (e) => {
      if (Conf.qq.my_group == e.group_id) {
        //筛选指定群=
        if (e.sender.card != "") {
          info("[", e.group_id, "] ", e.group_name, " <", e.sender.card, "> ", e.raw_message);
        } else {
          info("[", e.group_id, "] ", e.group_name, " <", e.sender.nickname, "> ", e.raw_message);
        }
      }
      if (Conf.bds.motd) {
        let str = e.raw_message.split(" ");
        if (str.indexOf(Conf.bds.motd_cmd) == 0) {
          let str_len = str.length;
          if (str_len > 1) {
            //如果查服指令有参数，将处理为查其他服 查服 mcserver.com 19132
            if (str_len == 2) {
              let ip = str[1];
              motd_be(ip, 19132, e.group_id, false);
            } else if (str_len == 3) {
              let ip = str[1],
                port = str[2];
              motd_be(ip, port, e.group_id, false);
            }
          } else if (str_len == 1 && e.raw_message == Conf.bds.motd_cmd) {
            //查服指令无参数，仅指令，为查询本服
            motd_be(Conf.server.ip, Conf.server.port, e.group_id, true);
          }
        }
      }
    });
    if (Conf.bds.ServerEvent) {
      //是否允许转发服务器事件（玩家进出服）
      mc.listen("onJoin", (pl) => {
        info("[bot事件]玩家 ", pl.realName, " 进入服务器");
        let str = Conf.format.ServerEvent_join.replace("{name}", pl.realName);
        SendMsg(Conf.qq.my_group, str);
      });
      mc.listen("onLeft", (pl) => {
        info("[bot事件]玩家 ", pl.realName, " 离开服务器");
        let str = Conf.format.ServerEvent_leave.replace("{name}", pl.realName);
        SendMsg(Conf.qq.my_group, str);
      });
    } else {
      info("已关闭服务器事件转发!");
    }
    if (Conf.bds.ServerChat) {
      //是否允许转发服务器内聊天到群聊
      mc.listen("onChat", (pl, msg) => {
        let name = pl.realName;
        info("[bot事件] <", pl.realName, "> ", msg);

        // let str = "<" + name + "> " + msg;
        let str = Conf.format.ServerChat.replace("{name}", name).replace("{msg}", msg);
        SendMsg(Conf.qq.my_group, str);
      });
    } else {
      info("已关闭服务器聊天转发!");
    }
    if (Conf.bds.QQChat == 1) {
      //状态为1：启用全部聊天转发，2：仅指定前缀消息转发，0：不转发
      groupBot.on("message.group", (e) => {
        if (Conf.qq.my_group == e.group_id && !e.raw_message.startsWith(Conf.bds.cmd_prefix)) {
          //这里填充为bds的指令，用于转发到服内
          let msg = e.raw_message;
          if (e.sender.card != "") {
            let str =
              'tellraw @a {"rawtext":[{"text":"' +
              Conf.format.QQChat.replace("{name}", e.sender.card).replace("{msg}", msg) +
              '"}]}';
            mc.runcmdEx(str);
          } else {
            let str =
              'tellraw @a {"rawtext":[{"text":"' +
              Conf.format.QQChat.replace("{name}", e.sender.nickname).replace("{msg}", msg) +
              '"}]}';
            mc.runcmdEx(str);
          }
        }
      });
    } else if (Conf.bds.QQChat == 2) {
      groupBot.on("message.group", (e) => {
        if (
          Conf.qq.my_group == e.group_id &&
          !e.raw_message.startsWith(Conf.bds.cmd_prefix) &&
          e.raw_message.startsWith(Conf.bds.chat_prefix)
        ) {
          //聊天信息，填充为bds的指令，用于转发到服内
          let msg = e.raw_message.split(Conf.bds.chat_prefix)[1];
          if (e.sender.card != "") {
            let str =
              'tellraw @a {"rawtext":[{"text":"' +
              Conf.format.QQChat.replace("{name}", e.sender.card).replace("{msg}", msg) +
              '"}]}';
            mc.runcmdEx(str);
          } else {
            let str =
              'tellraw @a {"rawtext":[{"text":"' +
              Conf.format.QQChat.replace("{name}", e.sender.nickname).replace("{msg}", msg) +
              '"}]}';
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
          if (e.raw_message.startsWith(Conf.bds.cmd_prefix)) {
            //当bds指令处理，前缀默认为#
            if (e.raw_message.split(Conf.bds.cmd_prefix)[1] == "stop") {
              info("服务器即将关闭...");
              setTimeout(() => {
                mc.runcmdEx("stop");
                process.exit(0);
              }, 2000);
            } else {
              let str = e.raw_message.split(Conf.bds.cmd_prefix);
              let res = mc.runcmdEx(str[1]);
              let pattern =
                /Unknown command: (.+). Please check that the command exists and that you have permission to use it./;
              let err_cmd = res.output.match(pattern);
              if (pattern.test(res.output)) {
                //判断指令返回有没有错误，
                SendMsg(Conf.qq.my_group, Conf.format.cmd_error.replace("{cmd_err}", err_cmd[1]));
              } else {
                SendMsg(Conf.qq.my_group, Conf.format.cmd_succ.replace("{cmd_out}", res.output));
              }
            }
          }
        }
      });
    }
    if (Conf.bds.private_cmd) {
      groupBot.on("message.private", (e) => {
        if (Conf.qq.admin.indexOf(e.user_id) != -1) {
          info("[", e.user_id, "] <", e.sender.nickname, "> ", e.raw_message);
          //判断发言者是否为管理员
          if (e.raw_message.startsWith(Conf.bds.cmd_prefix)) {
            //当bds指令处理，前缀默认为#
            if (e.raw_message.split(Conf.bds.cmd_prefix)[1] == "stop") {
              info("服务器即将关闭...");
              setTimeout(() => {
                mc.runcmdEx("stop");
                process.exit(0);
              }, 2000);
            } else {
              let str = e.raw_message.split(Conf.bds.cmd_prefix);
              let res = mc.runcmdEx(str[1]);
              let pattern =
                /Unknown command: (.+). Please check that the command exists and that you have permission to use it./;
              let err_cmd = res.output.match(pattern);
              if (pattern.test(res.output)) {
                //判断指令返回有没有错误，
                SendMsg(Conf.qq.my_group, Conf.format.cmd_error.replace("{cmd_err}", err_cmd[1]));
              } else {
                SendMsg(Conf.qq.my_group, Conf.format.cmd_succ.replace("{cmd_out}", res.output));
              }
            }
          }
        }
      });
    }
    function SendMsg(group_id, str) {
      groupBot.sendGroupMsg(group_id, str).catch((e) => {});
    }
    function SendMsg_private(user_id, str) {
      groupBot.sendPrivateMsg(user_id, str).catch((e) => {});
    }
    function motd_be(ip, port, group_id, local = false) {
      let str1, str2;
      ser = new Server(ip, port);
      ser.motdbe();
      setTimeout(() => {
        let code = ser.serverInfo.code,
          status = ser.serverInfo.status,
          motd = ser.serverInfo.motd,
          ver = ser.serverInfo.version,
          online = ser.serverInfo.online,
          upper = ser.serverInfo.upperLimit,
          delay = ser.serverInfo.delay;
        if (code == 200) {
          str1 = `服务器运行状态:${status}\nMOTD:${motd}\n当前版本:${ver}\n在线人数:${online}/${upper}\n参考延迟:${delay}`;
          if (local) {
            let list_str = mc.runcmdEx("list").output.split(":")[1];
            str2 = "\n===在线玩家===" + list_str;
            SendMsg(group_id, str1 + str2);
          } else {
            SendMsg(group_id, str1);
          }
        } else {
          warn(`服务器访问异常！code:${code}`);
          SendMsg(group_id, `服务器访问异常！code:${code}`);
        }
      }, 1000);
    }
    //=============
  } else {
    info("已禁用QQ群机器人！如需使用请在配置文件内打开选项并设置 群号 管理员号 机器人账户 密码(可选) ");
  }
});

info("==========GBot机器人加载完成==========");
