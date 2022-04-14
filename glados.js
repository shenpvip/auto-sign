const axios = require("axios")
const server = require("./push")

const checkIn = async (cookie) => {
  return axios({
    method: "post",
    url: "https://glados.rocks/api/user/checkin",
    headers: {
      Cookie: cookie,
    },
    data: {
      token: "glados_network",
    },
  })
}

const getStatus = async (cookie) => {
  return axios({
    method: "get",
    url: "https://glados.rocks/api/user/status",
    headers: {
      Cookie: cookie,
    },
  })
}

const checkInAndGetStatus = async (cookie) => {
  const checkInMessage = (await checkIn(cookie))?.data?.message

  const userStatus = (await getStatus(cookie))?.data?.data
  const email = userStatus?.email
  const leftDays = parseInt(userStatus?.leftDays)

  return {
    账号: email,
    天数: leftDays,
    签到情况: checkInMessage,
  }
}

const pushMsg = (infos) => {
  const titleEmail = infos?.[0]["账号"]
  const titleLeftDays = infos?.[0]["天数"]
  const titleCheckInMessage = infos?.[0]["签到情况"]

  const title = `- 账号:${titleEmail}\n
    - 天数: ${titleLeftDays}\n
    - 签到情况:${titleCheckInMessage}`

  server({
    title: `签到成功，天数：${titleLeftDays}`,
    desp: title,
  })
}

const GLaDOSCheckIn = async () => {
  try {
    const cookies = process.env.COOKIES?.split("&&") ?? []

    const infos = await Promise.all(
      cookies.map(async (cookie) => await checkInAndGetStatus(cookie))
    )
    console.log(infos)

    if (infos.length) {
      pushMsg(infos)
    }
  } catch (error) {
    console.log(error)
  }
}

GLaDOSCheckIn()
