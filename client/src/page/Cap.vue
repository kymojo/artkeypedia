<!--####################################################-->
<style>

#cap { display: flex; width: 70%; min-width: 32em; padding:1em; margin: 0 auto; flex-direction: column; }

#title { color: #3149ce; font-weight: bold; font-size: 2em;}
#artist { color: #3149ce; font-size: 1.25em; }

#header { display: flex; flex-grow: 1; }
#thumbnail { height: 10em; width: 10em; min-width: 10em; margin-right: 3em; background-color: grey; }

#title-bar { flex-grow: 1; display: flex; flex-direction: column; }
#title-space { flex-grow: 1; display: flex; flex-direction: column; }
#title-tabs { display: flex; align-items: flex-end; }

.page-tab {
    flex-grow: 1;
    height: 2em; line-height: 2em;
    text-align: center;
    color: black;
    cursor: pointer;
    border-style: solid;
    border-color: blue;
    border-width: 2px;
    border-radius: .5em;
    padding: .25em;
    margin-right: .25em;
    margin-bottom: .25em;
}
.page-tab:hover { text-decoration: underline; color: black; }
.page-tab:active { margin-bottom: 0; text-decoration: none; }
.selected { background-color: white; border-bottom-style: none; border-radius: .5em .5em 0 0; margin-bottom: -.15em; z-index: 10; }
.selected:hover { text-decoration: none; cursor: default; }

#body { display: flex; }
#body-left { width: 10em; margin-right: 3em; }
#body-main { flex-grow: 1; border-top: 2px solid blue; padding-top: .5em; }

</style>
<!--####################################################-->
<template>

<div>
    <page-header></page-header>
    <div id="cap">

        <div id="header">
            <div id="thumbnail">Thumbnail</div>
            <div id="title-bar">
                <div id="title-space">
                    <span id="title">Cap Title</span>
                    <span id="artist">Cap Artist</span>
                </div>
                <div id="title-tabs">
                    <div class="page-tab selected">Summary</div>
                    <div class="page-tab">Colorways</div>
                    <div class="page-tab">History</div>
                    <div class="page-tab">Other</div>
                </div>
            </div>
            <div style="width:3em;height:10em;background-color:lightblue;color:white;">Ad</div>
        </div>
        
        <div id="body">
            <div id="body-left">
                Blah
            </div>
            <div id="body-main">
                <div style="font-size:.8em;">
                    <span>Description</span><br/>
                    <span>It's peanut butter jelly time! Peanut butter jelly time!</span>
                </div>
            </div>
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
    name: 'cap',
    data: function() {
        return {
            capData: getCapData()
        }
    },
    methods: {
        getCapData: function() {
            
        }
    }
}

</script>
<!--####################################################-->