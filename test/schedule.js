const schedule = require("node-schedule")

schedule.scheduleJob("30 1 * * *", function () {
  console.log("This job was supposed to run at " + new Date())
})
