//
// The Mouse is Lava - Keyboard Shortcuts for the Web
//
// Ansgar Grunseid
// grunseid.com
// grunseid@gmail.com
//
// License: MIT
//

;(function () {
    const cl = console.log

    const ARROW_CLASSNAME = 'the-mouse-is-lava-selected-arrow'
    const SELECTED_CLASSNAME = 'the-mouse-is-lava-selected-result'

    function isInputFocused () {
        const activeEle = document.activeElement
        return ['input', 'textarea'].includes(activeEle.tagName.toLowerCase())
    }

    function isInViewport ($ele) {
        const $docEle = document.documentElement
        const pos = $ele.getBoundingClientRect()
        const inViewport = (
            pos.top >= 0 &&
            pos.left >= 0 &&
            pos.right <= (window.innerWidth || $docEle.clientWidth) &&
            pos.bottom <= (window.innerHeight || $docEle.clientHeight))

        return inViewport
    }

    function getSelectedResult () {
        let $selected = document.getElementsByClassName(SELECTED_CLASSNAME)
        if ($selected.length) {
            $selected = $selected[0]
        } else {
            $selected = null
        }

        return $selected
    }

    function isBackgroundDark () {
        const bgColor = window.getComputedStyle(document.body).backgroundColor
        const rgb = bgColor.match(/\d+/g).map(Number)

        // calculate brightness using the standard luminance formula:
        //   brightness = (R * 0.299) + (G * 0.587) + (B * 0.114)
        const brightness = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);

        // brightness < 128 = dark, otherwise light
        const isDark = (brightness < 128)

        return isDark
    }

    function selectResult ($result, scrollIntoView=true) {
        $result.classList.add(SELECTED_CLASSNAME)

        if (scrollIntoView && !isInViewport($result)) {
            $result.scrollIntoView({
                behavior: 'auto',  // 'smooth' for smooth scrolling, 'auto' instant
                block: 'center',  // 'center' -> center vertically
                inline: 'nearest',  // 'nearest' -> visible horizontally
            })
        }

        let arrowColor = '#222'  // black arrow on light backgrounds
        if (isBackgroundDark()) {
            arrowColor = '#fff'  // light arrow on dark backgrounds
        }

        const $arrow = document.createElement('div')
        $arrow.id = ARROW_CLASSNAME

        $arrow.style.top = '50%'
        $arrow.style.left = '-40px'
        $arrow.style.width = '0'
        $arrow.style.height = '0'
        $arrow.style.position = 'absolute'
        $arrow.style.transform = 'translateY(-50%)'
        $arrow.style.borderTop = '15px solid transparent'
        $arrow.style.borderBottom = '15px solid transparent'
        $arrow.style.borderLeft = `30px solid ${arrowColor}`

        const $h3 = $result.querySelector('h3')
        $h3.style.position = 'relative'
        $h3.appendChild($arrow)
    }

    function selectResultViaOffset ($results, offset) {  // +1 next, -1 previous
        const $selected = getSelectedResult()

        let idx = null
        if ($selected) {
            idx = $results.indexOf($selected)
        }

        if ($selected) {
            deselectResult($selected)
        }

        let $toSelect
        if (idx == null) {
            $toSelect = $results[0]
        } else {
            idx += offset
            idx = Math.max(Math.min(idx, $results.length - 1), 0)  // clamp
            $toSelect = $results[idx]
        }

        selectResult($toSelect)
    }

    function deselectResult ($result) {
        $result.classList.remove(SELECTED_CLASSNAME)

        const $h3 = $result.querySelector('h3')
        $h3.style.position = ''

        const $arrow = document.getElementById(ARROW_CLASSNAME)
        $arrow.remove()
    }

    function isAnyModifierKeyPressed (event) {
        return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
    }

    function getNthParentEle($ele, n) {
        if (n === 0 || !$ele.parentElement) {
            return $ele
        }
        return getNthParentEle($ele.parentElement, n - 1)
    }

    function getSearchResults () {
        // search results have the 'g' class first and another class (that
        // likely changes a lot). the 'g' class must be the first class. examples:
        //   is a search result parent ele:    div.g.Ww4FFb.vt6azd.tF2Cxc.asEBEc
        //   not a search result parent ele
        //     *unless* its the first element: div.g
        //   not a search result parent ele:   div.liYKde.g.VjDLd
        let $eles = document.querySelectorAll('#search h3:first-of-type')

        // filter out `People also ask` search results, whose root
        // element has the data-sgrd="true" attribute
        $eles = Array.from($eles).filter($ele => {
            return !$ele.closest('[data-sgrd="true"]')
        })

        $eles = Array.from($eles).filter(($ele, idx) => {
            const $parent = getNthParentEle($ele, 7)
            const classList = $parent.classList

            if (idx === 0 && classList.contains('g')) {  // first result
                return true
            } else if (classList.contains('g') && classList.length > 1) {
                return true
            }

            return false
        })
        const $searchResults = $eles.map($ele => getNthParentEle($ele, 7))

        return $searchResults
    }

    function loadSelectedResult () {
        const $selected = getSelectedResult()
        if (!$selected) {
            return
        }

        const $a = $selected.querySelector('a')
        window.location.href = $a.href
    }

    function loadNavbarItem (name) {
        name = name.toLowerCase()

        let $items
        const $main = document.getElementById('main')
        // sometimes the first [role="navigation"] element is the
        // navbar. sometimes it isnt. I'm not sure when or why it
        // changes. but either way, be robust in finding the navbar so
        // iterate through all the returned [role="navigation"] elements
        // and select the first one with <a> children, which are the
        // 'All', 'Images', etc anchors
        const $navigations = $main.querySelectorAll('[role="navigation"]')
        let $navbar = $navigations[0]
        for (const $navigation of $navigations) {
            $anchors = $navigation.querySelectorAll('a')
            if ($anchors.length > 0) {
                $navbar = $navigation
                break
            }
        }

        if (!$anchors) {
            throw new Error('No NavBar found. Update the CSS selectors.')
        }

        for (const $a of $anchors) {
            const $div = $a.querySelector('div')
            const itemName = $div.textContent.trim().toLowerCase()

            if (itemName === name && $a.href) {  // no $a.href if same page
                window.location.href = $a.href
            }
        }
    }

    function onPageLoad () {
        const $results = getSearchResults()

        if ($results.length > 0 && isInViewport($results[0])) {
            selectResult($results[0], false)  // dont scroll the page initially
        }
    }

    function handleKeypress ($results, event) {
        if (event.key === 'ArrowDown' || event.key === 'j') {  // next result
            selectResultViaOffset($results, 1) 
        } else if (event.key === 'ArrowUp' || event.key === 'k') {  // previous
            selectResultViaOffset($results, -1)
        } else if (event.key === 'Enter') { // navigate to result
            loadSelectedResult()
        } else if (event.key === 'a') {  // All
            loadNavbarItem('All')
        } else if (event.key === 'n') {  // News
            loadNavbarItem('News')
        } else if (event.key === 'i') {  // Images
            loadNavbarItem('Images')
        } else if (event.key === 'v') {  // Videos
            loadNavbarItem('Videos')
        } else if (event.key === 's') {  // Shopping
            loadNavbarItem('Shopping')
        } else if (event.key === 'f') {  // Forums
            loadNavbarItem('Forums')
        } else if (event.key === 'w') {  // Web
            loadNavbarItem('Web')
        } else if (event.key === 'm') {  // Maps
            loadNavbarItem('Maps')
        } else if (event.key === 'b') {  // Books
            loadNavbarItem('Books')
        } else if (event.key === 'l') {  // Flights
            loadNavbarItem('Flights')
        }
    }

    document.addEventListener('keydown', function (event) {
        if (isInputFocused() || isAnyModifierKeyPressed(event)) {
            return
        }

        const $results = getSearchResults()
        handleKeypress($results, event)
    })

    if (document.readyState === 'loading') {  // page still loading
        document.addEventListener('DOMContentLoaded', onPageLoad)
    } else {  // DOM is already loaded
        onPageLoad()
    }
})()
