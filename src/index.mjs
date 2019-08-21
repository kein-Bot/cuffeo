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
      this.libs    = await this.loadLibs();
      this.clients = await this.registerClients(cfg);
      return this;
    })();
  }
  async loadLibs() {
    return (await (Promise.all((await fs.promises.readdir(`${__dirname}/clients`)).filter(f => f.endsWith(".mjs")).map(async client => {
      const lib = (await import(`./clients/${client}`)).default;
      return { [lib.name]: lib };
    })))).reduce((a, b) => ({ ...a, ...b }));
  }
  async registerClients(cfg) {
    return cfg.filter(e => e.enabled).map(async srv => {
      if(!Object.keys(this.libs).includes(srv.type))
        throw new Error(`not supported client: ${srv.type}`);

      const client = {
        name: srv.network,
        type: srv.type,
        client: await new this.libs[srv.type](srv)
      };
      client.client.on("data", ([type, data]) => this.emit(type, data));
      return client;
    });
  }
};

Map.prototype.hasi = function(val) {
  try {
    for (let [key] of this)
      if(key.toLowerCase() === val.toLowerCase())
        return true;
    return false;
  } catch(err) {
    console.log("das übliche mit tolowercase()");
    return false;
  }
};

Map.prototype.geti = function(val) {
  for (let [key, value] of this)
    if(key.toLowerCase() === val.toLowerCase())
      return value;
  return false;
};

Map.prototype.deli = function(val) {
  for (let [key] of this)
    if(key.toLowerCase() === val.toLowerCase())
      this.delete(key);
};