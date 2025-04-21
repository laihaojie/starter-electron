import { presetWeb } from '@djie/unocss'
import { defineConfig } from 'unocss'

export default defineConfig({
  /** 预设 */
  presets: [
    presetWeb({
      unit: 'px',
      presetIconCollections: {
        com: {
          dir: './renderer/assets/svg',
        },
      },
    }),
  ],
  theme: {
    colors: {
      main: 'var(--main-color)',
    },
  },
  /** 自定义规则 */
  rules: [['uno-padding-20', { padding: '20px' }]],
  /** 自定义快捷方式 */
  shortcuts: {
    'uno-wh-full': 'w-full h-full',
    'uno-flex-center': 'flex justify-center items-center',
    'uno-checkmene': '!ml0 !justify-inherit !border-0',
    'uno-flexcol-center': 'flex flex-col justify-center items-center',
    'text': 'w-full bg-#f5f7fa border border-#dcdfe6 border-solid rounded-4px !px-11px !py-1px h-32px leading-30px !text-#787a80 cursor-text',
  },
})
