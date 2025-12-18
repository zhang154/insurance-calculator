# 五险一金计算器

一个基于 Next.js 的社保公积金计算 Web 应用，支持根据预设的员工工资数据和城市社保标准，自动计算公司应缴纳的社保费用。

## 功能特点

- 🚀 **快速计算** - 一键完成所有员工的社保费用计算，支持千人规模数据批量处理
- 📊 **数据管理** - 支持 Excel 文件上传，自动解析城市标准和工资数据
- 📈 **结果展示** - 清晰的表格展示计算结果，支持排序、导出和打印
- 🎯 **准确可靠** - 严格按照社保政策规定计算，确保结果准确无误
- 🌐 **响应式设计** - 适配桌面和移动设备，提供良好的用户体验

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI/样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **数据处理**: XLSX、Zod
- **语言**: TypeScript

## 快速开始

### 1. 环境准备

确保你的环境中已安装：
- Node.js 18+
- npm 或 yarn

### 2. 克隆项目

```bash
git clone <repository-url>
cd insurance-calculator
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置 Supabase

#### 4.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册账号并创建新项目
3. 获取项目的 URL 和 API Keys

#### 4.2 配置数据库

在 Supabase 的 SQL Editor 中执行 `supabase-setup.sql` 文件中的脚本，创建必要的数据表。

#### 4.3 设置环境变量

创建 `.env.local` 文件并配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase项目_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_匿名_key
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
```

### 5. 运行项目

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 使用指南

### 1. 准备数据文件

#### 城市标准文件 (cities.xlsx)
| id | city_name | year | rate | base_min | base_max |
|----|-----------|------|------|----------|----------|
| 1  | 南山      | 2024 | 0.14 | 4546     | 26421    |

#### 员工工资文件 (salaries.xlsx)
| id | employee_id | employee_name | month | salary_amount |
|----|-------------|---------------|-------|---------------|
| 1  | 1           | 张三          | 202401| 30000         |

### 2. 上传数据

1. 访问 `/upload` 页面
2. 上传城市标准数据文件
3. 上传员工工资数据文件
4. 点击"执行计算并存储结果"

### 3. 查看结果

访问 `/results` 页面查看计算结果，支持：
- 数据排序
- 导出 Excel
- 打印功能

## 项目结构

```
insurance-calculator/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── page.tsx      # 主页
│   │   ├── upload/       # 数据上传页面
│   │   └── results/      # 结果展示页面
│   ├── components/       # React 组件
│   │   ├── NavigationCard.tsx
│   │   ├── FileUploader.tsx
│   │   ├── CalculateButton.tsx
│   │   └── ResultsTable.tsx
│   ├── lib/              # 核心业务逻辑
│   │   ├── supabase.ts   # Supabase 客户端配置
│   │   ├── calculator.ts # 核心计算函数
│   │   └── database.ts   # 数据库操作函数
│   ├── types/            # TypeScript 类型定义
│   │   └── schema.ts     # Zod 验证模式
│   └── utils/            # 工具函数
│       └── excelParser.ts # Excel 解析工具
├── public/               # 静态资源
├── supabase-setup.sql    # 数据库创建脚本
├── .env.local           # 环境变量（需手动创建）
└── README.md            # 项目说明
```

## 核心计算逻辑

1. **数据分组**: 按员工姓名分组计算年度月平均工资
2. **基数确定**: 将平均工资与城市基数上下限比较
   - 低于下限 → 使用下限
   - 高于上限 → 使用上限
   - 在范围内 → 使用平均工资
3. **费用计算**: 最终缴费基数 × 缴费比例 = 公司应缴费用

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署完成

### 其他平台

支持部署到任何支持 Next.js 的平台，如：
- Netlify
- AWS
- 阿里云
- 腾讯云

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

MIT License

## 支持

如有问题或建议，请联系：
- 提交 GitHub Issue
- 发送邮件至 [your-email@example.com]

---

© 2024 五险一金计算器. 专为中小企业设计.
