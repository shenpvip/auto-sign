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
    // 使用 stealth 插件
    // puppeteer.use(StealthPlugin())
    // var browser = await puppeteer.launch({
    //   headless: false,
    //   executablePath:
    //     "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    // })
    // var page = await browser.newPage()
    var { connect } = await import("puppeteer-real-browser")
    const { page, browser } = await connect({
      headless: "auto",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    return { page, browser }
  },
}
