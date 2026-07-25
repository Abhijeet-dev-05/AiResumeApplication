"""Profile Builder — lean LLM data extraction + Python HTML rendering."""
from langchain_core.prompts import PromptTemplate
from html_template import TEMPLATE_HTML

DATA_PROMPT = PromptTemplate(
    input_variables=["context"],
    template="""Extract info from this resume. Return ONLY valid JSON, no markdown, no explanation.
RESUME:
{context}
JSON structure (use empty string/array if missing):
{{"name":"","title":"","email":"","phone":"","location":"","linkedin":"","github":"","summary":"","skills":{{"languages":[],"frameworks":[],"databases":[],"cloud":[],"ai_ml":[],"devops":[],"tools":[]}},"projects":[{{"name":"","description":"","tech":[],"github":"","demo":""}}],"experience":[{{"company":"","role":"","dates":"","bullets":[]}}],"education":[{{"institution":"","degree":"","year":"","gpa":""}}],"certifications":[{{"name":"","issuer":""}}],"achievements":[]}}
Return ONLY the JSON."""
)

COLORS = ["#c2622a","#a84e1e","#7c3aed","#0ea5e9","#10b981","#e07050","#d4854a"]

def _nav(exp, certs, achieve):
    s = ["About","Skills","Projects"]
    if exp: s.append("Experience")
    s.append("Education")
    if certs: s.append("Certifications")
    if achieve: s.append("Achievements")
    s.append("Contact")
    d = "".join(f'<a href="#{x.lower()}" class="nl">{x}</a>' for x in s)
    m = "".join(f'<a href="#{x.lower()}" onclick="cm()" class="ml">{x}</a>' for x in s)
    return d, m

def _pills(skills):
    cats = [("Languages","💻",skills.get("languages",[])),("Frameworks","⚡",skills.get("frameworks",[])),
            ("Databases","🗄",skills.get("databases",[])),("Cloud","☁",skills.get("cloud",[])),
            ("AI / ML","🤖",skills.get("ai_ml",[])),("DevOps","🔧",skills.get("devops",[])),("Tools","🛠",skills.get("tools",[]))]
    h=""
    for n,ic,items in cats:
        if not items: continue
        p="".join(f'<span class="sp">{s}</span>' for s in items)
        h+=f'<div class="scard"><div class="shead"><span>{ic}</span><b>{n}</b></div><div class="spills">{p}</div></div>'
    return h

def _projs(projects):
    h=""
    for i,p in enumerate(projects):
        c=COLORS[i%len(COLORS)]
        tech="".join(f'<span class="tb" style="color:{c};border-color:{c}44">{t}</span>' for t in p.get("tech",[]))
        gh=f'<a href="{p["github"]}" target="_blank" class="pbo">↗ GitHub</a>' if p.get("github") else ""
        dm=f'<a href="{p["demo"]}" target="_blank" class="pbs" style="background:linear-gradient(135deg,{c},{c}aa);color:#000">▶ Live</a>' if p.get("demo") else ""
        n=str(i+1).zfill(2)
        h+=f'<div class="pcard" style="--pc:{c}"><div class="pbar"></div><div class="pnum">{n}</div><h3 class="pn">{p.get("name","")}</h3><p class="pd">{p.get("description","")}</p><div class="ptech">{tech}</div><div class="pbtns">{gh}{dm}</div><div class="pglow"></div></div>'
    return h

def _tl(experience):
    if not experience: return ""
    items=""
    for e in experience:
        bl="".join(f"<li>{b}</li>" for b in e.get("bullets",[]))
        items+=f'<div class="te"><div class="tdot"><div class="tdi"></div></div><div class="tb2"><div class="tth"><div><p class="trole">{e.get("role","")}</p><p class="tco">{e.get("company","")}</p></div><span class="tdate">{e.get("dates","")}</span></div><ul class="tul">{bl}</ul></div></div>'
    return f'<div class="tline">{items}</div>'

def _edu(education):
    h=""
    for e in education:
        gpa=f'<span class="gpa">GPA {e["gpa"]}</span>' if e.get("gpa") else ""
        h+=f'<div class="ecard"><div class="eico">🎓</div><p class="edeg">{e.get("degree","")}</p><p class="einst">{e.get("institution","")}</p><div class="efoot"><span class="eyr">{e.get("year","")}</span>{gpa}</div></div>'
    return h

def _certs(certifications):
    h=""
    for c in certifications:
        if not c.get("name"): continue
        h+=f'<div class="ccrd"><span class="cstar">★</span><div><p class="cn">{c.get("name","")}</p><p class="ci2">{c.get("issuer","")}</p></div></div>'
    return h

def _ach(achievements):
    h=""
    for i,a in enumerate(achievements,1):
        h+=f'<div class="acrd"><span class="anum">{str(i).zfill(2)}</span><p class="atxt">{a}</p></div>'
    return h

def _contact(data):
    rows=""
    its=[("✉","Email",data.get("email",""),f'mailto:{data.get("email","")}'),
         ("📱","Phone",data.get("phone",""),""),
         ("📍","Location",data.get("location",""),""),
         ("🔗","LinkedIn",data.get("linkedin",""),data.get("linkedin","")),
         ("💻","GitHub",data.get("github",""),data.get("github",""))]
    for ic,lb,val,hr in its:
        if not val: continue
        v=f'<a href="{hr}" target="_blank" class="cva">{val}</a>' if hr else f'<span class="cvt">{val}</span>'
        rows+=f'<div class="crow"><div class="cbox">{ic}</div><div><p class="clbl">{lb}</p>{v}</div></div>'
    return rows

def build_html(data):
    name=data.get("name","") or "Developer"
    fname=name.split()[0] if name else "Dev"
    title=data.get("title","") or "Software Developer"
    summary=data.get("summary","") or "A passionate developer building impactful applications."
    skills=data.get("skills",{}); projects=data.get("projects",[])
    exp=data.get("experience",[]); edu=data.get("education",[])
    certs=data.get("certifications",[]); achieve=data.get("achievements",[])
    skc=sum(len(v) for v in skills.values() if isinstance(v,list))
    prc=len(projects)
    raw_words = [title] + [w for w in title.split() if len(w) > 3]
    safe_words = list(dict.fromkeys(raw_words))[:3]  # dedupe, max 3
    if not safe_words:
        safe_words = ["Developer"]
    type_words = ",".join(f'"{w}"' for w in safe_words)
    nl,ml=_nav(exp,certs,achieve)
    gh_f=f'<a href="{data.get("github","")}" target="_blank" class="fla">💻</a>' if data.get("github") else ""
    li_f=f'<a href="{data.get("linkedin","")}" target="_blank" class="fla">🔗</a>' if data.get("linkedin") else ""
    exp_s=f'<section id="experience" class="sec salt" data-a><div class="wrap"><div class="sh"><h2 class="st">Experience</h2><div class="sl"></div></div>{_tl(exp)}</div></section>' if exp else ""
    cert_s=f'<section id="certifications" class="sec" data-a><div class="wrap"><div class="sh"><h2 class="st">Certifications</h2><div class="sl"></div></div><div class="cgrid">{_certs(certs)}</div></div></section>' if any(c.get("name") for c in certs) else ""
    ach_s=f'<section id="achievements" class="sec salt" data-a><div class="wrap"><div class="sh"><h2 class="st">Achievements</h2><div class="sl"></div></div><div class="agrid">{_ach(achieve)}</div></div></section>' if achieve else ""
    # Use simple string replacement instead of .format() to avoid CSS brace conflicts
    replacements = {
        "{{name}}": name, "{{fname}}": fname, "{{title}}": title,
        "{{summary}}": summary, "{{skc}}": str(skc), "{{prc}}": str(prc),
        "{{type_words}}": type_words,
        "{{email}}": data.get("email",""), "{{location}}": data.get("location",""),
        "{{nl}}": nl, "{{ml}}": ml, "{{sk}}": _pills(skills),
        "{{pr}}": _projs(projects), "{{edu}}": _edu(edu),
        "{{ct}}": _contact(data), "{{exp_s}}": exp_s,
        "{{cert_s}}": cert_s, "{{ach_s}}": ach_s,
        "{{gh_f}}": gh_f, "{{li_f}}": li_f,
    }
    result = TEMPLATE_HTML
    for k, v in replacements.items():
        result = result.replace(k, v)
    return result
