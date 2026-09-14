
<template>
  <div class="container mt-5 pt-5 ct d-flex justify-content-center">
    <div class="row">
      <h2 class="text-center text-white mb-4 mt-5">Nächste Überprüfung: {{ this.nextCheck }}</h2>
      <div class="col-lg-12">
        <div class="card text-white bg-dark mb-3" style="min-width: 22rem;">
          <div class="card-header">LUMAGICA Meran</div>
          <div class="card-body">
            <h5 v-if="!this.mordChanged" class="card-title text-success">Keine Veränderungen</h5>
            <h5 v-else class="card-title text-danger">Veränderung Erkannt</h5>
            <a href="https://lumagica.com/de/standorte/meran#intro">Webseite</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
export default {
  data() {
    return {
      nextCheck: 120,
      mordChanged: false,
      normChanged: false
    };
  },
  methods: {
    async fetchValues() {
      let res = await axios.get("http://192.168.0.138:4545/checkPages").then((response) => response.data)
      console.log(res);
      this.mordChanged = res.res0.change;
    },
    setupAll() {
      setInterval(() => {
        if (this.nextCheck == 0) {
          this.fetchValues();
          this.nextCheck = 120;
        }
        this.nextCheck--;
      }, 1000);
    }
  },
  mounted() {
    this.setupAll()
    this.fetchValues()
  },
}
</script>


<style>
body {
  background-color: #1E1E20 !important;
}
</style>
