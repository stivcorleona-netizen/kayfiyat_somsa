const L=require('./_lib');
module.exports=async(req,res)=>{
  const q=req.query||{},id=String(q.id||''),t=String(q.t||'');
  if(!/^K\d{4}$/.test(id))return res.status(400).json({error:'id'});
  try{
    const o=await L.loadOrder(id);
    // kuzatish kaliti noto'g'ri bo'lsa ham "topilmadi" deymiz: boshqa buyurtmalarni qidirib topib bo'lmasin
    if(!o||!L.safeEq(o.tok,t))return res.status(404).json({error:'topilmadi'});
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({s:o.s});
  }catch(e){console.error(e);return res.status(502).json({error:'xato'})}
};
