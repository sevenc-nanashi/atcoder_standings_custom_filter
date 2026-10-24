// ==UserScript==
// @name         AtCoder Standings Custom Filter
// @version      0.1.1
// @author
// @license      ISC
// @updateURL    https://raw.githubusercontent.com/sevenc-nanashi/atcoder_standings_custom_filter/built/atcoder_standings_custom_filter.user.js
// @match        https://atcoder.jp/contests/*/standings*
// @sandbox      raw
// @inject-into  page
// ==/UserScript==

(function() {
	"use strict";
	var PREFIX = "[AtCoder Standings Custom Filter] ";
	var _global = globalThis;
	async function waitForElement(selector) {
		for (let i = 0; i < 100; i++) {
			const element = document.querySelector(selector);
			if (element) return element;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		throw new Error(`Element with selector "${selector}" not found`);
	}
	(async () => {
		console.log(PREFIX + "Waiting for toRegExp function...");
		for (let i = 0; i < 100; i++) {
			if (typeof _global.toRegExp !== "function") {
				await new Promise((resolve) => setTimeout(resolve, 100));
				continue;
			}
			console.log(PREFIX + "Monkey patching toRegExp function to support ASCF: prefix for user lists");
			const originalToRegexp = _global.toRegExp;
			const MAGIC = "ASCF:";
			_global.toRegExp = function(pattern) {
				if (pattern.startsWith(MAGIC)) {
					const combinedPattern = `^(${JSON.parse(pattern.slice(5)).map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`;
					return new RegExp(combinedPattern, "i");
				} else return originalToRegexp(pattern);
			};
			break;
		}
	})();
	(async () => {
		console.log(PREFIX + "Waiting for standings panel heading...");
		const element = await waitForElement("#standings-panel-heading .form-filter ");
		const button = document.createElement("button");
		button.textContent = "フィルタを読み込む";
		button.classList.add("form-control");
		button.addEventListener("click", (e) => {
			e.preventDefault();
			const presets = JSON.parse(localStorage.getItem("ascf-presets") || "{}");
			const dialog = document.createElement("dialog");
			dialog.style.width = "400px";
			dialog.style.padding = "20px";
			dialog.style.borderRadius = "8px";
			dialog.style.border = "1px solid #ccc";
			dialog.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
			dialog.innerHTML = `
      <h3>AtCoder Standings Custom Filter</h3>
      <p>ユーザー名を1行ずつ入力してください。</p>
      <textarea id="ascf-userList" class="form-control" rows="10" style="width: 100%; margin-top: 0"></textarea>
      <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
        <button id="ascf-cancelButton" class="form-control">キャンセル</button>
        <button id="ascf-okButton" class="form-control">OK</button>
      </div>
      <hr>
      <h4>プリセット</h4>
      <p>プリセットからユーザーリストを読み込むことができます。</p>
      <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
        <input type="text" id="ascf-presetInput" class="form-control" placeholder="プリセット名を入力">
        <button id="ascf-saveButton" class="form-control">保存</button>
      </div>
      <div style="width: 100%; margin-top: 10px; gap: 2px; display: grid; grid-template-columns: 1fr auto auto;" id="ascf-presetList">
      </div>
    `;
			function updatePresetList() {
				const presetList = dialog.querySelector("#ascf-presetList");
				presetList.innerHTML = "";
				if (Object.keys(presets).length === 0) {
					const row = document.createElement("div");
					row.style.gridColumn = "1 / span 3";
					row.innerHTML = `
          <td colspan="2" style="text-align: center; color: #888;">プリセットはありません。</td>
        `;
					presetList.appendChild(row);
				}
				for (const [name, users] of Object.entries(presets)) {
					const presetName = document.createElement("div");
					presetName.textContent = name;
					const loadButton = document.createElement("button");
					loadButton.textContent = "読込";
					loadButton.classList.add("form-control");
					loadButton.addEventListener("click", () => {
						const userListTextarea = dialog.querySelector("#ascf-userList");
						userListTextarea.value = users.join("\n");
					});
					const deleteButton = document.createElement("button");
					deleteButton.textContent = "削除";
					deleteButton.classList.add("form-control");
					deleteButton.addEventListener("click", () => {
						delete presets[name];
						localStorage.setItem("ascf-presets", JSON.stringify(presets));
						updatePresetList();
					});
					const row = document.createElement("div");
					row.style.display = "contents";
					row.appendChild(presetName);
					row.appendChild(loadButton);
					row.appendChild(deleteButton);
					presetList.appendChild(row);
				}
			}
			document.body.appendChild(dialog);
			dialog.showModal();
			const cancelButton = dialog.querySelector("#ascf-cancelButton");
			const okButton = dialog.querySelector("#ascf-okButton");
			const userListTextarea = dialog.querySelector("#ascf-userList");
			updatePresetList();
			const saveButton = dialog.querySelector("#ascf-saveButton");
			const presetInput = dialog.querySelector("#ascf-presetInput");
			saveButton.addEventListener("click", () => {
				const presetName = presetInput.value.trim();
				if (presetName.length === 0) {
					alert("プリセット名を入力してください。");
					return;
				}
				const userList = userListTextarea.value.split("\n").map((user) => user.trim()).filter((user) => user.length > 0);
				if (userList.length === 0) {
					alert("ユーザーリストが空です。");
					return;
				}
				presets[presetName] = userList;
				localStorage.setItem("ascf-presets", JSON.stringify(presets));
				updatePresetList();
				presetInput.value = "";
			});
			cancelButton.addEventListener("click", () => {
				dialog.close();
				document.body.removeChild(dialog);
			});
			okButton.addEventListener("click", (e) => {
				e.preventDefault();
				const userList = userListTextarea.value.split("\n").map((user) => user.trim()).filter((user) => user.length > 0);
				if (userList.length > 0) {
					const pattern = MAGIC + JSON.stringify(userList);
					const input = element.querySelector("#input-user");
					input.value = pattern;
					input.dispatchEvent(new Event("input", { bubbles: true }));
				}
				dialog.close();
				document.body.removeChild(dialog);
			});
		});
		console.log(PREFIX + "Adding button to standings panel heading...");
		element.appendChild(button);
	})();
})();
