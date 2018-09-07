export default client => {
  client._cmd.set("PING", function (msg) { // ping
    this.send(`PONG ${msg.params.join``}`);
  }.bind(client));
};
