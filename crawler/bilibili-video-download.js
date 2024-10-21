const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")
const axios = require("axios")

const exePath = "C:\\project\\media-download\\lux\\"
let basePath = ""
/**
 * 获取视频信息
 * @param {*} url 视频url
 */
async function getInfo(url) {
  /**
   * 本地测试说明
   * headless - 打开浏览器试图
   * executablePath - 浏览器所在路径
   */
  const browser = await puppeteer.launch({
    // headless: false,
    // executablePath:
    //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  })
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: "networkidle2" })

  let title = await page.$eval(
    "#viewbox_report .video-title",
    (element) => element.innerText
  )

  const desp = await page.$eval(
    "#v_desc .desc-info-text",
    (element) => element.innerText
  )
  // 要检查和创建的文件夹路径
  title = title.replace(/[<>:"/\\|?*]/g, "_")
  basePath = path.join(exePath, title)
  // 检查文件夹是否存在
  if (!fs.existsSync(basePath)) {
    try {
      // 创建文件夹，递归模式确保所有上级目录也会被创建（如果必要）
      fs.mkdirSync(basePath, { recursive: true })
      console.log("文件夹已创建:", basePath)
    } catch (error) {
      console.error("创建文件夹时出错:", error)
    }
  } else {
    console.log("文件夹已存在:", basePath)
  }
  await saveDesp(desp, title)
  // 获取 <meta> 标签的 content 属性
  let videoImage = await page.evaluate(() => {
    // 选择特定的 <meta> 标签
    const metaTag = document.querySelector('meta[itemprop="image"]') // 修改选择器以匹配需要的 <meta> 标签
    return metaTag ? metaTag.content : null // 返回 content 属性值，若不存在则返回 null
  })
  videoImage = videoImage.split("@")[0]
  await downloadImage(videoImage, title)
  await browser.close()
}

/**
 * 执行exe 文件下载视频
 * @param {*} url 视频url
 * @param {*} mode down 下载，info 获取信息
 */
async function runExe(url, mode = "down") {
  // 这里的路径需要替换为你的 .exe 文件的实际路径
  const executablePath = path.join(exePath, "lux.exe")

  // 参数（如果有的话）可以放在这个数组中
  const infoArgs = ["-c", path.join(exePath, "bilibili_cookie.txt"), "-i", url]

  const downloadArgs = [
    "-c",
    path.join(exePath, "bilibili_cookie.txt"),
    "-f",
    "80-12",
    "-o",
    basePath,
    url,
  ]
  const args = mode === "info" ? infoArgs : downloadArgs
  console.log(`开始下载...`)
  // 执行 .exe 文件
  try {
    // 同步执行文件并捕获标准输出
    const output = execFileSync(executablePath, args, {
      encoding: "utf8", // 指定输出的编码
      stdio: "pipe", // 控制输入输出，可以是 'inherit', 'ignore', 或 'pipe'
    })
    console.log(`下载成功: ${output}`)
  } catch (error) {
    console.error(`完整的错误信息: ${error}`)
  }
}

/**
 * 下载并保存图片
 * @param {*} url 图片url
 */
async function downloadImage(url, title) {
  try {
    // 发送 GET 请求下载图片，设置 responseType 为 'stream'
    const response = await axios({
      url: `https:${url}`,
      method: "GET",
      responseType: "stream",
    })

    // 创建写入流将图片保存到指定路径
    const writer = fs.createWriteStream(path.join(basePath, `${title}.jpg`))

    // 管道传输数据，下载完成后关闭流
    response.data.pipe(writer)

    // 监听下载完成和错误事件
    writer.on("finish", () => {
      console.log("图片下载成功")
    })

    writer.on("error", (err) => {
      console.error("写入文件时出错:", err.message)
    })
  } catch (error) {
    console.error("下载图片时出错:", error.message)
    return
  }
}

async function saveDesp(textContent, title) {
  // 保存文件的路径，确保文件名带有 .txt 扩展名
  const outputPath = path.join(basePath, `${title}.txt`) // 你可以根据需要更改文件路径和名称
  try {
    fs.writeFileSync(outputPath, textContent, "utf8") // 'utf8' 指定编码格式
    console.log("描述保存成功")
  } catch (error) {
    console.error("写入文件时出错:", error.message)
    return
  }
}

async function getVideoList(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "networkidle2" })

  let hrefs = await page.$$eval(
    "#submit-video-list .list-list li a",
    (elements) => {
      return elements.map((element) => element.href)
    }
  )
  hrefs = [...new Set(hrefs)]
  hrefs = hrefs.splice(0, 10)
  await browser.close()
  return hrefs
}

async function main() {
  const url = "https://space.bilibili.com/701220372/video"
  const list = await getVideoList(url)
  for (const item of list) {
    await getInfo(item)
    await runExe(item)
  }
}

main(process.argv.splice(2)).catch((error) => {
  console.log(error.message)
  throw error
})
