import cap from "./cap";
import invite from "./invite";
import join from "./join";
import motd from "./motd";
import msg from "./msg";
import nick from "./nick";
import part from "./part";
import ping from "./ping";
import pwdreq from "./pwdreq";
import welcome from "./welcome";
import who from "./who";
import whois from "./whois";

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

export default [
  cap, invite, join,
  motd, msg, nick,
  part, ping, pwdreq,
  welcome, who, whois
];
