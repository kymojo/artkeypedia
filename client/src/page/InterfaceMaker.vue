<!--####################################################-->
<style>
.container { border: 1px solid black; padding: .5em; }
.textfield {
    margin: 0 .5em .5em 0;
    width: calc(33% - .5em);
}
</style>
<!--####################################################-->
<template>

<div id="interface-maker">
    
    <div class="container" style="margin-bottom:1em;">
        <h1 style="margin:0;">Mode: {{loading ? 'Loading...' : (maker ? 'Edit' : 'New')}} Maker</h1>
    </div>

    <!-- 
        Consider: https://rangle.io/blog/how-to-create-data-driven-user-interfaces-in-vue/
    -->

    <div class="container" style="display:flex;flex-wrap:wrap;">
        <loading-animation v-if="loading" color="lightgrey"/>
        <div v-else class="textfield" v-for="field in fields" :key="field.name">
            <text-field :field-name="field.name"
                    v-model="field.value"
                    :placeholder="field.placeholder"
                    :edit-mode="editMode"
                    :validator="field.validator"
                    :read-only="field.readOnly"/>
        </div>
    </div>

    <div class="container" style="margin-top:1em;">
        <input type="button" value="Save" @click="onSaveClick"/>
        <input type="button" value="Cancel" @click="onCancelClick"/>
    </div>

    <div class="container" style="margin-top:1em;padding:1em;">
        <file-upload/>
    </div>

</div>

</template>
<!--####################################################-->
<script>
import Api from '../script/api-helper.js';
import TextField from '../component/TextField';
import LoadingAnimation from '../component/LoadingAnimation';
import FileUpload from '../component/FileUpload';

export default {
    name: 'interface-maker',
    components: {
        TextField,
        LoadingAnimation,
        FileUpload
    },
    props: [],
    data: function() {
        return {
            loading: false,
            maker: null,
            fields: this.defineFields(),
            editMode: true,
        };
    },
    created() {
        // Load maker from db if PK != null
        if (this.$route.params.pk) {
            this.loadMaker(this.$route.params.pk);
        }
    },
    methods: {
        // ====== EVENTS ========================
        loadMaker: function(pk) {
            this.loading = true;
            Api.callApiGet(`maker/${pk}`,(req)=>{
                const data = req.response;
                this.maker = JSON.parse(data);
                this.loading = false;
                this.onMakerLoad();
            });
        },
        onMakerLoad: function() {
            for(const index in this.fields) {
                const field = this.fields[index];
                const makerField = this.maker[field.name];
                if (makerField) {
                    field.value = makerField;
                    field.savedValue = makerField;
                }
            }
        },
        onSaveClick: function() {
            if (this.maker) {
                this.updateObjectFromFields();
                Api.callApiPut(`maker/`,this.maker,(req)=>{
                    console.log(req.response);
                    window.location.reload();
                });
            }
            else {
                this.updateObjectFromFields();
                delete this.maker['MakerPk'];
                Api.callApiPost(`maker/`,this.maker,(req)=>{
                    const result = JSON.parse(req.response);
                    const newPk = result.postPk;
                    window.location.href = document.location.origin + '/interface/maker/' + newPk;
                });
            }
        },
        onCancelClick: function() {
            this.revertFieldValues();
        },
        // ====== FIELDS ========================
        updateObjectFromFields: function() {
            if (!this.maker)
                this.maker = {};

            for(const index in this.fields) {
                const field = this.fields[index];
                this.maker[field.name] = field.postprocessor(field.value);
            }
        },
        revertFieldValues: function() {
            for(const index in this.fields) {
                const field = this.fields[index];
                field.value = field.savedValue;
            }
        },
        saveFieldValues: function() {
            for(const index in this.fields) {
                const field = this.fields[index];
                field.savedValue = field.value;
            }
        },
        defineFields: function() {
            return [
                {
                    name: 'MakerPk',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: true,
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
                    name: 'MakerId',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
                    validator: function(check) {
                        if (!check)
                            return 'ID cannot be null';
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                },
                {
                    name: 'MakerName',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
                    validator: function(check) {
                        if (!check)
                            return 'Name cannot be null';
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                },
                {
                    name: 'MakerWebsite',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
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
                    name: 'MakerInstagram',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
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
                    name: 'MakerReddit',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
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
                    name: 'MakerGeekhack',
                    value: '',
                    savedValue: '',
                    placeholder: 'null',
                    readOnly: false,
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
    },
}

</script>
<!--####################################################-->