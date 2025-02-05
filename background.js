const cl = console.log

// same as in popup.js. TODO(ans): refactor
function callInActiveTab (fnName, ...args) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length < 1) {
            return
        }

        const activeTabId = tabs[0].id
        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            args: [fnName, args],
            func: (fnName, args) => {
                const MIL = window.__MIL
                if (MIL && typeof MIL[fnName] === 'function') {
                    MIL[fnName](...args)
                } else {
                    console.error(`${fnName}() not found in window.__MIL`)
                }
            },
        }).catch(error => {
            console.log('Script injection execution failed:', error)
        })
    })
}

chrome.commands.onCommand.addListener(command => {
    if (command === 'openSearchBar') {
        chrome.action.openPopup()
    } else {
        callInActiveTab(command)
    }
})

chrome.runtime.onConnect.addListener(port => {
    if (port.name !== 'popup') {
        return
    }

    port.onDisconnect.addListener(() => {
        callInActiveTab('clearAllMatches')
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // there's no programmatic way to close the popup. so move focus to
    // the active tab, which auto-closes the popup
    if (message.closePopup) {
        chrome.windows.getCurrent(window => {
            chrome.windows.update(window.id, { focused: true })
        })
    }
})
