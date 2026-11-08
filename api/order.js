const crypto=require('crypto');
const L=require('./_lib');

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'method'});
  try{
    if(!process.env.TELEGRAM_BOT_TOKEN||!process.env.TELEGRAM_CHAT_ID)return res.status(500).json({error:'sozlanmagan'});
    // tezlikni cheklash: bir IP dan daqiqasiga 5 ta buyurtma
    const ip=((req.headers['x-forwarded-for']||'').split(',')[0]||'x').trim();
    const n=await L.redis(['INCR','rl:'+ip]);
    if(n===1)await L.redis(['EXPIRE','rl:'+ip,'60']);
    if(n>5)return res.status(429).json({error:'ko‘p urinish'});

    const b=req.body||{};
    const items=[];let sum=0,usd=0,sc=0;
    if(!Array.isArray(b.items)||!b.items.length||b.items.length>30)return res.status(400).json({error:'savat'});
    for(const x of b.items){
      const m=L.MENU.find(r=>r[0]===x.id),q=Number(x.q);
      if(!m||!Number.isInteger(q)||q<1||q>50)return res.status(400).json({error:'taom'});
      if(m[5])usd+=q*100;else sum+=q*m[2];
      if(m[3]<2)sc+=q;
      items.push({id:m[0],n:m[1],q,l:m[5]?q*100+' $':L.fmt(q*m[2])});
    }
    const br=Number(b.br);
    if(!Number.isInteger(br)||br<0||br>=L.BR.length)return res.status(400).json({error:'filial'});
    const phone=String(b.phone||'').slice(0,25);
    if((phone.match(/\d/g)||[]).length<9)return res.status(400).json({error:'telefon'});
    const mode=b.mode==='Yetkazib berish'?'Yetkazib berish':'Olib ketaman';
    const pay=b.pay==='Karta'?'Karta':'Naqd';
    const loc=/^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/.test(String(b.loc||''))?String(b.loc):'';
    const o={
      br,items,sc,mode,pay,phone,loc,s:'new',eta:null,t:Date.now(),
      tot:(sum?L.fmt(sum)+' so‘m':'')+(sum&&usd?' + ':'')+(usd?usd+' $':''),
      name:String(b.name||'').slice(0,60),
      adr:mode==='Yetkazib berish'?String(b.adr||'').slice(0,200):'',
      cm:String(b.cm||'').slice(0,200)
    };
    // noyob buyurtma raqami
    let ok=false;
    for(let i=0;i<6&&!ok;i++){
      o.id='K'+(1000+crypto.randomInt(9000));
      ok=(await L.redis(['SET','order:'+o.id,JSON.stringify(o),'NX','EX',String(60*60*24*3)]))==='OK';
    }
    if(!ok)return res.status(500).json({error:'raqam'});

    const msg=await L.tg('sendMessage',{chat_id:L.chatFor(br),text:L.orderText(o),parse_mode:'HTML',disable_web_page_preview:true,reply_markup:{inline_keyboard:L.keyboard(o)}});
    o.chat=String(msg.chat.id);o.mid=msg.message_id;
    await L.saveOrder(o);
    if(process.env.OWNER_CHAT_ID){try{await L.tg('sendMessage',{chat_id:process.env.OWNER_CHAT_ID,text:L.orderText(o),parse_mode:'HTML',disable_web_page_preview:true})}catch(e){}}
    return res.status(200).json({id:o.id,tot:o.tot,sc:o.sc,items:o.items});
  }catch(e){
    console.error(e);
    return res.status(502).json({error:'yuborilmadi'});
  }
};
