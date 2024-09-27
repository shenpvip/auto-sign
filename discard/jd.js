const fs = require("fs")
const exec = require("child_process").execSync
const server = require("../utils/push")
const download = require("download")

// 读取环境变量
const cookies = process.env.JDCOOKIES

async function downFile() {
  const url =
    "https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js"
  await download(url, "./")
}

// 写入cookie
async function changeFile() {
  let content = fs.readFileSync("./JD_DailyBonus.js", "utf8")
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
    content = content.replace(
      /var OtherKey = ``/,
      `var OtherKey = \`${cookieStr}\``
    )
  } else {
    throw new Error("未配置cookie")
  }
  await fs.writeFileSync("./JD_DailyBonus.js", content, "utf8")
}

//server酱推送
async function sendNotify() {
  const result = fs.readFileSync("./result.txt", "utf8")
  const title = result.match(/Cookie失效/)
    ? "京东cookie失效，请更新"
    : result.match(/(?<=【账号总计】:).*\d*/g)
    ? "京东签到成功，共获得" + result.match(/(?<=【账号总计】:).*\d*/g)
    : "京东签到失败，请查看GitHub Actions日志"
  console.log(title)
  await server({ title })
}

async function main() {
  await downFile()
  console.log("下载代码完毕")
  await changeFile()
  console.log("替换变量完毕")
  // 执行
  await exec("node JD_DailyBonus.js >> result.txt")
  console.log("执行完毕")
  await sendNotify()
}

main()
