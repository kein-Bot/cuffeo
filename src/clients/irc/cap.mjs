export default bot => {
  bot._cmd.set("CAP", msg => { // capkram
    switch (msg.params[1]) {
      case "LS": // list
        bot.send(`CAP REQ :${msg.params[2]}`);
        break;
      case "ACK": // success
        bot.send("AUTHENTICATE PLAIN");
        break;
    }
  });

  bot._cmd.set("AUTHENTICATE", msg => { // auth
    if (msg.params[0].match(/\+/))
      bot.send(`AUTHENTICATE ${new Buffer(bot.username + "\u0000" + bot.username + "\u0000" + bot.options.password).toString("base64")}`);
  });

  bot._cmd.set("900", msg => { // cap end
    bot.send("CAP END");
  });
};
