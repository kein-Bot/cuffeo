export default client => {
  client._cmd.set("CAP", function (msg) { // capkram
    switch (msg.params[1]) {
      case "LS": // list
        this.send(`CAP REQ :${msg.params[2]}`);
        break;
      case "ACK": // success
        this.send("AUTHENTICATE PLAIN");
        break;
    }
  }.bind(client));

  client._cmd.set("AUTHENTICATE", function (msg) { // auth
    if (msg.params[0].match(/\+/))
      this.send(`AUTHENTICATE ${new Buffer(this.username + "\u0000" + this.username + "\u0000" + this.options.password).toString("base64")}`);
  }.bind(client));

  client._cmd.set("900", function (msg) { // cap end
    this.send("CAP END");
  }.bind(client));
};
