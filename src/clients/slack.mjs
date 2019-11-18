import https from "https";
import url from "url";
import EventEmitter from "events";
import fetch from "flumm-fetch-cookies";

export default class slack extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.token = options.token || null;
    this.set = this.options.set || "all";
    this.network = "Slack";
    this.api = "https://slack.com/api";
    this.socket = null;
    this.server = {
      set: this.set,
      channel: null,
      user: null,
      wss: {
        url: null,
        socket: null
      },
      me: {}
    };

    return (async () => {
      await this.connect();
      return this;
    })();
  }
  async connect() {
    const res = await (await fetch(`${this.api}/rtm.connect?token=${this.token}`)).json();
    if (!res.ok)
      throw this.emit("data", [ "error", res.description ]); // more infos

    this.server.wss.url = url.parse(res.url);

    https.get({
      hostname: this.server.wss.url.host,
      path: this.server.wss.url.path,
      port: 443,
      headers: {
        "Upgrade": "websocket",
        "Connection": "Upgrade",
        "Sec-WebSocket-Version": 13,
        "Sec-WebSocket-Key": new Buffer.from(Array(16).fill().map(e => Math.round(Math.random() * 0xFF))).toString("base64")
      }
    }).on("upgrade", (_, sock) => {
      this.server.wss.socket = sock;
      this.server.wss.socket.setDefaultEncoding("utf-8");

      setInterval(async () => await this.ping(), 3e4); // 30 seconds lul

      this.server.wss.socket.on("data", data => {
        data = data.toString("utf-8").replace(/\0/g, "");
        data = JSON.parse(data.substr(data.indexOf("{")));

        //console.log(data, data.type);

        if(data.type !== "message")
          return false;

        return this.emit("data", [ "message", this.reply(data) ]);
      })
      .on("end", () => this.emit("data", [ "debug", "stream ended" ]))
      .on("error", err => this.emit("data", [ "error", err ]));
      /*.on("drain", console.log)
      .on("close", console.log)
      .on("finish", console.log)
      .on("timeout", console.log)*/
    });
  }

  async send(channel, text) {
    await this.write({
      type: "message",
      channel: channel,
      text: this.format(text)
    });
  }

  async ping() {
    await this.write({
      type: "ping"
    });
  }

  async write(json) {
    const msg = JSON.stringify(json);

    const payload = Buffer.from(msg);

    if(payload.length > 2 ** 14) // 16KB limit
      throw this.emit("data", [ "error", "message too long, slack limit reached" ]);

    let frame_length = 6;
    let frame_payload_length = payload.length;

    if(payload.length > 125) {
      frame_length += 2;
      frame_payload_length = 126;
    }

    const frame = Buffer.alloc(frame_length);

    // set mask bit but leave mask key empty (= 0), so we don't have to mask the message
    frame.writeUInt16BE(0x8180 | frame_payload_length);

    if(frame_length > 6)
      frame.writeUInt16BE(payload.length, 2);

    this.server.wss.socket.cork();
    this.server.wss.socket.write(frame);
    this.server.wss.socket.write(Buffer.from(msg));
    this.server.wss.socket.uncork();
    return true;
  }

  reply(tmp) {
    return {
      type: "slack",
      network: "Slack",
      channel: tmp.channel, // get channelname
      channelid: tmp.channel,
      user: {
        prefix: `${tmp.user}!${tmp.user}`, // get username
        nick: tmp.user, // get username
        username: tmp.user,  // get username
        account: tmp.user
      },
      self: this.server,
      message: tmp.text,
      time: ~~(Date.now() / 1000),
      raw: tmp,
      reply: msg => this.send(tmp.channel, msg),
      replyAction: msg => this.send(tmp.channel, `Uwe ${msg}`),
      replyNotice: msg => this.send(tmp.channel, msg)
    };
  }

  format(msg) {
    return msg.toString()
      .replace(/\[b\](.*?)\[\/b\]/g, "*$1*") // bold
      .replace(/\[s\](.*?)\[\/s\]/g, "~$1~") // strike
      .replace(/\[i\](.*?)\[\/i\]/g, "_$1_") // italic
      .replace(/\[color=(.*?)](.*?)\[\/color\]/g, "$2")
    ;
  }

}
