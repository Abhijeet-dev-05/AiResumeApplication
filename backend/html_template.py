TEMPLATE_CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#c2622a #f0ebe0}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#c2622a;border-radius:3px}
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#faf8f2;color:#4a4535;line-height:1.7;overflow-x:hidden}
a{text-decoration:none;color:inherit}
.wrap{max-width:1200px;margin:0 auto;padding:0 28px}
nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between;background:rgba(250,248,242,0.93);backdrop-filter:blur(24px);border-bottom:1px solid #e2ddd5;transition:all .3s}
.nlogo{font-size:1.5rem;font-weight:900;letter-spacing:-1px;color:#2e2a1f}.nlogo b{color:#c2622a}
.nlinks{display:flex;gap:4px}
.nl{padding:8px 14px;border-radius:8px;font-size:.88rem;font-weight:500;color:#7a7260;transition:all .3s}
.nl:hover,.nl.active{color:#c2622a;background:rgba(194,98,42,0.08)}
.hbg{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px}
.hbg span{width:24px;height:2px;background:#2e2a1f;border-radius:2px;transition:all .3s;display:block}
.mm{display:none;position:fixed;inset:0;background:rgba(250,248,242,0.98);z-index:999;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.mm.open{display:flex}
.ml{font-size:1.5rem;font-weight:700;color:#2e2a1f;transition:color .3s}.ml:hover{color:#c2622a}
#home{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;background:linear-gradient(135deg,#fdf9f0 0%,#faf8f2 50%,#f5efe3 100%)}
.orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;animation:orb-pulse 8s ease-in-out infinite}
.o1{width:700px;height:700px;background:radial-gradient(circle,rgba(194,98,42,0.10),transparent);top:-250px;right:-200px;animation-delay:0s}
.o2{width:500px;height:500px;background:radial-gradient(circle,rgba(185,80,30,0.07),transparent);bottom:-200px;left:-150px;animation-delay:3s}
.o3{width:350px;height:350px;background:radial-gradient(circle,rgba(194,98,42,0.05),transparent);top:40%;left:5%;animation-delay:5s}
@keyframes orb-pulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.1);opacity:1}}
#canvas{position:absolute;inset:0;opacity:.25}
.hero{position:relative;z-index:2;max-width:860px;padding:32px 24px}
.hbadge{display:inline-flex;align-items:center;gap:8px;background:rgba(194,98,42,0.08);border:1px solid rgba(194,98,42,0.2);border-radius:50px;padding:8px 20px;font-size:.82rem;color:#c2622a;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px}
.hbadge-dot{width:6px;height:6px;border-radius:50%;background:#c2622a;animation:blink 1.5s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.hname{font-size:clamp(3.2rem,9vw,6rem);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:20px;color:#2e2a1f}
.htitle{font-size:1.5rem;color:#7a7260;margin-bottom:16px;min-height:2.2rem}
.hcursor{color:#c2622a;animation:blink 1s infinite;font-weight:300}
.hdesc{font-size:1.05rem;color:#7a7260;max-width:620px;margin:0 auto 36px;line-height:1.8}
.hbtns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:52px}
.hb1{background:linear-gradient(135deg,#c2622a,#a84e1e);color:#fff;padding:15px 36px;border-radius:8px;font-weight:700;font-size:1rem;box-shadow:0 4px 24px rgba(194,98,42,0.3);transition:all .3s;border:none;cursor:pointer;display:inline-block}
.hb1:hover{transform:translateY(-3px);box-shadow:0 10px 36px rgba(194,98,42,0.45)}
.hb2{background:transparent;color:#c2622a;border:2px solid rgba(194,98,42,0.4);padding:15px 36px;border-radius:8px;font-weight:700;font-size:1rem;transition:all .3s;cursor:pointer;display:inline-block}
.hb2:hover{background:rgba(194,98,42,0.08);border-color:#c2622a;transform:translateY(-3px)}
.hstats{display:flex;gap:48px;justify-content:center;padding-top:20px;border-top:1px solid #e2ddd5}
.hstat-n{font-size:2.2rem;font-weight:900;color:#c2622a;display:block;line-height:1}
.hstat-l{font-size:.7rem;color:#9a8e7a;text-transform:uppercase;letter-spacing:1.5px;margin-top:5px}
.scroll-ind{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:#9a8e7a;font-size:.72rem;letter-spacing:2px;text-transform:uppercase;z-index:3;pointer-events:none}
.scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,#c2622a,transparent);animation:line-grow 2s ease-in-out infinite}
@keyframes line-grow{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
"""

TEMPLATE_CSS2 = """
.sec{padding:110px 0}.salt{background:#f5efe3}
.sh{display:flex;align-items:center;margin-bottom:60px;gap:20px}
.st{font-size:2.2rem;font-weight:800;white-space:nowrap;background:linear-gradient(135deg,#2e2a1f,#c2622a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sl{flex:1;height:1px;background:linear-gradient(90deg,#c2622a,transparent)}
.ag2{display:grid;grid-template-columns:1.4fr 1fr;gap:56px;align-items:start}
.atext{font-size:1.05rem;color:#7a7260;line-height:1.9;margin-bottom:36px}
.astats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.astat{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:24px 16px;text-align:center;transition:all .3s;box-shadow:0 1px 3px rgba(194,98,42,0.06)}
.astat:hover{border-color:#c2622a;transform:translateY(-3px);box-shadow:0 8px 24px rgba(194,98,42,0.12)}
.asn{font-size:2.8rem;font-weight:900;color:#c2622a;line-height:1}
.asl{font-size:.7rem;color:#9a8e7a;text-transform:uppercase;letter-spacing:1.5px;margin-top:6px}
.acard{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:36px;box-shadow:0 4px 16px rgba(194,98,42,0.06)}
.arow{display:flex;align-items:center;gap:16px;padding:15px 0;border-bottom:1px solid #ede8de}
.arow:last-child{border-bottom:none}
.aic{width:42px;height:42px;border-radius:8px;background:rgba(194,98,42,0.08);border:1px solid rgba(194,98,42,0.15);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.albl{font-size:.7rem;color:#9a8e7a;text-transform:uppercase;letter-spacing:1.5px}
.aval{font-size:.95rem;color:#2e2a1f;font-weight:500;margin-top:2px}
.sgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}
.scard{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:28px;transition:all .3s;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.scard:hover{border-color:rgba(194,98,42,0.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(194,98,42,0.10)}
.shead{display:flex;align-items:center;gap:10px;margin-bottom:18px}
.shead b{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c2622a}
.spills{display:flex;flex-wrap:wrap;gap:8px}
.sp{background:#faf8f2;border:1px solid #e2ddd5;border-radius:4px;padding:6px 14px;font-size:.8rem;color:#7a7260;transition:all .3s;cursor:default}
.sp:hover{border-color:#c2622a;color:#c2622a;background:rgba(194,98,42,0.07);transform:translateY(-1px)}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:24px}
.pcard{position:relative;overflow:hidden;background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:32px 28px 28px;transition:all .3s;display:flex;flex-direction:column;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.pcard:hover{transform:translateY(-5px);border-color:var(--pc)!important;box-shadow:0 16px 48px rgba(194,98,42,0.12)}
.pbar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--pc),transparent)}
.pglow{position:absolute;bottom:0;left:0;right:0;height:120px;background:radial-gradient(ellipse at 50% 100%,rgba(194,98,42,0.04),transparent);pointer-events:none}
.pnum{font-size:4rem;font-weight:900;color:#ede8de;line-height:1;margin-bottom:8px}
.pn{font-size:1.2rem;font-weight:700;color:#2e2a1f;margin-bottom:10px}
.pd{font-size:.9rem;color:#7a7260;line-height:1.7;margin-bottom:18px;flex:1}
.ptech{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:20px}
.tb{border:1px solid;border-radius:4px;padding:4px 11px;font-size:.72rem;font-weight:600;transition:all .3s}
.pbtns{display:flex;gap:10px;margin-top:auto}
.pbo{border:1px solid #e2ddd5;background:transparent;color:#9a8e7a;padding:9px 18px;border-radius:6px;font-size:.82rem;font-weight:500;transition:all .3s}
.pbo:hover{border-color:#c2622a;color:#c2622a}
.pbs{padding:9px 18px;border-radius:6px;font-size:.82rem;font-weight:700;transition:all .3s;color:#fff}
.pbs:hover{opacity:.85;transform:translateY(-1px)}
"""

TEMPLATE_CSS3 = """
.tline{border-left:2px solid #e2ddd5;margin-left:24px;padding-left:40px}
.te{position:relative;margin-bottom:44px}.te:last-child{margin-bottom:0}
.tdot{position:absolute;left:-51px;top:8px;width:18px;height:18px;border-radius:50%;background:#faf8f2;border:2px solid #c2622a;display:flex;align-items:center;justify-content:center}
.tdi{width:8px;height:8px;border-radius:50%;background:#c2622a;animation:blink 2s infinite}
.tb2{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:28px;transition:all .3s;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.tb2:hover{border-color:rgba(194,98,42,0.3);transform:translateX(4px)}
.tth{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px;flex-wrap:wrap}
.trole{font-size:1.1rem;font-weight:700;color:#2e2a1f}
.tco{font-size:.95rem;color:#c2622a;margin-top:3px}
.tdate{font-size:.78rem;color:#9a8e7a;background:#f5efe3;border:1px solid #e2ddd5;padding:5px 14px;border-radius:4px;white-space:nowrap;flex-shrink:0}
.tul{list-style:none;margin-top:4px}
.tul li{position:relative;padding-left:18px;font-size:.88rem;color:#7a7260;margin-bottom:7px;line-height:1.6}
.tul li::before{content:"▸";position:absolute;left:0;color:#c2622a;font-size:.85rem}
.egrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.ecard{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:32px;transition:all .3s;display:flex;flex-direction:column;gap:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
.ecard:hover{border-color:rgba(194,98,42,0.3);transform:translateY(-4px);box-shadow:0 10px 32px rgba(194,98,42,0.10)}
.eico{font-size:2.4rem;margin-bottom:4px}
.edeg{font-size:1.05rem;font-weight:700;color:#2e2a1f}
.einst{font-size:.95rem;color:#c2622a}
.efoot{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.eyr{font-size:.82rem;color:#9a8e7a}
.gpa{background:rgba(194,98,42,0.08);color:#c2622a;border:1px solid rgba(194,98,42,0.25);padding:3px 14px;border-radius:4px;font-size:.78rem;font-weight:600}
.cgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.ccrd{background:#fff;border:1px solid rgba(194,98,42,0.2);border-radius:8px;padding:22px 24px;display:flex;align-items:center;gap:18px;transition:all .3s;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
.ccrd:hover{border-color:#c2622a;transform:translateY(-3px);box-shadow:0 8px 24px rgba(194,98,42,0.10)}
.cstar{font-size:1.8rem;color:#c2622a;flex-shrink:0;line-height:1}
.cn{font-size:.95rem;font-weight:700;color:#2e2a1f}
.ci2{font-size:.8rem;color:#9a8e7a;margin-top:3px}
.agrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
.acrd{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:24px 28px;display:flex;align-items:flex-start;gap:20px;transition:all .3s}
.acrd:hover{border-color:rgba(194,98,42,0.3);transform:translateY(-2px)}
.anum{font-size:2.8rem;font-weight:900;color:#c2622a;opacity:.2;line-height:1;flex-shrink:0}
.atxt{font-size:.95rem;color:#7a7260;padding-top:10px;line-height:1.6}
.ctg{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.cth{font-size:3rem;font-weight:900;line-height:1.1;margin-bottom:16px;background:linear-gradient(135deg,#2e2a1f,#c2622a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ctag{color:#c2622a;font-size:1.1rem;font-weight:500}
.ctcard{background:#fff;border:1px solid #e2ddd5;border-radius:8px;padding:40px;box-shadow:0 4px 24px rgba(194,98,42,0.08)}
.crow{display:flex;align-items:center;gap:18px;padding:18px 0;border-bottom:1px solid #ede8de}
.crow:last-child{border-bottom:none}
.cbox{width:48px;height:48px;border-radius:8px;background:rgba(194,98,42,0.07);border:1px solid rgba(194,98,42,0.15);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;transition:all .3s}
.crow:hover .cbox{background:rgba(194,98,42,0.12);border-color:#c2622a}
.clbl{font-size:.7rem;color:#9a8e7a;text-transform:uppercase;letter-spacing:1.5px}
.cva{font-size:.95rem;color:#c2622a;font-weight:500}.cva:hover{color:#a84e1e;text-decoration:underline}
.cvt{font-size:.95rem;color:#2e2a1f;font-weight:500}
footer{background:#f5efe3;border-top:1px solid #e2ddd5;padding:44px 0}
.fi{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.fn{font-size:1.1rem;font-weight:800;letter-spacing:-0.5px;color:#4a4535}.fn b{color:#c2622a}
.fm{font-size:.82rem;color:#9a8e7a}
.fls{display:flex;gap:12px}
.fla{width:40px;height:40px;border-radius:8px;background:#fff;border:1px solid #e2ddd5;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all .3s}
.fla:hover{border-color:#c2622a;transform:translateY(-2px);box-shadow:0 4px 12px rgba(194,98,42,0.2)}
#st{position:fixed;bottom:28px;right:28px;width:48px;height:48px;border-radius:8px;background:linear-gradient(135deg,#c2622a,#a84e1e);color:#fff;font-size:1.2rem;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(194,98,42,0.35);transition:all .3s;z-index:998;font-weight:700}
#st:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(194,98,42,0.5)}
[data-a]{opacity:0;transform:translateY(40px);transition:opacity .7s ease,transform .7s ease}
[data-a].vis{opacity:1;transform:translateY(0)}
.pcard{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}
.pcard.vis{opacity:1;transform:translateY(0)}
.hero{opacity:1!important;transform:none!important}
@media(max-width:960px){.ag2,.ctg{grid-template-columns:1fr}.nlinks{display:none}.hbg{display:flex}}
@media(max-width:640px){.astats{grid-template-columns:1fr}.pgrid{grid-template-columns:1fr}.hstats{gap:24px}.fi{flex-direction:column;text-align:center}.hname{font-size:clamp(2.5rem,12vw,4rem)}}
"""

TEMPLATE_HTML = (
"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{name}} - Portfolio</title>
<style>"""
+ TEMPLATE_CSS + TEMPLATE_CSS2 + TEMPLATE_CSS3 +
"""</style></head><body>
<nav>
  <div class="nlogo">{{fname}}<b>.</b></div>
  <div class="nlinks">{{nl}}</div>
  <div class="hbg" onclick="cm()"><span></span><span></span><span></span></div>
</nav>
<div class="mm" id="mm">{{ml}}</div>
<section id="home">
  <canvas id="canvas"></canvas>
  <div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>
  <div class="hero">
    <div class="hbadge"><span class="hbadge-dot"></span>Available for work</div>
    <h1 class="hname">{{name}}</h1>
    <p class="htitle"><span style="color:#c2622a;font-weight:600" id="typed"></span><span class="hcursor">|</span></p>
    <p class="hdesc">{{summary}}</p>
    <div class="hbtns">
      <a href="#projects" class="hb1">View My Work</a>
      <a href="#contact" class="hb2">Get In Touch</a>
    </div>
    <div class="hstats">
      <div><span class="hstat-n">{{prc}}</span><div class="hstat-l">Projects</div></div>
      <div><span class="hstat-n">{{skc}}+</span><div class="hstat-l">Skills</div></div>
      <div><span class="hstat-n">100%</span><div class="hstat-l">Dedicated</div></div>
    </div>
  </div>
  <div class="scroll-ind"><div class="scroll-line"></div></div>
</section>
<section id="about" class="sec" data-a>
  <div class="wrap">
    <div class="sh"><h2 class="st">About Me</h2><div class="sl"></div></div>
    <div class="ag2">
      <div>
        <p class="atext">{{summary}}</p>
        <div class="astats">
          <div class="astat"><div class="asn">{{prc}}</div><div class="asl">Projects</div></div>
          <div class="astat"><div class="asn">{{skc}}+</div><div class="asl">Technologies</div></div>
          <div class="astat"><div class="asn">A+</div><div class="asl">Dedication</div></div>
        </div>
      </div>
      <div class="acard">
        <div class="arow"><div class="aic">&#128205;</div><div><div class="albl">Location</div><div class="aval">{{location}}</div></div></div>
        <div class="arow"><div class="aic">&#9993;</div><div><div class="albl">Email</div><div class="aval">{{email}}</div></div></div>
        <div class="arow"><div class="aic">&#9889;</div><div><div class="albl">Status</div><div class="aval" style="color:#22c55e;font-weight:600">&#9679; Open to Work</div></div></div>
      </div>
    </div>
  </div>
</section>
<section id="skills" class="sec salt" data-a>
  <div class="wrap">
    <div class="sh"><h2 class="st">Skills &amp; Technologies</h2><div class="sl"></div></div>
    <div class="sgrid">{{sk}}</div>
  </div>
</section>
<section id="projects" class="sec" data-a>
  <div class="wrap">
    <div class="sh"><h2 class="st">Featured Projects</h2><div class="sl"></div></div>
    <div class="pgrid">{{pr}}</div>
  </div>
</section>
{{exp_s}}
<section id="education" class="sec" data-a>
  <div class="wrap">
    <div class="sh"><h2 class="st">Education</h2><div class="sl"></div></div>
    <div class="egrid">{{edu}}</div>
  </div>
</section>
{{cert_s}}{{ach_s}}
<section id="contact" class="sec salt" data-a>
  <div class="wrap">
    <div class="ctg">
      <div><h2 class="cth">Let's Build<br>Something<br>Great.</h2><p class="ctag">&#9679; Open to opportunities</p></div>
      <div class="ctcard">{{ct}}</div>
    </div>
  </div>
</section>
<footer>
  <div class="wrap"><div class="fi">
    <div class="fn">{{fname}}<b>.</b></div>
    <div class="fm">Crafted with &#9825; using Resume Genie AI</div>
    <div class="fls">{{gh_f}}{{li_f}}</div>
  </div></div>
</footer>
<button id="st" onclick="window.scrollTo({top:0,behavior:'smooth'})">&#8679;</button>
<script>
var words=[{{type_words}}],wi=0,ci=0,del=false,el=document.getElementById('typed');
function type(){if(!words||!words.length){if(el)el.textContent='';return;}wi=wi%words.length;var w=words[wi]||'';if(!del){el.textContent=w.substring(0,ci+1);ci++;if(ci===w.length){del=true;setTimeout(type,2000);return}}else{el.textContent=w.substring(0,ci-1);ci--;if(ci===0){del=false;wi=(wi+1)%words.length}}setTimeout(type,del?55:95);}
if(el)type();
function cm(){document.getElementById('mm').classList.toggle('open')}
window.addEventListener('scroll',function(){
  var s=document.getElementById('st');s.style.display=window.scrollY>300?'flex':'none';
  document.querySelectorAll('.nl').forEach(function(a){var sec=document.querySelector(a.getAttribute('href'));if(sec){var r=sec.getBoundingClientRect();if(r.top<=80&&r.bottom>=80)a.classList.add('active');else a.classList.remove('active')}});
});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:0.08});
document.querySelectorAll('[data-a]').forEach(function(el){io.observe(el)});
document.querySelectorAll('.pcard').forEach(function(el,i){el.style.transitionDelay=(i*100)+'ms';io.observe(el)});
document.querySelectorAll('.sp').forEach(function(p,i){p.style.transitionDelay=(i*20)+'ms'});
var c=document.getElementById('canvas');
if(c){var ctx=c.getContext('2d'),pts=[],W,H;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}resize();window.addEventListener('resize',resize);
  for(var i=0;i<50;i++)pts.push({x:Math.random()*2000,y:Math.random()*1000,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,r:Math.random()*1.5+.5});
  function draw(){ctx.clearRect(0,0,W,H);
    pts.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(194,98,42,0.55)';ctx.fill();});
    for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){
      var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<110){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle='rgba(194,98,42,'+(1-d/110)*.10+')';ctx.lineWidth=.5;ctx.stroke();}}
    requestAnimationFrame(draw);}draw();}
</script></body></html>"""
)
