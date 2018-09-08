let _admins = [];

const getLevel = (network, user) => {
  let ret = {
    level: 0,
    verified: false
  };
  if (typeof user !== "object")
    return "user has to be an object!";
  if (!user.account || !user.prefix)
    return ret;
  for(let admin of _admins) {
    if (admin.account === user.account.toLowerCase() && admin.network === network.toLowerCase()) {
      ret = {
        level: admin.level,
        verified: user.prefix.toLowerCase() === admin.prefix
      };
    }
  };
  return ret;
};

export {
  _admins, getLevel
};
