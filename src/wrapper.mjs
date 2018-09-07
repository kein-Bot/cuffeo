import { irc as irclib } from "./clients/irc";
import { tg as tglib } from "./clients/tg";

import EventEmitter from "events";

const clients = [];

const wrapper = class wrapper extends EventEmitter {
  constructor(cfg) {
    super();
    for (let srv in cfg) {
      if(cfg[srv].val.enabled) {
        switch (cfg[srv].val.type) {
        case "irc":
          clients.push({
            name: cfg[srv].val.network,
            type: "irc",
            client: new irclib(cfg[srv].val)
          });
          break;
        case "tg":
          clients.push({
            name: "tg",
            type: "tg",
            client: new tglib(cfg[srv].val)
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

export { wrapper, clients };
