import fetch from "flumm-fetch-cookies";
import EventEmitter from "events";
import ws from "ws";

export default class slack extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.token = options.token || null;
    this.set = this.options.set || "all";
    this.network = "Slack";
    this.api = `https://slack.com/api`;
    this.socket = null;
    this.server = {
      set: this.set,
      channel: null,
      user: null,
      wss: {
        link: null,
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

    this.server.me = {
      id: res.self.id,
      nickname: res.self.name,
    };
    this.server.wss.link = res.url;
    this.server.team = res.team;
    this.server.channel = res.channel;

    this.server.wss.socket = new ws(this.server.wss.link, {
      perMessageDeflate: false
    });

    this.server.wss.socket.on("error", error => {
      console.error(error);
    });

    this.server.wss.socket.on("message", async data => {
      data = JSON.parse(data);

      if(data.type !== "message")
        return false;

      return this.emit("data", ["message", this.reply(data)]);
    });
    
    console.log(res);

    
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
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split("&").join("&amp;")
      .replace(/\[b\](.*?)\[\/b\]/g, "*$1*") // bold
      .replace(/\[s\](.*?)\[\/s\]/g, "~$1~") // strike
      .replace(/\[i\](.*?)\[\/i\]/g, "_$1_") // italic
      .replace(/\[color=(.*?)](.*?)\[\/color\]/g, "$2")
    ;
  }

}
