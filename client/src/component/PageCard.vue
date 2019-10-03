<!--####################################################-->
<style>
#page-card {
  padding: .5em;
  display: flex;
  flex-direction: column;
}

.header {
  flex-grow: 1;
  display: flex;
  font-weight: bold;
}

.header .left {
  flex-grow: 1;
}

.header .right {
  cursor: pointer;
  width: 1.8em;
  line-height: 1.8em;
  margin: -.4em;
  text-align: center;
  font-weight: bold;
}
.header .right:hover {
  background-color: grey;
}
.body {
  margin-top: .5em;
  padding-top: .25em;
  overflow: none;
}
</style>
<!--####################################################-->
<template>

<div id="page-card">
    <div class="header">
     <span class="left" v-if="title">{{title}}</span>
     <span class="right" v-if="collapsible"  @click="isCollapsed = !isCollapsed">{{isCollapsed ? ">" : "v"}}</span>
   </div>
     <div class="body" v-if="!isCollapsed">
       <slot></slot>
     </div>
</div>

</template>
<!--####################################################-->
<script>

export default {
    name: 'page-card',
    props: ['title','collapsible','collapse'],
    data: function () {
      return {
        isCollapsed: (this.collapsible && this.collapsed) || false,
    }},
}

</script>
<!--####################################################-->