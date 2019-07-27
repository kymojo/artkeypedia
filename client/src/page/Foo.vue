<!--####################################################-->
<style>

</style>
<!--####################################################-->
<template>

<div id="foo">
    <page-header></page-header>
    <input type="button" value="API" id="bar" @click="testApi()"/>
    <br/>
    Some?
    <router-link to="/">Go Back</router-link>
</div>

</template>
<!--####################################################-->
<script>
import PageHeader from '../component/PageHeader'
import ApiHelper from '../script/api-helper'

export default {
    name: 'foo',
    components: {
        PageHeader
    },
    data: function() {
        return {

        }
    },
    methods: {
        testApi: function() {
            ApiHelper.callApiGet('test',function() {
            
                const data = this.response; // JSON.parse(this.response);
                // if (request.status >= 200 && request.status < 400)
                // {
                alert(data);
                // }
                // else
                // {
                //     alert('I am error');
                // }
            });
        }
    }
}

</script>
<!--####################################################-->