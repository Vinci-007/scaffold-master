<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'
import Segmented from '@/components/ui/Segmented.vue'
import Button from '@/components/ui/Button.vue'
import Switch from '@/components/ui/Switch.vue'
import { appearance, resetAppearance, type Density, type ThemeMode } from '@/composables/appearance'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const themes: Array<{ label: string; value: ThemeMode }> = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'auto' },
]
const densities: Array<{ label: string; value: Density }> = [
  { label: '宽松', value: 'comfy' },
  { label: '标准', value: 'regular' },
  { label: '紧凑', value: 'compact' },
]
</script>

<template>
  <Modal :open="open" title="系统自定义配置" sub="仅保存在当前浏览器" :width="620" close-on-overlay @close="emit('close')">
    <div class="pref-list">
      <div class="pref-row"><span class="pref-title">主题色</span><Segmented v-model="appearance.accent" :options="[{label:'亮青',value:'lime'},{label:'蓝色',value:'blue'},{label:'紫色',value:'violet'},{label:'青色',value:'teal'},{label:'自选',value:'custom'}]" label="主题色" /></div>
      <div class="pref-row"><label for="custom-accent">自选颜色</label><input id="custom-accent" type="color" aria-label="自选颜色" :value="appearance.customColor" @input="appearance.customColor = ($event.target as HTMLInputElement).value; appearance.accent = 'custom'" /><span class="mono">{{ appearance.customColor }}</span></div>
      <p class="pref-desc">亮青使用亮色按钮与深色文字；其他颜色自动适配明暗主题和文字对比度；成功、警告、错误保留独立状态色。</p>
      <div class="pref-row"><span class="pref-title">界面材质</span><Segmented v-model="appearance.surfaceStyle" :options="[{label:'珍珠玻璃',value:'glass'},{label:'简洁平面',value:'flat'}]" label="界面材质" /></div>
      <div class="pref-row"><div class="pref-title">导航布局</div><Segmented v-model="appearance.layout" :options="[{label:'左侧',value:'side'},{label:'顶部',value:'top'},{label:'混合',value:'mixed'},{label:'双栏',value:'dual'}]" label="导航布局" /></div>
      <p class="pref-desc">顶部菜单按层级下拉；混合与双栏按模块切换。窄屏自动使用移动侧栏。</p>
      <div class="pref-row"><div class="pref-title">内容宽度</div><Segmented v-model="appearance.contentWidth" :options="[{label:'铺满',value:'full'},{label:'居中',value:'boxed'}]" label="内容宽度" /></div>
      <div class="pref-row"><span>显示面包屑</span><Switch v-model="appearance.showBreadcrumb" label="显示面包屑" /></div>
      <div class="pref-row"><span>减少动效</span><Switch v-model="appearance.reduceMotion" label="减少动效" /></div>
      <div class="pref-row">
        <div>
          <div class="pref-title">主题</div>
          <div class="pref-desc">跟随系统时随操作系统的浅色 / 深色自动切换</div>
        </div>
        <Segmented v-model="appearance.theme" :options="themes" label="主题" />
      </div>
      <div class="pref-row">
        <div>
          <div class="pref-title">表格密度</div>
          <div class="pref-desc">影响所有列表的行高</div>
        </div>
        <Segmented v-model="appearance.density" :options="densities" label="表格密度" />
      </div>
    </div>
    <template #footer>
      <Button variant="ghost" @click="resetAppearance">恢复默认</Button>
      <Button variant="primary" @click="emit('close')">完成</Button>
    </template>
  </Modal>
</template>
