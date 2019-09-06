<!--####################################################-->
<style>

</style>
<!--####################################################-->
<template>

<div id="file-upload">
    <div class="file">
        <form @submit.prevent="onSubmit" enctype="multipart/form-data">
            <div class="fields">
                <label>Upload File</label><br/>
                <input type="file" ref="file" @change="onSelect"/>
            </div>
            <div class="fields">
                <button>Submit</button>
            </div>
            <div class="message">
                <h5>{{message}}</h5>
            </div>
        </form>
    </div>
</div>

</template>
<!--####################################################-->
<script>
import axios from 'axios'

export default {
    name: 'file-upload',
    components: {},
    props: [],
    data: function() {
        return {
            file:"",
            message:""
        };
    },
    computed: {},
    methods: {
        onSelect(){
            const allowedTypes = ['image/jpeg','image/jpg','image/png'];
            const file = this.$refs.file.files[0];
            this.file = file;
            this.message = '';
            if (!allowedTypes.includes(file.type)){
                this.message = 'Invalid filetype! (must be jpg/jpeg/png)';
            }
            if (file.size>500000) {
                this.message = 'Invalid file size! (must be < 500KB)';
            }
        },
        async onSubmit(){
            const formData = new FormData();
            formData.append('file',this.file);
            try {
                await axios.post('/upload',formData);
                this.message = 'Uploaded!';
            } catch(err) {
                console.log(err);
                this.message = 'Something went wrong!';
            }
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