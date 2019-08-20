import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import EventEmitter from "events";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class cuffeo extends EventEmitter {
  constructor(cfg) {
    super();
    this.clients = [];
    this.libs = {};

    return (async () => {
      this.libs = await this.loadLibs();
      this.clients = this.registerClients(cfg);
      return this;
    })();
  }
  async loadLibs() {
    const _libs = {};
    for (const client of (await fs.promises.readdir(`${__dirname}/clients`)).filter(f => f.endsWith(".mjs"))) {
      const lib = await import(`./clients/${client}`);
      _libs[lib.default.name] = lib.default;
    }
    return _libs;
  }
  registerClients(cfg) {
    return cfg.filter(e => e.enabled).map(srv => {
      if(!Object.keys(this.libs).includes(srv.type))
        throw new Error(`not supported client: ${srv.type}`);

      return {
        name: srv.network,
        type: srv.type,
        client: new this.libs[srv.type](srv)
      };
    });
  }
};
