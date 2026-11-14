// Employer-first index: a plain text index of employers with their contracts nested beneath.
// Desktop: sticky, vertically centred in the gutter; a diamond marker slides along a hairline between the lines using q.
// Mobile: a compact bar (employer / contract / "2 of 3", segmented progress on its top edge) plus one "Jump to" disclosure that opens the same nested index upward.
import { esc, reduce, range } from '../lib/data.js'

export const id = 'index'

const R = '.xv-monolith.rail-index'

export const css = `
${R}{--g:clamp(200px,18.4vw,264px)}
${R} .ix-d,${R} .ix-m{font:300 .8rem/1.3 var(--mono);color:var(--muted)}
${R} :where(.ix-d,.ix-pn) ol{margin:0;padding:0;list-style:none}
${R} :where(.ix-d,.ix-pn) p{margin:0}

/* ---------- shared index parts (desktop gutter + mobile panel) ---------- */
${R} .ix-emp{position:relative}
${R} .ix-emp + .ix-emp{margin-top:22px}
${R} .ix-t{position:relative}
${R} .ix-t::after{content:attr(data-t);content:attr(data-t) / "";position:absolute;left:0;top:0;width:100%;color:var(--fg);opacity:0;pointer-events:none;transition:opacity .5s var(--ease)}
${R} .ix-en{font:300 var(--fs)/1.3 var(--display);letter-spacing:.05em;color:var(--muted);overflow-wrap:anywhere}
${R} .ix-em{margin-top:3px;font-size:.7rem;line-height:1.4;color:var(--muted)}
${R} .ix-emp.is-cur > .ix-en::after{opacity:1}
${R} .ix-cons{margin:3px 0 0 3px;padding-left:15px}
${R} .ix-con{position:relative}
${R} .ix-con::before{content:"";position:absolute;left:-15px;top:-2px;width:11px;height:calc(var(--c1) + 2px);border-left:1px solid rgb(230 224 212/.3);border-bottom:1px solid rgb(230 224 212/.3)}
${R} .ix-con:not(:last-child)::after{content:"";position:absolute;left:-15px;top:var(--c1);bottom:0;border-left:1px solid rgb(230 224 212/.3)}
${R} .ix-line{position:relative;display:block;width:100%;padding:var(--pb) 0;background:none;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer}
${R} .ix-line:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
${R} .ix-r1{position:relative;display:flex;align-items:baseline;gap:8px;font-size:var(--fs);line-height:1.3}
${R} .ix-nm{flex:1;min-width:0;color:var(--muted);overflow-wrap:anywhere}
${R} .ix-nm:not(.ix-en){font-family:var(--mono)}
${R} .ix-yr{flex:none;font-size:.7rem;line-height:1.4;color:var(--muted);white-space:nowrap}
${R} .ix-lvd{display:inline-block;width:5px;height:5px;margin-right:5px;border-radius:50%;background:var(--blue);box-shadow:0 0 6px var(--blue);vertical-align:middle}
${R} .ix-r2{display:flex;flex-wrap:wrap;column-gap:10px;margin-top:2px;font-size:.7rem;line-height:1.4;color:var(--muted)}
${R} .ix-tt{min-width:0;overflow-wrap:anywhere}
${R} .ix-line:hover .ix-nm::after,${R} .ix-line:focus-visible .ix-nm::after{opacity:1;color:var(--fg)}
${R} .ix-line:hover .ix-tt::after,${R} .ix-line:focus-visible .ix-tt::after{opacity:1}
${R} .ix-line.is-cur .ix-nm::after{opacity:1;color:var(--accent)}
${R} .ix-line.is-cur.is-live .ix-nm::after{color:var(--blue)}
${R} .ix-line.is-cur .ix-tt::after{opacity:1}

/* ---------- desktop: sticky text index in the gutter ---------- */
${R} .ix-d{--pb:6px;--fs:.78rem;--c1:calc(var(--pb) + var(--fs) * .65);position:sticky;top:max(110px,calc((100svh - var(--h,320px)) / 2));height:var(--h,320px);margin-right:24px}
${R} .ix-d.ix-dense{--pb:3px}
${R} .ix-sc{position:absolute;inset:-8px;padding:8px;overflow-x:hidden;overflow-y:auto;scrollbar-width:none}
${R} .ix-over .ix-sc{scrollbar-width:thin;scrollbar-color:rgb(255 140 43/.55) transparent;overscroll-behavior:contain}
${R} .ix-over .ix-sc[data-edge=top]{-webkit-mask-image:linear-gradient(#000 calc(100% - 30px),transparent);mask-image:linear-gradient(#000 calc(100% - 30px),transparent)}
${R} .ix-over .ix-sc[data-edge=mid]{-webkit-mask-image:linear-gradient(transparent,#000 30px,#000 calc(100% - 30px),transparent);mask-image:linear-gradient(transparent,#000 30px,#000 calc(100% - 30px),transparent)}
${R} .ix-over .ix-sc[data-edge=end]{-webkit-mask-image:linear-gradient(transparent,#000 30px);mask-image:linear-gradient(transparent,#000 30px)}
${R} .ix-lw{position:relative;padding-left:20px}
${R} .ix-tr,${R} .ix-fl{position:absolute;left:0;top:0;bottom:0;width:1px}
${R} .ix-tr{background:rgb(230 224 212/.24)}
${R} .ix-fl{background:var(--accent);transform-origin:50% 0;transform:scaleY(0);will-change:transform}
${R} .ix-mk{position:absolute;left:-5px;top:0;width:11px;height:11px;pointer-events:none;will-change:transform}
${R} .ix-mk i{position:absolute;left:1.5px;top:1.5px;box-sizing:border-box;width:8px;height:8px;transform:rotate(45deg);transition:opacity .5s var(--ease)}
${R} .ix-mk .o{border:1px solid var(--accent);background:rgb(255 140 43/.35);box-shadow:0 0 12px rgb(255 140 43/.7)}
${R} .ix-mk .b{border:1px solid var(--blue);background:rgb(90 209 230/.35);box-shadow:0 0 12px rgb(90 209 230/.8);opacity:0}
${R} .ix-d[data-live=true] .ix-mk .o{opacity:0}
${R} .ix-d[data-live=true] .ix-mk .b{opacity:1}
${R} .ix-an{position:absolute;left:calc(var(--ind) * -1);top:calc(var(--fs) * .65);width:7px;height:1px;background:rgb(230 224 212/.4);pointer-events:none}
${R} .ix-solo .ix-line{--ind:20px}
${R} .ix-cons .ix-line{--ind:38px}
${R} .ix-d.ix-dense .ix-emp + .ix-emp{margin-top:12px}
${R} .ix-d.ix-dense .ix-em,${R} .ix-d.ix-dense .ix-cons .ix-r2,${R} .ix-d.ix-dense .ix-solo .ix-tt{display:none}

/* ---------- mobile: bar + upward panel ---------- */
${R} .mo-bar{margin-inline:-20px;background:rgb(8 10 12/.97);border-top:1px solid rgb(255 140 43/.3)}
${R} .ix-m{position:relative;padding:0 20px}
${R} .ix-sgs{position:absolute;left:20px;right:20px;top:-2px;display:flex;height:3px}
${R} .ix-sg{position:relative;flex:1 1 0;min-width:0;height:3px;overflow:hidden;background:rgb(230 224 212/.24)}
${R} .ix-sg + .ix-sg{margin-left:3px}
${R} .ix-sg.ix-gap{margin-left:10px}
${R} .ix-sg i{position:absolute;inset:0;background:var(--accent);transform-origin:0 50%;transform:scaleX(0);will-change:transform}
${R} .ix-sg.is-live i{background:var(--blue)}
${R} .ix-brow{display:flex;align-items:center;gap:12px;min-height:44px;padding:7px 0 6px}
${R} .ix-bc{flex:1;min-width:0;display:grid;grid-template-columns:minmax(0,1fr);gap:1px}
${R} .ix-b1{display:flex;align-items:baseline;gap:10px;font-size:.7rem;line-height:1.4;color:var(--muted)}
${R} .ix-be{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${R} .ix-ct{flex:none;margin-left:auto;white-space:nowrap}
${R} .ix-b2{display:flex;align-items:baseline;gap:8px;font-size:.86rem;line-height:1.35;color:var(--accent)}
${R} .ix-bc[data-live=true] .ix-b2{color:var(--blue)}
${R} .ix-b2t{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${R} .ix-bc[data-k=group] .ix-b2::before{content:"";flex:none;align-self:flex-start;width:9px;height:.6em;margin:0 -2px 0 1px;border-left:1px solid rgb(230 224 212/.5);border-bottom:1px solid rgb(230 224 212/.5)}
${R} .ix-bn{flex:none;font-size:.7rem;color:var(--blue)}
${R} .ix-bn[hidden]{display:none}
@media (max-width:359px){${R} .ix-bnt{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}${R} .ix-bn .ix-lvd{margin-right:0}${R} .ix-brow{gap:8px}${R} .ix-tg{padding:0 10px;gap:8px}}
${R} .ix-tg{flex:none;display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;background:none;border:1px solid rgb(255 140 43/.55);color:var(--fg);font:300 .78rem/1 var(--mono);cursor:pointer;transition:background-color .4s var(--ease)}
${R} .ix-tg:hover{background:rgb(255 140 43/.1)}
${R} .ix-tg:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
${R} .ix-cv{flex:none;width:7px;height:7px;border:solid var(--accent);border-width:1px 1px 0 0;transform:translateY(2px) rotate(-45deg);transition:transform .4s var(--ease)}
${R} .ix-tg[aria-expanded=true] .ix-cv{transform:translateY(-2px) rotate(135deg)}
${R} .ix-pn{--pb:6px;--fs:.84rem;--c1:calc(var(--pb) + var(--fs) * .65);position:absolute;left:0;right:0;bottom:100%;max-height:min(62svh,calc(100svh - 140px));overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgb(255 140 43/.55) transparent;padding:10px 20px 14px;border-top:1px solid rgb(255 140 43/.3);box-shadow:0 -24px 48px rgb(0 0 0/.55);
  background:linear-gradient(#0a0d10 30%,transparent) 0 0/100% 36px local no-repeat,linear-gradient(transparent,#0a0d10 70%) 0 100%/100% 36px local no-repeat,radial-gradient(farthest-side at 50% 0,rgb(255 140 43/.28),transparent) 0 0/100% 10px scroll no-repeat,radial-gradient(farthest-side at 50% 100%,rgb(255 140 43/.28),transparent) 0 100%/100% 10px scroll no-repeat,#0a0d10;
  visibility:hidden;opacity:0;transform:translateY(10px);transition:opacity .35s var(--ease),transform .5s var(--ease),visibility 0s linear .5s}
${R} .ix-m.ix-open .ix-pn{visibility:visible;opacity:1;transform:none;transition:opacity .35s var(--ease),transform .5s var(--ease),visibility 0s}
${R} .ix-pn .ix-emp + .ix-emp{margin-top:14px}
${R} .ix-pn .ix-line{min-height:44px;padding-right:18px}
${R} .ix-pn .ix-an{display:none}
${R} .ix-pn .ix-line.is-cur::after{content:"";position:absolute;right:2px;top:calc(var(--pb) + var(--fs) * .65 - 3.5px);box-sizing:border-box;width:7px;height:7px;transform:rotate(45deg);border:1px solid var(--accent);background:rgb(255 140 43/.35)}
${R} .ix-pn .ix-line.is-cur.is-live::after{border-color:var(--blue);background:rgb(90 209 230/.35)}
${R} .ix-pn .ix-yr{margin-right:0}

@media (prefers-reduced-motion:reduce){
  ${R} .ix-pn{transform:none}
  ${R} .ix-cv{transition:none}
}
`

const yr2 = (a, b, cur) => {
  const y = a.getUTCFullYear(), z = b.getUTCFullYear()
  return cur ? `${y}–now` : y === z ? String(y) : `${y}–${String(z).slice(2)}`
}
const label = ({ c }) => `${c.co}, ${c.title}, ${range(c)}${c.current ? ', current' : ''}`
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export function mount(ctx) {
  const { gut, bar, flat, goTo, subscribe } = ctx
  const n = flat.length
  const emps = [...new Set(flat.map((f) => f.e))]
  const ei = flat.map((f) => emps.indexOf(f.e))
  const uid = Math.random().toString(36).slice(2, 7)
  const cleanups = []

  /* the nested index, used verbatim by the desktop gutter and the mobile panel */
  const lineHTML = (f, solo, withAnchor) => {
    const { c, e, i } = f
    const lv = c.current
    const an = withAnchor ? '<i class="ix-an" aria-hidden="true"></i>' : ''
    const yr = `<span class="ix-yr">${lv ? '<i class="ix-lvd" aria-hidden="true"></i>' : ''}${esc(yr2(c.start, c.end, lv))}</span>`
    const open = `<button type="button" class="ix-line${lv ? ' is-live' : ''}" data-i="${i}" aria-label="${esc(label(f))}">`
    if (solo) {
      return `${open}<span class="ix-r1">${an}<span class="ix-nm ix-en ix-t" data-t="${esc(e.name)}">${esc(e.name)}</span></span><span class="ix-r2"><span class="ix-tt ix-t" data-t="${esc(c.title)}">${esc(c.title)}</span>${yr}</span></button>`
    }
    return `${open}<span class="ix-r1">${an}<span class="ix-nm ix-t" data-t="${esc(c.co)}">${esc(c.co)}</span>${yr}</span><span class="ix-r2"><span class="ix-tt ix-t" data-t="${esc(c.title)}">${esc(c.title)}</span></span></button>`
  }
  const listHTML = (p, withAnchor) => `<ol class="ix-list">${emps.map((e, k) => {
    const fs = flat.filter((f) => f.e === e)
    if (e.kind === 'solo') return `<li class="ix-emp ix-solo" data-ei="${k}">${lineHTML(fs[0], true, withAnchor)}</li>`
    const hid = `ix${uid}-${p}-${k}`
    const cn = e.contracts.length
    return `<li class="ix-emp ix-group" data-ei="${k}"><p class="ix-en ix-t" id="${hid}" data-t="${esc(e.name)}">${esc(e.name)}</p><p class="ix-em">${esc(yr2(e.start, e.end, e.current))} · ${cn} contract${cn > 1 ? 's' : ''}</p><ol class="ix-cons" aria-labelledby="${hid}">${fs.map((f) => `<li class="ix-con">${lineHTML(f, false, withAnchor)}</li>`).join('')}</ol></li>`
  }).join('')}</ol>`

  gut.innerHTML = `<nav class="ix-d" aria-label="Experience timeline" data-live="false"><div class="ix-sc" data-edge="top"><div class="ix-lw"><i class="ix-tr" aria-hidden="true"></i><i class="ix-fl" aria-hidden="true"></i><i class="ix-mk" aria-hidden="true"><i class="o"></i><i class="b"></i></i>${listHTML('d', true)}</div></div></nav>`

  const pid = `ix${uid}-panel`
  const segs = flat.map((f, k) => `<span class="ix-sg${k && ei[k] !== ei[k - 1] ? ' ix-gap' : ''}${f.c.current ? ' is-live' : ''}"><i></i></span>`).join('')
  bar.innerHTML = `<nav class="ix-m" aria-label="Experience timeline"><div class="ix-sgs" aria-hidden="true">${segs}</div><div class="ix-brow"><div class="ix-bc" data-k="group" data-live="false"><p class="ix-b1" style="margin:0"><span class="ix-be"></span><span class="ix-ct"></span></p><p class="ix-b2" style="margin:0"><span class="ix-b2t"></span><span class="ix-bn" hidden><i class="ix-lvd" aria-hidden="true"></i><span class="ix-bnt">now</span></span></p></div><button type="button" class="ix-tg" aria-expanded="false" aria-controls="${pid}"><span>Jump to</span><i class="ix-cv" aria-hidden="true"></i></button></div><div class="ix-pn" id="${pid}">${listHTML('m', false)}</div></nav>`

  /* ---- element handles ---- */
  const dEl = gut.querySelector('.ix-d'), sc = gut.querySelector('.ix-sc'), lw = gut.querySelector('.ix-lw')
  const fl = gut.querySelector('.ix-fl'), mk = gut.querySelector('.ix-mk')
  const mEl = bar.querySelector('.ix-m'), pn = bar.querySelector('.ix-pn'), tg = bar.querySelector('.ix-tg')
  const bc = bar.querySelector('.ix-bc'), be = bar.querySelector('.ix-be'), ct = bar.querySelector('.ix-ct')
  const b2t = bar.querySelector('.ix-b2t'), bn = bar.querySelector('.ix-bn')
  const segFill = [...bar.querySelectorAll('.ix-sg i')]
  const byI = (root) => { const a = []; root.querySelectorAll('.ix-line').forEach((b) => { a[+b.dataset.i] = b }); return a }
  const byE = (root) => { const a = []; root.querySelectorAll('.ix-emp').forEach((l) => { a[+l.dataset.ei] = l }); return a }
  const linesD = byI(gut), linesM = byI(bar), empD = byE(gut), empM = byE(bar)
  const anchors = [...gut.querySelectorAll('.ix-an')]

  /* ---- desktop layout: measure once per layout change, never in the scroll callback ---- */
  const mqD = matchMedia('(min-width:900px)')
  let ys = [], listH = 0, viewH = 0, over = false
  const measure = () => {
    if (!mqD.matches) return
    dEl.classList.remove('ix-dense')
    const avail = Math.max(160, innerHeight - 220)
    let H = lw.offsetHeight
    if (H > avail) { dEl.classList.add('ix-dense'); H = lw.offsetHeight }
    over = H > avail
    dEl.classList.toggle('ix-over', over)
    viewH = Math.min(H, avail)
    dEl.style.setProperty('--h', `${viewH}px`)
    const top = lw.getBoundingClientRect().top
    ys = anchors.map((a) => { const r = a.getBoundingClientRect(); return r.top + r.height / 2 - top })
    listH = H
    lastQ = NaN
    if (state) paintQ(state.q)
    if (over) edge()
  }

  const yAt = (q) => {
    if (!ys.length) return 0
    const f = Math.min(n - 1, Math.max(0, Math.floor(q)))
    if (f >= n - 1) return ys[n - 1]
    return ys[f] + (ys[f + 1] - ys[f]) * clamp01(q - f)
  }

  /* inner scroll (only when the index is taller than the screen): fade cue + auto-follow */
  let edgeNow = 'top', hov = false, lastTop = -1
  const edge = () => {
    const t = sc.scrollTop, m = sc.scrollHeight - sc.clientHeight
    const e = m <= 1 ? 'none' : t <= 1 ? 'top' : t >= m - 1 ? 'end' : 'mid'
    if (e !== edgeNow) { edgeNow = e; sc.dataset.edge = e }
  }
  const onHov = (v) => () => { hov = v }
  sc.addEventListener('pointerenter', onHov(true))
  sc.addEventListener('pointerleave', onHov(false))
  sc.addEventListener('scroll', edge, { passive: true })
  cleanups.push(() => { sc.removeEventListener('scroll', edge) })

  /* ---- state ---- */
  let state = null, cur = -1, lastQ = NaN, curFocusIn = false
  sc.addEventListener('focusin', () => { curFocusIn = true })
  sc.addEventListener('focusout', () => { curFocusIn = false })

  const paintQ = (q) => {
    if (q === lastQ) return
    lastQ = q
    if (mqD.matches) {
      const y = yAt(q)
      mk.style.transform = `translate3d(0,${(y - 5.5).toFixed(2)}px,0)`
      fl.style.transform = `scaleY(${listH ? clamp01(y / listH).toFixed(4) : 0})`
      if (over && !hov && !curFocusIn) {
        const t = Math.max(0, Math.min(listH - viewH, y - viewH / 2))
        if (Math.abs(t - lastTop) > 0.5) { lastTop = t; sc.scrollTop = t }
      }
    } else {
      for (let k = 0; k < n; k++) {
        const v = clamp01(q - k + 1).toFixed(3)
        if (segFill[k]._v !== v) { segFill[k]._v = v; segFill[k].style.transform = `scaleX(${v})` }
      }
    }
  }

  const setCur = (idx) => {
    const prev = cur
    cur = idx
    for (const L of [linesD, linesM]) {
      if (L[prev]) { L[prev].classList.remove('is-cur'); L[prev].removeAttribute('aria-current') }
      L[idx].classList.add('is-cur')
      L[idx].setAttribute('aria-current', 'true')
    }
    for (const E of [empD, empM]) {
      if (prev >= 0 && ei[prev] !== ei[idx]) E[ei[prev]]?.classList.remove('is-cur')
      E[ei[idx]]?.classList.add('is-cur')
    }
    const f = flat[idx], solo = f.e.kind === 'solo'
    dEl.dataset.live = String(f.c.current)
    be.textContent = f.e.name
    b2t.textContent = solo ? f.c.title : f.c.co
    ct.innerHTML = `<span class="sr">Contract </span>${idx + 1} of ${n}`
    bc.dataset.k = solo ? 'solo' : 'group'
    bc.dataset.live = String(f.c.current)
    bn.hidden = !f.c.current
    if (!reduce && prev >= 0 && !mqD.matches) bc.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,.8,.2,1)' })
  }

  const unsub = subscribe((s) => {
    state = s
    if (s.idx !== cur) setCur(s.idx)
    paintQ(s.q)
  })
  cleanups.push(unsub)

  /* ---- jump: desktop line / panel line ---- */
  let isOpen = false
  const setOpen = (v, refocus) => {
    if (v === isOpen) return
    isOpen = v
    mEl.classList.toggle('ix-open', v)
    tg.setAttribute('aria-expanded', String(v))
    if (v) {
      const b = linesM[cur] || linesM[0]
      const pr = pn.getBoundingClientRect(), br = b.getBoundingClientRect()
      pn.scrollTop += br.top - pr.top - (pn.clientHeight - br.height) / 2
      b.focus({ preventScroll: true })
    } else if (refocus) tg.focus()
  }
  const onClick = (ev) => {
    const b = ev.target.closest('.ix-line')
    if (!b) return
    const i = +b.dataset.i
    if (isOpen) setOpen(false, false)
    goTo(i)
  }
  gut.addEventListener('click', onClick)
  pn.addEventListener('click', onClick)
  const onTg = () => setOpen(!isOpen, true)
  tg.addEventListener('click', onTg)
  const onDoc = (ev) => { if (isOpen && !mEl.contains(ev.target)) setOpen(false, false) }
  const onKey = (ev) => { if (isOpen && ev.key === 'Escape') { ev.preventDefault(); setOpen(false, true) } }
  const onOut = (ev) => { if (isOpen && ev.relatedTarget && !mEl.contains(ev.relatedTarget)) setOpen(false, false) }
  document.addEventListener('pointerdown', onDoc)
  document.addEventListener('keydown', onKey)
  mEl.addEventListener('focusout', onOut)

  /* ---- layout observers ---- */
  const ro = new ResizeObserver(measure)
  ro.observe(lw)
  ro.observe(gut)
  addEventListener('resize', measure)
  const onMq = () => { setOpen(false, false); measure(); lastQ = NaN; if (state) paintQ(state.q) }
  mqD.addEventListener('change', onMq)
  measure()

  return () => {
    cleanups.forEach((fn) => fn())
    ro.disconnect()
    removeEventListener('resize', measure)
    mqD.removeEventListener('change', onMq)
    document.removeEventListener('pointerdown', onDoc)
    document.removeEventListener('keydown', onKey)
    gut.removeEventListener('click', onClick)
    gut.replaceChildren()
    bar.replaceChildren()
  }
}
