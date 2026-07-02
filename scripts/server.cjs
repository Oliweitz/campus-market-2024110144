// ============================================================
// 校园轻集市 — 自定义 API 服务器
// 基于 json-server，扩展图片上传功能
// ============================================================

const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const server = jsonServer.create();
const dbPath = path.join(__dirname, '..', 'db.json');
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, '..', 'public'),
});

// ---------- Multer 配置 ----------
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片文件（JPG / PNG / GIF / WebP）'));
    }
  },
});

// ---------- 上传接口 ----------
server.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择图片文件' });
  }
  res.json({ url: '/uploads/' + req.file.filename });
});

// 全局错误处理（multer 错误等）
server.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '图片大小不能超过 5MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  _next();
});

// ---------- 中间件与路由 ----------
server.use(middlewares);
server.use(router);

// ---------- 启动 ----------
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 API Server running at http://localhost:${PORT}`);
  console.log(`   📁 Upload endpoint:  POST /upload`);
  console.log(`   📦 JSON Server:      http://localhost:${PORT}`);
});
