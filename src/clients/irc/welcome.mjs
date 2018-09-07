export default client => {
  client._cmd.set("001", function (msg) { // welcome
    this.join(this.options.channels);
    this.emit("data", ["connected", msg.params[1]]);
  }.bind(client));
};
