/** 主题色只控制强调/装饰；成功、警告、错误使用独立语义令牌。 */
export type RGB = [number, number, number]
export const validHex = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
export function rgb(hex: string): RGB { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as RGB }
export function luminance(c: RGB) { const v = c.map(n => { const x = n / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4 }); return .2126 * v[0]! + .7152 * v[1]! + .0722 * v[2]! }
export function contrast(a: RGB, b: RGB) { const x = luminance(a), y = luminance(b); return (Math.max(x,y) + .05) / (Math.min(x,y) + .05) }
const mix = (a: RGB,b: RGB,t: number): RGB => a.map((v,i) => Math.round(v * (1-t) + b[i]! * t)) as RGB
const css = (c: RGB) => `rgb(${c.join(', ')})`
function readable(color: RGB, background: RGB, toward: RGB, target = 5.5): RGB {
  for (let i=0; i<=100; i++) { const candidate=mix(color,toward,i/100); if(contrast(candidate,background)>=target)return candidate }
  return toward
}
export function themePalette(hex: string, dark: boolean): Record<string,string> {
  const seed=rgb(validHex(hex)?hex:'#236de9'), white:RGB=[255,255,255], black:RGB=[0,0,0]
  const bg:RGB=dark?[27,31,33]:[246,248,247]
  const text=readable(seed,bg,dark?white:black)
  const fill=readable(seed,white,black,4.6), hover=mix(fill,black,.12)
  const light=readable(seed,[19,22,25],white)
  const alpha=(opacity:number)=>`rgba(${text.join(', ')}, ${opacity})`
  // 三段不同饱和度的主题染色面，末端仍保留极浅主题色；不混入固定黄绿色。
  const neutral: RGB = dark ? [20,23,25] : [252,252,252]
  const stops = (dark ? [.10,.045,.015] : [.12,.045,.012]).map(t => css(mix(neutral,seed,t)))
  return {
    '--hero-start':stops[0]!, '--hero-mid':stops[1]!, '--hero-end':stops[2]!,
    '--hero-glow':alpha(dark ? .10 : .12), '--hero-sheen':`rgba(${mix(seed,white,.92).join(', ')}, ${dark ? .015 : .55})`,
    '--blue':css(text),'--blue-hover':css(dark?mix(text,white,.12):mix(text,black,.12)), '--blue-soft':alpha(dark?.16:.08),
    '--accent-fill':css(fill),'--accent-fill-hover':css(hover),'--accent-on-fill':'#ffffff', '--accent-rgb':text.join(', '), '--accent-on-dark':css(light),
    '--lime':css(text),'--leaf-text':css(text),'--lime-soft':alpha(dark?.16:.08), '--focus':alpha(.85),
    '--ambient-a':alpha(.07),'--ambient-b':alpha(.055),'--thread-active':alpha(.62),'--pulse-halo':alpha(.18),
    '--e-accent':`0 1px 2px ${alpha(.24)}, 0 8px 18px ${alpha(.24)}`, '--e-accent-hover':`0 1px 2px ${alpha(.32)}, 0 12px 24px ${alpha(.3)}`,
    '--graph-accent':text.join(', '),'--graph-lime':text.join(', '),
  }
}

/** 亮青柠预设：饱和填充配深色文字，文字链接单独校正对比度。 */
export function limePalette(dark: boolean): Record<string,string> {
  const p=themePalette('#82dd2d',dark)
  const leaf=dark?[155,227,90] as RGB:readable(rgb('#58a021'),[239,248,228],[0,0,0],4.5)
  return {...p,
    '--accent-fill':'#82dd2d','--accent-fill-hover':'#95e34d','--accent-on-fill':'#142008',
    '--lime':'#82dd2d','--leaf-text':css(leaf),'--lime-soft':dark?'rgba(130,221,45,.16)':'rgba(130,221,45,.14)',
    '--accent-on-dark':'#a6ec62', '--graph-accent':'130, 221, 45','--graph-lime':'130, 221, 45',
    '--ambient-a':dark?'rgba(130,221,45,.05)':'rgba(130,221,45,.07)',
    '--hero-glow':dark?'rgba(130,221,45,.16)':'rgba(130,221,45,.26)',
  }
}
