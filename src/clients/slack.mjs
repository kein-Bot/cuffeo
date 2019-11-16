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
      throw this.emit("data", ["error", res.description]); // more infos

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

      this.server.wss.socket.on("data", data => {
        data = JSON.parse(data.slice(data.indexOf("{")).toString());
        if(data.type !== "message")
          return false;

        return this.emit("data", ["message", this.reply(data)]);
      })
    });
  }

  async send(channel, text) {
    return this.server.wss.socket.send(JSON.stringify({
      type: "message",
      channel: channel,
      text: this.format(text)
    }));
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
