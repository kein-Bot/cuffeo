# cuffeo (wip)

## Usage Example
```javascript
import cuffeo from "cuffeo";

(async () => {
  const clients = [
    {
      type: "irc",
      enabled: true,
      network: "name",
      host: "localhost",
      port: 6697,
      ssl: true,
      selfSigned: false,
      sasl: false,
      nickname: "nickname",
      username: "username",
      password: "password",
      realname: "realname",
      channels: [
        "#blah"
      ]
    },
    {
      type: "tg",
      enabled: true,
      token: "token",
      pollrate: 1001
    },
    {
      type: "slack",
      enabled: true,
      token: "token"
    }
  ];

  const bot = await new cuffeo(clients);

  // events
  bot.on("message", msg => {
    msg.reply("hello, world!");
  });

  bot.on("info", msg => {
    console.log(msg);
  });

  bot.on("error", err => {
    console.error(err);
  });

  bot.on("ctcp:ping", msg => { // irc only
    msg.write(`notice ${msg.user.nick} :${e.message}`);
  });

  bot.on("ctcp:version", msg => { // irc only
    msg.write(`notice ${msg.user.nick} :\u0001VERSION blah\u00001`);
  });
})();
```

## documentation

### clients
#### irc
```json
{
  "type": "irc",
  "enabled": true,
  "network": "name",
  "host": "localhost",
  "port": 6697,
  "ssl": true,
  "selfSigned": false,
  "sasl": false,
  "nickname": "nickname",
  "username": "username",
  "password": "password",
  "realname": "realname",
  "channels": [
    "#blah"
  ]
}
```
#### Telegram
```json
{
  "type": "tg",
  "enabled": true,
  "token": "token",
  "pollrate": 1001
}
```
#### Slack
```json
{
  "type": "slack",
  "enabled": true,
  "token": "token"
}
```

### Events
#### message
returns an object, containing:

| variable | type | explanation | note
| --- | --- | --- | --- |
| type | string | irc, tg or slack | |
| network | string | irc only, other it'll be "telegram" or "slack" | |
| channel | string | | |
| user | object | see below | |
| message | string | | |
| time | string | timestamp | |
| raw | object | | |
| reply | function | | |
| replyAction | function | | |
| replyNotice | function | | |
| self | object | | |
| _chan | object | | irc only |
| _user | object | | irc and telegram only |
| join | function | join a channel | irc only |
| part | function | part a channel | irc only |
| whois | function | request a whois | irc only |
| write | function | write raw lul | |

---
##### user object
| variable | type |
| --- | --- |
| account | string |
| prefix | string |

##### reply/replyAction/replyNotice function
```javascript
msg.reply("message");
msg.replyAction("message");
msg.replyNotice("message"); // same as reply() on Slack and Telegram
```
##### join function
```javascript
msg.join("#channel");
```
##### part function
```javascript
msg.part("#channel", "message");
// or
msg.part([ "#channel1", "#channel2" ], "message");
```
##### whois function
```javascript
msg.whois("user");
// or
msg.whois([ "user1", "user2" ]);
```


## irc related stuff
### color your messages
```javascript
msg.reply("[color=red]message[/color]");
```
allowed colors:
- white
- black
- navy
- green
- red
- brown
- purple
- orange
- yellow
- lightgreen
- teal
- cyan
- blue
- magenta
- gray
- lightgray

### bold and italic
```javascript
msg.reply("[b]bold[/b]");
msg.reply("[i]italic[/i]");
```