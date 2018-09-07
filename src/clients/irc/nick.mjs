export default client => {
  client._cmd.set("NICK", function (msg) { // nickchange
    let prefix = this.parsePrefix(msg.prefix);
    if (this.server.user.hasi(prefix.nick))
      this.server.user.deli(prefix.nick);
    this.whois(msg.params[0], true); // force
  }.bind(client));
};
