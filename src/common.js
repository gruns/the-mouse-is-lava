//
// The Mouse is Lava - Keyboard Shortcuts for the Web
//
// Ansgar Grunseid
// grunseid.com
// grunseid@gmail.com
//
// License: MIT
//

window.__MIL = {}

;(function () {
    const cl = console.log
    const MIL = window.__MIL

    function isAnyInputFocused () {
        const $activeEle = document.activeElement
        return ['input', 'textarea'].includes($activeEle.tagName.toLowerCase())
    }
    MIL.isAnyInputFocused = isAnyInputFocused

    // returns true if at least half of the element is visible both
    // horizontally and vertically. otherwise false
    function isInViewport ($ele) {
        const $docEle = document.documentElement
        const pos = $ele.getBoundingClientRect()

        const eleHeight = pos.bottom - pos.top
        const eleWidth = pos.right - pos.left

        const visibleHeight = (
            Math.min(window.innerHeight || $docEle.clientHeight, pos.bottom)
                - Math.max(0, pos.top))
        const visibleWidth = (
            Math.min(window.innerWidth || $docEle.clientWidth, pos.right)
                - Math.max(0, pos.left))

        const atLeastHalfVisible = (
            (visibleHeight >= eleHeight / 2) && (visibleWidth >= eleWidth / 2))

        return atLeastHalfVisible
    }
    MIL.isInViewport = isInViewport

    function isVisible ($ele) {
        // TODO(ans): improve this function to verify that the element
        // is _fully_ visible. dont just check the display and
        // visibility properties; also make sure there aren't any
        // elements occluding/above the element. that is, the user can
        // actually see and interact with the element
        if ($ele.style.display != 'none' &&
            $ele.style.visibility != 'hidden') {
            return true
        }
        return false
    }
    MIL.isVisible = isVisible
})()
