const axios = require("axios")

function server(content) {
  axios
    .post(
      "https://wxpusher.zjiecode.com/api/send/message/simple-push",
      {
        content: content.desp,
        summary: content.title,
        spt: process.env.PUSH_KEY,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      console.log("推送成功")
    })
    .catch((error) => {
      console.log(error)
      console.log("推送失败")
    })
}

module.exports = server
