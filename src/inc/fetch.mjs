import http from "http";
import https from "https";
import url from "url";

export default (a, options = {}, link = url.parse(a)) => new Promise((resolve, reject) => {
  (link.protocol === "https:"?https:http).get({...{
    hostname: link.hostname,
    path: link.path,
    method: "GET"
  }, ...options}, (res, data = "") => res
    .setEncoding("utf8")
    .on("data", chunk => data += chunk)
    .on("end", () => resolve({
      text: () => data,
      json: () => { try { return JSON.parse(data); } catch(err) { return "no json D:"; } },
      buffer: () => new Buffer.from(data)
    }))
  ).on("error", err => reject(err));
});
