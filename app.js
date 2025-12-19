:root{
  --bg:#0b0c0b;
  --card:#111311;
  --text:#f3f4f2;
  --muted:#a9b09e;
  --accent:#6f7f3a;
  --accent2:#8ea04b;
  --line:rgba(255,255,255,.08);
  --shadow: 0 16px 40px rgba(0,0,0,.45);
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif;
  color:var(--text);
  background:linear-gradient(180deg, #0b0c0b 0%, #070807 100%);
}

.topbar{
  position:sticky; top:0; z-index:20;
  display:flex; align-items:center; gap:12px;
  padding:14px 14px calc(10px + env(safe-area-inset-top));
  background:linear-gradient(180deg, rgba(111,127,58,.95) 0%, rgba(111,127,58,.72) 60%, rgba(11,12,11,.85) 100%);
  backdrop-filter: blur(10px);
}

.titleblock{flex:1; min-width:0}
.apptitle{font-size:28px; font-weight:800; letter-spacing:.2px}
.subtitle{font-size:12px; color:rgba(255,255,255,.85); margin-top:2px}

.icon-btn{
  width:40px; height:40px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.18);
  color:var(--text);
  display:grid; place-items:center;
}
.pill-btn{
  height:40px;
  padding:0 14px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.18);
  color:var(--text);
  font-weight:700;
}
.ghost-btn{
  height:40px;
  padding:0 14px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.18);
  background:transparent;
  color:var(--text);
  font-weight:700;
}

.burger, .closeicon, .filtericon, .searchicon, .backicon{
  width:18px; height:18px; position:relative; display:block;
}
.burger::before,.burger::after,.burger span{
  content:""; position:absolute; left:0; right:0; height:2px; background:#fff; border-radius:2px;
}
.burger::before{top:2px}
.burger::after{bottom:2px}
.burger span{top:8px}
.closeicon::before,.closeicon::after{
  content:""; position:absolute; left:8px; top:1px; bottom:1px; width:2px; background:#fff; border-radius:2px;
}
.closeicon::before{transform:rotate(45deg)}
.closeicon::after{transform:rotate(-45deg)}
.filtericon::before{
  content:""; position:absolute; left:0; right:0; top:3px; height:2px; background:#fff; border-radius:2px;
}
.filtericon::after{
  content:""; position:absolute; left:4px; right:4px; top:10px; height:2px; background:#fff; border-radius:2px;
}
.searchicon::before{
  content:""; position:absolute; width:10px; height:10px; border:2px solid #fff; border-radius:999px; left:0; top:0; opacity:.9;
}
.searchicon::after{
  content:""; position:absolute; width:8px; height:2px; background:#fff; border-radius:2px;
  right:0; bottom:0; transform:rotate(45deg); transform-origin:right bottom; opacity:.9;
}
.backicon::before{
  content:""; position:absolute; left:4px; top:8px; width:10px; height:2px; background:#fff; border-radius:2px;
}
.backicon::after{
  content:""; position:absolute; left:4px; top:5px; width:7px; height:7px;
  border-left:2px solid #fff; border-bottom:2px solid #fff;
  transform:rotate(45deg);
}

.wrap{padding:12px 12px calc(28px + env(safe-area-inset-bottom))}
.controls{max-width:980px; margin:0 auto 10px}
.searchrow{display:flex; gap:10px; align-items:center}

.search{
  flex:1; display:flex; align-items:center; gap:10px;
  padding:10px 12px;
  border-radius:14px;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.10);
}
.search input{
  flex:1; border:0; outline:0;
  background:transparent; color:var(--text);
  font-size:15px;
}

.filters{
  margin-top:10px;
  padding:12px;
  border-radius:16px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.10);
  display:none;
}
.filters.show{display:block}
.filtergrid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap:10px;
}
.field{display:flex; flex-direction:column; gap:6px}
.field span{font-size:12px; color:var(--muted)}
.field input, .field select{
  height:40px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.25);
  color:var(--text);
  padding:0 10px;
}
.filteractions{margin-top:10px; display:flex; justify-content:flex-end}

.grid{
  max-width:980px; margin:0 auto;
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap:12px;
}
@media (min-width: 860px){
  .grid{grid-template-columns: repeat(3, minmax(0,1fr));}
  .filtergrid{grid-template-columns: repeat(4, minmax(0,1fr));}
}

.card{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.10);
  border-radius:18px;
  overflow:hidden;
  box-shadow: var(--shadow);
  cursor:pointer;
}
.thumb{
  aspect-ratio: 16/10;
  background:rgba(255,255,255,.06);
}
.thumb img{width:100%; height:100%; object-fit:cover; display:block}
.cardbody{padding:10px 12px 12px}
.cardmeta{
  color:rgba(142,160,75,.95);
  font-weight:800;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.3px;
  line-height:1.25;
}
.cardtitle{
  margin-top:6px;
  font-size:15px;
  font-weight:800;
  line-height:1.2;
}

.drawer-backdrop, .modal-backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.55);
  z-index:40;
}
.drawer{
  position:fixed; top:0; right:0; height:100%;
  width:min(420px, 92vw);
  background:linear-gradient(180deg, #0f120f 0%, #0a0c0a 100%);
  border-left:1px solid rgba(255,255,255,.12);
  z-index:50;
  transform: translateX(100%);
  transition: transform .18s ease;
}
.drawer.open{transform: translateX(0)}
.drawerhead{
  display:flex; align-items:center; justify-content:space-between;
  padding:14px;
  border-bottom:1px solid var(--line);
}
.drawertitle{font-size:16px; font-weight:900}
.drawerbody{padding:14px}
.hint{margin:0 0 12px; color:var(--muted); font-size:13px; line-height:1.35}
.row{display:flex; gap:10px; margin-top:10px}
.status{margin-top:10px; color:var(--muted); font-size:13px}
.help{margin-top:12px; color:var(--muted); font-size:13px}
.help summary{cursor:pointer; font-weight:800; color:var(--text)}
.help ol{margin:8px 0 0; padding-left:18px}

.modal{
  position:fixed;
  inset: 10px 10px 10px 10px;
  z-index:60;
  background:linear-gradient(180deg, #0f120f 0%, #0a0c0a 100%);
  border:1px solid rgba(255,255,255,.12);
  border-radius:20px;
  overflow:hidden;
  display:none;
}
.modal.open{display:block}
.modalclose{position:absolute; left:10px; top:10px; z-index:5}

.hero{
  position:relative;
  height: 280px;
  background:rgba(255,255,255,.06);
}
.hero img{width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.05)}
.herotext{
  position:absolute; left:0; right:0; bottom:0;
  padding:14px;
  background:linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.75) 55%, rgba(0,0,0,.9) 100%);
}
.herotext h1{margin:0; font-si
