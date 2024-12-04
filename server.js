const Fastify = require("fastify")
const path = require("path")

const fastify = Fastify({ logger: true })

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"), // 指定静态文件目录
  prefix: "/", // 设置 URL 前缀，例如 '/static/' -> '/static/文件名'
})

fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send("File not found")
})
fastify.get("/", async (request, reply) => {
  return { message: "Hello, Fastify!" }
})

// 启动服务
const start = async () => {
  try {
    const PORT = process.env.PORT || 5757
    // 监听 0.0.0.0
    await fastify.listen({ port: PORT, host: "0.0.0.0" })

    // 打印服务地址
    console.log(`Server listening at:`)
    console.log(`- PORT: ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
