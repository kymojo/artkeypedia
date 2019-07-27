
<!--####################################################-->
<style>

body {
    margin: 0; padding: .5em; padding-top: 5.5em;
    font-family: Arial,Helvetica Neue,Helvetica,sans-serif;
}

</style>
<!--####################################################-->
<template>
  <div id="index">
    <page-header></page-header>
    <div style="margin-left:auto;margin-right:auto;width:70%;min-width:32em;display:flex;text-align:center;">
      <div style="flex-grow:1">
        <a href="/new">New</a>
        <!-- <router-link to="/new">New</router-link> -->
      </div>
      <div style="flex-grow:1;">
        <a href="/cap">Cap</a>
        <!-- <router-link to="/cap">Cap</router-link> -->
      </div>
    </div>
  </div>
</template>
<!--####################################################-->
<script>
import PageHeader from '../component/PageHeader'

export default {
  components: {
    PageHeader
  },
  data: function() {
    return {
      message: 'Hello World',
    };
  },
};
</script>
<!--####################################################-->