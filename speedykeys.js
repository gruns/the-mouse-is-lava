//
// Google SpeedyKeys - Keyboard Shortcuts for Google Search
//
// Ansgar Grunseid
// grunseid.com
// grunseid@gmail.com
//
// License: MIT
//

;(function () {
    const cl = console.log

    const ARROW_CLASSNAME = 'ansgar-shortcuts-selected-arrow'
    const SELECTED_CLASSNAME = 'ansgar-shortcuts-selected-result'

    function isInputFocused () {
        const activeEle = document.activeElement
        return ['input', 'textarea'].includes(activeEle.tagName.toLowerCase())
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

    function selectResult ($result) {
        $result.classList.add(SELECTED_CLASSNAME)
        
        const pos = $result.getBoundingClientRect()
        const docele = document.documentElement
        const isInViewport = (
            pos.top >= 0 &&
            pos.left >= 0 &&
            pos.right <= (window.innerWidth || docele.clientWidth) &&
            pos.bottom <= (window.innerHeight || docele.clientHeight))
        if (!isInViewport) {
            $result.scrollIntoView({
                behavior: 'smooth',  // 'smooth' -> smooth scrolling
                block: 'center',  // 'center' -> center vertically
                inline: 'nearest',  // 'nearest' -> visible horizontally
            })
        }

        const $arrow = document.createElement('div')
        $arrow.id = ARROW_CLASSNAME
        $arrow.style.width = '50px'
        $arrow.style.height = '50px'
        $arrow.style.backgroundColor = 'red'
        $arrow.style.position = 'absolute'
        $arrow.style.left = '-60px'
        $arrow.style.top = '50%'
        $arrow.style.transform = 'translateY(-50%)'

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
        //   is a search result parent ele:     div.g.Ww4FFb.vt6azd.tF2Cxc.asEBEc
        //   not a search result parent ele
        //     *unless* its the first element:  div.g
        //   not a search result parent ele:    div.liYKde.g.VjDLd
        let $eles = document.querySelectorAll('#search h3:first-of-type')
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

        const $main = document.getElementById('main')
        const $navbar = $main.querySelectorAll('[role="navigation"]')[1]
        const $items = $navbar.querySelectorAll('[role="listitem"]')
        
        for (const $item of $items) {
            const $a = $item.querySelector('a')
            const $div = $a.querySelector('div')
            const itemName = $div.textContent.trim().toLowerCase()

            if (itemName === name && $a.href) {  // no $a.href if same page
                window.location.href = $a.href
            }
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

    document.addEventListener('DOMContentLoaded', function() {
        if ($results.length === 0) {
            cl('loading initial results...')
            $results = getSearchResults()
            cl('results', results)
        }
    })
})()
