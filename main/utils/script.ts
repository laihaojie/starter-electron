import fetch from 'node-fetch'

const GM = {
  GM_addStyle: `
  var GM_addStyle = function(css) {
    try {
        var style = document.createElement('style');
        style.textContent = css;
        (document.head || document.body || document.documentElement || document).appendChild(style);
    } catch (e) {
        console.log("Error: env: adding style " + e);
    }
  };
  `,
  unsafeWindow: `
  var unsafeWindow = (function () {
    var e = document.createElement('p')
    e.setAttribute('onclick', 'return window;')
    return e.onclick()
  })();
  `,
}

export function joinGrants(grants: string[]) {
  const code = grants.map((grant) => {
    return GM[grant]
  }).join('\n')

  return code
}

export interface IScript {
  name: string
  namespace: string
  version: string
  author: string
  icon: string
  downloadURL: string
  updateURL: string
  matches: string[]
  runAt: string
  code: string
  url: string
  grants: string[]
}

export function parseScript(js: string): IScript {
  const configStr = js.match(/\/\/ ==UserScript==([\s\S]*)\/\/ ==\/UserScript==/)?.[1] || ''

  const name = configStr.match(/@name\s+(.*)/)?.[1] || ''
  const namespace = configStr.match(/@namespace\s+(.*)/)?.[1] || ''
  const version = configStr.match(/@version\s+(.*)/)?.[1] || ''
  const author = configStr.match(/@author\s+(.*)/)?.[1] || ''
  const icon = configStr.match(/@icon\s+(.*)/)?.[1] || ''
  const downloadURL = configStr.match(/@downloadURL\s+(.*)/)?.[1] || ''
  const updateURL = configStr.match(/@updateURL\s+(.*)/)?.[1] || ''
  const matches = ([...configStr.matchAll(/@match\s+(.*)/g)].map(item => item[1]) || []).map((i) => {
    if (i === '*')
      return '<all_urls>'

    return i
  })
  const runAt = (configStr.match(/@run-at\s+(.*)/)?.[1] || '').replace('-', '_')
  const grants = [...configStr.matchAll(/@grant\s+(.*)/g)].map(item => item[1])

  const code = joinGrants(grants) + js.replace(/\/\/ ==UserScript==([\s\S]*)\/\/ ==\/UserScript==/, '')

  return {
    url: downloadURL,
    name,
    namespace,
    version,
    author,
    icon,
    downloadURL,
    updateURL,
    matches,
    runAt,
    code,
    grants,
  }
}

export async function getDebugScript() {
  const url = 'https://tm.lingman.tech/inspect.user.js'
  return fetch(`${url}?v=${Date.now()}`).then(res => res.text()).then(async (res) => {
    const script = parseScript(res)
    return script.code
  })
}

export function injectScriptOnce(webContents, scriptContent, scriptId = 'custom-injected-script') {
  const injectCode = `
    (function() {
      // 检查是否已经存在具有指定 ID 的脚本标签
      let existingScript = document.getElementById('${scriptId}');
      if (existingScript) {
        return;
      }

      // 创建并注入新的脚本标签
      const script = document.createElement('script');
      script.id = '${scriptId}';
      script.textContent = ${JSON.stringify(scriptContent)};
      document.head.appendChild(script);
    })();
  `

  // 执行注入逻辑
  webContents.executeJavaScript(injectCode)
}
