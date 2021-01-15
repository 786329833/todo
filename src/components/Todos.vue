<template>
  <div class="root">
    <div class="todo">
      <div class="todo-controller">
        <input
          type="text"
          class="search-todo-input"
          placeholder="搜索"
          v-model="searchKeywords"
        />
        <div class="todo-controller-details">
          <div class="left-uncompleted-num">
            剩余未完成事项数量：{{ leftCompletedTodosNum }}
          </div>
          <label
            class="radio-item"
            v-for="(item, index) in typesOfTodos"
            :key="index"
          >
            <input
              class="radio-input"
              type="radio"
              v-model="typeOfTodosOnShow"
              :value="item.value"
            />
            <span class="radio-text"> {{ item.name }} </span>
            <br />
          </label>
        </div>
      </div>
      <div class="todo-container">
        <input
          class="add-todo-input"
          ref="addInput"
          @keyup.enter="addTodoItem($event)"
          type="text"
          placeholder="输入后按下回车添加todo"
        />
        <div class="todo-list">
          <div
            class="todo-item"
            v-for="(todo, index) in todosOnShow"
            :key="todo.id"
            @dblclick="updatingTodoItem(index, todo.text, $event)"
          >
            <!-- 不要同时使用checked 和 v-model -->
            <input
              class="completed-checkbox"
              type="checkbox"
              :checked="todo.completed"
              @dblclick="$event.stopPropagation()"
              @change="changeCompletedStatus(todo, $event)"
            />
            <span
              class="todo-text"
              v-if="!todo.updating"
              :style="
                todo.completed
                  ? {
                      color: 'grey',
                      'text-decoration': 'line-through',
                    }
                  : ''
              "
            >
              {{ todo.text }}
            </span>
            <input
              v-else
              class="update-todo-input"
              ref="updatingInput"
              type="text"
              @keyup.enter="updateInputBlur"
              @blur="updatedTodoText(todo, $event)"
            />
            <img
              class="delete"
              src="../assets/delete.svg"
              @click="deleteTodoItem(todo)"
              @dblclick="$event.stopPropagation()"
              v-if="!todo.updating"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="console">
      <span>console</span>
      <div>
        <span class="log-item" v-for="log in logs" :key="log">
          {{ log }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TodoItem } from "../interfaces/TodoItem";
import { httpGet, httpPost } from "../http/http";
import {
  allTodos,
  completedTodos,
  unCompletedTodos,
} from "../constants/todosTypes";
import { errorLog, acceptLog } from "../constants/log";
const Component = defineComponent({
  data() {
    return {
      // 所有todos
      todos: [] as TodoItem[],
      // 正在搜索的关键字
      searchKeywords: "" as string,
      // 正在展示的todo种类，默认为全部todo
      typeOfTodosOnShow: "allTodos" as string,
      // todos种类：全部todos、已完成todos、未完成todos
      typesOfTodos: [allTodos, completedTodos, unCompletedTodos],
      // 输出log
      logs: [] as string[],
    };
  },

  computed: {
    // 正在展示的todos: 全部、已完成、未完成，加入搜索关键字
    todosOnShow(): TodoItem[] {
      let todosOnShow = [] as TodoItem[];
      switch (this.typeOfTodosOnShow) {
        case "allTodos":
          todosOnShow = (this.todos as Array<TodoItem>).filter(
            (todo: TodoItem) =>
              this.searchKeywords === "" ||
              this.isKeywordsIn(todo.text, this.searchKeywords)
          );
          break;
        case "completedTodos":
          todosOnShow = (this.todos as Array<TodoItem>).filter(
            (todo: TodoItem) =>
              todo.completed &&
              (this.searchKeywords === "" ||
                this.isKeywordsIn(todo.text, this.searchKeywords))
          );
          break;
        case "unCompletedTodos":
          todosOnShow = (this.todos as Array<TodoItem>).filter(
            (todo: TodoItem) =>
              !todo.completed &&
              (this.searchKeywords === "" ||
                this.isKeywordsIn(todo.text, this.searchKeywords))
          );
          break;
      }
      return todosOnShow;
    },
    // 剩余未完成todos数目
    leftCompletedTodosNum(): number {
      const leftNum = (this.todos as Array<TodoItem>).filter(
        (todo: TodoItem) => !todo.completed
      ).length;
      return leftNum;
    },
  },

  mounted() {
    this.connectServer();
  },

  methods: {
    // 初始化数据库并创建表
    connectServer() {
      const createdbPromise = httpGet("/api/createdb");
      const choosedbPromise = httpGet("/api/choosedb");
      const createTablePromise = httpGet("/api/createTable");
      Promise.all([createdbPromise, choosedbPromise, createTablePromise])
        .then(() => {
          this.logs.push(acceptLog.initMysqlAccept);
          this.queryTodos();
        })
        .catch((err) => {
          this.logs.push(errorLog.initMysqlError);
          throw err;
        });
    },

    // 查询todos
    queryTodos() {
      const queryTodosPromise = httpGet("/api/queryTodos");
      queryTodosPromise
        .then((res) => {
          this.todos = res.data;
        })
        .catch((err) => {
          this.logs.push(errorLog.queryTodoError);
          throw err;
        });
    },

    // 添加todo
    addTodoItem(ev: any) {
      const newTodoText = ev.target.value;
      if (newTodoText === '') return;
      const todoItem: TodoItem = {
        text: newTodoText,
        completed: false,
      };
      httpPost("/api/addTodo", todoItem)
        .then((res) => {
          if (res.status === 200) {
            this.queryTodos();
            this.logs.push(acceptLog.addTodoAccept + ": " + todoItem.text);
            (this.$refs as any).addInput.value = null;
          }
        })
        .catch((err) => {
          this.logs.push(errorLog.addTodoError);
          throw err;
        });
    },

    // 以id作为删除todo的索引
    deleteTodoItem(deletedTodo: TodoItem) {
      httpPost("/api/deleteTodo", { id: deletedTodo.id })
        .then((res) => {
          if (res.status === 200) {
            this.todos = this.todos.filter((t) => t.id != deletedTodo.id);
            this.logs.push(
              acceptLog.deleteTodoAccept + ": " + deletedTodo.text
            );
          }
        })
        .catch((err) => {
          this.logs.push(errorLog.deleteTodoError);
          throw err;
        });
    },

    // 与服务端交互,修改某项todo
    updateTodoItem(updatedTodo: TodoItem) {
      httpPost("/api/updateTodo", updatedTodo)
        .then((res) => {
          if (res.status === 200) {
            this.logs.push(
              acceptLog.updateTodoAccept +
                ": " +
                updatedTodo.text +
                (updatedTodo.completed ? " 已完成" : " 未完成")
            );
          }
        })
        .catch((err) => {
          this.logs.push(errorLog.updateTodoError);
          throw err;
        });
    },

    // 双击某项todo，将其换成可编辑的输入框，保留内容并聚焦
    updatingTodoItem(index: number, text: string, event: any) {
      event.preventDefault();
      this.todosOnShow[index].updating = true;
      this.$nextTick(() => {
        (this.$refs as any).updatingInput.value = this.todosOnShow[index].text;
        (this.$refs as any).updatingInput.focus();
      });
    },

    // 使正在编辑的输入框失去焦点，其将调用updatedTodoItem
    updateInputBlur() {
      this.$nextTick(() => {
        (this.$refs as any).updatingInput.blur();
      });
    },

    // 完成对todo内容的修改，输入框消失，原先的todo替换为输入框中的内容
    updatedTodoText(todo: TodoItem, ev: any) {
      delete todo.updating;
      if (todo.text !== ev.target.value) {
        todo.text = ev.target.value;
        this.updateTodoItem(todo);
      }
    },

    // 改变todo的完成状态
    changeCompletedStatus(todo: TodoItem, ev: any) {
      todo.completed = ev.target.checked;
      this.updateTodoItem(todo);
    },

    // 是否包含关键字
    isKeywordsIn(str: string, keywords: string) {
      return str.search(keywords) !== -1;
    },
  },
});

export default Component;
</script>
<style scoped>
.todo {
  display: flex;
  position: relative;
}

.todo-controller {
  width: 300px;
  border: solid 1px rgb(136, 136, 136);
  border-radius: 1%;
  background-color: rgb(238, 238, 238);
}

.todo-container {
  padding: 4px;
  border: solid 1px black;
  width: 600px;
  height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-todo-input {
  background-color: rgb(221, 220, 220);
  height: 30px;
  border-radius: 10px;
  margin: 4px;
  position: relative;
  top: 20px;
}

.todo-controller-details {
  position: relative;
  top: 30px;
}

.add-todo-input {
  width: 100%;
}

.update-todo-input {
  width: 100%;
}

.todo-item {
  height: 60px;
  display: flex;
  word-break: break-all;
}

.todo-text {
  height: 60px;
  font-size: 30px;
  line-height: 60px;
  flex: 1;
  overflow: auto;
}

.completed-checkbox {
  width: 20px;
}

.delete {
  width: 30px;
  cursor: pointer;
  margin-left: auto;
}

.radio-item {
  margin: 6px 0;
  display: flex;
  height: 40px;
}

.radio-input {
  height: 40px;
  margin: 0 4px;
}

.radio-text {
  line-height: 40px;
  font-size: 26px;
}

.left-uncompleted-num {
  margin: 4px;
  font-size: 26px;
}

.console {
  height: 200px;
  border: solid 1px rgb(177, 175, 172);
  background-color: rgb(248, 248, 248);
  padding: 4px;
  overflow: auto;
}

.log-item {
  display: block;
}
</style>