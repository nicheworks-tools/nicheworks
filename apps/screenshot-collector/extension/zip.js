// Dependency-free ZIP writer using STORE (no compression). Local files only.
const encoder=new TextEncoder();
const table=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(data){let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function u16(v){return [v&255,(v>>>8)&255];}
function u32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];}
function bytes(value){return value instanceof Uint8Array?value:encoder.encode(value);}
export function createZip(files){
 if(files.length>65535)throw Error("Too many ZIP entries");
 const local=[],central=[];let offset=0,centralSize=0;
 for(const file of files){
  const name=bytes(file.name),data=bytes(file.data);
  if(!name.length||name.length>65535||data.length>0xffffffff)throw Error("Invalid ZIP entry");
  if(file.name.startsWith("/")||file.name.includes("..")||file.name.includes("\\"))throw Error("Unsafe ZIP filename");
  const crc=crc32(data);
  const lh=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
  local.push(lh,name,data);
  const ch=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
  central.push(ch,name);offset+=lh.length+name.length+data.length;centralSize+=ch.length+name.length;
  if(offset>0xffffffff)throw Error("ZIP exceeds 4 GiB; ZIP64 unsupported");
 }
 if(offset+centralSize>0xffffffff)throw Error("ZIP exceeds 4 GiB");
 const end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(centralSize),...u32(offset),...u16(0)]);
 return new Blob([...local,...central,end],{type:"application/zip"});
}
