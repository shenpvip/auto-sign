const fs = require("fs").promises,
  axios = require("axios"),
  { execSync } = require("child_process"),
  server = require("./push")

// 读取环境变量
const cookies = formatString(process.env.JDCOOKIES)

//文件路径配置
const scriptPath = "./script.js",
  resultPath = "./result.txt"

// 格式化用户输入
function formatString(string) {
  return string.replace(/\s/g, "")
}

async function getScript() {
  return axios.get(
    "https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js"
  )
}

// 写入cookie
async function writeCookie(data) {
  if (data) {
    console.log("脚本下载成功")
  }

  if (cookies) {
    let cookieStr = ""
    cookieStr = JSON.stringify(
      cookies.split(",").map((str) => {
        const arr = str.split("@")
        const obj = {
          cookie: arr[0],
        }
        if (arr[1]) {
          obj.jrBody = arr[1]
        }
        return obj
      })
    )
    data = data.replace(/var OtherKey = ``/, `var OtherKey = \`${cookieStr}\``)
  } else {
    throw new Error("未配置cookie")
  }

  await fs.writeFile(scriptPath, data).catch((e) => {
    throw new Error("写入cookie到脚本失败")
  })
  console.log("写入cookie到脚本成功")
}

//执行签到, 并输出log为文件
async function execScript() {
  await execSync(`node '${scriptPath}' >> '${resultPath}'`)
  console.log("执行并输出log为文件成功")
}

//server酱推送
async function sendNotify() {
  const result = await fs
    .readFile(resultPath, { encoding: "utf-8" })
    .catch((e) => {
      throw new Error("读取签到结果失败")
    })

  const title = result.match(/Cookie失效/)
    ? "京东cookie失效，请更新"
    : result.match(/(?<=【账号总计】:)\d*/)
    ? "签到成功，共获得" + result.match(/(?<=【账号总计】:)\d*/) + "京豆"
    : "签到失败，请查看GitHub Actions日志"
  await server({ title })
}

async function main() {
  const data = (await getScript())?.data?.data
  await writeCookie(data)
  await execScript()
  await sendNotify()
}

main()
