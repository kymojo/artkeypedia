<!--####################################################-->
<style>

#fields > div { margin-bottom: .5em; font-size: .8em; }

</style>
<!--####################################################-->
<template>

<div id="new-cap">
    <div>
        <div id="fields" v-for="field in datafields" :key="field.name">
            <text-field :field-name="field.name"
                v-model="field.value"
                :placeholder="field.placeholder"
                :edit-mode="editMode"
                :validator="field.validator"/>
        </div>
    </div>
    <input type="button"
        :value="this.editMode ? 'Save' : 'Edit'"
        @click="editButton"/>
    <input type="button" value="Cancel" 
        v-if="editMode"
        @click="cancelEdits"/>
</div>

</template>
<!--####################################################-->
<script>

import TextField from '../component/TextField'

export default {
    name: 'new-cap',
    data: function() {
        return {
            editMode: false,
            datafields: {
                somefield: {
                    type: 'text',
                    name: 'Some Field',
                    value: 'Schwiggy!',
                    savedValue: 'Schwiggy!',
                    placeholder: 'text goes here',
                    validator: function(check) {
                        if (!check)
                            return 'Cannot be blank!';
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = null;
                        return check;
                    }
                },
                anotherfield: {
                    type: 'text',
                    name: 'Another Field',
                    value: 'Shraggy!',
                    savedValue: 'Shraggy!',
                    placeholder: 'text goes here',
                    validator: function(check) {
                        return null;
                    },
                    postprocessor: function(check) {
                        if (!check)
                            check = 'null';
                        return check;
                    }
                }
            }
        };
    },
    components: {
        TextField
    },
    methods: {
        toggleEdit: function() {
            this.editMode = !this.editMode;
        },
        editButton: function() {
            if (!this.editMode)
                this.toggleEdit();
            else
                this.saveEdits();
        },
        saveEdits: function() {
            if (this.hasError()) {
                alert('Can\'t do it!');
                return;
            }
            for(let index in this.datafields) {
                let obj = this.datafields[index];
                obj.value = obj.postprocessor(obj.value);
                obj.savedValue = obj.value;
            }
            this.toggleEdit();
        },
        cancelEdits: function() {
            for(let index in this.datafields) {
                let obj = this.datafields[index];
                obj.value = obj.savedValue;
            }
            this.toggleEdit();
        },
        hasError: function() {
            let error = null;
            for(let index in this.datafields) {
                let obj = this.datafields[index];
                error = obj.validator(obj.value);
                if (error) break;
            }
            return error;
        }
    }
}

</script>
<!--####################################################-->