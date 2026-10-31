(function (global) {
  'use strict';
  var PRODUCT = 'okj.toolkit_pro';
  var FEATURE = 'okj.workspaces';
  var STORAGE_KEY = 'okj.workspaces.v1';
  var MAX_WORKSPACES = 30;
  var MAX_ENTRIES = 80;
  var MAX_ENTRY_CHARS = 30000;
  var SUPPORTED_TOOLS = [
    'old-kanji-reference','kanji-modernizer','old-kanji-ocr-scanner',
    'old-document-kanji-highlighter','unicode-kanji-checker','variant-kanji-compare',
    'place-old-kanji-checker','name-old-kanji-checker'
  ];

  function gated(gate) {
    return !!(gate && gate.active === true && gate.productId === PRODUCT && gate.featureId === FEATURE);
  }
  function makeId(prefix) {
    return prefix + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 11);
  }
  function now() { return new Date().toISOString(); }
  function cleanText(value, length) {
    return typeof value === 'string' ? value.slice(0, length) : '';
  }
  function normalizeEntry(input) {
    var entry = input || {};
    return {
      id: cleanText(entry.id, 80) || makeId('entry-'),
      sourceTool: SUPPORTED_TOOLS.includes(entry.sourceTool) ? entry.sourceTool : 'old-kanji-reference',
      label: cleanText(entry.label, 120),
      text: cleanText(entry.text, MAX_ENTRY_CHARS),
      createdAt: cleanText(entry.createdAt, 40) || now()
    };
  }
  function normalizeWorkspace(input) {
    var workspace = input || {};
    var entries = Array.isArray(workspace.entries) ? workspace.entries : [];
    return {
      id: cleanText(workspace.id, 80) || makeId('workspace-'),
      name: cleanText(workspace.name, 80),
      createdAt: cleanText(workspace.createdAt, 40) || now(),
      updatedAt: cleanText(workspace.updatedAt, 40) || now(),
      entries: entries.slice(0, MAX_ENTRIES).map(normalizeEntry)
    };
  }
  function read() {
    try {
      if (!global.localStorage) return { ok:false, error:'persistence_disabled', workspaces:[] };
      var content = global.localStorage.getItem(STORAGE_KEY);
      var data = content ? JSON.parse(content) : [];
      if (!Array.isArray(data)) return { ok:true, workspaces:[] };
      return { ok:true, workspaces:data.slice(0, MAX_WORKSPACES).map(normalizeWorkspace) };
    } catch (_error) {
      return { ok:false, error:'persistence_disabled', workspaces:[] };
    }
  }
  function write(records) {
    try {
      if (!global.localStorage) return { ok:false, error:'persistence_disabled' };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return { ok:true };
    } catch (_error) { return { ok:false, error:'persistence_disabled' }; }
  }
  function list(gate) {
    if (!gated(gate)) return { ok:false, error:'pro_required', workspaces:[] };
    return read();
  }
  function create(name, gate) {
    if (!gated(gate)) return { ok:false, error:'pro_required' };
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) return { ok:false, error:'invalid_name' };
    var result=read();
    if (!result.ok) return result;
    if (result.workspaces.length >= MAX_WORKSPACES) return { ok:false, error:'workspace_limit' };
    var record=normalizeWorkspace({name:name.trim(),entries:[]});
    result.workspaces.unshift(record);
    var saved=write(result.workspaces);
    return saved.ok ? {ok:true,workspace:record} : saved;
  }
  function addEntry(workspaceId, entry, gate) {
    if (!gated(gate)) return { ok:false, error:'pro_required' };
    if (typeof entry?.text !== 'string' || !entry.text.trim() ||
        entry.text.length > MAX_ENTRY_CHARS) return { ok:false, error:'invalid_text' };
    if (!SUPPORTED_TOOLS.includes(entry.sourceTool)) return {ok:false,error:'invalid_source_tool'};
    var data=read();
    if (!data.ok) return data;
    var workspace=data.workspaces.find(function (w) {return w.id===workspaceId;});
    if (!workspace) return {ok:false,error:'workspace_not_found'};
    if (workspace.entries.length >= MAX_ENTRIES) return {ok:false,error:'entry_limit'};
    var record=normalizeEntry(entry);
    workspace.entries.unshift(record);
    workspace.updatedAt=now();
    var saved=write(data.workspaces);
    return saved.ok ? {ok:true,entry:record,workspaceId:workspaceId} : saved;
  }
  function removeWorkspace(id, gate) {
    if (!gated(gate)) return {ok:false,error:'pro_required'};
    var data=read();
    if (!data.ok) return data;
    if (!data.workspaces.some(function(w){return w.id===id;})) return {ok:false,error:'workspace_not_found'};
    return write(data.workspaces.filter(function(w){return w.id!==id;}));
  }
  function removeEntry(workspaceId, entryId, gate) {
    if (!gated(gate)) return {ok:false,error:'pro_required'};
    var data=read();
    if (!data.ok) return data;
    var workspace=data.workspaces.find(function(w){return w.id===workspaceId;});
    if (!workspace) return {ok:false,error:'workspace_not_found'};
    if (!workspace.entries.some(function(e){return e.id===entryId;})) return {ok:false,error:'entry_not_found'};
    workspace.entries=workspace.entries.filter(function(e){return e.id!==entryId;});
    workspace.updatedAt=now();
    return write(data.workspaces);
  }
  function exportWorkspace(id,format,gate) {
    if (!gated(gate)) return {ok:false,error:'pro_required'};
    if (format!=='json' && format!=='markdown') return {ok:false,error:'unsupported_format'};
    var data=read();
    if (!data.ok) return data;
    var workspace=data.workspaces.find(function(w){return w.id===id;});
    if (!workspace) return {ok:false,error:'workspace_not_found'};
    if (format==='json') return {ok:true,format:format,mime:'application/json;charset=utf-8',filename:'old-kanji-workspace.json',content:JSON.stringify(workspace,null,2)};
    var lines=['# '+workspace.name,'','Created: '+workspace.createdAt,''];
    workspace.entries.slice().reverse().forEach(function(e){
      lines.push('## '+(e.label || e.sourceTool),'','Source: '+e.sourceTool,'','' + e.text,'');
    });
    return {ok:true,format:format,mime:'text/markdown;charset=utf-8',filename:'old-kanji-workspace.md',content:lines.join('\n')};
  }
  global.OldKanjiWorkspaceStore = {
    PRODUCT:PRODUCT,FEATURE:FEATURE,STORAGE_KEY:STORAGE_KEY,
    supportedTools:SUPPORTED_TOOLS.slice(),
    list:list,create:create,addEntry:addEntry,removeWorkspace:removeWorkspace,
    removeEntry:removeEntry,exportWorkspace:exportWorkspace
  };
})(window);
