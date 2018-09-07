export default client => {
  client._cmd.set("372", function (msg) { // motd_entry
    this.server.motd += `${msg.params[1]}\n`;
  }.bind(client));

  client._cmd.set("375", function (msg) { // motd_start
    this.server.motd = `${msg.params[1]}\n`;
  }.bind(client));

  client._cmd.set("376", function (msg) { // motd_end
    this.server.motd += `${msg.params[1]}\n`;
    this.emit("data", ["motd", this.server.motd]);
  }.bind(client));
};
