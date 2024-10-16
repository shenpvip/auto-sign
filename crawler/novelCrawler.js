const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

// 获取所有章节的url
async function getCharterUrlList() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const baseUrl = "https://m.xwbxsw1.com/html/316/316409"
  let pageNumber = 1
  let hasNextPage = true
  const urlList = []
  let title = ""

  while (hasNextPage) {
    // 构建当前页的URL
    const url = `${baseUrl}/index-${pageNumber}.html`
    console.log(`Navigating to ${url}`)
    await page.goto(url, { waitUntil: "networkidle2" })

    // 抓取 class 为 'chapter' 的 ul 标签下所有 a 标签的 href 属性
    let hrefs = await page.$$eval("ul.chapter li a", (elements) => {
      return elements.map((element) => element.href)
    })
    if (pageNumber === 1) {
      hrefs = hrefs.splice(5)
      title = await page.$eval("#bqgmb_h1", (element) => element.innerText)
    }
    hrefs = hrefs.flatMap((url) => {
      let index = url.length - 5 // 倒数第5个位置的索引
      let newStr2 = url.slice(0, index) + "_2" + url.slice(index)
      let newStr3 = url.slice(0, index) + "_3" + url.slice(index)
      return [url, newStr2, newStr3]
    })
    urlList.push(...hrefs)

    // 检查是否存在下一页
    // hasNextPage = await page.evaluate(() => {
    //   const nextButton = document.querySelector("span.right a")
    //   return nextButton.href !== "javascript:void(0);"
    // })
    hasNextPage = false
    pageNumber++
  }
  await browser.close()
  return { urlList, title }
}

async function main() {
  const { urlList, title } = await getCharterUrlList()
  const filePath = path.join(__dirname, `../txt`)
  // 检查文件夹是否存在
  if (!fs.existsSync(filePath)) {
    try {
      // 创建文件夹，递归模式确保所有上级目录也会被创建（如果必要）
      fs.mkdirSync(filePath, { recursive: true })
      console.log("文件夹已创建:", filePath)
    } catch (error) {
      console.error("创建文件夹时出错:", error)
    }
  } else {
    console.log("文件夹已存在:", filePath)
  }
  // 打开文件写入流
  const writeStream = fs.createWriteStream(filePath + `/${title}.txt`, {
    flags: "a",
  })
  // 启动 Puppeteer 浏览器
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // 遍历每个页面进行抓取
  for (const url of urlList) {
    try {
      // 导航到当前页面
      await page.goto(url, { waitUntil: "networkidle2" })

      // 抓取指定内容，这里假设内容位于 id 为 'nr1' 的元素中
      const content = await page.$eval("#nr1", (element) => element.innerText)
      if (!url.includes("_")) {
        const charterTitle = await page.$eval(
          "#nr_title",
          (element) => element.innerText
        )
        writeStream.write(`${charterTitle}\n\n`)
      }
      writeStream.write(`${content}\n\n`)
      console.log(`已抓取并写入：${url}`)
    } catch (error) {
      console.error(`抓取页面 ${url} 时出错:`, error)
    }
  }

  // 关闭文件写入流和浏览器
  writeStream.end()
  await browser.close()
}
main(process.argv.splice(2)).catch((error) => {
  console.log(error.message)
  throw error
})
