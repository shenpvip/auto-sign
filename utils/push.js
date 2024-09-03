const config = require("../config.json")
const axios = require("axios")

function server(content) {
  const params = new URLSearchParams()
  params.append("spt", config.pushToken)
  params.append("summary", content.title)
  params.append("content", content.desp)
  axios
    .post("https://wxpusher.zjiecode.com/api/send/message/simple-push", params)
    .then(() => {
      console.log("推送成功")
    })
    .catch((error) => {
      console.log(error)
      console.log("推送失败")
    })
}

module.exports = server
