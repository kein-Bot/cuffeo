export default bot => {
  bot._cmd.set("NICK", msg => { // nickchange
    let prefix = bot.parsePrefix(msg.prefix);
    if (bot.server.user.has(prefix.nick))
      bot.server.user.delete(prefix.nick);
    bot.whois(msg.params[0], true); // force
  });
};
