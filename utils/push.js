const config = require("../config.json")
const axios = require("axios")

function server(content) {
  const params = new URLSearchParams()
  params.append("token", config.pushToken)
  params.append("title", content.title)
  params.append("content", content.desp)
  axios
    .post("http://www.pushplus.plus/api/send", params)
    .then(() => {
      console.log("pushplus推送成功")
    })
    .catch((error) => {
      console.log(error)
      console.log("pushplus推送失败")
    })
}

module.exports = server
