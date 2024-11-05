const data = process.env.ACCOUNTS_JSON
const accounts = JSON.parse(data)
console.log(accounts, "data------")
console.log(accounts.serv00, "serv00------")
console.log(accounts.serv00.userName, "userName------")
