/*
 * アンケートの設問定義（来場前・来場後・失注者）
 *
 * 設問を変えたいときは、このファイルだけを編集します。
 *   id       … 回答の名前（Salesforce との対応付けに使う。英数字とアンダーバー）
 *   label    … 質問文
 *   type     … text / email / tel / zip / number / textarea / radio / checkbox / select / date
 *   options  … 選択肢（radio / checkbox / select）
 *   required … true なら必須
 *   showIf   … { id: "別の設問のid", in: ["表示する条件の回答", ...] } 条件付きで表示
 *   section  … 見出し（その設問から新しいまとまりになる）
 */
(function () {
  "use strict";

  var SHOWROOMS = [
    "岡山中央展示場", "岡山南展示場01", "岡山南展示場02", "岡山南展示場 構造Lab.", "プレステージ城東展示場01", "プレステージ城東展示場02",
    "問屋町テラス住宅展示場", "OHKハウジング展示場", "RSKハウジングプラザ展示場", "RSKハウジングプラザGRANZ展示場",
    "倉敷中央展示場01", "倉敷中央展示場02", "倉敷CLT展示場", "ハウジングモール倉敷展示場", "水島展示場", "児島モデルハウス",
    "総社展示場", "津山中央展示場", "ふれあいホームタウンかんなべ展示場", "ふれあいホームタウンみどりまち展示場", "みどりまち展示場 構造Lab.",
    "住宅宣言ふくやま展示場", "福山中央展示場", "尾道展示場",
    "広島西展示場", "広島西展示場 構造Lab.", "安佐南展示場", "東広島ハウジングフェア展示場", "東雲モデルハウス",
    "高松中央展示場", "クラシコ丸亀展示場", "愛媛新聞住宅公園パル展示場",
    "神戸新聞ハウジングセンター姫路展示場", "ABCハウジング加古川住宅公園展示場",
    "hit大野城住宅展示場", "TNC住宅展示場きてミテ！小倉展示場",
    "まちかどモデルハウス", "ライフデザイン・カバヤ不動産 店舗", "完成見学会・お施主様邸見学会", "オンライン相談", "その他",
  ];

  var INCOME = ["～299万円", "300万円～", "400万円～", "500万円～", "600万円～", "700万円～", "800万円～", "900万円～", "1,000万円～"];

  // お名前・連絡先（3つのアンケート共通の部品）
  var name = [
    { id: "last_name", label: "姓", type: "text", required: true, half: true, autocomplete: "family-name", section: "お客様情報" },
    { id: "first_name", label: "名", type: "text", required: true, half: true, autocomplete: "given-name" },
  ];

  window.SURVEYS = {
    // ---------------------------------------------------------------- 来場前
    pre: {
      title: "ご来場前アンケート",
      lead: "ご来場いただく前に、家づくりのご希望やお悩みをお聞かせください。当日はお客様に合わせたご提案をご用意いたします。",
      minutes: 5,
      questions: name.concat([
        { id: "kana", label: "フリガナ", type: "text", required: true, placeholder: "例）カバヤ タロウ" },
        { id: "phone", label: "電話番号", type: "tel", required: true, autocomplete: "tel", placeholder: "例）090-1234-5678" },
        { id: "email", label: "メールアドレス", type: "email", required: true, autocomplete: "email" },
        { id: "zip", label: "郵便番号", type: "zip", autocomplete: "postal-code", placeholder: "例）700-0000", half: true },
        { id: "state", label: "都道府県", type: "text", autocomplete: "address-level1", half: true },
        { id: "city", label: "市区町村", type: "text", autocomplete: "address-level2" },
        { id: "street", label: "番地・建物名", type: "text", autocomplete: "street-address" },
        { id: "visit_place", label: "ご来場予定の会場", type: "select", options: SHOWROOMS, required: true },

        { id: "household_age", label: "世帯主様の年齢層をお選びください。", type: "radio", options: ["20代", "30代", "40代", "50代", "60代以上"], required: true, section: "ご検討の状況" },
        { id: "motivation", label: "家づくり・住まいの購入をご検討いただくに至った理由をお選びください。", type: "checkbox", required: true,
          options: ["今の家が古くなってきた", "今の家が手狭になってきた", "家賃の支払いがもったいない", "結婚のため", "出産・子どもの成長のため", "転勤のため", "通勤・通学に不便", "その他"] },
        { id: "motivation_other", label: "きっかけについて、よろしければ詳しくお聞かせください。", type: "textarea" },
        { id: "desired_timing", label: "ご入居希望時期をお選びください。", type: "radio", options: ["なるべく早く", "半年～1年以内", "1年～2年以内", "2年以上先", "未定"], required: true },
        { id: "desired_type", label: "現在ご検討中の住まいの種類をお選びください。", type: "checkbox",
          options: ["注文住宅（土地未定）", "注文住宅（土地あり・建て替え）", "分譲住宅・建売", "中古一戸建て", "新築マンション", "中古マンション", "持ち家のリフォーム"] },
        { id: "current_land", label: "土地はお持ちですか？", type: "radio", options: ["はい", "いいえ", "候補の土地がある"], required: true },
        { id: "other_makers", label: "当社以外で気になっている住宅会社があればお書きください。", type: "text", placeholder: "例）〇〇ホーム、△△工務店" },

        { id: "hope_residence", label: "どんなお家に住みたいかお選びください。", type: "checkbox", section: "家づくりのご希望",
          options: ["暖かい家", "光熱費の安い家", "おしゃれな家", "メンテナンスの楽な家", "地震・災害に強い家", "家事がしやすい家", "その他"] },
        { id: "hope_residence_other", label: "その他の場合は詳しくお聞かせください。", type: "textarea", showIf: { id: "hope_residence", in: ["その他"] } },
        { id: "worries", label: "家づくりでお悩みの点をお選びください。", type: "checkbox",
          options: ["資金計画", "間取り", "住宅の性能", "土地探し", "住宅ローン", "住宅会社選び", "その他"] },
        { id: "worries_other", label: "その他の場合は詳しくお聞かせください。", type: "textarea", showIf: { id: "worries", in: ["その他"] } },
        { id: "floor_plan", label: "ご希望の間取りをお選びください。", type: "radio",
          options: ["1LDK", "2LDK", "3LDK", "4LDK", "5LDK以上", "二世帯（同居型）", "二世帯（分離型）", "未定"] },
        { id: "adults", label: "一緒にお住まいになる大人の人数", type: "radio", options: ["1人", "2人", "3人", "4人", "5人以上"], half: true },
        { id: "children", label: "一緒にお住まいになるお子様の人数", type: "radio", options: ["0人", "1人", "2人", "3人", "4人以上"], half: true },
        { id: "pet", label: "ペットと一緒にお住まいになる予定はありますか？", type: "radio", options: ["はい", "いいえ", "未定"] },

        { id: "current_category", label: "現在のお住まいは賃貸ですか、持ち家ですか？", type: "radio", options: ["賃貸", "持ち家", "実家・その他"], section: "現在のお住まい" },
        { id: "current_rent", label: "月々の家賃（駐車場込み）を教えてください。", type: "text", placeholder: "例）7万円", showIf: { id: "current_category", in: ["賃貸"] } },
        { id: "current_form", label: "現在の住まいの形態をお選びください。", type: "radio", options: ["一戸建て", "アパート・マンション", "社宅・官舎", "実家", "その他"] },
        { id: "utility_cost", label: "現在の年間光熱費（電気・ガス・灯油の合計）の目安を教えてください。", type: "text", placeholder: "例）年間25万円くらい" },

        { id: "monthly_payment", label: "家づくりの費用で、月々のお支払いはどれくらいをお考えですか？", type: "text", placeholder: "例）8万円くらい",
          section: "資金計画の参考に（任意）", note: "住宅ローンのシミュレーションなど、資金計画のご提案に使います。答えにくい項目は空欄で構いません。" },
        { id: "occupation_type", label: "世帯主様のご職業", type: "radio", options: ["正社員", "役員", "公務員", "自営業", "派遣社員", "契約社員", "パート・アルバイト", "その他"] },
        { id: "industry", label: "ご勤務先の業種", type: "select",
          options: ["農業・林業・漁業", "建設業", "製造業", "電気・ガス・熱供給・水道業", "情報通信業", "運輸業", "卸売・小売業", "金融・保険業", "不動産業", "飲食店・宿泊業", "医療・福祉", "教育・学習支援", "サービス業", "公務", "その他"] },
        { id: "years_of_service", label: "ご勤続年数", type: "radio", options: ["1年未満", "1年以上2年未満", "2年以上"] },
        { id: "household_head_income", label: "世帯主様の年収", type: "radio", options: INCOME.slice(0, 6) },
        { id: "household_income", label: "世帯合計（配偶者様を含めた合計）の年収", type: "radio", options: INCOME },

        { id: "expectations", label: "今後、家づくりで期待すること・見てみたいものをお選びください。", type: "checkbox", section: "今後について",
          options: ["建築中の現場を見てみたい", "完成した建物を見てみたい", "住宅の性能を体感したい", "実際に住んでいる方のお話を聞いてみたい", "地盤調査をしてほしい", "ライフプラン・資金計画の相談をしたい", "土地探しを手伝ってほしい"] },
        { id: "referral", label: "ご紹介者様はいらっしゃいますか？", type: "radio", options: ["はい", "いいえ"] },
        { id: "referral_name", label: "ご紹介者様のお名前", type: "text", showIf: { id: "referral", in: ["はい"] } },
        { id: "comments", label: "当日聞いてみたいことなど、ご自由にお書きください。", type: "textarea" },
      ]),
    },

    // ---------------------------------------------------------------- 来場後
    post: {
      title: "ご来場後アンケート",
      lead: "本日はご来場いただき、ありがとうございました。今後のご案内をより良いものにするため、ご感想をお聞かせください。",
      minutes: 3,
      questions: name.concat([
        { id: "email", label: "メールアドレス", type: "email", required: true, autocomplete: "email" },
        { id: "visit_place", label: "ご来場いただいた会場をお選びください。", type: "select", options: SHOWROOMS, required: true },
        { id: "staff", label: "担当者名（分かれば）", type: "text" },

        { id: "satisfaction", label: "本日のご見学はいかがでしたか？", type: "radio", options: ["非常に満足", "満足", "普通", "不満", "非常に不満"], required: true, section: "本日のご感想" },
        { id: "satisfaction_text", label: "上記の理由を簡単にお聞かせください。", type: "text" },
        { id: "good_points", label: "本日のご見学・担当者のご案内を通じて、特に良かった点をお選びください。", type: "checkbox",
          options: ["家づくりのコンセプトや考え方", "デザインの良さ", "性能（耐震・断熱など）", "間取りの自由度", "家と費用のバランス", "土地情報の豊富さ", "担当者の対応", "特になし"] },
        { id: "good_points_text", label: "上記の理由を簡単にお聞かせください。", type: "text" },
        { id: "building_points", label: "ご見学いただいた建物で、特に良かった点をお選びください。", type: "checkbox",
          options: ["内装のデザイン", "外観のデザイン", "間取りが参考になった", "設備・仕様", "住み心地（暖かさ・明るさなど）", "特になし"] },
        { id: "building_points_text", label: "上記の理由を簡単にお聞かせください。", type: "text" },

        { id: "staff_rating", label: "本日ご案内した担当者はいかがでしたか？", type: "radio", options: ["とても良かった", "良かった", "悪かった", "とても悪かった"], required: true, section: "担当者について" },
        { id: "staff_good", label: "良かった点として当てはまるものをお選びください。", type: "checkbox", showIf: { id: "staff_rating", in: ["とても良かった", "良かった"] },
          options: ["対応が親切だった", "知識が豊富で、質問に丁寧に答えてくれた", "私たちの要望をよく理解し、それに合わせた提案をしてくれた", "建物の特徴や利点を分かりやすく説明してくれた", "見学した建物以外の選択肢も教えてくれた", "その他"] },
        { id: "staff_good_text", label: "上記の理由を簡単にお聞かせください。", type: "text", showIf: { id: "staff_rating", in: ["とても良かった", "良かった"] } },
        { id: "staff_bad", label: "良くなかった点として当てはまるものをお選びください。", type: "checkbox", showIf: { id: "staff_rating", in: ["悪かった", "とても悪かった"] },
          options: ["対応が冷たかった・無愛想だった", "知識が不足していて、質問に適切に答えてもらえなかった", "説明が分かりにくかった", "私たちの要望を理解してもらえなかった", "事前の連絡がなかった", "その他"] },
        { id: "staff_bad_text", label: "上記の理由を簡単にお聞かせください。", type: "text", showIf: { id: "staff_rating", in: ["悪かった", "とても悪かった"] } },

        // 当社の最大の強み「CLTハイブリッド構法」の伝わり方を、性能全般とは分けて聞く
        { id: "clt_impression", label: "当社独自の「CLTハイブリッド構法」のご説明を聞いて、どのように感じましたか？", type: "radio", required: true, section: "CLTハイブリッド構法について",
          options: ["とても魅力的に感じた", "魅力的に感じた", "どちらとも言えない", "あまり魅力を感じなかった", "説明を聞いていない・よく分からなかった"] },
        { id: "clt_good", label: "CLTハイブリッド構法で、特に良いと感じた点をお選びください。", type: "checkbox",
          showIf: { id: "clt_impression", in: ["とても魅力的に感じた", "魅力的に感じた", "どちらとも言えない"] },
          options: ["地震に強い（繰り返しの地震への強さ）", "柱や壁の少ない大空間・間取りの自由度", "木の質感・ぬくもり", "長く安心して住み続けられる", "将来の資産価値", "その他"] },
        { id: "clt_concerns", label: "CLTハイブリッド構法について、気になった点・不安に感じた点があればお選びください。", type: "checkbox",
          options: ["価格・費用が気になる", "まだ新しい構法で実績が気になる", "説明が難しかった", "他の構法（一般的な木造など）との違いが分からなかった", "メンテナンスが気になる", "特になし", "その他"] },
        { id: "clt_text", label: "CLTハイブリッド構法について、ご意見やもっと知りたいことがあればお書きください。", type: "text" },

        { id: "expectation_change", label: "当社の住まいへの期待はいかがですか？", type: "radio", options: ["非常に増した", "増した", "変わらない", "減った", "非常に減った"], required: true, section: "今後について" },
        { id: "expectation_change_text", label: "上記の理由を簡単にお聞かせください。", type: "text" },
        { id: "purchase_possibility", label: "今後、当社に家づくりをお任せいただける可能性はありますか？", type: "radio", options: ["非常に高い", "高い", "まだ分からない", "低い", "非常に低い"], required: true },
        { id: "purchase_possibility_text", label: "上記の理由を簡単にお聞かせください。", type: "text" },
        { id: "contact_preference", label: "今後、見学のご案内や情報提供をご希望されますか？", type: "radio", options: ["希望する", "違う担当者でもう一度話を聞いてみたい", "希望しない"], required: true },
        { id: "concerns", label: "当社をご検討いただく上で、気がかりな点があればお選びください。", type: "checkbox",
          options: ["他に良い土地があった", "価格が高い", "提案力・デザインが心配", "担当者の対応が不安", "建物の品質・性能が不安", "資料・説明が分かりにくい", "会社の信頼性が不安", "特になし", "その他"] },
        { id: "open_questions", label: "今回のご見学で、まだ解決していない疑問やご要望はありますか？", type: "checkbox",
          options: ["資金計画・予算の立て方", "家づくりの流れ", "土地の探し方", "住宅ローン", "税制優遇（税金）", "光熱費", "当社の建物の特徴", "工法・構造", "間取り", "デザイン", "展示場・モデルハウスのご案内", "会社概要", "アフターメンテナンス", "その他"] },
        { id: "next_meeting_date", label: "次回のお打ち合わせのご希望日があればお知らせください。", type: "date" },
        { id: "next_meeting_topics", label: "次回のお打ち合わせで聞いてみたいことがあればお書きください。", type: "textarea" },
      ]),
    },

    // ---------------------------------------------------------------- 失注者
    lost: {
      title: "家づくりに関するアンケート",
      lead: "このたびは当社をご検討いただき、誠にありがとうございました。今後のサービス改善のため、率直なご意見をお聞かせいただけますと幸いです。営業のご連絡には使用いたしません。",
      minutes: 2,
      questions: name.concat([
        { id: "email", label: "メールアドレス", type: "email", required: true, autocomplete: "email" },

        { id: "decision_status", label: "現在の家づくりのご状況をお選びください。", type: "radio", required: true, section: "ご検討の結果",
          options: ["他社で建てる（購入する）ことに決めた", "分譲住宅・建売を購入した", "中古住宅・マンションを購入した", "家づくり自体を見送った", "時期を延期した", "その他"] },
        { id: "chosen_company_type", label: "お決めになった住宅会社の種類をお選びください。", type: "radio",
          showIf: { id: "decision_status", in: ["他社で建てる（購入する）ことに決めた", "分譲住宅・建売を購入した", "中古住宅・マンションを購入した"] },
          options: ["大手ハウスメーカー", "地元の工務店", "ローコスト住宅メーカー", "設計事務所", "分譲住宅・建売の会社", "不動産会社（中古）", "その他"] },
        { id: "chosen_company_name", label: "差し支えなければ、会社名をお聞かせください。", type: "text",
          showIf: { id: "decision_status", in: ["他社で建てる（購入する）ことに決めた", "分譲住宅・建売を購入した", "中古住宅・マンションを購入した"] } },
        { id: "decision_factors", label: "最終的な決め手になったことをお選びください。", type: "checkbox",
          options: ["価格・総額", "月々の支払い", "土地が見つかった・土地とセットだった", "間取り・プランの提案", "デザイン", "住宅性能（断熱・耐震など）", "担当者の対応", "会社の信頼性・知名度", "保証・アフターサービス", "打ち合わせ・提案のスピード", "その他"] },

        { id: "lost_reasons", label: "当社をお選びいただけなかった主な理由をお選びください。", type: "checkbox", required: true, section: "当社について",
          options: ["価格が高かった", "提案（間取り・プラン）が希望と合わなかった", "デザインが好みと合わなかった", "性能・仕様が希望と合わなかった", "CLTハイブリッド構法の良さが分からなかった・必要性を感じなかった", "担当者の対応に不満があった", "連絡・提案のスピードが遅かった", "土地の提案が少なかった", "資金計画の説明が分かりにくかった", "会社の信頼性に不安があった", "特にない（他社がより良かった）", "その他"] },
        { id: "lost_reasons_text", label: "上記について、よろしければ詳しくお聞かせください。", type: "textarea" },
        { id: "lost_stage", label: "当社が候補から外れたのは、どの段階でしたか？", type: "radio",
          options: ["展示場・モデルハウスの見学後", "資金計画のご説明の段階", "間取り・プランのご提案の段階", "お見積もりの段階", "土地探しの段階", "ご契約の直前", "覚えていない"] },
        { id: "price_gap", label: "お見積もりの金額は、お決めになった会社と比べてどうでしたか？", type: "radio",
          options: ["当社が300万円以上高かった", "当社が100～300万円高かった", "当社が100万円未満高かった", "ほぼ同じ", "当社の方が安かった", "比較していない・分からない"] },
        { id: "staff_rating", label: "当社の担当者の対応はいかがでしたか？", type: "radio", options: ["とても良かった", "良かった", "普通", "悪かった", "とても悪かった"] },
        { id: "improvement", label: "当社に「もっとこうしてほしかった」ということがあればお聞かせください。", type: "textarea" },
        { id: "future_info", label: "今後、リフォーム・メンテナンスや不動産などのご案内をお送りしてもよろしいですか？", type: "radio", options: ["希望する", "希望しない"], required: true, section: "最後に" },
      ]),
    },
  };
})();
