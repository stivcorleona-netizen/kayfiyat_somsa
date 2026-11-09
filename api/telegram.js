const L=require('./_lib');

async function refreshAdminMsg(o,confirm){
  try{await L.tg('editMessageText',{chat_id:o.chat,message_id:o.mid,text:L.orderText(o),parse_mode:'HTML',disable_web_page_preview:true,reply_markup:{inline_keyboard:L.keyboard(o,confirm)}})}
  catch(e){if(!/not modified/i.test(String(e.message)))console.error(e)}
}
const alert=(cq,text)=>L.tg('answerCallbackQuery',{callback_query_id:cq.id,text,show_alert:true}).catch(()=>{});
const who=u=>u?[u.first_name,u.username?'@'+u.username:''].filter(Boolean).join(' '):'';

async function onCallback(cq){
  const [code,id]=String(cq.data||'').split(':');
  if(!/^K\d{4}$/.test(id||'')||!'acdkyxXn'.includes(code||'?'))return;
  const chat=cq.message&&String(cq.message.chat.id);
  if(!chat||!L.allChats().includes(chat))return alert(cq,'Bu guruhga ruxsat berilmagan');
  if(!(await L.isAdmin(chat,cq.from.id)))return alert(cq,'Faqat adminlar buyurtma holatini o‘zgartira oladi');
  if(!(await L.lock(id)))return L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:'Biroz kuting…'}).catch(()=>{});
  try{
    const o=await L.loadOrder(id);
    if(!o)return alert(cq,'Buyurtma topilmadi (saqlash muddati o‘tgan)');
    if(code==='x'){ // bekor qilishdan oldin tasdiq so'raymiz
      const m=L.canMove(o,'cancelled');if(!m.ok)return alert(cq,m.msg);
      await refreshAdminMsg(o,true);return L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:'Bekor qilishni tasdiqlang'}).catch(()=>{});
    }
    if(code==='n'){await refreshAdminMsg(o,false);return L.tg('answerCallbackQuery',{callback_query_id:cq.id}).catch(()=>{})}
    const target=code==='X'?'cancelled':L.CODE[code];
    const m=L.canMove(o,target);
    if(!m.ok){await alert(cq,m.msg);if(code==='X')await refreshAdminMsg(o,false);return}
    o.s=target;
    (o.hist=o.hist||[]).push({s:target,t:Date.now(),by:who(cq.from)});
    // mijozga xabar: faqat Telegramga ulangan bo'lsa
    if(o.cust){
      const t=L.customerText(o);
      try{await L.tg('sendMessage',{chat_id:o.cust,text:t});o.notifyErr=false}catch(e){console.error(e);o.notifyErr=true}
    }
    await L.saveOrder(o);
    await refreshAdminMsg(o,false);
    await L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:L.labelOf(o,o.s)}).catch(()=>{});
  }finally{await L.unlock(id)}
}

async function onMessage(m){
  const text=String(m.text||'');
  // Mijoz botni kuzatish havolasi orqali ochdi: /start K1234-abcdef123456
  if(/^\/start(@\w+)?(\s|$)/.test(text)&&m.chat.type==='private'){
    const p=(text.split(/\s+/)[1]||'').split('-'),id=p[0],tok=p[1];
    if(/^K\d{4}$/.test(id||'')){
      const o=await L.loadOrder(id);
      if(o&&L.safeEq(o.tok,tok)){
        o.cust=String(m.chat.id);o.notifyErr=false;await L.saveOrder(o);
        await refreshAdminMsg(o,false); // guruhdagi xabarda "mijoz ulandi" belgisi yangilanadi
        return L.tg('sendMessage',{chat_id:m.chat.id,text:'Buyurtma №'+id+' kuzatilmoqda. Holat o‘zgarganda shu yerga yozaman.\nHozirgi holat: '+L.labelOf(o,o.s)});
      }
    }
    return L.tg('sendMessage',{chat_id:m.chat.id,text:'Assalomu alaykum! Kayfiyat Somsa botiga xush kelibsiz. Buyurtma berish uchun saytga kiring.'});
  }
  // Admin guruhida /bugun: bugungi buyurtmalar xulosasi
  if(/^\/bugun(@\w+)?$/.test(text)&&L.allChats().includes(String(m.chat.id))&&await L.isAdmin(String(m.chat.id),m.from.id)){
    const ids=await L.redis(['LRANGE','idx:'+L.dayKey(Date.now()),'0','-1']);
    if(!ids.length)return L.tg('sendMessage',{chat_id:m.chat.id,text:'Bugun hali buyurtma yo‘q.'});
    const raw=await L.redis(['MGET',...ids.map(i=>'order:'+i)]);
    const os=raw.filter(Boolean).map(r=>JSON.parse(r));
    const cnt={};os.forEach(o=>cnt[o.s]=(cnt[o.s]||0)+1);
    let t='<b>Bugun: '+os.length+' ta buyurtma</b>\n'+Object.keys(cnt).map(s=>L.LABEL[s]+': '+cnt[s]).join('\n')+'\n\n';
    t+=os.slice(-15).map(o=>'№'+o.id+' · '+L.hm(o.t)+' · '+L.esc(o.name||o.phone)+' · '+L.esc(L.labelOf(o,o.s))+' · '+L.esc(o.tot)).join('\n');
    return L.tg('sendMessage',{chat_id:m.chat.id,text:t,parse_mode:'HTML'});
  }
}

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(200).send('ok');
  if(!L.safeEq(req.headers['x-telegram-bot-api-secret-token'],process.env.TELEGRAM_WEBHOOK_SECRET)||!process.env.TELEGRAM_WEBHOOK_SECRET)return res.status(401).send('no');
  const u=req.body||{};
  try{
    // Telegram bir xil update'ni qayta yuborsa, ikkinchi marta ishlamaydi
    if(u.update_id&&!(await L.firstTime('upd:'+u.update_id)))return res.status(200).send('ok');
    if(u.callback_query)await onCallback(u.callback_query);
    else if(u.message)await onMessage(u.message);
  }catch(e){console.error(e)}
  return res.status(200).send('ok');
};
