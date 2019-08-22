export default bot => {
  bot._cmd.set("JOIN", msg => { // join
    bot.send(`WHO ${msg.params[0]}`);
  });
};
