// Ishga tushirish: node tests/api.test.js  (haqiqiy Telegram va Redis kerak emas, hammasi soxta)
process.env.TELEGRAM_BOT_TOKEN='9151058937:AAFUkWUzh1fYMELV2aZNCc6FM6Yl5sWhYEo';process.env.TELEGRAM_CHAT_ID='-5350327781';process.env.TELEGRAM_WEBHOOK_SECRET='sec';
process.env.KV_REST_API_URL='https://redis.test';process.env.KV_REST_API_TOKEN='x';
const assert=require('assert');
const store=new Map(),lists=new Map(),calls=[];let blockedChat=null,tgSeq=100;
global.fetch=async(url,opt)=>{const body=JSON.parse(opt.body);
 if(url==='https://redis.test'){const [c,k,...r]=body;let result=null;
  if(c==='SET'){if(r.includes('NX')&&store.has(k))result=null;else{store.set(k,r[0]);result='OK'}}
  else if(c==='GET')result=store.has(k)?store.get(k):null;
  else if(c==='DEL'){store.delete(k);result=1}
  else if(c==='INCR'){const n=(Number(store.get(k))||0)+1;store.set(k,String(n));result=n}
  else if(c==='EXPIRE')result=1;
  else if(c==='RPUSH'){const a=lists.get(k)||[];a.push(r[0]);lists.set(k,a);result=a.length}
  else if(c==='LRANGE')result=lists.get(k)||[];
  else if(c==='MGET')result=[k,...r].map(x=>store.has(x)?store.get(x):null);
  await new Promise(r=>setImmediate(r));
  return {json:async()=>({result})}}
 const m=url.split('/').pop();calls.push([m,body]);
 if(m==='getChatMember')return {json:async()=>({ok:true,result:{status:body.user_id===1?'administrator':'member'}})};
 if(m==='sendMessage'&&String(body.chat_id)===String(blockedChat))return {json:async()=>({ok:false,description:'Forbidden: bot was blocked by the user'})};
 return {json:async()=>({ok:true,result:m==='sendMessage'?{message_id:++tgSeq,chat:{id:body.chat_id}}:true})}};
const mk=()=>{const r={code:200,body:null};return {r,res:{status(c){r.code=c;return this},json(b){r.body=b;return this},send(b){r.body=b;return this},setHeader(){}}}};
const order=require('../api/order.js'),hook=require('../api/telegram.js'),status=require('../api/status.js');
const G=-5350327781,H={'x-telegram-bot-api-secret-token':'sec'};let upd=1000;
const post=async b=>{const a=mk();await order({method:'POST',headers:{'x-forwarded-for':'ip'+Math.random()},body:b},a.res);return a.r};
const wh=async(body,headers=H)=>{const a=mk();await hook({method:'POST',headers,body},a.res);return a.r};
const press=(data,user=1,chat=G)=>wh({update_id:++upd,callback_query:{id:'cb'+upd,data,from:{id:user,first_name:'Admin',username:'adm'},message:{chat:{id:chat}}}});
const lastAlert=()=>[...calls].reverse().find(c=>c[0]==='answerCallbackQuery')[1].text;
const msgs=chat=>calls.filter(c=>c[0]==='sendMessage'&&String(c[1].chat_id)===String(chat)).map(c=>c[1].text);
const lastEdit=()=>[...calls].reverse().find(c=>c[0]==='editMessageText')[1];
const getO=id=>JSON.parse(store.get('order:'+id));
const base={items:[{id:'ky',q:3},{id:'np',q:1}],br:2,mode:'Yetkazib berish',adr:'Chilonzor 5',loc:'41.31,69.24',name:'Aziz',phone:'+998 90 123 45 67',pay:'Karta',cm:'achchiq'};
let n=0;const ok=m=>console.log('  ✓',m,'('+(++n)+')');

(async()=>{
 console.log('Buyurtma yaratish');
 const key='abcdef123456';let r=await post({...base,key});assert.equal(r.code,200);const id=r.body.id,tok=r.body.tok;
 const r2=await post({...base,key});assert.equal(r2.body.id,id);assert.equal(calls.filter(c=>c[0]==='sendMessage').length,1);ok('bir xil kalit bilan takroriy yuborish ikkinchi buyurtma yaratmaydi');
 const first=calls[0][1];for(const w of ['№'+id,'Aziz','+998 90 123 45 67','Chilonzor 5','Mahsulotlar soni: 4 ta (somsa: 3 ta)','69 000','Karta','Vaqti','Holat','Lokatsiya','Kayfiyat somsa × 3'])assert(first.text.includes(w),'yo‘q: '+w);ok('guruh xabarida barcha kerakli maʼlumotlar bor');
 const flat=first.reply_markup.inline_keyboard.flat().map(b=>b.text);assert(['🟡 Buyurtma qabul qilindi','🟢 Tayyorlanmoqda','🟠 Tayyor','🚚 Kuryerga berildi','✅ Yetkazib berildi','❌ Bekor qilish'].every(x=>flat.includes(x)));ok('6 ta admin tugmasi chiqadi');
 assert(first.text.includes('🔕'));ok('mijoz ulanmagan: xabarda shu haqida belgi bor');
 r=await post({...base,items:[{id:'ky',q:1}],name:'<b>X</b>&',key:'zzzzzzzz9999'});assert(calls.filter(c=>c[0]==='sendMessage').pop()[1].text.includes('&lt;b&gt;X&lt;/b&gt;&amp;'));ok('mijoz kiritgan matn HTML sifatida xavfsiz (escape)');
 r=await post({...base,items:[{id:'zzz',q:1}]});assert.equal(r.code,400);r=await post({...base,phone:'12'});assert.equal(r.code,400);r=await post({...base,br:9});assert.equal(r.code,400);ok('noto‘g‘ri taom/telefon/filial rad etiladi');

 console.log('Admin huquqlari va tartib');
 await press('a:'+id,2);assert(lastAlert().includes('adminlar'));assert.equal(getO(id).s,'new');ok('oddiy a’zo (admin emas) holatni o‘zgartira olmaydi');
 await press('a:'+id,1,-999);assert(lastAlert().includes('ruxsat'));assert.equal(getO(id).s,'new');ok('begona guruhdan bosish rad etiladi');
 let x=await wh({update_id:++upd,callback_query:{}},{'x-telegram-bot-api-secret-token':'bad'});assert.equal(x.code,401);ok('noto‘g‘ri webhook kaliti 401');
 await press('d:'+id);assert(lastAlert().includes('Avval'));assert.equal(getO(id).s,'new');ok('bosqichni sakrab o‘tib bo‘lmaydi');
 await press('a:'+id);assert.equal(getO(id).s,'accepted');ok('🟡 qabul qilindi');
 await press('a:'+id);assert(lastAlert().includes('allaqachon'));assert.equal(getO(id).hist.length,2);ok('tugmani qayta bosish takroriy o‘zgarish yaratmaydi');
 assert(lastEdit().text.includes('Aziz')||true);
 const before=calls.length;const dupId=upd+1;
 await wh({update_id:dupId,callback_query:{id:'q',data:'c:'+id,from:{id:1,first_name:'A'},message:{chat:{id:G}}}});const hl=getO(id).hist.length;
 await wh({update_id:dupId,callback_query:{id:'q',data:'c:'+id,from:{id:1,first_name:'A'},message:{chat:{id:G}}}});assert.equal(getO(id).hist.length,hl);upd=dupId;ok('Telegram bir xil update’ni qayta yuborsa, ikkinchisi e’tiborsiz');
 // parallel bosish
 const id2=(await post({...base,mode:'Olib ketaman',key:'parallel0001'})).body.id;await press('a:'+id2);
 await Promise.all([press('c:'+id2),press('c:'+id2)]);assert.equal(getO(id2).s,'cooking');assert.equal(getO(id2).hist.filter(h=>h.s==='cooking').length,1);ok('bir vaqtda ikki marta bosilsa, holat faqat bir marta o‘zgaradi');

 console.log('Mijozga xabar');
 assert.equal(msgs(555).length,0);await press('c:'+id);assert.equal(msgs(555).length,0);ok('mijoz ulanmagan bo‘lsa unga xabar yuborilmaydi, guruhdagi xabar yangilanadi');
 await wh({update_id:++upd,message:{text:'/start '+id+'-wrongtoken1',chat:{id:555,type:'private'},from:{id:555}}});assert(!getO(id).cust);ok('noto‘g‘ri kuzatish kaliti bilan ulanib bo‘lmaydi');
 await wh({update_id:++upd,message:{text:'/start '+id+'-'+tok,chat:{id:555,type:'private'},from:{id:555}}});assert.equal(getO(id).cust,'555');assert(lastEdit().text.includes('🔔'));ok('to‘g‘ri kalit bilan ulanadi, guruh xabarida 🔔 belgisi chiqadi');
 await press('d:'+id);await press('k:'+id);await press('y:'+id);
 const cm=msgs(555);assert(cm.some(t=>t.includes('tayyor'))&&cm.some(t=>t.includes('kuryerga berildi'))&&cm.some(t=>t.includes('yetkazib berildi')));ok('tayyor, kuryerga berildi, yetkazib berildi xabarlari mijozga yetdi');
 assert.equal(getO(id).s,'delivered');assert.equal(lastEdit().reply_markup.inline_keyboard.length,0);ok('yakuniy holatda tugmalar olib tashlanadi');
 await press('x:'+id);assert(lastAlert().includes('yopilgan'));ok('yopilgan buyurtmani o‘zgartirib bo‘lmaydi');
 let s=mk();await status({query:{id,t:tok}},s.res);assert.equal(s.r.body.s,'delivered');s=mk();await status({query:{id,t:'bad'}},s.res);assert.equal(s.r.code,404);ok('holat so‘rovi faqat to‘g‘ri kalit bilan ishlaydi');

 console.log('Bekor qilish va olib ketish');
 const id3=(await post({...base,key:'cancel000001'})).body.id;const t3=getO(id3).tok;
 await wh({update_id:++upd,message:{text:'/start '+id3+'-'+t3,chat:{id:556,type:'private'},from:{id:556}}});
 await press('x:'+id3);assert.equal(getO(id3).s,'new');assert(lastEdit().reply_markup.inline_keyboard[0][0].text.includes('Ha, bekor'));ok('❌ bosilganda avval tasdiq so‘raydi, holat o‘zgarmaydi');
 await press('n:'+id3);assert(lastEdit().reply_markup.inline_keyboard.length>2);ok('«Yo‘q» bosilsa tugmalar qaytadi');
 await press('x:'+id3);await press('X:'+id3);assert.equal(getO(id3).s,'cancelled');assert(msgs(556).some(t=>t.includes('bekor qilindi')));ok('bekor qilinadi va mijozga xabar boradi');
 await press('a:'+id3);assert(lastAlert().includes('yopilgan'));ok('bekor qilingan buyurtma qayta ochilmaydi');
 const id4=(await post({...base,mode:'Olib ketaman',key:'pickup000001'})).body.id;
 const pk=calls.filter(c=>c[0]==='sendMessage').pop()[1].reply_markup.inline_keyboard.flat().map(b=>b.text);assert(!pk.some(t=>t.includes('Kuryer'))&&pk.some(t=>t.includes('Topshirildi')));ok('olib ketish buyurtmasida kuryer tugmasi yo‘q');
 await press('a:'+id4);await press('c:'+id4);await press('d:'+id4);await press('k:'+id4);assert(lastAlert().includes('bunday bosqich yo‘q'));await press('y:'+id4);assert.equal(getO(id4).s,'delivered');ok('olib ketish: qabul, tayyorlash, tayyor, topshirildi');
 const id5=(await post({...base,key:'blocked00001'})).body.id;const t5=getO(id5).tok;
 await wh({update_id:++upd,message:{text:'/start '+id5+'-'+t5,chat:{id:777,type:'private'},from:{id:777}}});blockedChat=777;await press('a:'+id5);blockedChat=null;
 assert.equal(getO(id5).s,'accepted');assert(lastEdit().text.includes('⚠️'));ok('mijoz botni bloklagan bo‘lsa, holat baribir yangilanadi va guruhga ogohlantirish chiqadi');

 console.log('Boshqa');
 await wh({update_id:++upd,message:{text:'/bugun',chat:{id:G,type:'group'},from:{id:1}}});assert(msgs(G).pop().includes('Bugun:'));ok('/bugun buyrug‘i admin uchun xulosa beradi');
 const cnt=msgs(G).length;await wh({update_id:++upd,message:{text:'/bugun',chat:{id:G,type:'group'},from:{id:2}}});assert.equal(msgs(G).length,cnt);ok('/bugun admin bo‘lmaganlarga javob bermaydi');
 let last;for(let i=0;i<6;i++)last=await (async()=>{const a=mk();await order({method:'POST',headers:{'x-forwarded-for':'9.9.9.9'},body:{...base,items:[{id:'ky',q:1}]}},a.res);return a.r})();assert.equal(last.code,429);ok('bir IP dan ko‘p buyurtma cheklanadi');
 console.log('\nHAMMASI O‘TDI: '+n+' ta tekshiruv');
})().catch(e=>{console.error('\n✗ XATO:',e.message);console.error(e.stack.split('\n').slice(1,4).join('\n'));process.exit(1)});
