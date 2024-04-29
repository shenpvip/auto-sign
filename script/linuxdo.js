const puppeteer = require("puppeteer")
const config = require("../config.json")
const server = require("../utils/push")

function errorHandler(tips, error) {
  console.log(tips)
  server({ title: tips, desp: error || '' })
}

async function main() {
  let title = ""
  const browser = await puppeteer.launch()

  const page = await browser.newPage()
  try {
    await page.goto("https://linux.do")
    console.log("进入https://linux.do/页面")
    await page.click("button.login-button")
    console.log("打开登录弹窗")
    await page.waitForTimeout(3000)
    const userNameInput = await page.$("#login-account-name")
    const passWordInput = await page.$("#login-account-password")
    await userNameInput.type(config.userName, { delay: 100 })
    await passWordInput.type(config.passWord, { delay: 100 })
    await page.click("#login-button")
    console.log("填写表单登陆")
    await page.waitForTimeout(6000)
    const loginElement = await page.$("#current-user")
    if (loginElement) {
      console.log("登录成功！")
      title = "登录成功！"
    } else {
      console.log("登录失败!")
      title = "登录失败!"
    }
  } catch (error) {
    console.log(error)
    errorHandler("登录失败", error)
    await browser.close()
    return
  }
  await server({ title })
  browser.close()
}

main()
