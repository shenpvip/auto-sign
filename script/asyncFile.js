const axios = require("axios")
const fs = require("fs")
const path = require("path")
const AdmZip = require("adm-zip")

/**
 * 解压文件到指定目录
 * @param {string} zipFilePath - ZIP 文件路径
 * @param {string} targetDir - 解压的目标目录
 */
function extractZipToDir(zipFilePath, targetDir) {
  try {
    // 如果目标目录已存在，删除其内容
    // if (fs.existsSync(targetDir)) {
    //   console.log(`清空目录：${targetDir}`)
    //   fs.rmSync(targetDir, { recursive: true, force: true })
    // }

    // 确保目标目录存在
    fs.mkdirSync(targetDir, { recursive: true })

    console.log(`解压文件：${zipFilePath} 到目录：${targetDir}`)
    const zip = new AdmZip(zipFilePath)
    zip.extractAllTo(targetDir, true) // true 表示覆盖同名文件
    console.log("解压完成！")
  } catch (error) {
    console.error("解压文件时发生错误：", error)
  }
}

// 递归下载 GitHub 仓库中符合名称规则的文件
async function downloadMatchingFilesRecursive(repoOwner, repoName, pattern) {
  const saveDir = "downloaded_files"
  try {
    // 构造 API 请求 URL
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`

    // 获取目录内容
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    })

    // 解析目录内容
    for (let item of response.data) {
      const itemPath = path.join("", item.name)

      if (
        item.type === "file" &&
        item.name.includes(pattern) &&
        item.name.includes(".zip")
      ) {
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
          extractZipToDir(
            fileName,
            path.join(__dirname, `../public/${repoName}`)
          )

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
    console.error(`错误：无法访问目录或下载文件：`, error)
  }
}

async function main() {
  await downloadMatchingFilesRecursive("fish2018", "PG", "pg.")
  // await downloadMatchingFilesRecursive("fish2018", "ZX", "真心")
}

main()
