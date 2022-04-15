const puppeteer = require("puppeteer")
const config = require("./config.json")
const server = require("./push")

function errorHandler(tips, error) {
  console.log(tips)
  server({ title: tips, content: error })
}

async function main() {
  let title = ""
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

  const page = await browser.newPage()
  try {
    await page.goto("https://poi.aoao.me", {
      waitUntil: "networkidle0",
    })
    console.log("进入https://poi.aoao.me页面")
  } catch (error) {
    errorHandler("https://poi.aoao.me 无法访问!")
    await browser.close()
    return
  }
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.click("#js-alert-btn"),
    ])
    console.log("进入新地址页面")
  } catch (error) {
    errorHandler("进入新地址失败!")
    await browser.close()
    return
  }

  try {
    await Promise.all([
      page.waitForNavigation([{ waitUntil: "networkidle0" }]),
      page.click("a.btn-round"),
    ])
    console.log("进入登陆页")
  } catch (error) {
    errorHandler("进入登陆页失败!")
    await browser.close()
    return
  }

  try {
    const userNameInput = await page.$("#email")
    const passWordInput = await page.$("#passwd")
    await userNameInput.type(config.userName, { delay: 100 })
    await passWordInput.type(config.passWord, { delay: 100 })
    await Promise.all([
      page.waitForNavigation([{ waitUntil: "networkidle0" }]),
      page.click("#login"),
    ])
    console.log("填写表单登陆")
  } catch (error) {
    errorHandler("登陆失败!", error)
    await browser.close()
    return
  }
  await page.waitForTimeout(3000)
  try {
    const signBtn = await page.$("#checkin")
    if (signBtn) {
      await page.click("#checkin")
      console.log("签到成功!")
      title = "sakura"
      await page.waitForTimeout(3000)
      const count = await page.$eval("#msg", (node) => node.innerText)
      if (count) {
        title += `${count}`
        await page.click("#result_ok")
      }
    } else {
      console.log("今日已签到!")
      title = "今日已签到,"
    }
  } catch (error) {
    errorHandler("获取签到信息失败!", error)
    await browser.close()
    return
  }

  await page.waitForTimeout(3000)

  // 获取剩余流量信息
  try {
    const remark = await page.$eval("#remain", (node) => node.innerText)
    title += `剩余流量：${remark}`
    console.log(`剩余流量：${remark}`)
  } catch (error) {
    errorHandler("获取剩余流量失败!", error)
    await browser.close()
    return
  }
  console.log(title)
  await server({ title })
  browser.close()
}

main()
