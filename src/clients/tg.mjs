import fetch from "flumm-fetch-cookies";
import EventEmitter from "events";

export class tg extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.token = options.token || null;
    this.options.pollrate = options.pollrate || 1000;
    this.set = this.options.set || "all";
    this.network = "Telegram";
    this.api = `https://api.telegram.org/bot${this.token}`;
    this.lastUpdate = 0;
    this.lastMessage = 0;
    this.server = {
      set: this.set,
      channel: new Map(),
      user: new Map(),
      me: {}
    };
    this.connect().then(() => {
      this.poller = setInterval(() => { this.poll(); }, this.options.pollrate);
    });
  }
  connect() {
    return new Promise((resolve, reject) => {
      fetch(`${this.api}/getMe`)
        .then(res => res.json())
        .then(res => {
          if(res.ok) {
            this.me = res.result;
            this.server.me = {
              nickname: res.result.first_name,
              username: res.result.username,
              account: res.result.id.toString(),
              prefix: `${res.result.username}!${res.result.id.toString()}`,
              id: res.result.id.toString()
            };
            resolve();
          }
          else {
            reject();
          }
        })
        .catch(err => {
          reject();
        });
    });
  }
  poll() {
    fetch(`${this.api}/getUpdates?offset=${this.lastUpdate}&allowed_updates=message`)
      .then(res => res.json())
      .then(res => {
        if(res.ok && res.result.length > 0) {
          res = res.result[res.result.length-1];
          this.lastUpdate = res.update_id + 1;
          if (res.message.date >= ~~(Date.now() / 1000) - 10 && res.message.message_id !== this.lastMessage) {
            this.lastMessage = res.message.message_id;
            if(!this.server.user.has(res.message.from.username || res.message.from.first_name)) {
              this.server.user.set(res.message.from.username || res.message.from.first_name, {
                nick: res.message.from.first_name,
                username: res.message.from.username,
                account: res.message.from.id.toString(),
                prefix: `${res.message.from.username}!${res.message.from.id.toString()}`,
                id: res.message.from.id
              });
            }
            this.emit("data", ["message", this.reply(res.message)]);
          }
        }
      })
      .catch(err => {
          this.emit("error", err);
      });
  }
  send(chatid, msg, reply = null) {
    if(msg.length === 0 || msg.length > 2048)
      return false;
    const opts = {
      method: "POST",
      body: {
        chat_id: chatid,
        text: msg.split("\n").length > 1 ? `<code>${msg}</code>` : msg,
        parse_mode: "HTML"
      }
    };
    if(reply)
      opts.body.reply_to_message_id = reply;
    fetch(`${this.api}/sendMessage`, opts)
      .then(res => {})
      .catch(err => {
          this.emit("error", err);
      });
  }
  sendmsg(mode, recipient, msg) {
    this.send(recipient, msg);
  }
  reply(tmp) {
    return {
      type: "tg",
      network: "Telegram",
      channel: tmp.chat.title,
      channelid: tmp.chat.id,
      user: {
        prefix: `${tmp.from.username}!${tmp.from.id}`,
        nick: tmp.from.first_name,
        username: tmp.from.username,
        account: tmp.from.id.toString()
      },
      self: this.server,
      message: tmp.text,
      time: tmp.date,
      raw: tmp,
      reply: msg => this.send(tmp.chat.id, this.format(msg), tmp.message_id),
      replyAction: msg => this.send(tmp.chat.id, this.format(`Uwe ${msg}`), tmp.message_id),
      replyNotice: msg => this.send(tmp.chat.id, this.format(msg), tmp.message_id),
      _user: this.server.user
    };
  }
  format(msg) {
    return msg.toString()
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .replace(/\[b\](.*?)\[\/b\]/g, "<b>$1</b>") // bold
      .replace(/\[i\](.*?)\[\/i\]/g, "<i>$1</i>") // italic
      .replace(/\[color=(.*?)](.*?)\[\/color\]/g, "$2")
    ;
  }
}
