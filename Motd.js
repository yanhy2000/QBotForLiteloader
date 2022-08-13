const dgram = require("dgram");
const client = dgram.createSocket("udp4");

class Server {
  constructor(ip, port = 19132) {
    this.ip = ip;
    this.port = port;
    this.serverInfo = {
      code: 404,
      status: "offline / not Exist",
    };
  }

  motdbe() {
    let msgArrayToBedrockServer = [
      0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe, 0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78,
    ];

    let nowByteTimeStamp = this.#strToUtf8Bytes(Math.round(new Date() / 1000).toString());

    for (var i = 0; i < 8; i++) msgArrayToBedrockServer.unshift(nowByteTimeStamp[i]);

    msgArrayToBedrockServer.unshift(0x01);

    let bufferMsg = Buffer.from(msgArrayToBedrockServer);

    let serverInfo;

    let t1 = Math.round(new Date());

    client.send(bufferMsg, 0, bufferMsg.length, this.port, this.ip, (err) => {
      if (err) console.log(err);
    });

    client.on("message", (msg) => {
      let msgArray = msg.toString().split(";");

      let t2 = Math.round(new Date());

      serverInfo = {
        code: 200,
        status: "online",
        ip: this.ip,
        port: this.port,
        motd: msgArray[1],
        protocol: msgArray[2],
        version: msgArray[3],
        online: msgArray[4],
        upperLimit: msgArray[5],
        gamemode: msgArray[8],
        difficulty: msgArray[9],
        port_ipv6: msgArray[11],
        delay: `${t2 - t1}ms`,
      };
    });

    setTimeout(() => {
      if (serverInfo != null) this.serverInfo = serverInfo;
    }, 1000);
  }

  #strToUtf8Bytes(str) {
    const utf8 = [];
    for (let ii = 0; ii < str.length; ii++) {
      let charCode = str.charCodeAt(ii);
      if (charCode < 0x80) utf8.push(charCode);
      else if (charCode < 0x800) {
        utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
      } else {
        ii++;
        // Surrogate pair:
        // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
        // splitting the 20 bits of 0x0-0xFFFFF into two halves
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
        utf8.push(
          0xf0 | (charCode >> 18),
          0x80 | ((charCode >> 12) & 0x3f),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f)
        );
      }
    }
    //兼容汉字，ASCII码表最大的值为127，大于127的值为特殊字符
    for (let jj = 0; jj < utf8.length; jj++) {
      var code = utf8[jj];
      if (code > 127) {
        utf8[jj] = code - 256;
      }
    }
    return utf8;
  }
}

module.exports.Server = Server;
