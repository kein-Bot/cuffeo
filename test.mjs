import fetch from "./src/inc/fetch";

fetch("https://pr0.totally.rip/api/v2/item?file=2018/09/02/9a8b714642a7d9a9.mp4")
//fetch("https://srv.fail")
  .then(res => res.text())
  .then(res => console.log(res))
  .catch(err => {
    console.log("error", err);
  });