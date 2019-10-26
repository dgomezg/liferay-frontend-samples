<template>
    <div id="app">
        <Cars/>
    </div>
</template>

<script>
    import Vue from 'vue'
    import Cars from './components/Cars.vue'
    import VueGlide from 'vue-glide-js'
    import 'vue-glide-js/dist/vue-glide.css'
    import VModal from 'vue-js-modal'

    Vue.use(VModal, { dialog: true });
    Vue.use(VueGlide);

    export default {
        name: 'app',
        components: {
            Cars: Cars
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }
</style>
