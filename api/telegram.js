const L=require('./_lib');

const NEXT={a:{from:['new'],to:'accepted'},r:{from:['new'],to:'rejected'},c:{from:['accepted'],to:'cooking'},d:{from:['accepted','cooking'],to:'ready'}};

async function notifyCustomer(o){
  if(!o.cust)return;
  const t=L.customerText(o);
  if(t){try{await L.tg('sendMessage',{chat_id:o.cust,text:t})}catch(e){console.error(e)}}
}

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(200).send('ok');
  if(req.headers['x-telegram-bot-api-secret-token']!==process.env.TELEGRAM_WEBHOOK_SECRET)return res.status(401).send('no');
  const u=req.body||{};
  try{
    // 1) Xodim guruhdagi tugmani bosdi
    if(u.callback_query){
      const cq=u.callback_query,parts=String(cq.data||'').split(':'),act=NEXT[parts[0]],id=parts[1];
      const chat=cq.message&&String(cq.message.chat.id);
      if(!act||!/^K\d{4}$/.test(id||''))return res.status(200).send('ok');
      if(!L.allChats().includes(chat)){await L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:'Ruxsat yo‘q'});return res.status(200).send('ok')}
      const o=await L.loadOrder(id);
      if(!o){await L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:'Buyurtma topilmadi (muddati o‘tgan)'});return res.status(200).send('ok')}
      if(!act.from.includes(o.s)){await L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:'Holat allaqachon o‘zgargan'});return res.status(200).send('ok')}
      o.s=act.to;
      if(parts[0]==='a')o.eta=Number(parts[2])||15;
      await L.saveOrder(o);
      try{await L.tg('editMessageText',{chat_id:o.chat,message_id:o.mid,text:L.orderText(o),parse_mode:'HTML',disable_web_page_preview:true,reply_markup:{inline_keyboard:L.keyboard(o)}})}catch(e){console.error(e)}
      await L.tg('answerCallbackQuery',{callback_query_id:cq.id,text:L.STATUS[o.s]});
      await notifyCustomer(o);
      return res.status(200).send('ok');
    }
    // 2) Mijoz botni ochdi: /start K1234
    const m=u.message;
    if(m&&m.text&&m.text.startsWith('/start')&&m.chat.type==='private'){
      const id=(m.text.split(' ')[1]||'').trim();
      if(/^K\d{4}$/.test(id)){
        const o=await L.loadOrder(id);
        if(o){
          o.cust=String(m.chat.id);await L.saveOrder(o);
          await L.tg('sendMessage',{chat_id:m.chat.id,text:'Buyurtma №'+id+' kuzatilmoqda. Holat o‘zgarganda shu yerga yozaman.\nHozirgi holat: '+L.STATUS[o.s]+(o.s==='accepted'&&o.eta?' (~'+o.eta+' daqiqa)':'')});
          return res.status(200).send('ok');
        }
      }
      await L.tg('sendMessage',{chat_id:m.chat.id,text:'Assalomu alaykum! Kayfiyat Somsa botiga xush kelibsiz. Buyurtma berish uchun saytga kiring.'});
    }
  }catch(e){console.error(e)}
  return res.status(200).send('ok');
};
