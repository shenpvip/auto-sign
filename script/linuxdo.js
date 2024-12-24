const { waitForTimeout, pageInstance } = require("../utils/utils")
const server = require("../utils/push")

async function randomClick(page) {
  await page.waitForSelector("a.title.raw-link.raw-topic-link")
  console.log("开始随机浏览帖子...")
  const titles = await page.$$("a.title.raw-link.raw-topic-link")
  if (titles.length > 0) {
    const randomIndex = Math.floor(Math.random() * titles.length)
    const randomTitle = titles[randomIndex]
    randomTitle.click()
    // 后续操作可以在这里进行，例如等待加载或提取数据
    await page.waitForNavigation() // 等待页面导航
  } else {
    console.log("未发现帖子")
  }
}

async function scrollToBottom(page) {
  // 定义每次滚动的步长
  const scrollStep = 100 // 每次滚动的像素数（可以根据页面高度调整）
  const scrollDelay = 1000 // 每次滚动后的延迟时间（毫秒）

  // 滚动页面的函数
  const autoScroll = async () => {
    await page.evaluate(
      async (scrollStep, scrollDelay) => {
        // 获取页面的总高度
        const documentHeight = document.body.scrollHeight

        // 当前滚动的高度
        let currentScrollPosition = 0

        // 循环滚动，直到到达页面底部
        while (currentScrollPosition < documentHeight) {
          window.scrollBy(0, scrollStep) // 向下滚动 scrollStep 像素
          currentScrollPosition += scrollStep // 更新当前滚动位置
          await new Promise((resolve) => setTimeout(resolve, scrollDelay)) // 延迟 scrollDelay 毫秒
        }
      },
      scrollStep,
      scrollDelay
    )
  }
  await autoScroll()
}

async function waitSomeSeconds(page) {
  await waitForTimeout(1000, 3000)
  await page.goto("https://linux.do/new", { waitUntil: "networkidle2" })
}
async function main() {
  const ACCOUNTS_JSON = JSON.parse(process.env.ACCOUNTS_JSON)
  const userName = ACCOUNTS_JSON.linuxdo.userName
  const passWord = ACCOUNTS_JSON.linuxdo.passWord
  const { page, browser } = await pageInstance()
  await page.goto("https://linux.do", { waitUntil: "networkidle2" })
  await page.waitForSelector("button.login-button")
  await page.click("button.login-button")
  console.log("打开登录弹窗")
  await page.waitForSelector("#login-account-name")
  const userNameInput = await page.$("#login-account-name")
  const passWordInput = await page.$("#login-account-password")
  await userNameInput.type(userName, {
    delay: 100,
  })
  await passWordInput.type(passWord, {
    delay: 100,
  })
  await page.click("#login-button")
  console.log("填写表单登陆")
  await waitForTimeout(3000, 5000)
  await page.screenshot({ path: "screenshot.png", fullPage: true })
  try {
    await page.waitForSelector("#current-user")
    const loginElement = await page.$("#current-user")
    if (!loginElement) {
      console.log("登录失败!")
    } else {
      console.log("登录成功")
    }
  } catch (error) {
    await page.screenshot({ path: "screenshot1.png", fullPage: true })
  }

  // let count = 0
  // const target = Math.floor(Math.random() * (5 - 3 + 1)) + 3
  // console.log(`今日目标浏览${target}次`)
  // while (count < target) {
  //   await waitForTimeout(500, 1000)
  //   await randomClick(page)
  //   await scrollToBottom(page)
  //   count++
  //   console.log(`已浏览${count}次`)
  //   await waitSomeSeconds(page)
  // }
  // console.log("浏览完成")
  await browser.close()
}

main(process.argv.splice(2)).catch((error) => {
  console.log(error.message)
  server({ title: "linuxdo签到失败", desp: error.message })
  throw error
})
