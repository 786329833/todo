<template>
  <div class="todos-root">
    <p class="todos-title">Todos</p>
    <Todos class="todos" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Todos from "./components/Todos.vue";

@Options({
  components: {
    Todos,
  },
})
export default class App extends Vue {}
</script>

<style>
body {
  overflow: hidden;
}
.todos-title {
  width: 820px;
  text-align: center;
  font-size: 40px;
  font-weight: 100;
}
.todos-root {
  position: relative;
  left: calc(50% - 410px);
}

.todos {
  width: 820px;
}

input {
  border: none;
  font-size: 1.4em;
  height: 2.7em;
  border-bottom: 1px solid #c8cccf;
  outline: 0;
}
</style>
