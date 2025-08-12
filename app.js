const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const compression = require("compression");
const zlib = require("zlib");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// 启用 Brotli 和 gzip 压缩
app.use(
  compression({
    // 设置 Brotli 为首选压缩算法
    brotliOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11, // 设置 Brotli 压缩质量，0 (最差) - 11 (最好)
      },
    },
    // 默认会使用 gzip，但当接受的请求头中含有 Brotli 时，它会优先使用 Brotli
    threshold: 1024, // 文件大于1k才压缩
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 只转发以 /api 开头的请求
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://test-ai.smartroi.cn/api", // 目标服务器
    changeOrigin: true, // 更改请求来源，以适应目标服务器
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);
app.use("/home", indexRouter);
app.use("/", indexRouter);

// 禁用缓存的中间件
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
