import { getActiveEntitlementByCheckoutSession } from "../billing/entitlement-store.js";
import { STUDIO_PRODUCT_ID, STUDIO_FEATURE_ID, generateStudioFiles } from "./studio-core.mjs";

const SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]+$/;
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
// Product and permission come only from server code, never from user input.
export async function onRequestPost({request,env}){
 const origin=request.headers.get("origin");
 if(origin && origin!==new URL(request.url).origin)return reply(403,{ok:false,error:"origin_mismatch"});
 if(request.headers.get("content-type")?.split(";")[0].trim().toLowerCase()!=="application/json")return reply(415,{ok:false,error:"json_required"});
 const length=Number(request.headers.get("content-length"));
 if(Number.isFinite(length)&&length>12000)return reply(413,{ok:false,error:"payload_too_large"});
 let payload;
 try{const raw=await request.text();if(raw.length>12000)return reply(413,{ok:false,error:"payload_too_large"});payload=JSON.parse(raw);}catch{return reply(400,{ok:false,error:"bad_json"});}
 const sessionId=typeof payload?.sessionId==="string"?payload.sessionId.trim():"";
 if(!SESSION_PATTERN.test(sessionId))return reply(401,{ok:false,error:"paid_session_required"});
 let composition;
 try{composition=generateStudioFiles(payload.composition);}catch(error){
  return reply(400,{ok:false,error:String(error.message||"invalid_composition")});
 }
 let proof;
 try{proof=await getActiveEntitlementByCheckoutSession(env,{productId:STUDIO_PRODUCT_ID,sessionId});}
 catch{return reply(503,{ok:false,error:"entitlement_check_unavailable"});}
 if(!proof.ok)return reply(503,{ok:false,error:"entitlement_check_unavailable"});
 if(!proof.found||!proof.entitlement||!proof.entitlement.features?.includes(STUDIO_FEATURE_ID)){
  return reply(403,{ok:false,error:"paid_entitlement_required"});
 }
 return reply(200,{ok:true,productId:STUDIO_PRODUCT_ID,...composition});
}
export async function onRequestGet(){return reply(405,{ok:false,error:"method_not_allowed"});}
