export default client => {
  client._cmd.set("464", function (msg) { // motd_entry
    if (this.options.password.length > 0 && !this.options.sasl)
      this.send(`PASS ${this.options.password}`);
  }.bind(client));
};
