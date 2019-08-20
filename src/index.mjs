import _fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import EventEmitter from "events";

const fs = _fs.promises;
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class cuffeo extends EventEmitter {
  constructor(cfg) {
    super();
    this.clients = [];
    this.libs = {};

    return (async () => {
      await this.loadLibs();
      this.clients = await this.init(cfg);
      return this;
    })();
  }
  async loadLibs() {
    const _clients = (await fs.readdir(`${__dirname}/clients`)).filter(f => f.endsWith(".mjs"));
    for(const client of _clients) {
      const lib = await import(`./clients/${client}`);
      this.libs[lib.default.name] = lib.default;
    }
    return;
  }
  async init(cfg) {
    const clients = [];
    for (const srv in cfg) {
      if(!cfg[srv].enabled)
        return new Error("not enabled");
      if(!Object.keys(this.libs).includes(cfg[srv].type))
        return new Error("not supported client");

      clients.push({
        name: cfg[srv].network,
        type: cfg[srv].type,
        client: new this.libs[cfg[srv].type](cfg[srv])
      });
    }
    clients.forEach(client => client.client.on("data", e => this.emit(e[0], e[1])));
    return clients;
  }
};
