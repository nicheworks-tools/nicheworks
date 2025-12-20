const TASKS = {
  common: [
    "郵便転送届を出した",
    "住所変更（銀行・クレカ・保険）を完了した"
  ],
  rental: [
    "退去立会いを実施した",
    "電気・ガス・水道を停止した",
    "ネット回線を解約した",
    "火災保険を解約した",
    "鍵を返却した"
  ],
  owned: [
    "電気・ガス・水道を停止した",
    "自治体の転出届を提出した"
  ]
};

const btn = document.getElementById("btnGenerate");
const result = document.getElementById("result");
const list = document.getElementById("taskList");

btn.addEventListener("click", () => {
  list.innerHTML = "";
  const type = document.getElementById("homeType").value;
  const tasks = [...TASKS.common, ...TASKS[type]].slice(0, 10);

  tasks.forEach(text => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    li.append(cb, " ", text);
    list.appendChild(li);
  });

  result.hidden = false;
});
