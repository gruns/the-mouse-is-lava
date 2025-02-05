const cl = console.log

// same as in background.js. TODO(ans): refactor
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

function closePopup () {
    chrome.runtime.sendMessage({ closePopup: true })
}

function selectPreviousMatch () {
    callInActiveTab('selectMatchFromOffset', -1)
}
function selectNextMatch () {
    callInActiveTab('selectMatchFromOffset', 1)
}

document.addEventListener('DOMContentLoaded', () => {
    const $findInput = document.getElementById('find-input')
    const $prevBtn = document.getElementById('prev-btn')
    const $nextBtn = document.getElementById('next-btn')
    const $closeBtn = document.getElementById('close-btn')

    // restore the previous value, if any
    const savedFindInputValue = localStorage.getItem('savedFindInputValue') || ''
    $findInput.value = savedFindInputValue
    if ($findInput.value) {
        $findInput.select()
        callInActiveTab('findInViewport', $findInput.value)
    }
    $findInput.focus()

    $findInput.addEventListener('input', () => {
        // persist the value across finds. like chrome's ctrl+f
        localStorage.setItem('savedFindInputValue', $findInput.value)

        const s = $findInput.value
        callInActiveTab('findInViewport', s)
    })
    $prevBtn.addEventListener('click', selectPreviousMatch)
    $nextBtn.addEventListener('click', selectNextMatch)
    $closeBtn.addEventListener('click', closePopup)

    document.addEventListener('keydown', function (event) {
        // TODO(ans): support meta and ctrl across windows and os x
        if (event.metaKey && event.key === 'j') {
            selectNextMatch()
        } else if (event.metaKey && event.key === 'k') {
            selectPreviousMatch()
        } else if (event.shiftKey && event.key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            selectPreviousMatch()
        } else if (event.key === 'Tab') {
            event.preventDefault()
            event.stopPropagation()
            selectNextMatch()
        } else if (event.key === 'Enter') {
            const ctrlDown = !!event.metaKey
            callInActiveTab('clickSelectedMatch', ctrlDown)
        }
    })
})

const port = chrome.runtime.connect({ name: 'popup' })
window.addEventListener('unload', () => {
    port.disconnect()  // triggers `onDisconnect` in the service worker
})
