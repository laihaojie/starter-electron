import Path, { resolve } from 'node:path'

import Inspector from '@djie/vite-plugin-vue-inspector'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { LingManVueAutoImport } from 'lingman/resolve'
import LingMan from 'lingman/vite'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import svgLoader from 'vite-svg-loader'

/**
 * https://vitejs.dev/config
 */
export default defineConfig({
  // root: Path.join(__dirname, 'renderer'),
  publicDir: 'renderer/public',
  server: {
    port: 2589,
    host: true,
  },
  resolve: {
    alias: {
      /** @ 符号指向 src 目录 */
      '@': resolve(__dirname, './renderer'),
    },
  },
  build: {
    outDir: Path.join(__dirname, 'build', 'renderer'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
  plugins: [
    vuePlugin(),
    vueJsx(),
    VueSetupExtend(),
    AutoImport({
      imports: ['vue', '@vueuse/core', 'pinia', { 'element-plus': ['ElMessageBox', 'ElMessage'] }, 'vue-router', LingManVueAutoImport()],
      resolvers: [ElementPlusResolver()],
      dts: true,
      dirs: [
        'renderer/api/**/*',
        'renderer/store/modules',
        'renderer/composables',
        'renderer/hooks',
      ],
    }),
    ElementPlus({
      useSource: false,
    }),
    Components({
      extensions: ['vue', 'tsx'],
      dirs: [
        'renderer/components',
      ],
      resolvers: [
        ElementPlusResolver(),
      ],
      dts: true,
    }),
    /** 将 SVG 静态图转化为 Vue 组件 */
    svgLoader({ defaultImport: 'url' }),
    // visualizer(),
    Unocss(),
    Inspector(),
    LingMan(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  /** 混淆器 */
  esbuild: {
    /** 打包时移除 console.log */
    pure: ['console.log'],
    /** 打包时移除 debugger */
    drop: ['debugger'],
    /** 打包时移除所有注释 */
    legalComments: 'none',
  },
  /** Vitest 单元测试配置：https://cn.vitest.dev/config */
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
  },
  optimizeDeps: {
    exclude: ['canvas', 'path2d', 'pdfjs'],
    include: [
      'lingman/vue',
      'vue',
      'sass',
      'mitt',
      'axios',
      'pinia',
      'dayjs',
      'unocss',
      'vue-router',
      'lodash-es',
      'nprogress',
      'splitpanes',
      '@vueuse/core',
      'echarts/core',
      'echarts/charts',
      'echarts/components',
      'echarts/renderers',
      '@wangeditor/editor',
      '@wangeditor/editor-for-vue',
      'element-plus',
      'element-plus/es',
      'element-plus/es/locale/lang/zh-cn',
      'element-plus/es/components/message-box/style/css',
      'element-plus/es/locale/lang/en',
      'element-plus/es/components/scrollbar/style/css',
      'element-plus/es/components/icon/style/css',
      'element-plus/es/components/avatar/style/css',
      'element-plus/es/components/space/style/css',
      'element-plus/es/components/backtop/style/css',
      'element-plus/es/components/form/style/css',
      'element-plus/es/components/radio-group/style/css',
      'element-plus/es/components/radio/style/css',
      'element-plus/es/components/checkbox/style/css',
      'element-plus/es/components/checkbox-group/style/css',
      'element-plus/es/components/switch/style/css',
      'element-plus/es/components/time-picker/style/css',
      'element-plus/es/components/date-picker/style/css',
      'element-plus/es/components/descriptions/style/css',
      'element-plus/es/components/descriptions-item/style/css',
      'element-plus/es/components/link/style/css',
      'element-plus/es/components/tooltip/style/css',
      'element-plus/es/components/drawer/style/css',
      'element-plus/es/components/dialog/style/css',
      'element-plus/es/components/checkbox-button/style/css',
      'element-plus/es/components/option-group/style/css',
      'element-plus/es/components/radio-button/style/css',
      'element-plus/es/components/cascader/style/css',
      'element-plus/es/components/color-picker/style/css',
      'element-plus/es/components/input-number/style/css',
      'element-plus/es/components/rate/style/css',
      'element-plus/es/components/select-v2/style/css',
      'element-plus/es/components/tree-select/style/css',
      'element-plus/es/components/slider/style/css',
      'element-plus/es/components/time-select/style/css',
      'element-plus/es/components/autocomplete/style/css',
      'element-plus/es/components/image-viewer/style/css',
      'element-plus/es/components/upload/style/css',
      'element-plus/es/components/col/style/css',
      'element-plus/es/components/form-item/style/css',
      'element-plus/es/components/alert/style/css',
      'element-plus/es/components/breadcrumb/style/css',
      'element-plus/es/components/select/style/css',
      'element-plus/es/components/input/style/css',
      'element-plus/es/components/breadcrumb-item/style/css',
      'element-plus/es/components/tag/style/css',
      'element-plus/es/components/pagination/style/css',
      'element-plus/es/components/table/style/css',
      'element-plus/es/components/table-v2/style/css',
      'element-plus/es/components/table-column/style/css',
      'element-plus/es/components/card/style/css',
      'element-plus/es/components/row/style/css',
      'element-plus/es/components/button/style/css',
      'element-plus/es/components/menu/style/css',
      'element-plus/es/components/sub-menu/style/css',
      'element-plus/es/components/menu-item/style/css',
      'element-plus/es/components/option/style/css',
      'element-plus/es/components/dropdown/style/css',
      'element-plus/es/components/dropdown-menu/style/css',
      'element-plus/es/components/dropdown-item/style/css',
      'element-plus/es/components/skeleton/style/css',
      'element-plus/es/components/skeleton/style/css',
      'element-plus/es/components/backtop/style/css',
      'element-plus/es/components/menu/style/css',
      'element-plus/es/components/sub-menu/style/css',
      'element-plus/es/components/menu-item/style/css',
      'element-plus/es/components/dropdown/style/css',
      'element-plus/es/components/tree/style/css',
      'element-plus/es/components/dropdown-menu/style/css',
      'element-plus/es/components/dropdown-item/style/css',
      'element-plus/es/components/badge/style/css',
      'element-plus/es/components/breadcrumb/style/css',
      'element-plus/es/components/breadcrumb-item/style/css',
      'element-plus/es/components/image/style/css',
      'element-plus/es/components/collapse-transition/style/css',
      'element-plus/es/components/timeline/style/css',
      'element-plus/es/components/timeline-item/style/css',
      'element-plus/es/components/collapse/style/css',
      'element-plus/es/components/collapse-item/style/css',
      'element-plus/es/components/button-group/style/css',
      'element-plus/es/components/text/style/css',
      'element-plus/es/components/divider/style/css',
      'element-plus/es/components/empty/style/css',
      'element-plus/es/components/aside/style/css',
      'element-plus/es/components/container/style/css',
      'element-plus/es/components/main/style/css',
      'element-plus/es/components/header/style/css',
      'element-plus/es/components/popover/style/css',
      'element-plus/es/components/tabs/style/css',
      'element-plus/es/components/tab-pane/style/css',
      'element-plus/es/components/loading/style/css',
      'element-plus/es/components/base/style/css',
      'element-plus/es/components/config-provider/style/css',
      'element-plus/es/components/progress/style/css',
      'element-plus/es/components/carousel/style/css',
      'element-plus/es/components/carousel-item/style/css',
      'element-plus/es/components/message/style/css',
      'element-plus/es/components/overlay/style/css',
    ],
  },
})
