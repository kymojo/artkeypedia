<template>
  <div id="app">
    <span id="msg">{{ message }}</span>
    <br/>
    <router-link to="/foo">Go Foo</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello World',
    };
  },
};
</script>

<style>
#msg {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
  color: blue;
}
</style>