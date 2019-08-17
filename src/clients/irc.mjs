import modules from "./irc/index";

import net from "net";
import tls from "tls";
import EventEmitter from "events";

const colors = {
  red: "04",
  blue: "12",
  yellow: "08",
  green: "03",
  brown: "05"
};
const msgmodes = {
  normal: "PRIVMSG {recipient} :{msg}",
  action: "PRIVMSG {recipient} :\u0001ACTION {msg}\u0001",
  notice: "NOTICE {recipient} :{msg}"
};

const replaceColor = (match, color, text) => {
  if (colors.hasOwnProperty(color))
    return `\x03${colors[color]}${text}\x0F`;
  return text;
};

export class irc extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.options.channels = this.options.channels || [];
    this.options.host = this.options.host || "127.0.0.1";
    this.options.port = this.options.port || 6667;
    this.options.ssl = this.options.ssl || false;
    this.options.selfSigned = this.options.selfSigned || false;
    this.options.sasl = this.options.sasl || false;
    this.network = this.options.network || "test";
    this.nickname = this.options.nickname || "test";
    this.username = this.options.username || "test";
    this.realname = this.options.realname || "test";
    this.channels = this.options.channels || [];
    this.set = this.options.set || "all";
    this._recachetime = 60 * 30; // 30 minutes
    this._cmd = new Map();

    modules.forEach(mod => mod(this));

    this.server = {
      set: this.set,
      motd: "",
      me: {},
      channel: [],
      user: new Map()
    };
    this.socket = (this.options.ssl ? tls : net).connect({
      host: this.options.host,
      port: this.options.port,
      rejectUnauthorized: !this.options.selfSigned
    }, () => {
      this.send(`NICK ${this.nickname}`);
      this.send(`USER ${this.username} 0 * : ${this.realname}`);
      if(this.options.sasl)
        this.send("CAP LS");
    });
    this.socket.setEncoding("utf-8");
    this.socket.on("data", msg => {
      msg.split(/\r?\n|\r/).filter(tmp => tmp.length > 0).forEach(tmp => {
        const cmd = this.parse(tmp);
        if (this._cmd.has(cmd.command))
          this._cmd.get(cmd.command)(cmd);
      })
    });
  }
  send(data) {
    this.socket.write(`${data}\n`);
  }
  sendmsg(mode, recipient, msg) {
    msg = msg.split(/\r?\n/);
    if(msg.length > 6)
      return false;
    msg.forEach(e => {
      this.send( msgmodes[mode].replace("{recipient}", recipient).replace("{msg}", e) );
    });
  }
  parse(data, [a, ...b] = data.split(/ +:/), tmp = a.split(" ").concat(b)) {
    let prefix = data.charAt(0) === ":" ? tmp.shift() : null
      , command = tmp.shift()
      , params = command.toLowerCase() === "privmsg" ? [ tmp.shift(), tmp.join(" :") ] : tmp;
    return {
      prefix: prefix,
      command: command,
      params: params
    };
  }
  reply(tmp) {
    return {
      type: "irc",
      network: this.network,
      channel: tmp.params[0],
      channelid: tmp.params[0],
      user: Object.assign(this.parsePrefix(tmp.prefix), {
        account: this.server.user.geti(this.parsePrefix(tmp.prefix).nick).account,
        prefix: tmp.prefix.charAt(0) === ":" ? tmp.prefix.substring(1) : tmp.prefix,
        level: getLevel(this.network, Object.assign(this.parsePrefix(tmp.prefix), {
          account: this.server.user.geti(this.parsePrefix(tmp.prefix).nick).account,
          prefix: tmp.prefix.charAt(0) === ":" ? tmp.prefix.substring(1) : tmp.prefix
        }))
      }),
      message: tmp.params[1].replace(/\u0002/, ""),
      time: ~~(Date.now() / 1000),
      raw: tmp,
      reply: msg => this.sendmsg("normal", tmp.params[0], this.format(""+msg)),
      replyAction: msg => this.sendmsg("action", tmp.params[0], this.format(""+msg)),
      replyNotice: msg => this.sendmsg("notice", tmp.params[0], this.format(""+msg)),
      self: this.server,
      _chan: this.server.channel[tmp.params[0]],
      _user: this.server.user,
      _cmd: this._cmd,
      join: chan => this.join(chan),
      part: (chan, msg) => this.part(chan, msg),
      whois: user => this.whois(user),
      write: msg => this.send(msg),
      socket: this.socket
    };
  }
  join(channel) {
    this.send(`JOIN ${(typeof channel === "object") ? channel.join(",") : channel}`);
  }
  part(channel, msg=false) {
    this.send(`PART ${(typeof channel === "object") ? channel.join(",") : channel}${msg ? " " + msg : " part"}`);
  }
  whois(user, force = false) {
    user = user.toLowerCase();
    let tmpuser = {};
    if(this.server.user.has(user) && !force) {
      tmpuser = this.server.user.get(user);
      if(tmpuser.cached >= ~~(Date.now() / 1000) - this._recachetime)
        return;
    }

    tmpuser = {
      nickname: tmpuser.nickname || false,
      username: tmpuser.username || false,
      hostname: tmpuser.hostname || false,
      realname: tmpuser.realname || false,
      account: tmpuser.account || false,
      prefix: tmpuser.prefix || false,
      registered: tmpuser.registered || false,
      oper: tmpuser.oper || false,
      channels: tmpuser.channels || [],
      cached: ~~(Date.now() / 1000)
    };
    this.server.user.set(user, tmpuser);
    this.send(`WHOIS ${user}`);
  }
  parsePrefix(prefix) {
    prefix = /:?(.*)\!(.*)@(.*)/.exec(prefix);
    if(!prefix)
      return false; //this.parsePrefix(arguments);
    return {
      nick: prefix[1],
      username: prefix[2],
      hostname: prefix[3]
    };
  }
  format(msg) {
    return msg
      .replace(/\[b\](.*?)\[\/b\]/g, "\x02$1\x02") // bold
      .replace(/\[i\](.*?)\[\/i\]/g, "\x1D$1\x1D") // italic
      .replace(/\[color=(.*?)](.*?)\[\/color\]/g, replaceColor) // colors
      ;
  }
}
