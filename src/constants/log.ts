export { errorLog, acceptLog };
const defaultSetup = {
  default: '服务器host：localhost，port：3456，数据库user：root，pwd：123456。'
}

const errorLog = {
  initMysqlError: '初始化mysql失败,默认配置：' + defaultSetup.default +
    `请在后端index.js文件中修改相应的数据库连接参数并确认后端node项目及本地mysql服务启动。
    (注意：若修改服务器端口3456或ip，请一并修改vue.config.js中跨域设置的target)`,
  addTodoError: '添加todo失败',
  deleteTodoError: '删除todo失败',
  updateTodoError: '修改todo失败',
  queryTodoError: '读取todo失败'
}

const acceptLog = {
  initMysqlAccept: '初始化数据库成功',
  addTodoAccept: '添加todo成功',
  deleteTodoAccept: '删除todo成功',
  updateTodoAccept: '修改todo成功',
  queryTodoAccept: '读取todo成功'
}