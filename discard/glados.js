const axios = require("axios")
const server = require("../utils/push")
const schedule = require("node-schedule")

const checkIn = async (cookie) => {
  return axios({
    method: "post",
    url: "https://glados.rocks/api/user/checkin",
    headers: {
      Cookie: cookie,
    },
    data: {
      token: "glados.network",
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
  console.log(checkInMessage)
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

  const title =
    `- 账号:${titleEmail}\n
    - 天数: ${titleLeftDays}\n
    - 签到情况:${titleCheckInMessage}`

  server({
    title: `glados签到成功，天数：${titleLeftDays}`,
    desp: title,
  })
}

const GLaDOSCheckIn = async () => {
  try {
    // const cookies = process.env.COOKIES?.split("&&") ?? []
    const cookies = ['_ga=GA1.2.1088860688.1657506097; koa:sess=eyJjb2RlIjoiM0RJVkQtWUo4VFAtSklETEUtWE9FUk4iLCJ1c2VySWQiOjE1MDY0NiwiX2V4cGlyZSI6MTY5NzQ0MzE0MDY0NiwiX21heEFnZSI6MjU5MjAwMDAwMDB9; koa:sess.sig=g5JGebonvnS6TdBBqp07ra_bhE0; _gid=GA1.2.1394727825.1672714920; _gat_gtag_UA_104464600_2=1']
    const infos = await Promise.all(
      cookies.map(async (cookie) => await checkInAndGetStatus(cookie))
    )
    console.log(infos, 'infos')

    if (infos.length) {
      pushMsg(infos)
    }
  } catch (error) {
    console.log(error)
  }
}

schedule.scheduleJob("30 1 * * *", function () {
  GLaDOSCheckIn()
})