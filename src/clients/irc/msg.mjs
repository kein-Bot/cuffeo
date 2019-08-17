export default client => {
  client._cmd.set("PRIVMSG", function (msg) { // privmsg
    if(msg.params[1] === "\u0001VERSION\u0001")
      return this.emit("data", ["ctcp:version", this.reply(msg)]);
    else if(msg.params[1].match(/^\u0001PING .*\u0001/i))
      return this.emit("data", ["ctcp:ping", this.reply(msg)]);
    else
      this.emit("data", ["message", this.reply(msg)]);
  }.bind(client));

  client._cmd.set("NOTICE", function (msg) { // notice
    this.emit("data", ["notice", msg.params[1]]);
  }.bind(client));
};
