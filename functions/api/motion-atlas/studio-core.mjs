// Motion Atlas Studio: pure server-side generator; never load directly in a public page.
export const STUDIO_PRODUCT_ID = "motion_atlas.studio_v1";
export const STUDIO_FEATURE_ID = "motionAtlas.studioExport";
const EASINGS = new Set(["ease","ease-in","ease-out","ease-in-out","linear","cubic-bezier(.2,.8,.2,1)"]);
const EFFECTS = Object.freeze({
 "fade-in":"from{opacity:0}to{opacity:1}",
 "slide-in":"from{opacity:0;transform:translateX(45px)}to{opacity:1;transform:translateX(0)}",
 "fade-up":"from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}",
 "scale-in":"from{opacity:0;transform:scale(.65)}to{opacity:1;transform:scale(1)}",
 "overshoot":"0%{transform:scale(.65);opacity:0}60%{transform:scale(1.17);opacity:1}80%{transform:scale(.94)}100%{transform:scale(1)}",
 "wiggle":"0%,100%{transform:rotate(0)}30%{transform:rotate(-8deg)}70%{transform:rotate(7deg)}",
 "pulse":"0%,100%{transform:scale(1)}50%{transform:scale(1.08)}",
 "mask-reveal":"from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}",
 "squash-stretch":"0%,100%{transform:scale(1,1)}30%{transform:scale(1.22,.76)}65%{transform:scale(.86,1.14)}",
 "parallax":"from{transform:translateX(0)}to{transform:translateX(36px)}"
});
export function validateComposition(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw Error("invalid_composition");
 if(typeof input.text!=="string"||input.text.length<1||input.text.length>80||/[\u0000-\u001f\u007f]/.test(input.text))throw Error("invalid_text");
 if(!Array.isArray(input.tracks)||input.tracks.length<1||input.tracks.length>8)throw Error("invalid_tracks");
 const tracks=input.tracks.map(t=>{
  if(!t||typeof t!=="object"||Array.isArray(t))throw Error("invalid_track");
  if(!Object.hasOwn(EFFECTS,t.effect))throw Error("unsupported_effect");
  if(!Number.isInteger(t.delay)||t.delay<0||t.delay>12000)throw Error("invalid_delay");
  if(!Number.isInteger(t.duration)||t.duration<100||t.duration>5000)throw Error("invalid_duration");
  if(typeof t.easing!=="string"||!EASINGS.has(t.easing))throw Error("invalid_easing");
  return {effect:t.effect,delay:t.delay,duration:t.duration,easing:t.easing};
 });
 if(Math.max(...tracks.map(t=>t.delay+t.duration))>15000)throw Error("timeline_too_long");
 return {text:input.text,tracks};
}
export function generateStudioFiles(input){
 const data=validateComposition(input), tracks=data.tracks;
 const duration=Math.max(...tracks.map(t=>t.delay+t.duration));
 const css=[
  "/* Motion Atlas Studio — nested wrappers isolate overlapping transform tracks. */",
  ".nw-studio-composition,.nw-studio-layer,.nw-studio-content{display:inline-block;will-change:transform,opacity}",
  ...tracks.map((t,i)=>"@keyframes nwStudio_"+i+"{"+EFFECTS[t.effect]+"}\n.nw-studio-layer-"+i+"{animation:nwStudio_"+i+" "+t.duration+"ms "+t.easing+" "+t.delay+"ms both;}"),
  "@media(prefers-reduced-motion:reduce){.nw-studio-layer{animation:none!important}.nw-studio-composition,.nw-studio-content{will-change:auto}}"
 ].join("\n\n");
 const react=[
  'import React from "react";',
  'import "./MotionStudio.css";',
  "",
  "export default function MotionStudioSequence(){",
  " return (",
  '  <span className="nw-studio-composition" aria-label="Motion sequence">',
  ...tracks.map((t,i)=>"    ".repeat(i+1)+'<span className="nw-studio-layer nw-studio-layer-'+i+'">'),
  "    ".repeat(tracks.length+1)+"<span className=\"nw-studio-content\">{"+JSON.stringify(data.text)+"}</span>",
  ...tracks.map((t,i)=>"    ".repeat(tracks.length-i)+"</span>"),
  "  </span>",
  " );",
  "}"
 ].join("\n");
 const html='<span class="nw-studio-composition">'+tracks.map((t,i)=>'<span class="nw-studio-layer nw-studio-layer-'+i+'">').join("")+'<span class="nw-studio-content"></span>'+"</span>".repeat(tracks.length+1);
 const readme=[
  "# Motion Atlas Studio — code bundle",
  "",
  "Tracks: "+tracks.length+" | Timeline: "+duration+" ms",
  "",
  "Save the following files together. Each track uses a separate wrapper so transforms compose instead of overriding one another.",
  "",
  "## MotionStudio.css",
  "~~~css",css,"~~~",
  "",
  "## MotionStudioSequence.jsx",
  "~~~jsx",react,"~~~",
  "",
  "## Optional HTML markup",
  "~~~html",html,"~~~",
  "",
  "Reduced-motion preferences disable the animation and show the content directly."
 ].join("\n");
 return {schema:"motion-atlas-studio-bundle-v1",tracks:tracks.length,totalDuration:duration,files:[
  {name:"MotionStudio.css",content:css},
  {name:"MotionStudioSequence.jsx",content:react},
  {name:"MotionStudioBundle.md",content:readme}
 ]};
}
