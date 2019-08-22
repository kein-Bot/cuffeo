export default bot => {
  bot._cmd.set("001", msg => { // welcome
    bot.join(bot.options.channels);
    bot.emit("data", ["connected", msg.params[1]]);
  });
};
