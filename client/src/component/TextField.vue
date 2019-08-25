<!--####################################################-->
<style>

#label { font-weight: bold; }
#type-in.error {
    border-color: red;
}

</style>
<!--####################################################-->
<template>

<div id="text-field">
    <span id="label">{{fieldName}}</span>
    <span v-if="hasError" style="color:red;">&nbsp;{{hasError}}</span>
    <br/>
    <div v-if="editMode==1 && !readOnly">
        <input id="type-in" type="text" 
            :value="value" :placeholder="placeholder"
            @input="$emit('input', $event.target.value)"
            :class="hasError ? 'error' : ''"
            />
    </div>
    <div v-else>
        <span id="value">{{value}}&nbsp;</span>
    </div>
</div>

</template>
<!--####################################################-->
<script>

export default {
    name: 'text-field',
    props: [
        'value',
        'field-type',
        'field-name',
        'placeholder',
        'edit-mode',
        'validator',
        'read-only'
    ],
    data: function() {
        return {

        };
    },
    computed: {
        hasError: function() {
            let error = this.validator(this.value); 
            return error;
        }
    }
}

</script>
<!--####################################################-->