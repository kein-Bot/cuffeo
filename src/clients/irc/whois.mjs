export default client => {
  client._cmd.set("307", function (msg) { // whois_identified (ircd-hybrid)
    let tmpuser = {};
    if (this.server.user.hasi(msg.params[1]))
      tmpuser = this.server.user.geti(msg.params[1]);
    tmpuser.account = msg.params[1];
    tmpuser.registered = true;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));

  client._cmd.set("311", function (msg) { // whois_userdata
    let tmpuser = {};
    if (this.server.user.hasi(msg.params[1]))
      tmpuser = this.server.user.geti(msg.params[1]);
    tmpuser.nickname = msg.params[1];
    tmpuser.username = msg.params[2];
    tmpuser.hostname = msg.params[3];
    tmpuser.realname = msg.params[5];
    tmpuser.prefix = `${msg.params[1]}!${msg.params[2]}@${msg.params[3]}`;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));

  client._cmd.set("313", function (msg) { // whois_oper
    let tmpuser = {};
    if (this.server.user.hasi(msg.params[1]))
      tmpuser = this.server.user.geti(msg.params[1]);
    tmpuser.oper = true;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));

  client._cmd.set("318", function (msg) { // whois_end
    let tmpuser = {};
    if (this.server.user.hasi(msg.params[1]))
      tmpuser = this.server.user.geti(msg.params[1]);
    tmpuser = {
      nickname: tmpuser.nickname || false,
      username: tmpuser.username || false,
      hostname: tmpuser.hostname || false,
      realname: tmpuser.realname || false,
      account: tmpuser.account || false,
      prefix: tmpuser.prefix || false,
      registered: tmpuser.registered || false,
      oper: tmpuser.oper || false,
      channels: tmpuser.channels || [],
      cached: ~~(Date.now() / 1000)
    };
    if(msg.params[0] === msg.params[1])
      this.server.me = tmpuser;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));

  client._cmd.set("319", function (msg) { // whois_chanlist
    let tmpchan = new Map()
      , tmpuser = {};
    if (this.server.user.hasi(msg.params[1])) {
      tmpuser = this.server.user.geti(msg.params[1]);
      if (tmpuser.channels)
        tmpchan = new Map(tmpuser.channels);
    }
    let chans = msg.params[2].trim().split(" ");
    for (let chan in chans) {
      chan = chans[chan].split("#");
      tmpchan.set(`#${chan[1]}`, chan[0]);
    }
    tmpuser.channels = tmpchan;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));

  client._cmd.set("330", function (msg) { // whois_authed_as (snircd)
    let tmpuser = {};
    if (this.server.user.hasi(msg.params[1]))
      tmpuser = this.server.user.geti(msg.params[1]);
    tmpuser.account = msg.params[2];
    tmpuser.registered = true;
    this.server.user.set(msg.params[1], tmpuser);
  }.bind(client));
};

Map.prototype.hasi = function (val) {
  for (let [key] of this)
    if (key.toLowerCase() === val.toLowerCase())
      return true;
  return false;
};
Map.prototype.geti = function (val) {
  for (let [key, value] of this)
    if (key.toLowerCase() === val.toLowerCase())
      return value;
  return false;
};
Map.prototype.deli = function (val) {
  for (let [key] of this)
    if (key.toLowerCase() === val.toLowerCase())
      this.delete(key);
};
