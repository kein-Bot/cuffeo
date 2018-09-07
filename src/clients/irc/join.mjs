export default client => {
  client._cmd.set("JOIN", function (msg) { // join
    this.send(`WHO ${msg.params[0]}`);
  }.bind(client));
};
