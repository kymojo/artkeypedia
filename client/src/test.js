import Vue from 'vue';

Vue.directive('click-outside', {
    bind: function (el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
            // here I check that click was outside the el and his childrens
            if (!(el == event.target || el.contains(event.target))) {
                // and if it did, call method provided in attribute value
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unbind: function (el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    },
});

Vue.component('login-popup', {
    props: [
        'current-user'
    ],
    data: function() {
        return {
            delayOutside: true, // delays popup
            opened: false,
            loggedIn: (this.currentUser !== "" && this.currentUser),
            username: this.currentUser,
            password: ""
        }
    },
    computed: {
        buttonText: function() {
            return (this.opened
                ? 'Close'
                : ((this.loggedIn)
                    ? 'Account'
                    : 'Log In')
            );
        }
    },
    methods: {
        togglePopup: function() {
            this.opened = !this.opened;

            if (!this.opened)
                this.delayOutside = true;
        },
        closePopup: function() {
            if (this.delayOutside)
            {
                this.delayOutside = false;
                return;
            }
            this.togglePopup();
        },
        event_logIn: function() {
            this.$emit('log-in', {username: this.username, password: this.password});
        }
    },
    template:
    `<div class="login-popup">
            <input type="button" style="width:5em;" :value="buttonText" @click="togglePopup"/>

            <div v-if="opened" v-click-outside="closePopup" style="text-align:right;position:absolute;top:2em;right:0;border:1px solid grey;border-top:0;padding:.5em;">
                <form v-if="!loggedIn">
                    <input type="text" placeholder="Username" v-model="username" style="margin-bottom:.25em;"/><br/>
                    <input type="password" placeholder="Password" v-model="password" style="margin-bottom:.25em;"/><br/>
                    <input type="submit" value="Log in" @click="event_logIn"/>
                </form>
                <div v-else>
                    Logged in!
                </div>
            </div>
        </div>`
});

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

new Vue({
    el: '#header',
    component: [
        'login-component',
        'search-bar'
    ],
    data: {
        username: "",
        autofillResults: []
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
});