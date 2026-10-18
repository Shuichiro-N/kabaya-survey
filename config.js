/*
 * アンケートの送信先の設定（Salesforce 管理者の方が編集してください）
 *
 * mode
 *   "demo"        … 送信しません（画面の確認用）。回答内容は画面に表示されるだけです。
 *   "web-to-lead" … Salesforce の Web-to-リード で「リード」として登録します。
 *   "form-handler"… Account Engagement（旧Pardot）のフォームハンドラーなど、任意のURLへ送ります。
 *
 * 項目の対応（fieldMap）
 *   アンケートの設問ID → Salesforce の項目名 です。
 *   ・標準項目は名前のまま（last_name, first_name, email, phone, zip, state, city, street, description など）
 *   ・カスタム項目は Web-to-リード 作成画面に表示される ID（例：00N5j00000AbCdE）を書きます
 *   ・ここに書かれていない設問の回答も、すべて「説明（description）」にまとめて送られます
 *     （カスタム項目を作る前でも、回答を漏れなく Salesforce に残せます）
 *   ・複数選択の回答は「;」区切りで送ります（複数選択リスト項目にそのまま入ります）
 *   ・設問IDの一覧は「項目一覧.csv」を参照してください
 */
window.SURVEY_CONFIG = {
  mode: "web-to-lead",

  webToLead: {
    endpoint: "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00Dd500000IyWXS",
    oid: "00Dd500000IyWXS", // 組織ID（00D から始まる15桁）
    leadSource: "Web", // リードソースの値（選択リストに存在する値にしてください）
    // 会社名はリードの必須項目のため、個人のお客様は固定の値を入れる
    company: "個人のお客様",
    debug: false, // true にすると Salesforce からデバッグメールが届きます（テスト時のみ）
    debugEmail: "",
    // Salesforce で「reCAPTCHA を要求」が有効な場合に設定（Web-to-リード作成画面で生成されたHTMLの値）
    recaptcha: {
      siteKey: "6LcN-PMtAAAAAPF7io4TXJX_sSaqrGdOfAd41CsR",
      keyName: "kabaya",
    },
  },

  formHandler: {
    endpoint: "", // 例）https://go.example.com/l/123456/2026-01-01/abcdef
  },

  // アンケートの種類を Salesforce に送る項目（リードの区別に使う）。不要なら空文字
  surveyTypeField: "00NQ800000XntoM", // アンケート種別（Survey_Type__c）
  surveyTypeLabels: { pre: "来場前アンケート", post: "来場後アンケート", lost: "失注アンケート" },

  fieldMap: {
    // 都道府県・国が選択リスト（state_code / country_code）の組織では、都道府県は「説明」欄に入る
    pre: {
      last_name: "last_name", first_name: "first_name", email: "email", phone: "phone", zip: "zip", city: "city", street: "street",
      visit_place: "00NQ800000Xnztl", // 来場会場（Visit_Place__c）
      desired_timing: "00NQ800000Xnzwz", // 入居希望時期（Desired_Timing__c）
    },
    post: {
      last_name: "last_name", first_name: "first_name", email: "email",
      visit_place: "00NQ800000Xnztl", // 来場会場（Visit_Place__c）
      satisfaction: "00NQ800000Xo01p", // 来場満足度（Satisfaction__c）
      purchase_possibility: "00NQ800000Xo053", // 成約の可能性（Purchase_Possibility__c）
    },
    lost: { last_name: "last_name", first_name: "first_name", email: "email" },
  },

  privacyUrl: "https://lifedesign-kabaya.co.jp/privacy/",
  companyName: "ライフデザイン・カバヤ株式会社",
};
