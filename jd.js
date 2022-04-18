const puppeteer = require("puppeteer")

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 400,
      height: 600,
      isMobile: true,
    },
  })
  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36"
  )
  try {
    await page.goto("https://m.jd.com", {
      waitUntil: "networkidle0",
    })
    console.log("进入https://m.jd.com")
  } catch (error) {
    console.log("https://m.jd.com 无法访问!")
    await browser.close()
    return
  }
  await page.waitForTimeout(5000)
  try {
    await Promise.all([
      page.waitForNavigation([{ waitUntil: "networkidle0" }]),
      page.click("#msShortcutLogin"),
    ])
    console.log("进入登陆页")
  } catch (error) {
    console.log("进入登陆页失败!", error)
    await browser.close()
    return
  }

  await page.screenshot({ path: "example.png" })
  //   const cookies = await page.cookies()
  //   console.log(cookies)
  
  browser.close()
}
main()
