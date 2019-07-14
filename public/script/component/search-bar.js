Vue.component('search-bar', {
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
    template: 
        `<div style="display:flex;">
            <div style="flex-grow:1;position:relative;">
                <input type="text" style="width:100%;" placeholder="Search" v-model="searchText" @keydown="event_getAutofill"/>
                <div v-show="hasResults" style="background-color:white;position:absolute;width:calc(100% - 2px);border:1px solid grey;">
                    <div v-for="option in autofill" style="margin:.25em;border-bottom:1px solid grey;">{{option}}</div>
                </div>
            </div>
            <input type="button" style="margin-left:.25em;" value="Go" @click="event_search"/>
        </div>`
});