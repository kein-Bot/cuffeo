export default bot => {
  bot._cmd.set("372", msg => { // motd_entry
    bot.server.motd += `${msg.params[1]}\n`;
  });

  bot._cmd.set("375", msg => { // motd_start
    bot.server.motd = `${msg.params[1]}\n`;
  });

  bot._cmd.set("376", msg => { // motd_end
    bot.server.motd += `${msg.params[1]}\n`;
    bot.emit("data", ["motd", bot.server.motd]);
  });
};
