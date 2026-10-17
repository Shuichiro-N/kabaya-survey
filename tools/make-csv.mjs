// 設問定義（assets/surveys.js）から、Salesforce 管理者向けの項目一覧（CSV）を作る。node tools/make-csv.mjs
import fs from "node:fs";
import vm from "node:vm";
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../assets/surveys.js", import.meta.url), "utf8"), ctx);
const STD = { last_name: "姓（標準）", first_name: "名（標準）", email: "メール（標準）", phone: "電話（標準）", zip: "郵便番号（標準）", state: "都道府県（標準）", city: "市区郡（標準）", street: "町名・番地（標準）" };
const TYPE = { text: "テキスト", email: "メール", tel: "電話", zip: "テキスト", number: "数値", textarea: "ロングテキストエリア", radio: "選択リスト", select: "選択リスト", checkbox: "複数選択リスト", date: "日付" };
const NAME = { pre: "来場前", post: "来場後", lost: "失注者" };
const q = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const rows = [["アンケート", "設問ID", "質問", "必須", "推奨する項目の型", "選択肢（;区切り）", "表示条件", "標準項目"].map(q).join(",")];
for (const [key, s] of Object.entries(ctx.window.SURVEYS)) {
  for (const x of s.questions) {
    rows.push([NAME[key], x.id, x.label, x.required ? "必須" : "", STD[x.id] ? "（標準項目）" : TYPE[x.type], (x.options || []).join(";"),
      x.showIf ? `「${x.showIf.id}」が ${x.showIf.in.join("・")} のとき` : "", STD[x.id] || ""].map(q).join(","));
  }
}
// Excel で文字化けしないよう BOM 付き UTF-8
fs.writeFileSync(new URL("../項目一覧.csv", import.meta.url), "﻿" + rows.join("\r\n") + "\r\n");
console.log(`項目一覧.csv：${rows.length - 1}項目`);
