const puppeteer = require("puppeteer")
const fs = require("fs")

// 获取所有章节的url
async function getCharterUrlList() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const baseUrl = "https://m.xwbxsw1.com/html/351/351450"
  let pageNumber = 1
  let hasNextPage = true
  const urlList = []

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
    }
    hrefs = hrefs.flatMap((url) => {
      let index = url.length - 5 // 倒数第5个位置的索引
      let newStr2 = url.slice(0, index) + "_2" + url.slice(index)
      let newStr3 = url.slice(0, index) + "_3" + url.slice(index)
      return [url, newStr2, newStr3]
    })
    urlList.push(...hrefs)

    // 检查是否存在下一页
    hasNextPage = await page.evaluate(() => {
      const nextButton = document.querySelector("span.right a")
      return nextButton.href !== "javascript:void(0);"
    })
    pageNumber++
  }
  await browser.close()
  fs.writeFileSync("links.txt", urlList.join("\n"), "utf-8")
  return urlList
}

async function main() {
  const urls = await getCharterUrlList()
  // 打开文件写入流
  const writeStream = fs.createWriteStream("我被骗去缅北那些年.txt", {
    flags: "a",
  })
  // 启动 Puppeteer 浏览器
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // 遍历每个页面进行抓取
  for (const url of urls) {
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
