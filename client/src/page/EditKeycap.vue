<!--####################################################-->
<style>
    table { border-collapse: collapse; }
    table, td, tr { border: 1px solid black; }
    td { padding: .5em; }
    .fieldTitle {
        font-weight: bold;
        vertical-align: top;
    }
    #imageDisplay {
        max-width: 256px;
        max-height: 256px;
        margin-top: .5em;
    }
</style>
<!--####################################################-->
<template>

<div id="edit-keycap">
    <h3>Edit Keycap</h3>
    <!-- ############################################### -->
    <table>
        <tr>
            <td colspan="2" style="text-align:center;">
                Basic Info
            </td>
        </tr>
        <tr>
            <td class="fieldTitle">Name</td>
            <td><input id="nameField" placeholder="Name"/></td>
        </tr>
        <tr>
            <td class="fieldTitle">ID</td>
            <td><input id="idField" placeholder="ID"/></td>
        </tr>
        <tr>
            <td class="fieldTitle">Artist</td>
            <td><input id="artistField" placeholder="Artist"/></td>
        </tr>
        <tr>
            <td class="fieldTitle">Image</td>
            <td>
                <input id="imageField" type='file' @change="onFileChange" />
                <div v-if="imageUrl">
                    <img id="imageDisplay" :src="imageUrl" />
                </div>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align:center;">
                <input id="submitBasic" type="button" value="Submit"/>
            </td>
        </tr>
    </table>
    <!-- ############################################### -->
    <br/>
    <table>
        <tr>
            <td colspan="2" style="text-align:center;">
                More Info
            </td>
        </tr>
        <tr>
            <td class="fieldTitle">Release Date</td>
            <td>date picker</td>
        </tr>
        <tr>
            <td class="fieldTitle">Summary</td>
            <td>rich text or something?</td>
        </tr>
        <tr>
            <td class="fieldTitle">Material</td>
            <td>...</td>
        </tr>
        <tr>
            <td class="fieldTitle">Stem</td>
            <td>...</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align:center;">
                <input id="submitInfo" type="button" value="Submit"/>
            </td>
        </tr>
    </table>
    <!-- ############################################### -->
</div>

</template>
<!--####################################################-->
<script>

export default {
    name: 'edit-keycap',
    components: {},
    props: [],
    data: function() {
        return {
            imageUrl: null
        };
    },
    computed: {},
    methods: {

        onFileChange: function (e) {
            const file = e.target.files[0];
            this.imageUrl = URL.createObjectURL(file);
        }

    },

    beforeCreated () {},
    created () {},
    mounted () {},
    beforeDestroy () {},
    destroy () {}
}

</script>
<!--####################################################-->