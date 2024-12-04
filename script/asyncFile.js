const axios = require("axios")
const fs = require("fs")
const path = require("path")
const AdmZip = require("adm-zip")

// 递归下载 GitHub 仓库中符合名称规则的文件
async function downloadMatchingFilesRecursive(
  repoOwner,
  repoName,
  pattern,
  saveDir = "downloaded_files",
  currentPath = ""
) {
  try {
    // 构造 API 请求 URL
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${currentPath}`

    // 获取目录内容
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    })

    // 解析目录内容
    for (let item of response.data) {
      const itemPath = path.join(currentPath, item.name)

      if (item.type === "file" && item.name.includes(pattern)) {
        const fileUrl = item.download_url
        const fileName = path.join(saveDir, itemPath)

        // 创建目录（如果不存在）
        fs.mkdirSync(path.dirname(fileName), { recursive: true })

        console.log(`下载文件：${fileName} ...`)

        // 下载文件
        const fileResponse = await axios.get(fileUrl, {
          responseType: "arraybuffer",
        })

        if (fileResponse.status === 200) {
          // 保存文件
          fs.writeFileSync(fileName, fileResponse.data)
          console.log(`文件 ${fileName} 下载完成！`)

          // 解压 ZIP 文件
          const zip = new AdmZip(fileName)
          zip.extractAllTo(path.join(__dirname, "../public/pg"), true)
          console.log("文件解压完成")

          // 可选：删除 ZIP 文件
          fs.unlinkSync(fileName)
        } else {
          console.log(
            `下载失败：${fileName}, HTTP 状态码：${fileResponse.status}`
          )
        }
      } else if (item.type === "dir") {
        // 递归处理子目录
        await downloadMatchingFilesRecursive(
          repoOwner,
          repoName,
          pattern,
          saveDir,
          itemPath
        )
      }
    }
  } catch (error) {
    console.error(`错误：无法访问目录 ${currentPath} 或下载文件：`, error)
  }
}

// 示例：下载某仓库中所有 .md 文件（包括子目录）
const repoOwner = "fish2018"
const repoName = "PG"
downloadMatchingFilesRecursive(repoOwner, repoName, "pg.")
