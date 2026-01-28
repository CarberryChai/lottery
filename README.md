# Lottery 彩票历史数据查询系统

大乐透、双色球历史开奖数据查询系统。

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + Shadcn/ui
- **部署**: Cloudflare Pages
- **数据库**: Cloudflare D1

## 数据概览

| 彩种 | 数据量 | 数据源 |
|------|--------|--------|
| 大乐透 | 2829 期 | 体彩官方 API |
| 双色球 | 1971 期 | 500.com |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 数据抓取

```bash
# 更新大乐透数据
python3 scripts/fetch_super_lotto.py

# 更新双色球数据
python3 scripts/fetch_double_color_ball.py
```

## 项目结构

```
├── app/                # Next.js App Router
├── components/         # React 组件
├── data/              # 历史数据 JSON
│   ├── lottery_data.json        # 双色球
│   └── super_lotto_data.json    # 大乐透
├── db/                # D1 数据库 Schema
├── functions/         # Cloudflare Functions
├── lib/               # 工具函数
└── scripts/           # 数据抓取脚本
```

## 部署

项目部署到 Cloudflare Pages，数据库使用 Cloudflare D1。

```bash
# 创建 D1 数据库
npx wrangler d1 create lottery-db

# 部署
npx wrangler pages deploy .next
```

## License

MIT
