export default client => {
  client._cmd.set("INVITE", function (msg) { // invite
    const user = this.parsePrefix(msg.prefix);
    const channel = msg.params[1];

    if(!this.server.channel.includes(channel)) {
      this.join(channel);
      setTimeout(() => {
        this.send(`PRIVMSG ${channel} :Hi. Wurde von ${user.nick} eingeladen.`);
      }, 1000);
    }
  }.bind(client));
};