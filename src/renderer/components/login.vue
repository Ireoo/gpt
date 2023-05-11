<template>
  <div class="main">
    <h1>iDownloader</h1>
    <el-form ref="form" :model="form" label-width="80px">
      <el-input v-model="form.username" :disabled="loading" placeholder="Username"></el-input>
      <el-input :type="lock ? `password` : `text`" v-model="form.password" :disabled="loading" placeholder="Password">
        <el-button
          slot="append"
          :icon="lock ? `el-icon-view` : `el-icon-lock`"
          @click="lock = !lock"
          :disabled="loading"
        ></el-button>
      </el-input>
      <el-button type="primary" style="width: 100%" @click="onSubmit" :loading="loading">Login</el-button><br />
      <el-button type="text">Forgot password?</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      loading: false,
      form: {
        username: '',
        password: ''
      },
      lock: true
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true
      let res = await this.$axios.post('https://creator.integem.com/api.php?do=login', this.form)
      this.loading = false
      if (res.data.success) {
        this.$store.set('userinfo', this.form)
        this.$router.push('/')
      } else {
        this.$message.error(res.data.data)
      }
    }
  }
}
</script>

<style scoped>
.main {
  text-align: center;
  max-width: 400px;
  margin: auto;
}

h1 {
  color: #00bdbd;
  padding: 100px 0 50px 0;
}

.el-input {
  margin-bottom: 20px;
}
</style>
