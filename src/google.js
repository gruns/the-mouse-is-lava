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
    const d = document
    const cl = console.log
    const MIL = window.__MIL

    const ARROW_CLASSNAME = 'mouse-is-lava-selected-arrow'
    const SELECTED_CLASSNAME = 'mouse-is-lava-selected-result'

    function isBackgroundDark () {
        const bgColor = window.getComputedStyle(d.body).backgroundColor
        const rgb = bgColor.match(/\d+/g).map(Number)

        // calculate brightness using the standard luminance formula:
        //   brightness = (R * 0.299) + (G * 0.587) + (B * 0.114)
        const brightness = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);

        // brightness < 128 = dark, otherwise light
        const isDark = (brightness < 128)

        return isDark
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

    function getSelectedResult () {
        let $selected = d.getElementsByClassName(SELECTED_CLASSNAME)
        if ($selected.length) {
            $selected = $selected[0]
        } else {
            $selected = null
        }

        return $selected
    }

    function selectResult ($result, scrollIntoView=true) {
        $result.classList.add(SELECTED_CLASSNAME)

        if (scrollIntoView && !MIL.isInViewport($result)) {
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

        const $arrow = d.createElement('div')
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
        if ($toSelect) {
            selectResult($toSelect)
        }
    }

    function deselectResult ($result) {
        $result.classList.remove(SELECTED_CLASSNAME)

        const $h3 = $result.querySelector('h3')
        $h3.style.position = ''

        const $arrow = d.getElementById(ARROW_CLASSNAME)
        $arrow.remove()
    }

    function getSearchResults () {
        // search results have the 'g' class first and another class (that
        // likely changes a lot). the 'g' class must be the first class. examples:
        //   is a search result parent ele:    div.g.Ww4FFb.vt6azd.tF2Cxc.asEBEc
        //   not a search result parent ele
        //     *unless* its the first element: div.g
        //   not a search result parent ele:   div.liYKde.g.VjDLd
        let $eles = d.querySelectorAll('#search h3:first-of-type')

        // filter out results that are hidden or occluded, like behind
        // dropdowns in the `People also ask` and `Things to know`
        // sections
	      $eles = Array.from($eles).filter(
            $e => MIL.isVisible($e) && !MIL.isOccluded($e))

        // 2025/03/22: google parent elements stopped having the 'g'
        // class. so the filter() code below is no longer
        // needed. commented out instead of removed in case future
        // filtering code is needed
        //
        //$eles = Array.from($eles).filter(($ele, idx) => {
        //    const $parent = getNthParentEle($ele, 7)
        //    cl('$parent', $parent)
        //    const classList = $parent.classList
        //
        //    if (idx === 0 && classList.contains('g')) {  // first result
        //        return true
        //    } else if (classList.contains('g') && classList.length > 1) {
        //        return true
        //    }
        //
        //    return true
        //})
        const $searchResults = $eles.map($ele => getNthParentEle($ele, 2))

        return $searchResults
    }

    function loadSelectedResult (loadInNewTab = false) {
        const $selected = getSelectedResult()
        if (!$selected) {
            return
        }

        const url = $selected.querySelector('a').href
        if (loadInNewTab) {
            window.open(url, '_blank')
        } else {
            window.location.href = url
        }
    }

    function loadNavbarItem (name) {
        name = name.toLowerCase()

        let $items
        const $main = d.getElementById('main')
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

        if ($results.length > 0 && MIL.isInViewport($results[0])) {
            selectResult($results[0], false)  // dont scroll the page initially
        }

        d.addEventListener('keydown', function (event) {
            //if (MIL.isAnyInputFocused() || isAnyModifierKeyPressed(event)) {
            if (MIL.isAnyInputFocused()) {
                return
            }

            const $results = getSearchResults()
            handleKeypress($results, event)
        })
    }

    function handleKeypress ($results, event) {
        if (!isAnyModifierKeyPressed(event)) {
            if (event.key === 'ArrowDown' || event.key === 'j') {  // next result
                selectResultViaOffset($results, 1) 
            } else if (event.key === 'ArrowUp' || event.key === 'k') {  // previous
                selectResultViaOffset($results, -1)
            } else if (!event.metaKey && event.key === 'Enter') { // navigate to result
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
        } else if (event.metaKey) {  // ctrl pressed
            if (event.key === 'Enter') { // load in new tab
                loadSelectedResult(true)
            }
        }
    }

    if (d.readyState === 'loading') {  // page still loading
        d.addEventListener('DOMContentLoaded', onPageLoad)
    } else {  // DOM is already loaded
        onPageLoad()
    }
})()
