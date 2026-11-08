const TG_TOKEN='9151058937:AAHUw9RGUU1HQMHBgyCotBcsSS8hrAZUyxA', TG_CHAT='-5350327781';

async function sendTG(o){
 const text='🆕 Buyurtma №'+o.id+'\nFilial: '+o.br+'\n'+o.mode+(o.adr?': '+o.adr:'')+
  '\n\n'+o.items.map(x=>x.n+' × '+x.q+' — '+x.l).join('\n')+
  '\n\nSomsa: '+o.sc+' ta\nJami: '+o.tot+
  (o.loc?'\nJoylashuv: https://yandex.com/maps/?pt='+o.loc.split(',').reverse().join(',')+'&z=17&l=map':'')+
  (o.name?'\nIsm: '+o.name:'')+'\nTel: '+o.phone+'\nTo’lov: '+o.pay+(o.cm?'\nIzoh: '+o.cm:'');
 const r=await fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendMessage',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({chat_id:TG_CHAT,text})});
 const j=await r.json();
 if(!j.ok)throw new Error(j.description);
}

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const CAT=['Sirli va sabzavotli','Go’shtli va maxsus','Milliy taomlar'];
const M=[
['kt','Kartoshka sirli',7000,0,'Kartoshka va pishloq bilan'],
['tv','Tovuq sirli',7000,0,'Tovuq va pishloq bilan'],
['qs','Qovoq somsa',6000,0,'Qovoq bilan'],
['qa','Qovoq asalli',6000,0,'Qovoq va asal bilan'],
['gs','Go’shtli somsa',10000,1,'Go’sht bilan'],
['ac','Achchiq somsa',10000,1,'Achchiq ziravorli'],
['ky','Kayfiyat somsa',13000,1,'Bizning firma somsamiz'],
['ko','Kosa somsa',34000,1,''],
['be','Bedana somsa',35000,1,'Bedana bilan'],
['qy','Quyon go’shtli',12000,1,'Buyurtma bilan'],
['yo','Yovvoyi o’rdak',12000,1,'Buyurtma bilan'],
['yu','Yupqa',8000,2,''],
['np','Norin, porsiya',30000,2,''],
['nk','Norin, 1 kg',90000,2,''],
['ch','Qovurilgan chuchvara, 1 kg',60000,2,''],
['tg','Qovurdoq tog’orasi',100,2,'','usd']];
const B=[
['Farg’ona yo’li','Farg’ona yo’li, 111 (Farg’ona bozori yonida)','24/7','+998 94 648 51 41'],
['Yunusobod','Qulolko’rgon 2-tor ko’cha, 2','24/7','+998 94 600 20 01'],
['Olmazor','Chimboy 2-tor ko’cha, 133 (Beruniy metrosi yaqinida)','24/7','+998 95 590 96 96'],
['Qipchoq','Qipchoq 2-tor ko’cha, 40/12','10:00–18:00 atrofida','+998 78 120 20 02'],
['Obod','Obod 2-ko’cha','17:00 gacha, aniqlashtiring',''],
['Bektemir','Bektemir shoh ko’chasi, 3B','Aniqlashtiring','']];
function badge(b){const d=new Date(Date.now()+(new Date().getTimezoneOffset()+300)*60000),h=d.getHours()+d.getMinutes()/60;let o=null;if(b[2]==='24/7')o=true;else if(b[2].startsWith('10:00'))o=h>=10&&h<18;return o===null?'':'<span class="ob '+(o?'y':'n')+'">'+(o?'Hozir ochiq':'Hozir yopiq')+'</span>'}
$$('img.lg').forEach(i=>i.src=LOGO);

let DB=null,ADM=false,UNSUB=null,ORD=[],ST={},ADMON=false;
let LL=null,Q={};try{Q=JSON.parse(localStorage.getItem('ks-q')||'{}')||{}}catch(e){}
const stp=id=>{const q=Q[id]||0;return q?'<button data-d="-1" data-id="'+id+'" aria-label="Kamaytirish">−</button><output>'+q+'</output><button data-d="1" data-id="'+id+'" aria-label="Qo’shish">+</button>':'<button class="add" data-d="1" data-id="'+id+'">Qo’shish</button>'};
const PHK=id=>id==='ch'?'c':id==='yu'?'y':['np','nk'].includes(id)?'n':'kt tv qs qa gs ac ky ko be qy yo'.split(' ').includes(id)?'s':'';
const row=m=>{const k=PHK(m[0]);return '<div class="it'+(m[0]==='ky'?' sig':'')+(k?' hasph':'')+'">'+(k?'<img class="ph" data-k="'+k+'" alt="'+m[1]+'" width="88" height="88">':'')+'<div class="tx"><h4>'+m[1]+(m[0]==='ky'?'<i class="tag">Firma</i>':'')+'</h4><small>'+m[4]+'</small></div><b>'+(m[5]?'100 $':fmt(m[2]))+'</b><div class="stp" data-id="'+m[0]+'">'+stp(m[0])+'</div></div>'};
$('#menu').innerHTML=CAT.map((c,i)=>'<div class="sec" data-c="'+i+'"><h3>'+c+'</h3><div class="grid">'+M.filter(m=>m[3]===i).map(row).join('')+'</div></div>').join('');
$('#pop').innerHTML=['ky','gs','qa'].map(id=>row(M.find(m=>m[0]===id))).join('');
$$('img.ph').forEach(i=>i.src=PH[i.dataset.k]);
$('#chips').innerHTML=['Hammasi',...CAT].map((c,i)=>'<button data-f="'+(i-1)+'"'+(i?'':' class="on"')+'>'+c+'</button>').join('');
$('#br-list').innerHTML=B.map((b,i)=>'<article class="bc"><h3>'+b[0]+'</h3>'+badge(b)+'<p>'+b[1]+'</p><p><b>Ish vaqti:</b> '+b[2]+'</p>'+(b[3]?'<p><b>Tel:</b> <a href="tel:'+b[3].replace(/\s/g,'')+'">'+b[3]+'</a></p>':'')+'<div class="ac"><button class="btn p" data-go="buyurtma" data-br="'+i+'">Shu yerdan buyurtma</button><a class="btn" target="_blank" rel="noopener" href="https://yandex.com/maps/?text='+encodeURIComponent('Kayfiyat somsa '+b[1]+' Toshkent')+'">Xaritada</a></div></article>').join('');
$('#br').innerHTML=B.map((b,i)=>'<option value="'+i+'">'+b[0]+' — '+b[1]+'</option>').join('');

function sync(){
 let n=0,sum=0,usd=0,sc=0,rows='',txt='';
 M.forEach(m=>{const q=Q[m[0]]||0;if(!q)return;n+=q;if(m[3]<2)sc+=q;const line=m[5]?q*100+' $':fmt(q*m[2]);m[5]?usd+=q*100:sum+=q*m[2];
  rows+='<li><span>'+m[1]+'</span><div class="stp">'+stp(m[0])+'</div><b>'+line+'</b></li>';txt+=m[1]+' × '+q+' — '+line+'\n'});
 const tot=(sum?fmt(sum)+' so’m':'')+(sum&&usd?' + ':'')+(usd?usd+' $':'')||'0';
 $('#lines').innerHTML=rows?'<ul>'+rows+'</ul>':'<p class="empty">Savat hozircha bo’sh. Menyudan taom tanlang.</p>';
 $('#total').textContent=tot;$('#cnt').textContent=n?'('+n+')':'';
 $$('.stp[data-id]').forEach(e=>e.innerHTML=stp(e.dataset.id));
 try{localStorage.setItem('ks-q',JSON.stringify(Q))}catch(e){}
 $('#fbar').hidden=!n;$('#fsum').textContent='Savatda: '+n+' ta · '+tot;
 const b=B[+$('#br').value],mode=document.querySelector('[name=m]:checked').value;
 $('#adrw').hidden=mode!=='Yetkazib berish';
 const full='Kayfiyat Somsa buyurtmasi\nFilial: '+b[0]+' ('+b[1]+')\n'+mode+($('#adr').value&&mode==='Yetkazib berish'?': '+$('#adr').value:'')+'\n\n'+(txt||'(savat bo’sh)\n')+'\nSomsa: '+sc+' ta\nJami: '+tot+(LL&&mode==='Yetkazib berish'?'\nJoylashuv: https://yandex.com/maps/?pt='+LL[1]+','+LL[0]+'&z=17&l=map':'')+($('#nm').value?'\nIsm: '+$('#nm').value:'')+($('#ph').value?'\nTel: '+$('#ph').value:'')+'\nTo’lov: '+document.querySelector('[name=p]:checked').value+($('#cm').value?'\nIzoh: '+$('#cm').value:'');
 const pay=document.querySelector('[name=p]:checked').value,phOk=($('#ph').value.match(/\d/g)||[]).length>=9;
 const CAN=DB||TG_TOKEN;
 $('#call').classList.toggle('off',!n);$('#tg').classList.toggle('off',!n);$('#call').classList.toggle('p',!CAN);
 $('#submit').hidden=!CAN;$('#submit').classList.toggle('off',!n||!phOk);
 $('#hint').textContent=!n?'Avval menyudan savatga taom qo’shing.':CAN?(phOk?'':'Buyurtma yuborish uchun telefon raqamingizni kiriting.'):'Onlayn qabul hozircha ulanmagan. Qo’ng’iroq qiling yoki Telegram orqali yuboring.';
 $('#call').href='tel:'+(b[3]||'+998 95 590 96 96').replace(/\s/g,'');
 $('#call').textContent='Qo’ng’iroq: '+(b[3]||'+998 95 590 96 96');
 $('#tg').href='https://t.me/share/url?url='+encodeURIComponent('https://www.instagram.com/kayfiyat_somsa/')+'&text='+encodeURIComponent(full);
}
['#br','#adr','#nm','#ph','#cm'].forEach(s=>$(s).addEventListener('input',sync));
$$('[name=m],[name=p]').forEach(e=>e.addEventListener('change',sync));

const V=['bosh','menyu','filiallar','buyurtma','qabul','boshqaruv'];
function show(n){if(!V.includes(n))n='bosh';$$('.view').forEach(v=>v.hidden=v.id!=='v-'+n);$$('.tabs [data-go]').forEach(b=>b.setAttribute('aria-current',b.dataset.go===n?'page':'false'));if(n==='boshqaruv')admInit();scrollTo(0,0);try{history.replaceState(null,'','#'+n)}catch(e){}}
document.addEventListener('click',e=>{
 const d=e.target.closest('[data-d]');if(d){Q[d.dataset.id]=Math.max(0,(Q[d.dataset.id]||0)+ +d.dataset.d);sync();return}
 const f=e.target.closest('[data-f]');if(f){const k=+f.dataset.f;$$('#chips button').forEach(b=>b.classList.toggle('on',b===f));$$('#menu .sec').forEach(s=>s.hidden=k>=0&&+s.dataset.c!==k);return}
 const g=e.target.closest('[data-go]');if(g){if(g.dataset.br!=null)$('#br').value=g.dataset.br;show(g.dataset.go);sync()}});
function geo(ok,el){if(!navigator.geolocation){el.textContent='Brauzer joylashuvni qo’llamaydi. Manzilni yozing.';return}el.textContent='Aniqlanmoqda…';navigator.geolocation.getCurrentPosition(p=>{LL=[p.coords.latitude,p.coords.longitude];el.textContent='Joylashuv aniqlandi ✓';ok()},()=>{el.textContent='Aniqlab bo’lmadi. Ruxsat bering yoki manzilni qo’lda yozing.'},{enableHighAccuracy:true,timeout:10000})}
$('#loc').onclick=()=>geo(sync,$('#locs'));
$('#near').onclick=()=>geo(()=>{const a=$('#nearlink');a.href='https://yandex.com/maps/?text='+encodeURIComponent('Kayfiyat somsa')+'&ll='+LL[1]+','+LL[0]+'&z=14';a.hidden=false},$('#nears'));
/* gilam */
const P={uz:['O’zbek','Sakkizqirra yulduz va anor: to’kinlik va baraka belgisi.'],kz:['Qozoq','Qo’chqor shoxi (қошқар мүйіз): mol-mulk va quvvat ramzi.'],ky:['Qirg’iz','Tunduk: o’tovning tepasidagi dumaloq tuynuk, uy va oila ramzi.'],tj:['Tojik','Bodom naqshi: suzana va atlas bezaklarida keng uchraydi.'],tm:['Turkman','Gul: turkman gilamlarining sakkiz burchakli asosiy naqshi.']};
const MP={uz:[32,44,14],kz:[21,22,11],ky:[43,22,11],tj:[21,66,11],tm:[43,66,11]};
(function(){
 const cv=$('#cv'),g=cv.getContext('2d'),C=12,W=64,H=88,FY=57;
 const col={r:[104,28,34],R:[182,52,42],n:[27,40,84],i:[238,224,188],o:[239,133,8],k:[38,20,18]};
 let sv=7;const rnd=()=>(sv=sv*16807%2147483647)/2147483647;
 const G=Array.from({length:H},()=>Array(W).fill('r'));
 const set=(x,y,k)=>{x=Math.round(x);y=Math.round(y);if(x>=10&&x<W-10&&y>=10&&y<H-10)G[y][x]=k};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=Math.min(x,W-1-x),dy=Math.min(y,H-1-y),d=Math.min(dx,dy);if(d>=10)continue;let k;if(d===0||d===9)k='k';else if(d===1||d===8)k='o';else{const u=dy<=dx?x:y,v=d-2,m=Math.abs((u%12)-5.5)+Math.abs(v-2.5)*2;k=m<=2.5?'R':m<=4.5?'i':'n'}G[y][x]=k}
 for(let y=10;y<H-10;y++)for(let x=10;x<W-10;x++)if(x%8===2&&y%8===2){set(x,y,'o');set(x-1,y,'R');set(x+1,y,'R');set(x,y-1,'R');set(x,y+1,'R')}
 const put=(cx,cy,R,fn)=>{for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++){const k=fn(x,y);if(k)set(cx+x,cy+y,k)}};
 const oct=(R,k)=>(x,y)=>Math.max(Math.abs(x),Math.abs(y),(Math.abs(x)+Math.abs(y))*.72)<=R?k:null;
 const halo=(cx,cy,R,gr)=>{put(cx,cy,R,oct(R,'o'));put(cx,cy,R,oct(R-1,gr))};
 const dia=(x,y)=>{const d=Math.abs(x)+Math.abs(y);return d<=1?'R':d<=2?'i':d<=3?'o':null};
 [[32,13],[32,75],[13,44],[51,44]].forEach(m=>put(m[0],m[1],3,dia));
 const uz=(x,y)=>{const s=Math.max(Math.abs(x),Math.abs(y)),d=Math.abs(x)+Math.abs(y);if(!(s<=9||d<=13))return null;if(!(s<=8||d<=12))return'k';if(s>9)return s>=11?'i':'o';const e=Math.max(s,d*.73);return e<=1.5?'i':e<=3?'R':e<=4.5?'i':e<=6?'n':e<=7.5?'R':e<=8.5?'o':'n'};
 const tm=(x,y)=>{const s=Math.max(Math.abs(x),Math.abs(y)),d=Math.abs(x)+Math.abs(y),o=Math.max(s,d*.72);if(o>8.5)return null;if(o>7.5)return'k';if(Math.abs(x)<1||Math.abs(y)<1)return'k';if(o<=3)return'o';return(x>0)!==(y>0)?'n':'R'};
 const ky=(x,y)=>{const r=Math.hypot(x,y);if(r>8.8)return null;if(r>7.6)return'k';const a=Math.atan2(y,x);for(const p of[0,1.047,2.094])if(Math.abs(x*Math.sin(p)-y*Math.cos(p))<.8)return r<2.8?'k':'n';return r<2.8?'k':(Math.floor((a+Math.PI)/1.047)%2?'o':'R')};
 const tj=(x,y)=>{const t=(y+9)/18;if(t<0||t>1)return null;const w=6*Math.pow(Math.sin(Math.PI*t),.8)*(.6+.7*t),ax=Math.abs(x);if(ax>w)return null;if(ax>w-1.2)return'k';if(ax<1.3&&Math.abs(y-1.5)<1.3)return'n';if(ax<=w*.5&&t>.3&&t<.8)return'o';return'R'};
 const kz=()=>{for(const s of[-1,1])for(let t=0;t<1;t+=.008){const r=5.6-4.3*t,a=Math.PI+t*2.3*Math.PI,px=21+s*4.6+s*Math.cos(a)*r,py=22+Math.sin(a)*r;set(px,py,'n');set(px+1,py,'n');set(px,py+1,'n')}set(21,22,'R');set(20,23,'R');set(22,23,'R');set(21,24,'R')};
 [[21,22],[43,22],[21,66],[43,66]].forEach(m=>halo(m[0],m[1],11,'i'));
 kz();put(43,22,9,ky);put(21,66,9,tj);put(43,66,9,tm);
 halo(32,44,14,'n');put(32,44,13,uz);
 const rowS=Array.from({length:H},()=>(rnd()-.5)*16);
 g.lineCap='round';
 for(let s=0;s<2;s++)for(let x=0;x<W*3;x++){const px=x*C/3+C/6,y0=s?FY+H*C:FY,dir=s?1:-1,len=34+rnd()*18,sw=(rnd()-.5)*14;g.strokeStyle='rgb('+(222+rnd()*20|0)+','+(205+rnd()*20|0)+','+(165+rnd()*20|0)+')';g.lineWidth=2.4;g.beginPath();g.moveTo(px,y0);g.quadraticCurveTo(px+sw*.4,y0+dir*len*.5,px+sw,y0+dir*len);g.stroke()}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=col[G[y][x]],j=rowS[y]+(rnd()-.5)*14,px=x*C,py=FY+y*C;g.fillStyle='rgb('+c.map(v=>Math.max(0,Math.min(255,v+j)))+')';g.fillRect(px,py,C,C);g.fillStyle='rgba(255,255,255,.13)';g.fillRect(px,py,C,3);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(px,py+C-3,C,3);g.fillStyle='rgba(0,0,0,.07)';g.fillRect(px+C-2,py,2,C)}
 const L=g.createLinearGradient(0,FY,W*C,FY+H*C);L.addColorStop(0,'rgba(255,255,255,.14)');L.addColorStop(.5,'rgba(0,0,0,0)');L.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=L;g.fillRect(0,FY,W*C,H*C);
 const V2=g.createRadialGradient(W*C/2,FY+H*C/2,H*C*.25,W*C/2,FY+H*C/2,H*C*.75);V2.addColorStop(0,'rgba(0,0,0,0)');V2.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=V2;g.fillRect(0,FY,W*C,H*C);
 const ring=$('#ring'),cap=$('#cap'),pc=$('#pc'),ks=Object.keys(P);let tmr,pi=0;
 pc.innerHTML=ks.map(k=>'<button data-k="'+k+'">'+P[k][0]+'</button>').join('');
 function setP(k){const m=MP[k];ring.style.cssText='left:'+(m[0]-m[2])*C/7.68+'%;top:'+(FY+(m[1]-m[2])*C)/11.7+'%;width:'+m[2]*2*C/7.68+'%;height:'+m[2]*2*C/11.7+'%';$$('#pc button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));cap.innerHTML='<b>'+P[k][0]+':</b> '+P[k][1]}
 pc.onclick=e=>{const b=e.target.closest('button');if(b){clearInterval(tmr);setP(b.dataset.k)}};
 cv.onclick=e=>{const b=cv.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*768,y=(e.clientY-b.top)/b.height*1170,k=ks.find(k=>Math.hypot(x-MP[k][0]*C,y-(FY+MP[k][1]*C))<=MP[k][2]*C);if(k){clearInterval(tmr);setP(k)}};
 const cyc=()=>setP(ks[pi++%5]);cyc();if(!matchMedia('(prefers-reduced-motion:reduce)').matches)tmr=setInterval(cyc,3500);
})();
/* buyurtma qabul qilish (db) */
(async()=>{try{if(!window.claude)return;const db=await claude.use('db'),u=await claude.use('user');DB=db;if(u){ADM=await u.canEdit();if((await u.can('data.write'))===false)DB=null}}catch(e){DB=null}
 sync();if(location.hash==='#boshqaruv')admInit()})();
const STEPS=[['Yuborildi','Kafega yetib bordi'],['Qabul qilindi',''],['Tayyorlanmoqda',''],['Tayyor','']];
const SIDX={new:0,accepted:1,cooking:2,ready:3};
function renderOk(o,st){
 const s=st&&st.s||'new',i=SIDX[s]??0;
 $('#oid').textContent='Buyurtma №'+o.id;
 $('#ost').textContent=s==='rejected'?'Afsuski, buyurtma qabul qilinmadi. Filialga qo’ng’iroq qiling.':s==='new'?(DB?'Kafe buyurtmani ko’rib chiqmoqda. Bu sahifani yopmang, holat o’zi yangilanadi.':'Buyurtmangiz kafega yuborildi. Tez orada siz bilan bog’lanishadi.'):s==='accepted'?'Buyurtma qabul qilindi'+(st.eta?', taxminan '+st.eta+' daqiqada tayyor bo’ladi.':'.'):s==='cooking'?'Buyurtmangiz tayyorlanmoqda.':'Buyurtmangiz tayyor!';
 $('#trk').innerHTML=s==='rejected'?'<li>Qabul qilinmadi</li>':STEPS.map((x,k)=>'<li class="'+(k<=i?'on':'')+'">'+(k<=i?'✓ ':'')+x[0]+(k===1&&st&&st.eta?'<small>~'+st.eta+' daqiqa</small>':'')+'</li>').join('');
 $('#osum').innerHTML='<h3>Buyurtma tarkibi</h3><ul style="list-style:none;margin:0;padding:0">'+o.items.map(x=>'<li style="display:flex;justify-content:space-between;gap:1rem;padding:.35rem 0;border-bottom:1px solid var(--line)"><span>'+x.n+' × '+x.q+'</span><b>'+x.l+'</b></li>').join('')+'</ul><p style="margin:.8rem 0 0"><b>Somsa: '+o.sc+' ta · Jami: '+o.tot+'</b></p><p class="note" style="margin:.3rem 0 0">'+o.br+' · '+o.mode+' · To’lov: '+o.pay+'</p>';
 $('#ocall').href='tel:'+(o.tel||'+998955909696');
}
function buildOrder(){
 const items=[];let sum=0,usd=0,sc=0;
 M.forEach(m=>{const q=Q[m[0]]||0;if(!q)return;m[5]?usd+=q*100:sum+=q*m[2];if(m[3]<2)sc+=q;items.push({n:m[1],q,l:m[5]?q*100+' $':fmt(q*m[2])})});
 const b=B[+$('#br').value],mode=document.querySelector('[name=m]:checked').value;
 return{id:'K'+(1000+Math.floor(Math.random()*9000)),t:Date.now(),items,sc,tot:(sum?fmt(sum)+' so’m':'')+(sum&&usd?' + ':'')+(usd?usd+' $':''),br:b[0]+' ('+b[1]+')',tel:(b[3]||'+998 95 590 96 96').replace(/\s/g,''),mode,adr:mode==='Yetkazib berish'?$('#adr').value:'',loc:LL&&mode==='Yetkazib berish'?LL[0]+','+LL[1]:'',name:$('#nm').value,phone:$('#ph').value,pay:document.querySelector('[name=p]:checked').value,cm:$('#cm').value};
}
$('#submit').onclick=async()=>{
 if($('#submit').classList.contains('off'))return;
 const o=buildOrder();
 try{
  if(DB) await DB.doc('orders/'+o.id).set(o);
  else await sendTG(o);
 }catch(e){
  $('#hint').textContent='Yuborib bo’lmadi: '+e.message;
  return;
 }
 renderOk(o,null);
 if(DB){try{UNSUB&&UNSUB();UNSUB=DB.doc('status/'+o.id).onSnapshot(s=>renderOk(o,s.exists?s.data():null),()=>{})}catch(e){}}
 Q={};sync();show('qabul');
};

/* xodimlar bo'limi */
const SL={new:'Yangi',accepted:'Qabul qilindi',cooking:'Tayyorlanmoqda',ready:'Tayyor',rejected:'Rad etildi'};
function admInit(){
 if(!DB||!ADM){$('#anote').textContent='Bu bo’lim faqat kafe xodimlari uchun.';$('#olist').innerHTML='';return}
 if(ADMON){renderAdm();return}ADMON=true;
 DB.collection('orders').onSnapshot(q=>{ORD=q.docs.map(d=>d.data()).sort((a,b)=>b.t-a.t);renderAdm()},()=>{});
 DB.collection('status').onSnapshot(q=>{ST={};q.docs.forEach(d=>ST[d.id]=d.data());renderAdm()},()=>{});
}
function renderAdm(){
 $('#olist').innerHTML=ORD.length?ORD.map(o=>{const s=(ST[o.id]||{}).s||'new',tm=new Date(o.t).toLocaleTimeString('uz',{hour:'2-digit',minute:'2-digit'});
  const act=s==='new'?'<select data-eta aria-label="Tayyor bo’lish vaqti"><option>10</option><option selected>15</option><option>20</option><option>30</option></select><button class="btn p" data-st="accepted" data-o="'+o.id+'">Qabul qilish</button><button class="btn" data-st="rejected" data-o="'+o.id+'">Rad etish</button>':s==='accepted'?'<button class="btn p" data-st="cooking" data-o="'+o.id+'">Tayyorlanmoqda</button><button class="btn" data-st="ready" data-o="'+o.id+'">Tayyor</button>':s==='cooking'?'<button class="btn p" data-st="ready" data-o="'+o.id+'">Tayyor</button>':'';
  return'<div class="oc"><h4>№'+o.id+' · '+tm+' <span class="bd'+(s==='new'?' n':'')+'">'+SL[s]+'</span></h4><p>'+o.items.map(x=>x.n+' × '+x.q).join(', ')+'</p><p>'+(o.sc?'<b>Somsa: '+o.sc+' ta</b> · ':'')+'<b>'+o.tot+'</b> · '+o.pay+' · '+o.mode+(o.adr?': '+o.adr:'')+'</p><p>'+o.br+'</p><p>'+(o.name?o.name+' · ':'')+'<a href="tel:'+o.phone.replace(/\s/g,'')+'">'+o.phone+'</a>'+(o.loc?' · <a target="_blank" rel="noopener" href="https://yandex.com/maps/?pt='+o.loc.split(',').reverse().join(',')+'&z=17&l=map">Xaritada</a>':'')+'</p>'+(o.cm?'<p>Izoh: '+o.cm+'</p>':'')+'<div class="acts" data-card>'+act+'</div></div>'}).join(''):'<p class="empty">Hozircha buyurtma yo’q.</p>';
}
$('#olist').addEventListener('click',e=>{const b=e.target.closest('[data-st]');if(!b||!DB)return;const sel=b.closest('[data-card]').querySelector('[data-eta]');DB.doc('status/'+b.dataset.o).set({s:b.dataset.st,eta:sel&&b.dataset.st==='accepted'?+sel.value:null,t:Date.now()}).catch(()=>{})});
sync();show(location.hash.slice(1));
