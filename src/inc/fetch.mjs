import http from "http";
import https from "https";
import url from "url";

export default (a, options = {}, link = url.parse(a)) => new Promise((resolve, reject) => {
  options = {...{
    hostname: link.hostname,
    path: link.path,
    method: "GET"
  }, ...options};
  let body = "";
  if(options.method === "POST") {
    body = JSON.stringify(options.body);
    delete options.body;
    options.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body)
    }
  }
  const post = (link.protocol === "https:"?https:http).request(options, (res, data = "") => res
    .setEncoding("utf8")
    .on("data", chunk => data += chunk)
    .on("end", () => resolve({
      text: () => data,
      json: () => { try { return JSON.parse(data); } catch(err) { return "no json D:"; } },
      buffer: () => new Buffer.from(data)
    }))
  ).on("error", err => reject(err));
  post.end(body);
});
