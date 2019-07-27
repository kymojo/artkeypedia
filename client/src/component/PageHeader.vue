<!--####################################################-->
<style>

#page-header {
    position:fixed;top:0;left:0;
    display:flex;
    height:3em;
    width:calc(100% - 2em);
    background-color: lightgrey;
    padding:1em;
}
#page-header div {flex-grow:1;}

</style>
<!--####################################################-->
<template>

<div id="page-header">
    <div style="font-weight:bold;">
        <a href="/">Keycap Nation</a>
        <!--<router-link to="/">Keycap Nation</router-link>-->
    </div>
    <div>
        <search-bar :autofill="autofillResults" @get-autofill="getAutoFill" @search="search"/>
    </div>
    <div style="text-align:right;position:relative;">
        <login-popup :current-user="username" @log-in="logIn"/>
    </div>
</div>

</template>
<!--####################################################-->
<script>

import LoginPopup from './LoginPopup';
import SearchBar from './SearchBar';

export default {
    name: 'page-header',
    components:  {
        LoginPopup,
        SearchBar
    },
    data: function() {
        return {
            username: "",
            autofillResults: []
        }
    },
    computed: {
        imageURL: function() {
            return 'image/' + this.keycap.image;
        }
    },
    methods: {
        logIn: function(credentials) {
            alert(`User: ${credentials.username} / Pass: ${credentials.password}`);
        },
        search: function(searchText) {
            alert(`Search for: ${searchText}`);
        },
        getAutoFill: function(searchText) {
            this.autofillResults = searchText.split(' ').filter(x => x);
        }
    }
};

</script>
<!--####################################################-->