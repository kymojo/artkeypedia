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