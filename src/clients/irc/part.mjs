export default client => {
  client._cmd.set("PART", function (msg) { // part
    //delete this.server.user[msg.params[0]];
  }.bind(client));
};
