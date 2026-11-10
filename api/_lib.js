// Umumiy qism: ma'lumotlar, Redis (Upstash), Telegram, holat mashinasi, xabar matnlari
const crypto = require('crypto');
const MENU=[
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
const BR=[
['Farg’ona yo’li','Farg’ona yo’li, 111 (Farg’ona bozori yonida)','24/7','+998 94 648 51 41'],
['Yunusobod','Qulolko’rgon 2-tor ko’cha, 2','24/7','+998 94 600 20 01'],
['Olmazor','Chimboy 2-tor ko’cha, 133 (Beruniy metrosi yaqinida)','24/7','+998 95 590 96 96'],
['Qipchoq','Qipchoq 2-tor ko’cha, 40/12','10:00–18:00 atrofida','+998 78 120 20 02'],
['Obod','Obod 2-ko’cha','17:00 gacha, aniqlashtiring',''],
['Bektemir','Bektemir shoh ko’chasi, 3B','Aniqlashtiring','']];

const TOKEN=process.env.TELEGRAM_BOT_TOKEN;
const RURL=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const RTOK=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL=String(60*60*24*(Number(process.env.ORDER_TTL_DAYS)||30)); // buyurtmalar saqlanish muddati (kun)

const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const pad=n=>String(n).padStart(2,'0');
// Toshkent vaqti (UTC+5)
const tz=t=>new Date(t+5*3600*1000);
const hm=t=>{const d=tz(t);return pad(d.getUTCHours())+':'+pad(d.getUTCMinutes())};
const dmy=t=>{const d=tz(t);return pad(d.getUTCDate())+'.'+pad(d.getUTCMonth()+1)+'.'+d.getUTCFullYear()};
const dayKey=t=>{const d=tz(t);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate())};

// ---------- Redis ----------
async function redis(cmd){
  const r=await fetch(RURL,{method:'POST',headers:{Authorization:'Bearer '+RTOK,'Content-Type':'application/json'},body:JSON.stringify(cmd)});
  const j=await r.json();
  if(j.error)throw new Error('redis: '+j.error);
  return j.result;
}
const saveOrder=o=>redis(['SET','order:'+o.id,JSON.stringify(o),'EX',TTL]);
async function loadOrder(id){const r=await redis(['GET','order:'+id]);return r?JSON.parse(r):null}
// qisqa muddatli qulf: bir vaqtda ikki marta bosishdan himoya
const lock=async id=>(await redis(['SET','lock:'+id,'1','NX','EX','8']))==='OK';
const unlock=id=>redis(['DEL','lock:'+id]).catch(()=>{});
// bir xil update qayta kelsa (Telegram qayta yuborishi mumkin) e'tiborsiz qoldiriladi
const firstTime=async key=>(await redis(['SET',key,'1','NX','EX','86400']))==='OK';

// ---------- Telegram ----------
async function tg(method,body){
  const r=await fetch('https://api.telegram.org/bot'+TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json();
  if(!j.ok)throw new Error('telegram '+method+': '+j.description);
  return j.result;
}
const safeEq=(a,b)=>{a=Buffer.from(String(a||''));b=Buffer.from(String(b||''));return a.length===b.length&&crypto.timingSafeEqual(a,b)};

function branchMap(){let m={};try{m=JSON.parse(process.env.BRANCH_CHATS||'{}')}catch(e){}return m}
const chatFor=br=>branchMap()[br]||process.env.TELEGRAM_CHAT_ID;
const allChats=()=>[process.env.TELEGRAM_CHAT_ID,process.env.OWNER_CHAT_ID,...Object.values(branchMap())].filter(Boolean).map(String);

// Admin huquqi: ADMIN_USER_IDS berilgan bo'lsa faqat shular; bo'lmasa guruh adminlari/egasi
async function isAdmin(chatId,userId){
  const ids=(process.env.ADMIN_USER_IDS||'').split(',').map(s=>s.trim()).filter(Boolean);
  if(ids.length)return ids.includes(String(userId));
  try{const m=await tg('getChatMember',{chat_id:chatId,user_id:userId});return m.status==='creator'||m.status==='administrator'}
  catch(e){return false}
}

// ---------- Holat mashinasi ----------
const LABEL={new:'🆕 Yangi',accepted:'🟡 Qabul qilindi',cooking:'🟢 Tayyorlanmoqda',ready:'🟠 Tayyor',courier:'🚚 Kuryerga berildi',delivered:'✅ Yetkazib berildi',cancelled:'❌ Bekor qilindi'};
const CODE={a:'accepted',c:'cooking',d:'ready',k:'courier',y:'delivered'};
const isDel=o=>o.mode==='Yetkazib berish';
const seqOf=o=>isDel(o)?['accepted','cooking','ready','courier','delivered']:['accepted','cooking','ready','delivered'];
const labelOf=(o,s)=>s==='delivered'&&!isDel(o)?'✅ Topshirildi':LABEL[s];
const isClosed=o=>o.s==='delivered'||o.s==='cancelled';
// Qaysi bosqichga o'tish mumkin? {ok:true} yoki {ok:false,msg:'...'}
function canMove(o,target){
  if(isClosed(o))return{ok:false,msg:'Buyurtma yopilgan, o‘zgartirib bo‘lmaydi'};
  if(target==='cancelled')return{ok:true};
  const seq=seqOf(o),t=seq.indexOf(target),c=o.s==='new'?-1:seq.indexOf(o.s);
  if(t<0)return{ok:false,msg:'Bu buyurtma uchun bunday bosqich yo‘q'};
  if(t===c)return{ok:false,msg:'Bu holat allaqachon belgilangan'};
  if(t<c)return{ok:false,msg:'Bu bosqich o‘tib bo‘lgan'};
  if(t>c+1)return{ok:false,msg:'Avval «'+labelOf(o,seq[c+1])+'» tugmasini bosing'};
  return{ok:true};
}

// ---------- Xabar matnlari ----------
function orderText(o){
  const b=BR[o.br],del=isDel(o);
  let t='<b>🥟 Buyurtma №'+o.id+'</b>\n';
  t+='🏪 Filial: '+esc(b?b[0]:'?')+'\n🕒 Vaqti: '+hm(o.t)+' · '+dmy(o.t)+'\n\n';
  t+='👤 Mijoz: '+esc(o.name||'—')+'\n📞 Telefon: '+esc(o.phone)+'\n';
  t+=(del?'🚚 Yetkazib berish: '+esc(o.adr||'manzil yozilmagan'):'🏃 O‘zi olib ketadi')+'\n';
  if(o.loc){const p=o.loc.split(',');t+='📍 <a href="https://yandex.com/maps/?pt='+p[1]+','+p[0]+'&z=17&l=map">Lokatsiya (xaritada ochish)</a>\n'}
  t+='\n🛒 <b>Buyurtma tarkibi:</b>\n'+o.items.map(x=>'• '+esc(x.n)+' × '+x.q+' — '+esc(x.l)).join('\n');
  t+='\nMahsulotlar soni: '+o.cnt+' ta (somsa: '+o.sc+' ta)';
  t+='\n💰 <b>Jami: '+esc(o.tot)+'</b>\n💳 To‘lov: '+esc(o.pay)+' (borganda)';
  if(o.cm)t+='\n💬 Izoh: '+esc(o.cm);
  t+='\n\n📌 <b>Holat: '+esc(labelOf(o,o.s))+'</b>\n';
  t+=(o.hist||[]).map(h=>esc(labelOf(o,h.s))+' — '+hm(h.t)+(h.by?' ('+esc(h.by)+')':'')).join('\n');
  t+='\n'+(o.cust?(o.notifyErr?'⚠️ Mijozga xabar yuborib bo‘lmadi, telefon orqali bog‘lanishingiz mumkin.':'🔔 Mijozga holat Telegram orqali yuboriladi.'):'🔕 Mijoz Telegramga ulanmagan: xabar yuborilmaydi, holat faqat shu yerda yangilanadi.');
  return t;
}

function keyboard(o,confirm){
  if(isClosed(o))return [];
  const id=o.id;
  if(confirm)return [[{text:'❌ Ha, bekor qilish',callback_data:'X:'+id}],[{text:'↩️ Yo‘q, qaytish',callback_data:'n:'+id}]];
  const seq=seqOf(o),cur=o.s==='new'?-1:seq.indexOf(o.s);
  const names={accepted:['🟡 Buyurtma qabul qilindi','a'],cooking:['🟢 Tayyorlanmoqda','c'],ready:['🟠 Tayyor','d'],courier:['🚚 Kuryerga berildi','k'],delivered:[isDel(o)?'✅ Yetkazib berildi':'✅ Topshirildi','y']};
  const rows=[];
  seq.forEach((s,i)=>{if(i%2===0)rows.push([]);rows[rows.length-1].push({text:(i<=cur?'✔ ':'')+names[s][0],callback_data:names[s][1]+':'+id})});
  rows.push([{text:'❌ Bekor qilish',callback_data:'x:'+id}]);
  return rows;
}

function customerText(o){
  const b=BR[o.br],tel=b&&b[3]?b[3]:'+998 95 590 96 96',del=isDel(o);
  switch(o.s){
    case 'accepted':return '🟡 Buyurtmangiz №'+o.id+' qabul qilindi.';
    case 'cooking':return '🟢 Buyurtmangiz №'+o.id+' tayyorlanmoqda.';
    case 'ready':return del?'🟠 Buyurtmangiz №'+o.id+' tayyor. Tez orada kuryerga beriladi.':'🟠 Buyurtmangiz №'+o.id+' tayyor. Olib ketishingiz mumkin.';
    case 'courier':return '🚚 Buyurtmangiz №'+o.id+' kuryerga berildi.';
    case 'delivered':return del?'✅ Buyurtmangiz №'+o.id+' yetkazib berildi. Yoqimli ishtaha!':'✅ Buyurtma №'+o.id+' topshirildi. Yoqimli ishtaha!';
    case 'cancelled':return '❌ Kechirasiz, buyurtma №'+o.id+' bekor qilindi. Savollar bo‘lsa, qo‘ng‘iroq qiling: '+tel;
    default:return '';
  }
}

module.exports={MENU,BR,crypto,fmt,esc,hm,dmy,dayKey,redis,saveOrder,loadOrder,lock,unlock,firstTime,tg,safeEq,chatFor,allChats,isAdmin,LABEL,CODE,labelOf,seqOf,isClosed,canMove,orderText,keyboard,customerText,TTL};
