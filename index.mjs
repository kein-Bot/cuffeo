import { irc as irclib } from "./src/clients/irc";
import { tg as tglib } from "./src/clients/tg";
import { admins } from "./src/inc/admin";

import EventEmitter from "events";

const clients = [];

const cuffeo = class cuffeo extends EventEmitter {
  constructor(cfg, _admins = []) {
    super();
    admins.admins = _admins;
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

export { cuffeo, clients };
