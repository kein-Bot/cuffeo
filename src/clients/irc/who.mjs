const max = 400;
let whois = [];

export default client => {
  client._cmd.set("352", function (msg) { // who_entry
    if (!this.server.channel[msg.params[1]])
      this.server.channel[msg.params[1]] = new Map();
    this.server.channel[msg.params[1]].set(msg.params[5], { // chan
      nick: msg.params[5],
      username: msg.params[2],
      hostname: msg.params[3]
    });
    whois.push(msg.params[5]);
  }.bind(client));

  client._cmd.set("315", function (msg) { // who_end
    this.whois(whois.reduce((a, b) => {
      a += `${b},`;
      if(a.length >= max) {
        this.whois(a.slice(0, -1));
        a = "";
      }
      return a;
    }, "").slice(0, -1));
    whois = [];
  }.bind(client));
};
