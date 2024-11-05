const puppeteer = require("puppeteer")
const server = require("../utils/push")
function formatToISO(date) {
  return date
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")
    .replace(/\.\d{3}Z/, "")
}
const ACCOUNTS_JSON = JSON.parse(process.env.ACCOUNTS_JSON)
const userName = ACCOUNTS_JSON.serv00.userName
const passWord = ACCOUNTS_JSON.serv00.passWord
;(async () => {
  const browser = await puppeteer.launch({
    // executablePath:
    //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  })
  const page = await browser.newPage()

  let url = `https://panel3.serv00.com/login/?next=/`

  try {
    // 修改网址为新的登录页面
    await page.goto(url, { waitUntil: "networkidle2" })

    // 清空用户名输入框的原有值
    const usernameInput = await page.$("#id_username")
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 }) // 选中输入框的内容
      await usernameInput.press("Backspace") // 删除原来的值
    }

    // 输入实际的账号和密码
    await page.type("#id_username", userName)
    await page.type("#id_password", passWord)

    // 提交登录表单
    const loginButton = await page.$("#submit")
    if (loginButton) {
      await loginButton.click()
    } else {
      server({ title: "serv00登录失败", desp: userName })
      throw new Error("无法找到登录按钮")
    }

    // 等待登录成功（如果有跳转页面的话）
    await page.waitForNavigation()

    // 判断是否登录成功
    const isLoggedIn = await page.evaluate(() => {
      const logoutButton = document.querySelector('a[href="/logout/"]')
      return logoutButton !== null
    })

    if (isLoggedIn) {
      // 获取当前的UTC时间和北京时间
      const nowUtc = formatToISO(new Date()) // UTC时间
      const nowBeijing = formatToISO(
        new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
      ) // 北京时间东8区，用算术来搞
      console.log(
        `账号 ${userName} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`
      )
    } else {
      console.error(`账号 ${userName} 登录失败，请检查账号和密码是否正确。`)
      server({ title: "serv00登录失败", desp: userName })
    }
  } catch (error) {
    server({ title: "serv00登录失败", desp: userName })
    console.error(`账号 ${userName} 登录时出现错误: ${error}`)
  } finally {
    // 关闭页面和浏览器
    await page.close()
    await browser.close()
  }
})()
