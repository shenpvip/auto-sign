const ExcelJS = require("exceljs")
const { waitForTimeout, pageInstance } = require("../utils/utils")
const searchContent = "天斧77pro"
const maxSearchCount = 10
async function getData(page) {
  await page.waitForSelector("div.feeds-container")
  let res = await page.$eval("div.feeds-container", (element) => {
    const items = element.querySelectorAll("section.note-item")
    const results = []
    Array.from(items).forEach((item) => {
      if (item.querySelector("span.name")) {
        results.push({
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
        })
      }
    })
    return results
  })
  return res
}

async function main() {
  const { browser, page } = await pageInstance()
  const cookie = [
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1763199237,
      hostOnly: false,
      httpOnly: false,
      name: "xsecappid",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "xhs-pc-web",
    },
    {
      domain: "www.xiaohongshu.com",
      expirationDate: 1731665034.782705,
      hostOnly: true,
      httpOnly: true,
      name: "acw_tc",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "0a00d39c17316632347055899ebd9ea44e6f8bbb2a15b64c2e90dced06859e",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1731923338,
      hostOnly: false,
      httpOnly: false,
      name: "websectiga",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "a9bdcaed0af874f3a1431e94fbea410e8f738542fbb02df1e8e30c29ef3d91ac",
    },
    {
      domain: ".xiaohongshu.com",
      hostOnly: false,
      httpOnly: false,
      name: "webBuild",
      path: "/",

      secure: false,
      session: true,
      storeId: null,
      value: "4.43.0",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1731664743,
      hostOnly: false,
      httpOnly: false,
      name: "sec_poison_id",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "1c900500-15cb-45ae-bd28-364739673a41",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1761015741.170666,
      hostOnly: false,
      httpOnly: true,
      name: "web_session",
      path: "/",

      secure: true,
      session: false,
      storeId: null,
      value: "0400698cdb68ec56e59e548c20354b634d9f8a",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1766223239.621487,
      hostOnly: false,
      httpOnly: false,
      name: "gid",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value:
        "yjJj4yDJdJv2yjJj4yDJWkTWdfdWEdMyUClCV3382I638E28lfKKMl888JqJ2Y48fW4Jyd8d",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1760597660,
      hostOnly: false,
      httpOnly: false,
      name: "a1",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "192941b27ede7wes1pxox05nmi0od66sygjwok7ii50000232584",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1760597659.762568,
      hostOnly: false,
      httpOnly: false,
      name: "abRequestId",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "a76ad4dd-5c20-51e0-b772-30600100a203",
    },
    {
      domain: ".xiaohongshu.com",
      hostOnly: false,
      httpOnly: false,
      name: "unread",
      path: "/",

      secure: false,
      session: true,
      storeId: null,
      value:
        "{%22ub%22:%226712098f0000000024018a34%22%2C%22ue%22:%2267316528000000001b013d9b%22%2C%22uc%22:28}",
    },
    {
      domain: ".xiaohongshu.com",
      expirationDate: 1760597660,
      hostOnly: false,
      httpOnly: false,
      name: "webId",
      path: "/",

      secure: false,
      session: false,
      storeId: null,
      value: "8ed1860d908cc9b8c8f42b916bb5e595",
    },
  ]
  await page.setCookie(...cookie)
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  })
  await page.goto("https://www.xiaohongshu.com/", {
    waitUntil: "networkidle2",
  })
  console.log("等待用户登录...")
  await page.waitForSelector("li.user")
  await waitForTimeout(1000, 3000)
  await page.click("input#search-input")
  await page.keyboard.type(searchContent, { delay: 200 })
  await page.keyboard.press("Enter", { delay: 100 })
  console.log("开始搜索...")
  let result = [],
    pageCount = 1,
    hasNext = true
  while (result.length <= maxSearchCount && hasNext) {
    const data = await getData(page)
    result.push(...data)
    console.log(`已获取第 ${pageCount} 页数据`)
    await page.keyboard.press("End", { delay: 100 })
    await waitForTimeout(1000, 3000)
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
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const cellValue = row.getCell(4).value // 获取当前行的指定列
      const cell = row.getCell(4)
      if (cellValue.includes("万")) {
        cell.value = cellValue.replace("万", "") * 10000
      } else {
        cell.value = Number(cellValue)
      }
    }
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
