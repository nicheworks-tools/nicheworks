(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  let currentLang = "ja";
  let hasGenerated = false;

  const labels = {
    ja: {
      initial: "用途と項目を選んで生成してください。",
      copied: "コピーしました。",
      copyFailed: "コピーできませんでした。手動で選択してコピーしてください。",
      notGenerated: "先に生成してください。",
      savedMd: "Markdownを保存しました。",
      savedTxt: "TXTを保存しました。",
      changed: "入力内容が変わりました。必要に応じて再生成してください。"
    },
    en: {
      initial: "Choose a use case and fields, then generate a design.",
      copied: "Copied.",
      copyFailed: "Copy failed. Please select and copy manually.",
      notGenerated: "Generate a design first.",
      savedMd: "Markdown saved.",
      savedTxt: "TXT saved.",
      changed: "The input changed. Regenerate when needed."
    }
  };

  const fieldCatalog = {
    name: {
      ja: { label: "名前", type: "Title または Text", required: true, note: "問い合わせ元を識別する主項目" },
      en: { label: "Name", type: "Title or Text", required: true, note: "Primary identifier for the requester" }
    },
    email: {
      ja: { label: "メール", type: "Email", required: true, note: "返信先。公開ビューでは非表示推奨" },
      en: { label: "Email", type: "Email", required: true, note: "Reply destination. Hide it from public views" }
    },
    company: {
      ja: { label: "会社", type: "Text", required: false, note: "法人・団体名。不要なら省略可" },
      en: { label: "Company", type: "Text", required: false, note: "Organization name. Optional" }
    },
    request: {
      ja: { label: "内容", type: "Text", required: true, note: "問い合わせ・申請・依頼の本文" },
      en: { label: "Request", type: "Text", required: true, note: "Main inquiry, application, or request body" }
    },
    priority: {
      ja: { label: "優先度", type: "Select", required: false, note: "低 / 中 / 高 / 緊急" },
      en: { label: "Priority", type: "Select", required: false, note: "Low / Medium / High / Urgent" }
    },
    deadline: {
      ja: { label: "期限", type: "Date", required: false, note: "対応期限や希望納期" },
      en: { label: "Deadline", type: "Date", required: false, note: "Response deadline or desired due date" }
    },
    attachment: {
      ja: { label: "添付", type: "Files & media", required: false, note: "資料・画像・スクリーンショット" },
      en: { label: "Attachment", type: "Files & media", required: false, note: "Documents, images, or screenshots" }
    }
  };

  const flowCatalog = {
    simple: {
      ja: {
        name: "シンプル",
        statuses: ["新規", "対応中", "完了"],
        meanings: {
          "新規": "未確認の受付",
          "対応中": "担当者が確認・処理中",
          "完了": "返信または処理が完了"
        }
      },
      en: {
        name: "Simple",
        statuses: ["New", "In progress", "Done"],
        meanings: {
          "New": "Newly received item",
          "In progress": "Being reviewed or handled",
          "Done": "Response or handling is complete"
        }
      }
    },
    detailed: {
      ja: {
        name: "詳細",
        statuses: ["新規", "確認中", "追加情報待ち", "対応中", "保留", "返信済み", "完了", "却下/対象外"],
        meanings: {
          "新規": "未確認の受付",
          "確認中": "内容・権限・対応可否を確認中",
          "追加情報待ち": "相手からの追加情報待ち",
          "対応中": "作業または返信準備中",
          "保留": "期限・担当・判断待ち",
          "返信済み": "相手へ回答済み",
          "完了": "対応完了・記録のみ保持",
          "却下/対象外": "対応対象外または不採用"
        }
      },
      en: {
        name: "Detailed",
        statuses: ["New", "Reviewing", "Waiting for info", "In progress", "On hold", "Replied", "Done", "Rejected / out of scope"],
        meanings: {
          "New": "Newly received item",
          "Reviewing": "Checking content, permissions, or feasibility",
          "Waiting for info": "Waiting for additional information",
          "In progress": "Work or response preparation is in progress",
          "On hold": "Waiting for timing, owner, or decision",
          "Replied": "A response has been sent",
          "Done": "Completed and kept for record",
          "Rejected / out of scope": "Not accepted or outside scope"
        }
      }
    },
    inquiry: {
      ja: {
        name: "問い合わせ",
        statuses: ["新規", "確認中", "追加情報待ち", "対応中", "返信済み", "完了"],
        meanings: {
          "新規": "未確認の問い合わせ",
          "確認中": "内容と担当を確認中",
          "追加情報待ち": "相手からの補足待ち",
          "対応中": "回答作成または対応中",
          "返信済み": "回答済み・相手確認待ち",
          "完了": "対応を終了"
        }
      },
      en: {
        name: "Inquiry",
        statuses: ["New", "Reviewing", "Waiting for info", "In progress", "Replied", "Done"],
        meanings: {
          "New": "New inquiry",
          "Reviewing": "Checking content and owner",
          "Waiting for info": "Waiting for additional details",
          "In progress": "Preparing a response or handling the issue",
          "Replied": "Response sent and awaiting confirmation",
          "Done": "Closed"
        }
      }
    },
    application: {
      ja: {
        name: "申請",
        statuses: ["新規", "確認中", "差し戻し", "承認待ち", "承認", "却下", "完了"],
        meanings: {
          "新規": "未確認の申請",
          "確認中": "内容・条件を確認中",
          "差し戻し": "修正または追加資料が必要",
          "承認待ち": "決裁者の判断待ち",
          "承認": "承認済み",
          "却下": "承認しない判断",
          "完了": "処理と記録が完了"
        }
      },
      en: {
        name: "Application",
        statuses: ["New", "Reviewing", "Needs revision", "Waiting approval", "Approved", "Rejected", "Done"],
        meanings: {
          "New": "New application",
          "Reviewing": "Checking content and conditions",
          "Needs revision": "Revision or additional documents needed",
          "Waiting approval": "Waiting for approver decision",
          "Approved": "Approved",
          "Rejected": "Not approved",
          "Done": "Processing and record keeping completed"
        }
      }
    },
    recruiting: {
      ja: {
        name: "採用・応募",
        statuses: ["新規", "書類確認", "面談調整中", "面談済み", "保留", "不採用", "採用", "完了"],
        meanings: {
          "新規": "新しい応募",
          "書類確認": "履歴・実績を確認中",
          "面談調整中": "日程調整中",
          "面談済み": "面談完了・判断待ち",
          "保留": "追加判断待ち",
          "不採用": "見送り",
          "採用": "採用判断済み",
          "完了": "連絡と記録が完了"
        }
      },
      en: {
        name: "Recruiting",
        statuses: ["New", "Screening", "Scheduling", "Interviewed", "On hold", "Rejected", "Accepted", "Done"],
        meanings: {
          "New": "New applicant",
          "Screening": "Reviewing profile or work history",
          "Scheduling": "Scheduling an interview",
          "Interviewed": "Interview done and decision pending",
          "On hold": "Additional decision pending",
          "Rejected": "Rejected",
          "Accepted": "Accepted",
          "Done": "Notification and record keeping completed"
        }
      }
    },
    bug: {
      ja: {
        name: "バグ報告",
        statuses: ["新規", "再現確認中", "修正中", "確認待ち", "修正済み", "対象外", "完了"],
        meanings: {
          "新規": "未確認の報告",
          "再現確認中": "環境・手順を確認中",
          "修正中": "修正作業中",
          "確認待ち": "修正後の確認待ち",
          "修正済み": "修正完了",
          "対象外": "仕様・重複・対応外",
          "完了": "記録完了"
        }
      },
      en: {
        name: "Bug report",
        statuses: ["New", "Reproducing", "Fixing", "Waiting verification", "Fixed", "Out of scope", "Done"],
        meanings: {
          "New": "New report",
          "Reproducing": "Checking environment and reproduction steps",
          "Fixing": "Fix in progress",
          "Waiting verification": "Waiting for post-fix verification",
          "Fixed": "Fix completed",
          "Out of scope": "Expected behavior, duplicate, or out of scope",
          "Done": "Record completed"
        }
      }
    },
    creative: {
      ja: {
        name: "制作依頼",
        statuses: ["新規", "要件確認", "見積中", "制作中", "確認待ち", "修正中", "納品済み", "完了", "対象外"],
        meanings: {
          "新規": "未確認の依頼",
          "要件確認": "目的・素材・範囲を確認中",
          "見積中": "費用・納期を確認中",
          "制作中": "制作作業中",
          "確認待ち": "依頼者確認待ち",
          "修正中": "修正作業中",
          "納品済み": "成果物を納品済み",
          "完了": "請求・記録を含め完了",
          "対象外": "対応しない依頼"
        }
      },
      en: {
        name: "Creative request",
        statuses: ["New", "Scoping", "Estimating", "Producing", "Waiting review", "Revising", "Delivered", "Done", "Out of scope"],
        meanings: {
          "New": "New request",
          "Scoping": "Checking purpose, assets, and scope",
          "Estimating": "Checking cost and schedule",
          "Producing": "Production in progress",
          "Waiting review": "Waiting for requester review",
          "Revising": "Revision in progress",
          "Delivered": "Deliverables sent",
          "Done": "Completed including billing or records",
          "Out of scope": "Request not accepted"
        }
      }
    }
  };

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    currentLang = lang === "en" ? "en" : "ja";
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
    langButtons().forEach((button) => button.classList.toggle("active", button.dataset.lang === currentLang));
    document.documentElement.lang = currentLang;
    try { localStorage.setItem("nw_lang", currentLang); } catch (_) {}
    if (!hasGenerated) setInitialOutput();
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => button.addEventListener("click", () => applyLang(button.dataset.lang)));
    applyLang(lang);
  };

  const showToast = (message) => {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const copyToClipboard = async (text) => {
    if (!text.trim()) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    } finally {
      textarea.remove();
    }
    return ok;
  };

  const downloadText = (filename, text, mime = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const getSelectedFields = () => {
    return Array.from(document.querySelectorAll(".field-check:checked"))
      .map((input) => input.value)
      .filter((key) => fieldCatalog[key]);
  };

  const getFlow = () => {
    const key = $("statusFlow").value;
    return flowCatalog[key] || flowCatalog.simple;
  };

  const line = (text = "") => text;

  const buildProperties = (lang) => {
    const useCase = $("useCase").value.trim() || (lang === "ja" ? "未設定の用途" : "Untitled use case");
    const selected = getSelectedFields();
    const flow = getFlow()[lang];
    const requiredLabel = lang === "ja" ? "必須" : "Required";
    const optionalLabel = lang === "ja" ? "任意" : "Optional";

    const baseFields = selected.map((key) => {
      const field = fieldCatalog[key][lang];
      return `- ${field.label}: ${field.type} / ${field.required ? requiredLabel : optionalLabel} / ${field.note}`;
    });

    if (lang === "ja") {
      return [
        `# ${useCase} - Notion DB設計案`,
        "",
        "## プロパティ設計",
        ...baseFields,
        `- ステータス: Status / 必須 / ${flow.statuses.join(", ")}`,
        "- 担当者: Person / 任意 / 対応責任者",
        "- 受付ID: Unique ID または Text / 任意 / 外部連絡時の参照番号",
        "- 受付日: Created time または Date / 必須 / 登録日",
        "- 最終更新: Last edited time / 任意 / 更新確認用",
        "",
        "## 推奨ビュー",
        "- Board view: ステータス別に確認",
        "- Table view: 期限、担当者、優先度で一覧確認",
        "- Calendar view: 期限項目を使う場合のみ",
        "- My tasks view: 担当者が自分の項目だけ確認するビュー",
        "",
        "## 注意",
        "- メール、氏名、添付ファイルを含むビューは外部公開しないでください。",
        "- Notionの共有範囲、権限、保存期間、削除ルールを別途確認してください。"
      ].join("\n");
    }

    return [
      `# ${useCase} - Notion DB design draft`,
      "",
      "## Property design",
      ...baseFields,
      `- Status: Status / Required / ${flow.statuses.join(", ")}`,
      "- Owner: Person / Optional / Responsible person",
      "- Intake ID: Unique ID or Text / Optional / Reference ID for communication",
      "- Received at: Created time or Date / Required / Submission date",
      "- Last updated: Last edited time / Optional / Update tracking",
      "",
      "## Recommended views",
      "- Board view: Review items by status",
      "- Table view: Check deadline, owner, and priority",
      "- Calendar view: Use only when deadline is included",
      "- My tasks view: Let each owner see their assigned items",
      "",
      "## Notes",
      "- Do not publicly share views that include names, emails, or attachments.",
      "- Check Notion sharing scope, permissions, retention, and deletion rules separately."
    ].join("\n");
  };

  const buildPipeline = (lang) => {
    const flow = getFlow()[lang];
    const heading = lang === "ja" ? "## ステータスパイプライン" : "## Status pipeline";
    const meaningHeading = lang === "ja" ? "## ステータスの意味" : "## Status meanings";

    return [
      heading,
      flow.statuses.join(" → "),
      "",
      meaningHeading,
      ...flow.statuses.map((status) => `- ${status}: ${flow.meanings[status] || ""}`)
    ].join("\n");
  };

  const buildMessages = (lang) => {
    if (lang === "ja") {
      return [
        "## 通知テンプレ",
        "### 受付時",
        "お問い合わせを受け付けました。内容を確認し、必要に応じて担当者からご連絡します。",
        "",
        "### 追加情報依頼",
        "確認のため、以下の追加情報をご共有ください。情報がそろい次第、対応を進めます。",
        "",
        "### 対応中",
        "現在、担当者が内容を確認・対応しています。完了または追加確認が必要になった時点でご連絡します。",
        "",
        "### 完了",
        "対応が完了しました。追加で確認したい点があれば、この受付IDを添えてご連絡ください。",
        "",
        "### 対象外/却下",
        "確認の結果、今回は対応対象外と判断しました。必要に応じて理由や代替手段を追記してください。",
        "",
        "## 返信前チェック",
        "- 個人情報、社内URL、未公開情報が不要に含まれていないか",
        "- 相手に必要な次アクションが明確か",
        "- ステータスと担当者が更新されているか",
        "- Notionの共有範囲が適切か"
      ].join("\n");
    }

    return [
      "## Message templates",
      "### Received",
      "We have received your request. We will review the details and contact you if needed.",
      "",
      "### Additional information request",
      "Please share the following additional information so we can continue reviewing your request.",
      "",
      "### In progress",
      "The responsible person is reviewing or handling this item. We will contact you when it is completed or when we need more details.",
      "",
      "### Completed",
      "This item has been completed. If you need further help, please include the intake ID in your reply.",
      "",
      "### Rejected / out of scope",
      "After review, this item is outside the current scope. Add a reason or alternative option when appropriate.",
      "",
      "## Pre-reply checklist",
      "- Remove unnecessary personal data, internal URLs, and unreleased information",
      "- Make the next action clear for the recipient",
      "- Update status and owner",
      "- Check that the Notion sharing scope is appropriate"
    ].join("\n");
  };

  const buildDesign = (lang = currentLang) => ({
    properties: buildProperties(lang),
    pipeline: buildPipeline(lang),
    messages: buildMessages(lang)
  });

  const setInitialOutput = () => {
    const text = labels[currentLang].initial;
    $("properties").value = text;
    $("pipeline").value = text;
    $("messages").value = text;
  };

  const generate = () => {
    const data = buildDesign();
    $("properties").value = data.properties;
    $("pipeline").value = data.pipeline;
    $("messages").value = data.messages;
    hasGenerated = true;
  };

  const getCombinedOutput = () => {
    return [$("properties").value, $("pipeline").value, $("messages").value].join("\n\n");
  };

  const makeFilename = (extension) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `notion-form-design-kit-${currentLang}-${date}.${extension}`;
  };

  const requireGenerated = () => {
    if (hasGenerated) return true;
    showToast(labels[currentLang].notGenerated);
    return false;
  };

  const initTool = () => {
    initLang();
    setInitialOutput();

    $("generate").addEventListener("click", generate);

    $("copyAll").addEventListener("click", async () => {
      if (!requireGenerated()) return;
      const ok = await copyToClipboard(getCombinedOutput());
      showToast(ok ? labels[currentLang].copied : labels[currentLang].copyFailed);
    });

    $("saveMd").addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(makeFilename("md"), getCombinedOutput(), "text/markdown;charset=utf-8");
      showToast(labels[currentLang].savedMd);
    });

    $("saveTxt").addEventListener("click", () => {
      if (!requireGenerated()) return;
      downloadText(makeFilename("txt"), getCombinedOutput());
      showToast(labels[currentLang].savedTxt);
    });

    const rerenderIfGenerated = () => {
      if (hasGenerated) {
        generate();
      }
    };

    $("useCase").addEventListener("input", rerenderIfGenerated);
    $("statusFlow").addEventListener("change", rerenderIfGenerated);
    document.querySelectorAll(".field-check").forEach((input) => {
      input.addEventListener("change", rerenderIfGenerated);
    });
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
