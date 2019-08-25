<!--####################################################-->
<style>
.container { border: 1px solid black; }
</style>
<!--####################################################-->
<template>

<div id="interface-keycap">
    
    <div class="container">
        <h1>Mode: {{cap ? 'Edit' : 'New'}} Keycap</h1>
    </div>

    <div class="container" v-for="field in fields" :key="field.name">
        <text-field :field-name="field.name"
                v-model="field.value"
                :placeholder="field.placeholder"
                :edit-mode="editMode"
                :validator="field.validator"/>
    </div>

</div>

</template>
<!--####################################################-->
<script>
import Api from '../script/api-helper.js'

export default {
    name: 'interface-keycap',
    components: {},
    props: [],
    data: function() {
        return {
            loading: false,
            cap: null,
            fields: ''
        };
    },
    computed: {},
    methods: {
        getCap: function() {
            this.loading = true;
            Api.callApiGet('',()=>{
                
            });
            return {
                pk: null,
                id: null,
                name: null
            };
        },
        getCapFields: function() {

        },
        defineFields: function() {
            return [
                {
                    name: 'KeycapPK',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    validator: function(check) {
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                },
                {
                    name: 'KeycapID',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    validator: function(check) {
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                },
                {
                    name: 'KeycapName',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    validator: function(check) {
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                }
            ];
        }
    }
}

</script>
<!--####################################################-->