import Discord from "discord.js";
import EventEmitter from "events";

export class discord extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.token = options.token || null;
    this.set = this.options.set || "all";
    this.network = "discord";

    this.bot = new Discord.Client();
    this.bot.login(this.token);

    this.server = {
      set: this.set,
      channel: new Map(),
      user: new Map(),
      me: {}
    };

    this.bot.on("ready", () => {
      this.server.me = {
        nickname: this.bot.user.username,
        username: this.bot.user.username,
        account: this.bot.user.id.toString(),
        prefix: `${this.bot.user.username}!${this.bot.user.id.toString()}`,
        id: this.bot.user.id.toString()
      };
    });

    this.bot.on("message", msg => {
      if(msg.author.id !== this.server.me.id)
        this.emit("data", ["message", this.reply(msg)]);
    });
  }
  reply(tmp) {
    return {
      type: "discord",
      network: "Discord",
      channel: tmp.channel.name,
      channelid: tmp.channel.id,
      user: {
        prefix: `${tmp.author.username}!${tmp.author.id}`,
        nick: tmp.author.username,
        username: tmp.author.username,
        account: tmp.author.id.toString()
      },
      message: tmp.content,
      time: ~~(Date.now() / 1000),
      self: this.server,
      reply: msg => this.send(tmp, this.format(msg)),
      replyAction: msg => this.send(tmp, this.format(`*${msg}*`), "normal"),
      replyNotice: msg => this.send(tmp, this.format(msg))
    };
  }
  send(r, msg, mode = "blah") {
    switch(mode) {
      case "normal":
        r.channel.send(msg);
        break;
      default:
        r.reply(msg);
        break;
    }
  }
  sendmsg(mode, recipient, msg) {
    this.bot.channels.get(recipient).send(msg);
  }
  format(msg) {
    return msg.toString()
      .replace(/\[b\](.*?)\[\/b\]/g, "**$1**") // bold
      .replace(/\[i\](.*?)\[\/i\]/g, "*$1*") // italic
      .replace(/\[color=(.*?)](.*?)\[\/color\]/g, "$2")
    ;
  }
};
