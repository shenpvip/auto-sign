const puppeteer = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
module.exports = {
  async waitForTimeout(start = 500, end = 1000) {
    const time = (Math.random() * (end - start) + start) >> 0
    return new Promise((resolve) => setTimeout(resolve, time))
  },
  // 判断文件夹是否存在
  fileIsExist(path) {
    if (!fs.existsSync(path)) {
      try {
        // 创建文件夹，递归模式确保所有上级目录也会被创建（如果必要）
        fs.mkdirSync(path, { recursive: true })
        console.log("文件夹已创建:", path)
      } catch (error) {
        console.error("创建文件夹时出错:", error)
      }
    } else {
      console.log("文件夹已存在:", path)
    }
  },
  async pageInstance() {
    // 准备多个 User-Agent 和请求头配置
    // const userAgents = [
    //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    //   "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    // ]
    // const headersList = [
    //   {
    //     "Accept-Language": "en-US,en;q=0.9",
    //     Referer: "https://example.com",
    //     Connection: "keep-alive",
    //   },
    //   {
    //     "Accept-Language": "zh-CN,zh;q=0.9",
    //     Referer: "https://example.com",
    //     Connection: "keep-alive",
    //   },
    // ]

    // // 随机选择 User-Agent 和 Headers
    // function getRandomConfig() {
    //   const userAgent =
    //     userAgents[Math.floor(Math.random() * userAgents.length)]
    //   const headers =
    //     headersList[Math.floor(Math.random() * headersList.length)]
    //   return { userAgent, headers }
    // }

    // 使用 stealth 插件
    puppeteer.use(StealthPlugin())

    const browser = await puppeteer.launch({
      // headless: false,
      // executablePath:
      //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    })
    const page = await browser.newPage()
    // 获取随机的 User-Agent 和 Headers
    // const { userAgent, headers } = getRandomConfig()
    // 设置 User-Agent
    // await page.setUserAgent(userAgent)

    // 设置额外的 HTTP 头
    // await page.setExtraHTTPHeaders(headers)
    // await page.setViewport({
    //   width: 1280,
    //   height: 800,
    // })
    // 默认情况下，Puppeteer将navigator.webdriver属性设置为true。这暴露了自动化工具的存在。通过禁用或修改此属性，您可以减少被检测的机会。
    // await page.evaluateOnNewDocument(() => {
    //   Object.defineProperty(navigator, "webdriver", { get: () => false })
    // })
    return { page, browser }
  },
}
