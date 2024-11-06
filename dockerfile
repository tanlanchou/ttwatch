# 使用官方的Node.js运行时作为基础镜像
FROM node:16-alpine AS BUILD_IMAGE

# 安装 curl
RUN apk add --no-cache curl

# 下载并安装 node-prune
RUN curl -sfL https://gobinaries.com/tj/node-prune | sh

# 设置工作目录
WORKDIR /usr/src/app

# 将package.json和package-lock.json复制到工作目录
COPY package*.json ./

# 安装依赖，仅安装生产依赖
RUN npm --registry=https://registry.npmmirror.com i --only=production

# 运行 node-prune 删除不必要的文件
RUN /usr/local/bin/node-prune

# 编译后的代码位于根目录的 dist 文件夹，因此只复制 dist 文件夹
COPY ./dist ./dist

# 使用多阶段构建，仅复制需要的文件到最终镜像
FROM node:16-alpine

WORKDIR /usr/src/app

# 复制生产依赖
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

# 复制应用程序代码
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist

# 暴露端口
EXPOSE 8108

# 运行应用程序
CMD [ "node", "dist/main.js" ]

