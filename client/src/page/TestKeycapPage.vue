<!--####################################################-->
<style>

.pc {
    border: 1px solid black;
    margin: .5em;
}

</style>
<!--####################################################-->
<template>

<div id="test-keycap-page">
    
    <page-card class="pc" title="Skidd the Bat">
        <table>
            <tr><td style="vertical-align:top;"><b>Colorway</b></td><td>
                Pastel Panic <br/>
                <span style="font-size:.8em;font-style:italic;">
                    You are currently viewing a single colorway for this keycap.<br/>
                    Click here for the <a href="#">Skidd the Bat</a> main page.
                </span>
            </td></tr>
            <tr><td colspan="2">&nbsp;</td></tr>
            <tr><td><b>Artist</b></td><td>Sludgekidd</td></tr>
            <tr><td><b>Release Date</b></td><td>May 22, 2019</td></tr>
            <tr><td><b>Summary</b></td><td>Skidd the Bat is the 5th keycap sculpt released by Sludgekidd.</td></tr>
            <tr><td colspan="2">&nbsp;</td></tr>
            <tr><td colspan="2"><i><b>20</b> users have this cap</i></td></tr>
            <tr><td colspan="2"><i><b>103</b> users want this cap</i></td></tr>
            <tr><td colspan="2">&nbsp;</td></tr>
            <tr><td><b>Links</b></td><td>n/a</td></tr>
            <tr><td><b>Tags</b></td><td>bat, creepy, blue, light blue, pink, pastel (show colorway-specific tags)</td></tr>
        </table>
    </page-card>

    <page-card class="pc" title="Specifications" collapsible="true">
        <table>
            <tr><td><b>Material</b></td><td>Resin</td></tr>
            <tr><td><b>Stem</b></td><td>MX</td></tr>
        </table>
    </page-card>

    <page-card class="pc" title="Gallery" collapsible="true">
        gallery gallery gallery
    </page-card>

    <page-card class="pc" title="Colorways" collapsible="true">
        3 colorways exist for this cap
    </page-card>

    <page-card class="pc" title="Sale History" collapsible="true">
        <table>
            <tr><td><b>Latest Sale</b></td><td>June 28, 2019 (see detail)</td></tr>
            <tr><td><b>Summary</b></td><td>N/A</td></tr>
        </table>
        <a href="https://www.chartjs.org/">(probably gonna use this)</a>
    </page-card>

    <page-card class="pc" title="Related" collapsible="true">
        <table>
            <tr><td>Caps by same artist</td></tr>
            <tr><td>Caps with similar tags</td></tr>
            <tr><td>Keysets with similar tags</td></tr>
            <tr><td>User builds with this item</td></tr>
        </table>
    </page-card>

</div>

</template>
<!--####################################################-->
<script>

import PageCard from '../component/PageCard';

export default {
    name: 'test-keycap-page',
    components: {
        PageCard
    },
    props: [],
    data: function() {
        return {
            
        };
    },
    computed: {},
    methods: {},

    beforeCreated () {},
    created () {},
    mounted () {},
    beforeDestroy () {},
    destroy () {}
}

</script>
<!--####################################################-->