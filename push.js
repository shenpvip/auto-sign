const config = require("./config.json")
const axios = require("axios")

function server(content) {
  const params = new URLSearchParams()
  params.append("title", content.title)
  params.append("desp", content.desp)
  axios
    .post("https://sctapi.ftqq.com/" + config.sckey + ".send", params)
    .then((res) => {
      console.log(res)
      console.log("Server酱推送成功")
    })
    .catch((error) => {
      console.log(error)
      console.log("Server酱推送失败")
    })
}

module.exports = server
