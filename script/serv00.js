const puppeteer = require("puppeteer")
const config = require("../config.json")
const server = require("../utils/push")

function formatToISO(date) {
  return date
    .toISOString()
    .replace("T", " ")
    .replace("Z", "")
    .replace(/\.\d{3}Z/, "")
}

async function delayTime(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  let url = `https://panel3.serv00.com/login/?next=/`

  try {
    // 修改网址为新的登录页面
    await page.goto(url)

    // 清空用户名输入框的原有值
    const usernameInput = await page.$("#id_username")
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 }) // 选中输入框的内容
      await usernameInput.press("Backspace") // 删除原来的值
    }

    // 输入实际的账号和密码
    await page.type("#id_username", config.serv00.userName)
    await page.type("#id_password", config.serv00.passWord)

    // 提交登录表单
    const loginButton = await page.$("#submit")
    if (loginButton) {
      await loginButton.click()
    } else {
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
        `账号 ${config.serv00.userName} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）登录成功！`
      )
      server({ title: "serv00登录成功", desp: config.serv00.userName })
    } else {
      console.error(
        `账号 ${config.serv00.userName} 登录失败，请检查账号和密码是否正确。`
      )
      server({ title: "serv00登录失败", desp: config.serv00.userName })
    }
  } catch (error) {
    server({ title: "serv00登录失败", desp: config.serv00.userName })
    console.error(`账号 ${config.serv00.userName} 登录时出现错误: ${error}`)
  } finally {
    // 关闭页面和浏览器
    await page.close()
    await browser.close()

    // 用户之间添加随机延时
    const delay = Math.floor(Math.random() * 8000) + 1000 // 随机延时1秒到8秒之间
    await delayTime(delay)
  }
})()

// 自定义延时函数
function delayTime(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}