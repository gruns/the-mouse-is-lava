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
        // check ele size and basic CSS visibility
        const rect = $ele.getBoundingClientRect()
        const style = window.getComputedStyle($ele)
        if (style.display === 'none' || style.visibility === 'hidden' ||
            style.opacity === '0' || rect.width === 0 || rect.height === 0) {
            return false
        }

        return true
    }
    MIL.isVisible = isVisible

    function isOccluded ($ele) {
        // run a super simple occlusion check by making sure the four
        // corners + center of the element are visible and not
        // occluded. if the ele is outside the viewport,
        // elementFromPoint() doesn't work. so ignore those elements
        const rect = $ele.getBoundingClientRect()
        const points = [
            [Math.floor((rect.left + rect.right) / 2), Math.floor((rect.top + rect.bottom) / 2)],
            [Math.floor(rect.left + 1), Math.floor(rect.top + 1)],
            [Math.floor(rect.right - 1), Math.floor(rect.top + 1)],
            [Math.floor(rect.left + 1), Math.floor(rect.bottom - 1)],
            [Math.floor(rect.right - 1), Math.floor(rect.bottom - 1)]
        ]

        for (const [x, y] of points) {
            // $ele is off screen; skip occlusion check with
            // elementFromPoint()
            const w = window
            if (x < 0 || y < 0 || x > w.innerWidth || y > w.innerHeight) {
                continue
            }

            const topEl = document.elementFromPoint(x, y)
            if (!$ele.contains(topEl) && topEl !== $ele) {
                return true
            }
        }

        return false
    }
    MIL.isOccluded = isOccluded
})()
