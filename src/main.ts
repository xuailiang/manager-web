import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './styles.css'
import App from './App.vue'
import router from './router'
import { applyTheme } from './utils/theme'

applyTheme()

const removeLoading = () => {
  const el = document.getElementById('app-loading')
  if (el) el.remove()
}

createApp(App).use(router).use(Antd).mount('#app')
removeLoading()
setTimeout(removeLoading, 8000)
