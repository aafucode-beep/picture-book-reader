# 绘本阅读 App - 开发简报

## 项目目标
为3-6岁幼儿的父母开发一个 Web 应用，自动将绘本图片转换为多角色语音朗读。

## 技术栈
- 前端：React + TypeScript + Tailwind CSS（Vite）
- 后端：Python FastAPI
- AI 视觉分析：MiniMax M2.5（通过 Anthropic 兼容接口）
  - API Key: sk-api-zaKUk19gv0vq9esMrsqKua1IKgE6ynGvMK16WmPEm-Iij8qwLGW5WusNWr_P0O5ABTtdwB-GlpjdSxKJ3YOa-pp1NDXLgPRnmRT2MPQBpBR5z5vTTFTvbv4
  - Base URL: https://api.minimaxi.com/anthropic
  - Model: MiniMax-M2.5
- TTS：edge-tts（Python 库，免费多角色）
- 存储：本地文件系统（后期迁移腾讯云 COS）
- 部署：Vercel（前端）+ 本地/云端 Python 服务（后端）

## Phase 1 核心功能（MVP）
1. 上传绘本图片（支持多张，按页顺序）
2. AI 分析每页内容，输出结构化 JSON：
   - 旁白文本
   - 角色名 + 台词 + 情感
   - 页面场景描述
3. TTS 多角色语音合成：
   - 旁白：温柔女声（zh-CN-XiaoxiaoNeural）
   - 儿童角色：童声（zh-CN-XiaoyiNeural）
   - 成人男性角色：低沉男声（zh-CN-YunxiNeural）
   - 成人女性角色：温柔女声（zh-CN-XiaochenNeural）
4. 播放器：顺序播放各页语音，显示对应文本
5. 本地保存：原图 + JSON + MP3

## 关键设计细节
- 封面图优先用于识别书名（辅助网络搜索）
- AI Prompt 强制输出结构化 JSON，区分旁白/角色/情感
- 系列角色一致性：characters.json 记录角色→音色映射
- 护眼模式：播放时界面极简，支持息屏播放
- 手机优先设计（竖屏）

## 文件结构
```
picture-book-reader/
├── frontend/          # React 前端
├── backend/           # FastAPI 后端
│   ├── main.py
│   ├── analyzer.py    # AI 分析模块
│   ├── tts_engine.py  # TTS 模块
│   └── storage.py     # 文件存储模块
└── data/              # 本地数据存储
    └── books/
```
