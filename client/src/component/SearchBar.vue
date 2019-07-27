<!--####################################################-->
<style>

#search-bar { display:flex; }

#text-input { flex-grow:1; position:relative; }
#type-in { width:100%; }
#results { background-color:white;position:absolute;width:calc(100% - 2px);border:1px solid grey; }
.result-line { margin:.25em;border-bottom:1px solid grey; }

#go-button { margin-left:.25em; }

</style>
<!--####################################################-->
<template>

<div id="search-bar">
    <div id="text-input">
        <input id="type-in" type="text" placeholder="Search" v-model="searchText" @keydown="event_getAutofill"/>
        <div id="results" v-show="hasResults">
            <div class="result-line" v-for="option in autofill" :key="option">{{option}}</div>
        </div>
    </div>
    <input id="go-button" type="button" value="Go" @click="event_search"/>
</div>

</template>
<!--####################################################-->
<script>

export default {
    name: 'search-bar',
    props: [
        'autofill',
        'delay'
    ],
    data: function() {
        return {
            searchText: "",
            searchTextPrevious: "",
            autofillDelay: this.delay || 500,
            delayTimeout: null
        };
    },
    methods: {
        event_getAutofill: function() {
            // If timeout is in progress, clear it
            if (this.delayTimeout)
                clearTimeout(this.delayTimeout);
            // Start new timeout, delaying event emitter
            this.delayTimeout = setTimeout(
                function() {
                    // Only emit if search text has been updated
                    if (this.searchText !== this.searchTextPrevious) {
                        // Emit event
                        this.$emit('get-autofill',this.searchText);
                        this.searchTextPrevious = this.searchText;
                    }
                }.bind(this), this.autofillDelay);
        },
        event_search: function() {
            this.$emit('search',this.searchText);
        }
    },
    computed: {
        hasResults: function() {
            return (this.autofill.length > 0);
        }
    },
}

</script>
<!--####################################################-->

