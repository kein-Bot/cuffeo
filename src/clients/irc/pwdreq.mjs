export default bot => {
  bot._cmd.set("464", msg => { // motd_entry
    if (bot.options.password.length > 0 && !bot.options.sasl)
      bot.send(`PASS ${bot.options.password}`);
  });
};
