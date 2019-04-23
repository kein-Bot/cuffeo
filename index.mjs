import { irc as irclib } from "./src/clients/irc";
import { tg as tglib } from "./src/clients/tg";

import EventEmitter from "events";

const clients = [];

const cuffeo = class cuffeo extends EventEmitter {
  constructor(cfg) {
    super();
    for (let srv in cfg) {
      if(cfg[srv].enabled) {
        switch (cfg[srv].type) {
        case "irc":
          clients.push({
            name: cfg[srv].network,
            type: "irc",
            client: new irclib(cfg[srv])
          });
          break;
        case "tg":
          clients.push({
            name: "tg",
            type: "tg",
            client: new tglib(cfg[srv])
          });
          break;
        }
      }
    }

    clients.forEach(client => {
      client.client.on("data", e => {
        this.emit(e[0], e[1]);
      });
    });
  }
};

export { cuffeo, clients };
