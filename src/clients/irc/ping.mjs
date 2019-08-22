export default bot => {
  bot._cmd.set("PING", msg => { // ping
    bot.send(`PONG ${msg.params.join``}`);
  });
};
