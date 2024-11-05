const axios = require("axios")
const server = require("../utils/push")
// 读取环境变量
const cookies = process.env.SMZDM_COOKIE

const DEFAULT_HEADERS = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "zh-CN,zh;q=0.9",
  Connection: "keep-alive",
  Host: "zhiyou.smzdm.com",
  Referer: "https://www.smzdm.com/",
  "Sec-Fetch-Dest": "script",
  "Sec-Fetch-Mode": "no-cors",
  "Sec-Fetch-Site": "same-site",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36",
}

async function checkIn() {
  const session = axios.create({
    headers: DEFAULT_HEADERS,
  })
  session.defaults.headers["Cookie"] = cookies
  const res = await session.get(
    "https://zhiyou.smzdm.com/user/checkin/jsonp_checkin"
  )
  console.log(res.data)
  const { error_code, error_msg, data } = res.data
  if (error_code === 0) {
    server({ title: "什么值得买签到成功", desp: data.slogan })
  } else {
    server({ title: "什么值得买签到失败", desp: error_msg })
  }
}

checkIn()
