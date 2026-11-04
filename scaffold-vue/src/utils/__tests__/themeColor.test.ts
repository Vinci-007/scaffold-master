import test from 'node:test'
import assert from 'node:assert/strict'
import { themePalette, limePalette, contrast, validHex, type RGB } from '../themeColor.ts'
const parse = (s: string): RGB => s.match(/\d+/g)!.slice(0,3).map(Number) as RGB
for (const hex of ['#ffffff','#000000','#ffff00','#00ffff','#ff00ff','#d45d9e','#236de9']) {
  for (const dark of [false,true]) test(`readable palette ${hex} dark=${dark}`, () => {
    const p = themePalette(hex,dark)
    assert.ok(contrast(parse(p['--accent-fill']!),[255,255,255])>=4.5)
    assert.ok(contrast(parse(p['--accent-fill-hover']!),[255,255,255])>=4.5)
    assert.ok(contrast(parse(p['--blue']!),dark?[27,31,33]:[246,248,247])>=5.5)
    assert.ok(contrast(parse(p['--accent-on-dark']!),[19,22,25])>=5.5)
    assert.equal(p['--graph-accent'],p['--accent-rgb'])
    assert.equal(p['--success'],undefined)
  })
}
test('invalid custom values fall back safely',()=>{assert.equal(validHex('red'),false);assert.equal(validHex('#123456'),true);assert.deepEqual(themePalette('invalid',false),themePalette('#236de9',false))})

test('hero gradient has theme-derived layered stops in both modes',()=>{
 for(const dark of [false,true]) {
  const palettes=['#3975d3','#d45d9e','#c77d24'].map(hex=>themePalette(hex,dark))
  for(const key of ['--hero-start','--hero-mid','--hero-end','--hero-glow','--hero-sheen'])assert.equal(new Set(palettes.map(p=>p[key])).size,3)
  for(const p of palettes){
   assert.equal(new Set(['--hero-start','--hero-mid','--hero-end'].map(k=>p[k])).size,3)
   for(const key of ['--hero-start','--hero-mid','--hero-end']) assert.ok(contrast(parse(p[key]!),dark?[238,242,241]:[16,20,24])>=7)
  }
 }
})

test('lime preset keeps bright fills and readable dark labels',()=>{
 for(const dark of [false,true]) {
  const p=limePalette(dark)
  assert.equal(p['--lime'],'#82dd2d');assert.equal(p['--accent-fill'],'#82dd2d')
  assert.equal(p['--graph-accent'],'130, 221, 45')
  assert.ok(contrast([130,221,45],[20,32,8])>=4.5)
  assert.ok(contrast([149,227,77],[20,32,8])>=4.5)
  assert.ok(contrast(parse(p['--blue']!),dark?[27,31,33]:[246,248,247])>=5.5)
 }
})
