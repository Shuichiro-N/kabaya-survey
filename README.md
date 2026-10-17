# ライフデザイン・カバヤ 来場アンケート

来場前・来場後・失注者の3種類のアンケートです。HTML・CSS・JavaScript だけで動きます（サーバーのプログラムやデータベースは不要）。
回答は、お客様のブラウザから Salesforce に直接送られます。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `index.html` | 社内向けの案内ページ（3つのアンケートへのリンク、お客様に送るURLの作成） |
| `pre.html` | ① 来場前アンケート |
| `post.html` | ② 来場後アンケート |
| `lost.html` | ③ 失注者アンケート |
| `config.js` | **送信先（Salesforce）の設定**。最初はここだけ編集します |
| `assets/surveys.js` | **設問の内容**。質問や選択肢を変えるときはここを編集します |
| `assets/form.js` | 画面の表示・入力チェック・送信の処理（通常は編集不要） |
| `assets/style.css` | デザイン |
| `項目一覧.csv` | Salesforce 管理者向けの設問一覧（項目を作るときの参考） |
| `tools/make-csv.mjs` | 設問を変えたあと、項目一覧.csv を作り直すスクリプト（Node.js） |

## 公開のしかた

フォルダごと、Webサーバー（自社サイトのサーバーなど）にアップロードするだけです。
例：`https://lifedesign-kabaya.co.jp/survey/pre.html`

- 検索エンジンに出ないよう、全ページに `noindex` を設定しています。
- 必ず **https** のURLで公開してください（個人情報を送るため）。

## Salesforce との連携（2つの方法）

最初は `config.js` の `mode` が `"demo"`（送信しない）になっています。送信後の画面に「Salesforce に送られる内容」が表示されるので、確認に使えます。

### 方法A：Web-to-リード（Salesforce の標準機能・追加費用なし）

1. Salesforce の［設定］→「Web-to-リード」で、有効化して HTML を生成します。
2. 生成された HTML の中から、次の値を `config.js` に書き写します。
   - `oid` の値（00D から始まる組織ID）→ `webToLead.oid`
   - カスタム項目の名前（00N から始まるID）→ `fieldMap` の各設問IDの右側
3. `mode` を `"web-to-lead"` にします。
4. テスト時は `debug: true` と `debugEmail` を設定すると、Salesforce からデバッグメールが届きます。
5. Salesforce で「reCAPTCHA を要求」が有効な場合（新しい組織では必須）は、Google reCAPTCHA v2（チェックボックス）のキーを作って Salesforce に登録し、生成HTMLの `data-sitekey` と `keyname` を `webToLead.recaptcha` に書きます。reCAPTCHA の管理画面には、公開するドメイン（例：lifedesign-kabaya.co.jp）を登録してください。
6. リードの必須項目「会社名」には `webToLead.company` の値（初期値：個人のお客様）が入ります。
7. 都道府県・国が選択リストになっている組織では、都道府県は「説明」欄に入ります（`state_code` は数値コードのため）。

### 方法B：Account Engagement（旧 Pardot）のフォームハンドラー

Account Engagement を契約している場合は、フォームハンドラーを作成し、そのURLを `formHandler.endpoint` に入れて `mode` を `"form-handler"` にします。`fieldMap` の右側は、フォームハンドラーの項目名にします。

### 項目の対応（fieldMap）について

- `fieldMap` に書いていない設問の回答も、**すべて「説明（description）」欄にまとめて送られます**。カスタム項目を作る前でも、回答が漏れなく Salesforce に残ります。
- 集計や絞り込みに使いたい設問（例：入居希望時期、成約の可能性、失注理由）から順に、カスタム項目を作って `fieldMap` に追加するのがおすすめです。
- 複数選択の回答は `;` 区切りで送ります（「複数選択リスト」項目にそのまま入ります）。選択肢の文言は `項目一覧.csv` と同じにしてください。
- 来場後・失注者アンケートは、同じお客様のリードが重複して作られることがあります。Salesforce の重複ルール、またはフローで「メールアドレスが同じ既存のリード・取引先責任者」に回答をまとめる設定をしてください。
- アンケートの種類で区別したい場合は、選択リスト項目を1つ作り、その項目名を `surveyTypeField` に入れてください。

## 設問の変え方

`assets/surveys.js` を開き、`label`（質問文）や `options`（選択肢）を書き換えます。各項目の意味はファイルの先頭に書いてあります。
変更後は、ブラウザで表示を確認し、`node tools/make-csv.mjs` で項目一覧.csv を作り直してください（Salesforce の項目も合わせて変更が必要です）。

## お客様に送るURL

`index.html` の「お客様に送るURLを作る」で、展示場・担当者をあらかじめ入れたURLを作れます。
お名前やメールアドレスは、個人情報がURLに残らないよう、お客様ご自身に入力していただきます。

## 個人情報について

- 回答はお客様のブラウザから Salesforce に直接送られ、このフォーム自体には保存されません（ブラウザへの一時保存もしていません）。
- 同意欄から、自社のプライバシーポリシー（`config.js` の `privacyUrl`）にリンクしています。
- 年収・勤務先などの項目は任意です。答えにくい項目は空欄で送れます。
