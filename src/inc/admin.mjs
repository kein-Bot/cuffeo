//import sql from "./sql";

/*export let admins = [];
export const loadAdmins = () => {
  admins = [];
  sql.exec(`select * from admins`)
    .then(rows => {
      rows.forEach(row => {
        admins.push({
          id: row.id,
          prefix: row.prefix,
          account: row.account,
          network: row.network,
          level: row.level
        });
      });
    })
    .catch(err => {
      console.log("keine Admins vorhanden");
    });
};
loadAdmins();*/

export const getLevel = (network, user) => {
  let ret = {
    level: 0,
    verified: false
  };
  if (typeof user !== "object")
    return "user has to be an object!";
  if (!user.account || !user.prefix)
    return ret;
  for(let admin of admins) {
    if (admin.account === user.account.toLowerCase() && admin.network === network.toLowerCase()) {
      ret = {
        level: admin.level,
        verified: user.prefix.toLowerCase() === admin.prefix
      };
    }
  };
  return ret;
};