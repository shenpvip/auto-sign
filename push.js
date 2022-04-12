const config = require("./config.json")
const axios = require("axios")

function server(content) {
  axios({
    method: "post",
    url: "https://sctapi.ftqq.com/" + config.sckey + ".send",
    data: {
      title: content.title,
      desp: content.desp,
    },
    headers: { "Content-type": "application/x-www-form-urlencoded" },
  })
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
