export default client => {
  client._cmd.set("PRIVMSG", function (msg) { // privmsg
    this.emit("data", msg.params[1] === "\u0001VERSION\u0001" ? ["ctcp:version", this.reply(msg)] : ["message", this.reply(msg)]);
  }.bind(client));

  client._cmd.set("NOTICE", function (msg) { // notice
    this.emit("data", ["notice", msg.params[1]]);
  }.bind(client));
};
