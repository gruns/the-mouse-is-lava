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
    const marker = new Mark(document)

    const FOCUSED_CLASSNAME = 'mouse-is-lava-focused'
    const FOCUSED_STYLE_BOX_SHADOW = '0 0 0 0.7em rgba(255, 40, 0, 0.8)'
    const FOCUSED_STYLE_TRANSITION_TIMER = 0.1  // seconds
    const FOCUSED_STYLE_TRANSITION = (
        `box-shadow ${FOCUSED_STYLE_TRANSITION_TIMER}s linear`)
    const MULTI_VALUE_CSS_PROPERTIES = [  // properties with multiple values
        'transition', 'box-shadow', 'animation', 'background', 'transform']
    const FOCUSED_STYLE_BORDER_RADIUS = '6px'

    const CSS = `
        mark.selected {
            background: orange;
        }`

    ////////////////////////////////////////////////////////////////////
    // Focus Input Elements
    ////////////////////////////////////////////////////////////////////
    function backupAndSetCss($ele, propName, newValue) {
        if (!$ele.hasOwnProperty('__MIL_origStyles')) {
            $ele.__MIL_origStyles = {}
        }

        if (!$ele.__MIL_origStyles.hasOwnProperty(propName)) {
            const computedValue = getComputedStyle($ele)[propName]
            $ele.__MIL_origStyles[propName] = $ele.style[propName] !== '' 
                ? $ele.style[propName] 
                : computedValue
        }

        if (MULTI_VALUE_CSS_PROPERTIES.includes(propName)) {
            let currentValue = (
                $ele.style[propName] || getComputedStyle($ele)[propName])
            const valuesArray = currentValue
                  .split(',')
                  .map(v => v.trim())
                  .filter(v => v !== '')

            if (!valuesArray.includes(newValue)) {  // avoid duplicates
                valuesArray.push(newValue)
                $ele.style[propName] = valuesArray.join(', ')
            }
        } else {
            $ele.style[propName] = newValue
        }
    }

    function restoreOriginalCss ($ele, propName=null) {
        if (!$ele.__MIL_origStyles) {
            return
        }

        if (propName) {
            if ($ele.__MIL_origStyles.hasOwnProperty(propName)) {
                const originalValue = $ele.__MIL_origStyles[propName]

                if (MULTI_VALUE_CSS_PROPERTIES.includes(propName)) {
                    let currentValues = $ele.style[propName] || getComputedStyle($ele)[propName]
                    let valuesArray = currentValues.split(',').map(v => v.trim())
                    valuesArray = valuesArray.filter(v => v !== originalValue)
                    $ele.style[propName] = valuesArray.length ? valuesArray.join(', ') : ''
                } else {  // restore entire value
                    $ele.style[propName] = originalValue
                }

                delete $ele.__MIL_origStyles[propName]
                
                if (Object.keys($ele.__MIL_origStyles).length === 0) {
                    delete $ele.__MIL_origStyles
                }
            }
        } else {  // restore all properties
            Object.entries($ele.__MIL_origStyles).forEach(([property, originalValue]) => {
                $ele.style[property] = originalValue
            })

            delete $ele.__MIL_origStyles
        }
    }

    function focusElement ($ele) {
        $ele.focus()

        // move the cursor to the end of the input
        const length = $ele.value.length
        $ele.setSelectionRange(length, length)

        $ele.classList.add(FOCUSED_CLASSNAME)

        backupAndSetCss($ele, 'transition', FOCUSED_STYLE_TRANSITION)
        backupAndSetCss($ele, 'boxShadow', FOCUSED_STYLE_BOX_SHADOW)
        backupAndSetCss($ele, 'borderRadius', FOCUSED_STYLE_BORDER_RADIUS)

        $ele.__MIL_onBlur = () => { unfocusElement($ele) }
        $ele.addEventListener('blur', $ele.__MIL_onBlur)
    }

    function unfocusElement ($ele) {
        $ele.classList.remove(FOCUSED_CLASSNAME)

        restoreOriginalCss($ele, 'boxShadow')
        setTimeout(
            FOCUSED_STYLE_TRANSITION_TIMER,
            () => {
                restoreOriginalCss($ele, 'transition')
                restoreOriginalCss($ele, 'borderRadius')
            })

        delete $ele.__MIL_onBlur
    }

    function findAllInteractableTextElements () {
        // TODO(ans): support input elements in iframes, too. ex:
        // https://wallet.uber.com/payment-profile/add/gift-card
        const $allInputs = Array.from(d.querySelectorAll('input'))
        const $allTextareas = Array.from(d.querySelectorAll('textarea'))

        // types of <input>s with text entry and thus should be selected
        // and iterated through
        //
        // TODO(ans): should type='password' be selected with ctrl+b?
        const textInputTypes = [
            'text', 'search', 'email', 'url', 'tel', 'password']

        // TODO(ans): include input and texarea elements that may be
        // occluded in iteration. eg inputs on amazon's order history
        // page https://www.amazon.com/gp/css/order-history when the top
        // <input> is focused and the autocompletion popup occludes the
        // order search <input> ele
        const $inputs = $allInputs.filter($input =>
            MIL.isVisible($input) &&
            MIL.isInViewport($input) &&
            textInputTypes.includes($input.type) &&
            !$input.disabled)
        const $textareas = $allTextareas.filter($textarea =>
            MIL.isVisible($textarea) &&
            MIL.isInViewport($textarea) &&
            !$textarea.disabled)

        // combine <input> and <textarea> eles and sort to maintain DOM
        // order
        const $allElements = [...$inputs, ...$textareas].sort((a, b) => {
            const position = a.compareDocumentPosition(b)
            return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        })

        return $allElements
    }

    function focusNextInputElement () {
        let $inputs = findAllInteractableTextElements()

        if (!$inputs) {
            return null
        }

        let i = $inputs.indexOf(d.activeElement) || 0
        let $eleToFocus = $inputs[i+1]
        if (i + 1 >= $inputs.length) {
            $eleToFocus = $inputs[0]
        }

        if (!$eleToFocus) {
            return null
        }

        const $elesToUnfocus = d.getElementsByClassName(FOCUSED_CLASSNAME)
        for (const $eleToUnfocus of $elesToUnfocus) {
            unfocusElement($eleToUnfocus)
        }

        focusElement($eleToFocus)

        return $eleToFocus
    }
    MIL.focusNextInputElement = focusNextInputElement

    ////////////////////////////////////////////////////////////////////
    // Navigate via Find
    ////////////////////////////////////////////////////////////////////

    // IMPORTANT: this function can't detect 'click' listeners added
    // with $ele.addEventListener('click', ...). there's no way to test
    // for those in JS, unfortunately 😕; getEventListeners() is a
    // non-standard JS API only available in chrome dev tools
    function firstClickableAncestor ($ele, depth=7) {
        if (!$ele || depth < 1) {
            return null
        }

        if (getComputedStyle($ele).cursor === 'pointer'
            || $ele.tagName === 'A'
            || $ele.tagName === 'BUTTON'
            || ($ele.tagName === 'INPUT' && $ele.type === 'submit')
            || ($ele.nodeType === Node.ELEMENT_NODE
                && $ele.hasAttribute('onclick'))) {
            return $ele
        }

        return firstClickableAncestor($ele.parentElement, depth - 1)
    }

    function firstClickableBelow ($textNode) {
        // get all elements under the center of the text node, excluding
        // the text node itself
        const range = d.createRange()
        range.selectNode($textNode)
        const rect = range.getBoundingClientRect()
        const centerX = rect.left + (rect.width / 2)
        const centerY = rect.top + (rect.height / 2)
        const $elesAtPoint = Array.from(d.elementsFromPoint(centerX, centerY))
            .filter($ele => $ele !== $textNode)

        // find the first clickable, visible element, iterating from the
        // top to bottom by the visual stacking order
        for (const $ele of $elesAtPoint) {
            const $clickableAncestor = firstClickableAncestor($ele, 1)
            if ($clickableAncestor && MIL.isVisible($clickableAncestor)
                && MIL.isInViewport($clickableAncestor)) {
                return $clickableAncestor
            }
        }
        
        return null
    }

    function findInViewport (query) {
        marker.unmark()

        marker.mark(query, {
            accuracy: 'partially',
            acrossElements: true,
            separateWordSearch: false,
            filter: ($foundNode, foundTerm, totalCounter, counter) => {
                const isTextNodeClickable = !!firstClickableBelow($foundNode)
                return isTextNodeClickable
            },
            done: () => {
                selectMatchFromOffset(0)
            },
        })
    }
    MIL.findInViewport = findInViewport

    function clearAllMatches () {
        marker.unmark()
    }
    MIL.clearAllMatches = clearAllMatches

    function removeDuplicateEles ($eles) {
        const seen = new Set()
        return $eles.filter(
            $ele => seen.has($ele.outerHTML) ? false : seen.add($ele.outerHTML))
    }

    function selectMatchFromOffset (offset) {
        const $marks = document.querySelectorAll('mark')
        let $matches = Array.from($marks).filter($e =>
            MIL.isVisible($e) && MIL.isInViewport($e))
            //MIL.isVisible($e) && !MIL.isOccluded($e) && MIL.isInViewport($e))
        const $selected = document.querySelector('mark.selected')

        if ($matches.length === 0) {
            return
        } else if (!$selected) {  // select first match
            $matches[0].classList.add('selected')
            return
        } else if ($selected) {
            $selected.classList.remove('selected')
        }

        // filter down to just the clickable elements of matches, as
        // those are what should be iterated through
        const $matchesToClickables = $matches.map($e => firstClickableBelow($e))

        const $clickables = [...new Set($matchesToClickables)]
        const $currentClickable = firstClickableBelow($selected)
        const $currentClickableIdx = $clickables.indexOf($currentClickable) || 0
        const $clickableIdxToSelect = (
            ($currentClickableIdx + offset + $clickables.length)
                % $clickables.length)
        const $clickableToSelect = $clickables[$clickableIdxToSelect]

        // select the first match in $clickableToSelect
        for (let i = 0; i < $matches.length; i++) {
            if ($matchesToClickables[i] === $clickableToSelect) {
                const $match = $matches[i]
                $match.classList.add('selected')
                break
            }
        }
    }
    MIL.selectMatchFromOffset = selectMatchFromOffset

    function clickSelectedMatch (ctrl=false) {
        const $selected = document.querySelector('mark.selected')
        if (!$selected) {
            return
        }

        const $currentClickable = firstClickableBelow($selected)
        if (!$currentClickable) {
            return
        }

        if (!ctrl) {
            $currentClickable.click()
        } else {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                ctrlKey: true,
                metaKey: true  // ctrl on os x
            })
            $currentClickable.dispatchEvent(event)
        }
    }
    MIL.clickSelectedMatch = clickSelectedMatch

    function onPageLoad () {
        // no document.head in format like .svg, .txt, .csv, .log, etc,
        // CSS rules cant be added to the page via document.head. and it
        // makes no sense to add them to the 'page', either, as its not
        // an HTML page
        if (!document || !document.head) {
            return
        }

        const $style = document.createElement('style')
        $style.textContent = CSS
        document.head.appendChild($style)
    }

    if (d.readyState === 'loading') {  // page still loading
        d.addEventListener('DOMContentLoaded', onPageLoad)
    } else {  // DOM is already loaded
        onPageLoad()
    }
})()
