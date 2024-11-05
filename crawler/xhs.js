const ExcelJS = require("exceljs")
const { waitForTimeout, pageInstance } = require("../utils/utils")

async function getData(page) {
  await page.waitForSelector("div.feeds-container")
  let res = await page.$eval("div.feeds-container", (element) => {
    const items = element.querySelectorAll("section.note-item")
    return Array.from(items).map((item) => {
      return {
        title: item.querySelector("a.title span")
          ? item.querySelector("a.title span").innerText
          : null,
        url: item.querySelector("a.cover")
          ? item.querySelector("a.cover").href
          : null,
        user: item.querySelector("span.name")
          ? item.querySelector("span.name").innerText
          : null,
        count: item.querySelector("span.count")
          ? item.querySelector("span.count").innerText
          : null,
      }
    })
  })
  return res
}

async function main() {
  const searchContent = ""
  const page = await pageInstance()
  await page.goto("https://www.xiaohongshu.com/", {
    waitUntil: "networkidle2",
  })
  console.log("等待用户登录...")
  await page.waitForSelector("li.user")
  await waitForTimeout(1000, 3000) // 随机等待 0.5 到 2.5 秒
  await page.click("input#search-input")
  await page.keyboard.type(searchContent, { delay: 200 })
  await page.keyboard.press("Enter", { delay: 100 })
  console.log("开始搜索...")
  let result = [],
    pageCount = 1,
    hasNext = true
  while (result.length <= 50 && hasNext) {
    const data = await getData(page)
    result.push(...data)
    console.log(`已获取第 ${pageCount} 页数据`)
    await page.keyboard.press("End", { delay: 100 })
    await waitForTimeout(1000, 3000) // 随机等待 0.5 到 2.5 秒
    pageCount++
    const element = await page.$("div.end-container")
    if (element) {
      hasNext = false
    }
  }
  console.log(`共获取到 ${result.length} 条数据`)
  console.log("开始写入 Excel 文件...")
  // 创建一个新的 Excel 工作簿
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("数据")
  // 添加表头
  worksheet.columns = [
    { header: "标题", key: "title", width: 30 },
    { header: "链接", key: "url", width: 30 },
    { header: "用户名", key: "user", width: 30 },
    { header: "点赞数", key: "count", width: 30 },
  ]

  // 将数据行逐行添加到工作表
  result.forEach((row) => {
    worksheet.addRow(row)
  })
  // 自适应列宽的逻辑
  worksheet.columns.forEach((column) => {
    let maxLength = 0
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10
      if (columnLength > maxLength) {
        maxLength = columnLength
      }
    })
    column.width = maxLength + 10 // 适当加 2，避免太紧凑
  })
  // 将工作簿写入 Excel 文件
  await workbook.xlsx.writeFile("output.xlsx")
  console.log("Excel 文件已生成: output.xlsx")
  await browser.close()
}

main(process.argv.splice(2)).catch((error) => {
  console.log(error.message)
  throw error
})
