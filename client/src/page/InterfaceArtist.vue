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

<div id="interface-artist">
    
    <div class="container" style="margin-bottom:1em;">
        <h1 style="margin:0;">Mode: {{loading ? 'Loading...' : (artist ? 'Edit' : 'New')}} Artist</h1>
    </div>

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
    name: 'interface-artist',
    components: {
        TextField,
        LoadingAnimation,
        FileUpload
    },
    props: [],
    data: function() {
        return {
            loading: false,
            artist: null,
            fields: this.defineFields(),
            editMode: true,
        };
    },
    computed: {},
    created() {
        if (this.$route.params.pk)
        {
            this.loadArtist(this.$route.params.pk);
        }
    },
    methods: {
        loadArtist: function(pk) {
            this.loading = true;
            Api.callApiGet(`artist/${pk}`,(req)=>{
                const data = req.response;
                this.artist = JSON.parse(data)[0];
                this.loading = false;
                this.onArtistLoad();
            });
        },
        onArtistLoad: function() {
            for(const index in this.fields) {
                const field = this.fields[index];
                const artistField = this.artist[field.name];
                if (artistField) {
                    field.value = artistField;
                    field.savedValue = artistField;
                }
            }
        },
        onSaveClick: function() {
            if (this.artist) {
                this.updateObjectFromFields();
                Api.callApiPut(`artist/`,this.artist,(req)=>{
                    console.log(req.response);
                    window.location.reload();
                });
            }
            else {
                this.updateObjectFromFields();
                delete this.artist['ArtistPk'];
                Api.callApiPost(`artist/`,this.artist,(req)=>{
                    const result = JSON.parse(req.response);
                    const newPk = result.postPk;
                    window.location.href = document.location.origin + '/interface/artist/' + newPk;
                });
            }
        },
        onCancelClick: function() {
            this.revertFieldValues();
        },
        updateObjectFromFields: function() {
            if (!this.artist)
                this.artist = {};

            for(const index in this.fields) {
                const field = this.fields[index];
                this.artist[field.name] = field.postprocessor(field.value);
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
                    name: 'ArtistPk',
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
                    name: 'ArtistId',
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
                    name: 'ArtistName',
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
                    name: 'ArtistWebsite',
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
                    name: 'ArtistInstagram',
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
                    name: 'ArtistReddit',
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
                    name: 'ArtistGeekhack',
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