// Umumiy yordamchi funksiyalar: ma'lumotlar, Redis (Upstash), Telegram
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
const TTL=String(60*60*24*3);

const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

async function redis(cmd){
  const r=await fetch(RURL,{method:'POST',headers:{Authorization:'Bearer '+RTOK,'Content-Type':'application/json'},body:JSON.stringify(cmd)});
  const j=await r.json();
  if(j.error)throw new Error('redis: '+j.error);
  return j.result;
}
const saveOrder=o=>redis(['SET','order:'+o.id,JSON.stringify(o),'EX',TTL]);
async function loadOrder(id){const r=await redis(['GET','order:'+id]);return r?JSON.parse(r):null}

async function tg(method,body){
  const r=await fetch('https://api.telegram.org/bot'+TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json();
  if(!j.ok)throw new Error('telegram '+method+': '+j.description);
  return j.result;
}

// Filial raqami bo'yicha guruh (chat ID). BRANCH_CHATS={"0":"-100..","1":"-100.."} yoki bitta TELEGRAM_CHAT_ID
function chatFor(br){
  let m={};try{m=JSON.parse(process.env.BRANCH_CHATS||'{}')}catch(e){}
  return m[br]||process.env.TELEGRAM_CHAT_ID;
}
function allChats(){
  let m={};try{m=JSON.parse(process.env.BRANCH_CHATS||'{}')}catch(e){}
  return [process.env.TELEGRAM_CHAT_ID,process.env.OWNER_CHAT_ID,...Object.values(m)].filter(Boolean).map(String);
}

const STATUS={new:'🆕 Yangi',accepted:'✅ Qabul qilindi',cooking:'👨‍🍳 Tayyorlanmoqda',ready:'🎉 Tayyor',rejected:'❌ Rad etildi'};

function orderText(o){
  const b=BR[o.br];
  let t='<b>🥟 Buyurtma №'+o.id+'</b>\n'+esc(b?b[0]:'?')+' filiali\n\n';
  t+='<b>Somsa: '+o.sc+' ta</b>\n';
  t+=o.items.map(x=>'• '+esc(x.n)+' × '+x.q+' — '+esc(x.l)).join('\n');
  t+='\n\n💰 <b>Jami: '+esc(o.tot)+'</b> ('+esc(o.pay)+', borganda)';
  t+='\n📞 '+esc(o.phone)+(o.name?' ('+esc(o.name)+')':'');
  t+='\n'+(o.mode==='Yetkazib berish'?'🚚 Yetkazib berish'+(o.adr?': '+esc(o.adr):''):'🏃 O‘zi olib ketadi');
  if(o.loc){const p=o.loc.split(',');t+='\n📍 <a href="https://yandex.com/maps/?pt='+p[1]+','+p[0]+'&z=17&l=map">Lokatsiya (xaritada ochish)</a>'}
  if(o.cm)t+='\n💬 '+esc(o.cm);
  t+='\n\n<b>Holat:</b> '+STATUS[o.s]+(o.s==='accepted'&&o.eta?' (~'+o.eta+' daqiqa)':'');
  return t;
}

function keyboard(o){
  const id=o.id;
  if(o.s==='new')return [[{text:'✅ 10 daq',callback_data:'a:'+id+':10'},{text:'✅ 15 daq',callback_data:'a:'+id+':15'},{text:'✅ 20 daq',callback_data:'a:'+id+':20'}],[{text:'❌ Rad etish',callback_data:'r:'+id}]];
  if(o.s==='accepted')return [[{text:'👨‍🍳 Tayyorlanmoqda',callback_data:'c:'+id},{text:'🎉 Tayyor',callback_data:'d:'+id}]];
  if(o.s==='cooking')return [[{text:'🎉 Tayyor',callback_data:'d:'+id}]];
  return [];
}

function customerText(o){
  const b=BR[o.br],tel=b&&b[3]?b[3]:'+998 95 590 96 96';
  if(o.s==='accepted')return '✅ Buyurtmangiz №'+o.id+' qabul qilindi'+(o.eta?'. Taxminan '+o.eta+' daqiqada tayyor bo‘ladi.':'.');
  if(o.s==='cooking')return '👨‍🍳 Buyurtmangiz №'+o.id+' tayyorlanmoqda.';
  if(o.s==='ready')return '🎉 Buyurtmangiz №'+o.id+' tayyor!';
  if(o.s==='rejected')return 'Kechirasiz, buyurtma №'+o.id+' hozir qabul qilinmadi. Filialga qo‘ng‘iroq qiling: '+tel;
  return '';
}

module.exports={MENU,BR,fmt,esc,redis,saveOrder,loadOrder,tg,chatFor,allChats,STATUS,orderText,keyboard,customerText};
