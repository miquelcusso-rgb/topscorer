// Read-only prod crawler: tests routes + internal links + a big sample of player
// profiles (es/en) for broken pages (404/500/unexpected redirects).
import { readFileSync } from 'fs'
const BASE = 'https://www.top-scorers.com'
function load(f){const m=readFileSync(f,'utf8');return JSON.parse(JSON.parse(m.slice(m.indexOf('JSON.parse(')+11,m.lastIndexOf(') as'))))}
const slugify = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

const gen = load('data/players-generated.ts')
const idx = load('data/search-index.ts')
// 30 dataset players (clean slugs) + 15 index-only (fullName clean slugs → resolver stress test)
const datasetSlugs = gen.slice(0, 30).map(p => slugify(p.name))
const idxSlugs = idx.filter(p=>p.fullName).slice(0, 200).filter((_,i)=>i%13===0).slice(0,15).map(p=>slugify(p.fullName))

const ROUTES = ['', '/jugadores','/comparador','/estadisticas/comparador','/bota-de-oro','/records','/centrocampistas',
 '/competiciones','/clasificacion','/resultados','/mundial-2026','/noticias','/transferencias','/encuestas',
 '/predicciones','/fantasy','/rumores','/wiki','/descubrir','/cuenta','/pricing','/about','/api-docs','/embed-docs',
 '/competiciones/champions-league','/competiciones/europa-league','/competiciones/conference-league',
 '/competiciones/la-liga','/competiciones/premier-league','/competiciones/bundesliga','/competiciones/serie-a','/competiciones/ligue-1',
 '/maximos-goleadores-europa','/goleadores-premier-league','/goleadores-liga-espanola']

const seeds = new Set()
for (const lang of ['es','en']) {
  for (const r of ROUTES) seeds.add(`${BASE}/${lang}${r}`)
  for (const s of [...datasetSlugs, ...idxSlugs]) seeds.add(`${BASE}/${lang}/jugadores/${s}`)
}

const seen = new Map() // url -> status
const internalLinks = new Set()
const CAP = 400, CONC = 10
const queue = [...seeds]

async function hit(url){
  try {
    const r = await fetch(url, { redirect:'manual', headers:{'User-Agent':'ts-audit'} })
    let status = r.status
    // follow one apex→www / locale redirect to final
    if (status>=300 && status<400){
      const loc = r.headers.get('location')
      if (loc){ const f = await fetch(loc.startsWith('http')?loc:BASE+loc, {headers:{'User-Agent':'ts-audit'}}); status = `${status}->${f.status}`; }
    }
    seen.set(url, status)
    // extract internal links from 200 HTML pages (depth-1) up to cap
    if ((''+status).endsWith('200') && seen.size < CAP){
      const html = await (await fetch(url,{headers:{'User-Agent':'ts-audit'}})).text()
      const re=/href="(\/(?:es|en)\/[^"#?]*)"/g; let m
      while((m=re.exec(html))){ const u=BASE+m[1]; if(!seen.has(u)&&!queue.includes(u)){ internalLinks.add(u) } }
    }
  } catch(e){ seen.set(url, 'ERR:'+e.message) }
}

// pass 1: seeds (with link extraction)
let i=0
while(i<queue.length){ const batch=queue.slice(i,i+CONC); await Promise.all(batch.map(hit)); i+=CONC }
// pass 2: discovered internal links (no further extraction), capped
const extra=[...internalLinks].filter(u=>!seen.has(u)).slice(0, 250)
for(let j=0;j<extra.length;j+=CONC){ await Promise.all(extra.slice(j,j+CONC).map(async u=>{try{const r=await fetch(u,{redirect:'manual',headers:{'User-Agent':'ts-audit'}});let s=r.status;if(s>=300&&s<400){const loc=r.headers.get('location');if(loc){const f=await fetch(loc.startsWith('http')?loc:BASE+loc,{headers:{'User-Agent':'ts-audit'}});s=`${s}->${f.status}`}}seen.set(u,s)}catch(e){seen.set(u,'ERR:'+e.message)}})) }

const bad=[...seen.entries()].filter(([,s])=>!(''+s).endsWith('200'))
console.log('TOTAL urls tested:', seen.size)
console.log('OK (200):', [...seen.values()].filter(s=>(''+s).endsWith('200')).length)
console.log('NON-200:', bad.length)
for(const [u,s] of bad) console.log('  ',s,' ',u.replace(BASE,''))
