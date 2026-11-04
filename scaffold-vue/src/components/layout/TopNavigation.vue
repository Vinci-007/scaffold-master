<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { navigationTree, type NavigationNode } from '@/composables/auth'
import { floatingLayerFor } from '@/composables/focus'
const route = useRoute()
const router = useRouter()
const bar = ref<HTMLElement | null>(null)
interface Panel { node: NavigationNode; anchor: HTMLElement; left: number; top: number }
const panels = ref<Panel[]>([])
const layer = ref(120)
const expanded = computed(() => new Set(panels.value.map(p => p.node.key)))
const active = (node: NavigationNode): boolean => node.path === route.path || node.children.some(active)
const entries = (node: NavigationNode): NavigationNode[] => node.path ? [{ ...node, key: node.key + '-self', label: node.label + '首页', children: [] }, ...node.children] : node.children
let timer: ReturnType<typeof setTimeout> | undefined
function cancelClose() { clearTimeout(timer) }
function close(restore = false) {
  cancelClose()
  const anchor = panels.value[0]?.anchor
  panels.value = []
  if (restore) anchor?.focus()
}
function laterClose() { cancelClose(); timer = setTimeout(() => close(), 220) }
async function open(node: NavigationNode, anchor: HTMLElement, depth: number, focus = false) {
  cancelClose()
  if (!node.children.length) { panels.value = panels.value.slice(0, depth); return }
  const rect = anchor.getBoundingClientRect()
  const width = 240
  let left = depth ? rect.right - 2 : rect.left
  if (left + width > window.innerWidth - 8) left = depth ? rect.left - width + 2 : window.innerWidth - width - 8
  const top = Math.max(8, Math.min(depth ? rect.top : rect.bottom + 4, window.innerHeight - 100))
  layer.value = floatingLayerFor(anchor)
  panels.value = [...panels.value.slice(0, depth), { node, anchor, left: Math.max(8, left), top }]
  if (focus) { await nextTick(); document.querySelector<HTMLElement>(`[data-top-panel="${depth}"] button`)?.focus() }
}
function activate(node: NavigationNode, event: MouseEvent, depth: number) {
  if (node.children.length) {
    open(node, event.currentTarget as HTMLElement, depth, true)
  } else if (node.path) { close(); router.push(node.path) }
}
function key(event: KeyboardEvent, node: NavigationNode, depth: number) {
  const el = event.currentTarget as HTMLElement
  const buttons = Array.from(el.parentElement!.querySelectorAll<HTMLButtonElement>(':scope > button'))
  const index = buttons.indexOf(el as HTMLButtonElement)
  if (event.key === 'Escape') { event.preventDefault(); close(true); return }
  if (event.key === 'Tab') { close(); return }
  if ((depth === 0 && event.key === 'ArrowDown') || (depth > 0 && event.key === 'ArrowRight')) { event.preventDefault(); open(node, el, depth, true); return }
  if (depth > 0 && event.key === 'ArrowLeft') {
    event.preventDefault(); const anchor = panels.value[depth - 1]?.anchor; panels.value = panels.value.slice(0, depth - 1); anchor?.focus(); return
  }
  const forward = depth === 0 ? 'ArrowRight' : 'ArrowDown'
  const backward = depth === 0 ? 'ArrowLeft' : 'ArrowUp'
  if ([forward, backward, 'Home', 'End'].includes(event.key)) {
    event.preventDefault()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === forward ? 1 : -1) + buttons.length) % buttons.length
    if (depth === 0) close()
    buttons[next]?.focus(); buttons[next]?.scrollIntoView({block:'nearest',inline:'nearest'})
  }
}
function outside(e: PointerEvent) { if (!(e.target as Element).closest('.top-navigation, .top-nav-panel')) close() }
function focusOutside(e: FocusEvent) { if (!(e.target as Element).closest('.top-navigation, .top-nav-panel')) close() }
function viewportChanged() { close() }
function panelScroll(depth: number) { panels.value = panels.value.slice(0, depth + 1) }
watch(() => route.fullPath, () => close())
watch(navigationTree, () => close())
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('focusin', focusOutside); window.addEventListener('resize', viewportChanged) })
onBeforeUnmount(() => { cancelClose(); document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', focusOutside); window.removeEventListener('resize', viewportChanged) })
</script>
<template>
  <nav ref="bar" class="adaptive-nav top-navigation m-rail" aria-label="顶部导航" @mouseleave="laterClose" @mouseenter="cancelClose" @scroll="close()">
    <button v-for="node in navigationTree" :key="node.key" type="button" class="adaptive-item" :class="{'is-active': active(node)}" :aria-current="node.path === route.path ? 'page' : undefined" :aria-haspopup="node.children.length ? 'menu' : undefined" :aria-expanded="node.children.length ? expanded.has(node.key) : undefined" @mouseenter="open(node, $event.currentTarget as HTMLElement, 0)" @click="activate(node, $event, 0)" @keydown="key($event, node, 0)">
      <Icon :name="node.icon" :size="16" />{{ node.label }}<Icon v-if="node.children.length" name="chevronDown" :size="12" />
    </button>
  </nav>
  <Teleport to="body">
    <div v-for="(panel, depth) in panels" :key="panel.node.key" :data-top-panel="depth" class="top-nav-panel m-float" role="menu" :aria-label="panel.node.label" :style="{left:panel.left+'px',top:panel.top+'px',maxHeight:`calc(100dvh - ${panel.top + 8}px)`,zIndex:layer+depth}" @mouseenter="cancelClose" @mouseleave="laterClose" @scroll="panelScroll(depth)">
      <button v-for="node in entries(panel.node)" :key="node.key" type="button" role="menuitem" :class="{'is-active':active(node)}" :aria-current="node.path === route.path ? 'page' : undefined" :aria-haspopup="node.children.length ? 'menu' : undefined" :aria-expanded="node.children.length ? expanded.has(node.key) : undefined" @mouseenter="open(node,$event.currentTarget as HTMLElement,depth+1)" @click="activate(node,$event,depth+1)" @keydown="key($event,node,depth+1)"><Icon :name="node.icon" :size="16" /><span>{{node.label}}</span><Icon v-if="node.children.length" name="chevronRight" :size="12" /></button>
    </div>
  </Teleport>
</template>
