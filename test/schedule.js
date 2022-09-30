const schedule = require("node-schedule")

schedule.scheduleJob("10 0 * * * *", function () {
  console.log("This job was supposed to run at " + new Date())
})
