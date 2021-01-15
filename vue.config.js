// 跨域设置
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3456/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
};
