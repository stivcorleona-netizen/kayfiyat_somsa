const L=require('./_lib');
module.exports=async(req,res)=>{
  const id=String((req.query&&req.query.id)||'');
  if(!/^K\d{4}$/.test(id))return res.status(400).json({error:'id'});
  try{
    const o=await L.loadOrder(id);
    if(!o)return res.status(404).json({error:'topilmadi'});
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({s:o.s,eta:o.eta});
  }catch(e){console.error(e);return res.status(502).json({error:'xato'})}
};
