/*
 * アンケート画面の表示・入力チェック・送信
 * 設問は assets/surveys.js、送信先は config.js で設定します（このファイルは通常は編集不要）。
 */
(function () {
  "use strict";

  var key = document.body.getAttribute("data-survey");
  var survey = window.SURVEYS && window.SURVEYS[key];
  var config = window.SURVEY_CONFIG || { mode: "demo" };
  var root = document.getElementById("app");
  if (!survey || !root) return;

  var questions = survey.questions;
  var w2l = config.webToLead || {};
  var useCaptcha = config.mode === "web-to-lead" && !!(w2l.recaptcha && w2l.recaptcha.siteKey);
  var captchaId = null;
  var byId = {};
  questions.forEach(function (q) { byId[q.id] = q; });

  // ---------------------------------------------------------------- 部品
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === undefined || v === null || v === false) return;
      if (k === "text") node.textContent = v;
      else if (k === "class") node.className = v;
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  function valueOf(q) {
    var form = document.getElementById("survey-form");
    if (q.type === "checkbox") {
      return Array.prototype.map.call(form.querySelectorAll('input[name="' + q.id + '"]:checked'), function (i) { return i.value; });
    }
    if (q.type === "radio") {
      var r = form.querySelector('input[name="' + q.id + '"]:checked');
      return r ? r.value : "";
    }
    var f = form.elements[q.id];
    return f ? f.value.trim() : "";
  }

  function isEmpty(v) { return Array.isArray(v) ? v.length === 0 : !v; }

  function visible(q) {
    if (!q.showIf) return true;
    var v = valueOf(byId[q.showIf.id]);
    var vals = Array.isArray(v) ? v : [v];
    return vals.some(function (x) { return q.showIf.in.indexOf(x) !== -1; });
  }

  // ---------------------------------------------------------------- 画面
  function fieldFor(q) {
    var inputId = "q-" + q.id;
    var reqMark = q.required ? el("span", { class: "req", text: "必須" }) : el("span", { class: "opt", text: "任意" });
    var error = el("p", { class: "error", id: inputId + "-error", role: "alert" });
    var wrap;

    if (q.type === "radio" || q.type === "checkbox") {
      var list = el("div", { class: "choices" + (q.options.length > 6 ? " choices--grid" : "") });
      q.options.forEach(function (opt, i) {
        list.appendChild(
          el("label", { class: "choice" }, [
            el("input", { type: q.type, name: q.id, value: opt, id: inputId + "-" + i }),
            el("span", { text: opt }),
          ]),
        );
      });
      wrap = el("fieldset", { class: "field", "data-q": q.id, "aria-describedby": inputId + "-error" }, [
        el("legend", { class: "label" }, [el("span", { text: q.label }), reqMark]),
        q.type === "checkbox" ? el("p", { class: "hint", text: "当てはまるものをすべてお選びください" }) : null,
        list,
        error,
      ]);
    } else {
      var control;
      if (q.type === "textarea") {
        control = el("textarea", { id: inputId, name: q.id, rows: "3", maxlength: "1000", placeholder: q.placeholder });
      } else if (q.type === "select") {
        control = el("select", { id: inputId, name: q.id }, [el("option", { value: "", text: "選択してください" })].concat(
          q.options.map(function (o) { return el("option", { value: o, text: o }); }),
        ));
      } else {
        var type = { email: "email", tel: "tel", zip: "text", date: "date", number: "number" }[q.type] || "text";
        control = el("input", {
          id: inputId, name: q.id, type: type, maxlength: "200", placeholder: q.placeholder, autocomplete: q.autocomplete,
          inputmode: q.type === "tel" || q.type === "zip" ? "tel" : null,
        });
      }
      control.setAttribute("aria-describedby", inputId + "-error");
      wrap = el("div", { class: "field" + (q.half ? " field--half" : ""), "data-q": q.id }, [
        el("label", { class: "label", for: inputId }, [el("span", { text: q.label }), reqMark]),
        control,
        error,
      ]);
    }
    return wrap;
  }

  function render() {
    var header = el("header", { class: "site-header" }, [
      el("img", { class: "logo", src: "assets/logo.svg", alt: config.companyName || "", width: "265", height: "45" }),
    ]);
    var intro = el("section", { class: "intro" }, [
      el("h1", { text: survey.title }),
      el("p", { text: survey.lead }),
      el("p", { class: "meta", text: "所要時間の目安：約" + survey.minutes + "分　／　" }, [el("span", { class: "req", text: "必須" }), " の項目は入力が必要です"]),
    ]);
    if (config.mode === "demo") {
      intro.appendChild(el("p", { class: "demo-note", text: "【確認用】このフォームは送信されません（送信先が未設定です）。" }));
    }

    var form = el("form", { id: "survey-form", novalidate: true });
    var card = null;
    questions.forEach(function (q) {
      if (q.section || !card) {
        card = el("section", { class: "card" });
        if (q.section) card.appendChild(el("h2", { text: q.section }));
        form.appendChild(card);
      }
      if (q.note) card.appendChild(el("p", { class: "note", text: q.note }));
      card.appendChild(fieldFor(q));
    });

    var privacy = el("section", { class: "card card--agree" }, [
      el("label", { class: "choice choice--agree" }, [
        el("input", { type: "checkbox", id: "agree", name: "agree" }),
        el("span", {}, [
          el("a", { href: config.privacyUrl, target: "_blank", rel: "noopener", text: "プライバシーポリシー" }),
          "に同意して送信します",
        ]),
      ]),
      el("p", { class: "error", id: "agree-error", role: "alert" }),
      useCaptcha ? el("div", { class: "captcha", id: "captcha" }) : null,
      useCaptcha ? el("p", { class: "error", id: "captcha-error", role: "alert" }) : null,
    ]);
    form.appendChild(privacy);
    form.appendChild(el("div", { class: "actions" }, [el("button", { type: "submit", class: "submit", id: "submit", text: "回答を送信する" })]));
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    form.addEventListener("submit", onSubmit);

    var progress = el("div", { class: "progress", role: "progressbar", "aria-label": "回答の進み具合", "aria-valuemin": "0", "aria-valuemax": "100" }, [
      el("div", { class: "progress__bar", id: "progress-bar" }),
    ]);

    root.textContent = "";
    root.appendChild(header);
    root.appendChild(progress);
    root.appendChild(el("main", { class: "container" }, [intro, form]));
    root.appendChild(el("footer", { class: "site-footer", text: "© " + (config.companyName || "") }));
    prefill();
    update();
    if (useCaptcha) loadCaptcha();
  }

  // Salesforce の Web-to-リードで必須の reCAPTCHA（v2 チェックボックス）
  function loadCaptcha() {
    window.__onCaptchaLoad = function () {
      captchaId = window.grecaptcha.render("captcha", {
        sitekey: w2l.recaptcha.siteKey,
        callback: function () { document.getElementById("captcha-error").textContent = ""; },
      });
    };
    document.head.appendChild(el("script", { src: "https://www.google.com/recaptcha/api.js?onload=__onCaptchaLoad&render=explicit&hl=ja", async: true, defer: true }));
  }

  function captchaToken() {
    return captchaId !== null && window.grecaptcha ? window.grecaptcha.getResponse(captchaId) : "";
  }

  // 担当者がURLに付けた値（?last_name=…&email=…&visit_place=… など）を最初から入れておく
  function prefill() {
    var params = new URLSearchParams(location.search);
    var form = document.getElementById("survey-form");
    params.forEach(function (value, id) {
      var q = byId[id];
      if (!q || !value) return;
      value = value.slice(0, 200);
      if (q.type === "radio" || q.type === "checkbox") {
        Array.prototype.forEach.call(form.querySelectorAll('input[name="' + id + '"]'), function (i) { if (i.value === value) i.checked = true; });
      } else if (q.type === "select") {
        if (q.options.indexOf(value) !== -1) form.elements[id].value = value;
      } else if (form.elements[id]) {
        form.elements[id].value = value;
      }
    });
  }

  function update() {
    var total = 0;
    var done = 0;
    questions.forEach(function (q) {
      var node = document.querySelector('[data-q="' + q.id + '"]');
      var show = visible(q);
      node.hidden = !show;
      Array.prototype.forEach.call(node.querySelectorAll("input, select, textarea"), function (i) { i.disabled = !show; });
      if (show && q.required) {
        total++;
        if (!isEmpty(valueOf(q))) done++;
      }
    });
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("progress-bar").style.width = pct + "%";
    document.querySelector(".progress").setAttribute("aria-valuenow", String(pct));
  }

  // ---------------------------------------------------------------- 入力チェック
  function validate() {
    var first = null;
    questions.forEach(function (q) {
      var msg = "";
      if (visible(q)) {
        var v = valueOf(q);
        if (q.required && isEmpty(v)) msg = q.type === "radio" || q.type === "checkbox" || q.type === "select" ? "選択してください" : "入力してください";
        else if (v && q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "メールアドレスの形式をご確認ください";
        else if (v && q.type === "tel" && !/^[0-9０-９\-－()（）+ ]{10,16}$/.test(v)) msg = "電話番号をご確認ください";
        else if (v && q.type === "zip" && !/^[0-9０-９]{3}[-－]?[0-9０-９]{4}$/.test(v)) msg = "郵便番号をご確認ください（例：700-0000）";
      }
      var node = document.querySelector('[data-q="' + q.id + '"]');
      node.classList.toggle("has-error", !!msg);
      document.getElementById("q-" + q.id + "-error").textContent = msg;
      if (msg && !first) first = node;
    });
    var agree = document.getElementById("agree");
    var agreeMsg = agree.checked ? "" : "プライバシーポリシーへの同意が必要です";
    document.getElementById("agree-error").textContent = agreeMsg;
    if (agreeMsg && !first) first = agree.closest(".card");
    if (useCaptcha) {
      var capMsg = captchaToken() ? "" : "「私はロボットではありません」にチェックしてください";
      document.getElementById("captcha-error").textContent = capMsg;
      if (capMsg && !first) first = document.getElementById("captcha");
    }
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      var focusable = first.querySelector("input, select, textarea");
      if (focusable) focusable.focus({ preventScroll: true });
    }
    return !first;
  }

  // ---------------------------------------------------------------- 送信
  function answers() {
    var out = [];
    questions.forEach(function (q) {
      if (!visible(q)) return;
      var v = valueOf(q);
      if (!isEmpty(v)) out.push({ q: q, value: v });
    });
    return out;
  }

  // 「説明」欄に入れる、全回答のまとめ（Salesforce側にカスタム項目がなくても回答が残るように）
  function summary(list) {
    var labels = config.surveyTypeLabels || {};
    var lines = ["【" + (labels[key] || survey.title) + "】" + new Date().toLocaleString("ja-JP")];
    list.forEach(function (a) {
      lines.push("■" + a.q.label);
      lines.push(Array.isArray(a.value) ? a.value.join("、") : a.value);
    });
    return lines.join("\n").slice(0, 31000);
  }

  function post(endpoint, fields) {
    return new Promise(function (resolve) {
      var name = "sf-target-" + Date.now();
      var frame = el("iframe", { name: name, title: "送信", hidden: true });
      document.body.appendChild(frame);
      var f = el("form", { method: "POST", action: endpoint, target: name, "accept-charset": "UTF-8", hidden: true });
      Object.keys(fields).forEach(function (k) { f.appendChild(el("input", { type: "hidden", name: k, value: fields[k] })); });
      document.body.appendChild(f);
      var done = false;
      var finish = function () { if (!done) { done = true; resolve(); } };
      frame.addEventListener("load", finish);
      setTimeout(finish, 10000);
      f.submit();
    });
  }

  function buildFields(list) {
    var map = (config.fieldMap && config.fieldMap[key]) || {};
    var fields = {};
    list.forEach(function (a) {
      var target = map[a.q.id];
      if (target) fields[target] = Array.isArray(a.value) ? a.value.join(";") : a.value;
    });
    fields.description = summary(list);
    if (config.surveyTypeField) fields[config.surveyTypeField] = (config.surveyTypeLabels || {})[key] || key;
    return fields;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    var btn = document.getElementById("submit");
    btn.disabled = true;
    btn.textContent = "送信しています…";
    var list = answers();
    var fields = buildFields(list);
    var job;
    if (config.mode === "web-to-lead" && config.webToLead && config.webToLead.oid) {
      var w = config.webToLead;
      fields.oid = w.oid;
      if (w.company) fields.company = w.company;
      if (useCaptcha) {
        fields.captcha_settings = JSON.stringify({ keyname: w.recaptcha.keyName, fallback: "true", orgId: w.oid, ts: String(Date.now()) });
        fields["g-recaptcha-response"] = captchaToken();
      }
      fields.retURL = location.href.split("#")[0].split("?")[0] + "#sent";
      if (w.leadSource) fields.lead_source = w.leadSource;
      if (w.debug) { fields.debug = "1"; fields.debugEmail = w.debugEmail || ""; }
      job = post(w.endpoint, fields);
    } else if (config.mode === "form-handler" && config.formHandler && config.formHandler.endpoint) {
      job = post(config.formHandler.endpoint, fields);
    } else {
      job = Promise.resolve();
    }
    job.then(function () { thanks(fields); });
  }

  function thanks(fields) {
    var main = document.querySelector("main");
    main.textContent = "";
    main.appendChild(el("section", { class: "intro thanks" }, [
      el("h1", { text: "ご回答ありがとうございました" }),
      el("p", { text: key === "lost"
        ? "貴重なご意見をありがとうございました。今後のサービス改善に役立ててまいります。"
        : "いただいた内容をもとに、担当者よりご案内いたします。今後ともよろしくお願いいたします。" }),
    ]));
    if (config.mode === "demo") {
      var pre = el("pre", { class: "demo-output" });
      pre.textContent = Object.keys(fields).map(function (k) { return k + "：\n" + fields[k]; }).join("\n\n");
      main.appendChild(el("section", { class: "card" }, [
        el("h2", { text: "【確認用】Salesforce に送られる内容" }),
        el("p", { class: "note", text: "設定（config.js）で送信先を指定すると、この内容が送られます。" }),
        pre,
      ]));
    }
    document.getElementById("progress-bar").style.width = "100%";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Web-to-リードの完了後、iframe 内でこのページが開いた場合は何もしない
  if (location.hash === "#sent" && window.top !== window.self) return;
  render();
})();
