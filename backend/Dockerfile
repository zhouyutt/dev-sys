# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 配置 npm 使用淘宝镜像加速
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖（不使用 --production 以确保安装所有依赖）
RUN npm install

# 复制源代码
COPY . .

# 创建 uploads 目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 使用阿里云镜像源并安装 netcat（用于数据库健康检查）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache busybox-extras

# 添加等待数据库准备就绪的脚本
RUN cat > wait-for-db.sh <<'EOF'
#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 3306; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "MySQL is up - executing command"
exec $cmd
EOF

RUN chmod +x wait-for-db.sh

# 启动命令
CMD ["sh", "-c", "./wait-for-db.sh mysql node src/index.js"]
