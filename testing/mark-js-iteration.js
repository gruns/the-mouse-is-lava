document.addEventListener('DOMContentLoaded', function() {
    // the input field
    var input = document.querySelector("input[type='search']"),
        // clear button
        clearBtn = document.querySelector("button[data-search='clear']"),
        // prev button
        prevBtn = document.querySelector("button[data-search='prev']"),
        // next button
        nextBtn = document.querySelector("button[data-search='next']"),
        // the context where to search
        content = document.querySelector(".content"),
        // NodeList to save <mark> elements
        results = [],
        // the class that will be appended to the current
        // focused element
        currentClass = "current",
        // top offset for the jump (the search bar)
        offsetTop = 50,
        // the current index of the focused element
        currentIndex = 0

    /**
     * Jumps to the element matching the currentIndex
     */
    function jumpTo() {
        if (results.length) {
            var current = results[currentIndex]
            results.forEach(el => el.classList.remove(currentClass))
            if (current) {
                current.classList.add(currentClass)
                var position = current.getBoundingClientRect().top + window.scrollY - offsetTop
                window.scrollTo({ top: position, behavior: 'smooth' })
            }
        }
    }

    /**
     * Searches for the entered keyword in the
     * specified context on input
     */
    input.addEventListener('input', function() {
        var searchVal = this.value.trim()
        content.querySelectorAll('mark').forEach(mark => {
            var parent = mark.parentNode
            parent.replaceChild(document.createTextNode(mark.textContent), mark)
        })

        if (searchVal) {
            var regex = new RegExp(searchVal, 'gi')
            var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false)
            var nodes = []
            while (walker.nextNode()) {
                nodes.push(walker.currentNode)
            }
            
            nodes.forEach(node => {
                var matches = node.nodeValue.match(regex)
                if (matches) {
                    var markWrapper = document.createElement('span')
                    markWrapper.innerHTML = node.nodeValue.replace(regex, match => `<mark>${match}</mark>`)
                    node.replaceWith(...markWrapper.childNodes)
                }
            })
        }
        
        results = Array.from(content.querySelectorAll('mark'))
        currentIndex = 0
        jumpTo()
    })

    /**
     * Clears the search
     */
    clearBtn.addEventListener('click', function() {
        content.querySelectorAll('mark').forEach(mark => {
            var parent = mark.parentNode
            parent.replaceChild(document.createTextNode(mark.textContent), mark)
        })
        input.value = ''
        input.focus()
    })

    /**
     * Next and previous search jump to
     */
    function navigateResults(forward) {
        if (results.length) {
            currentIndex += forward ? 1 : -1
            if (currentIndex < 0) {
                currentIndex = results.length - 1
            }
            if (currentIndex > results.length - 1) {
                currentIndex = 0
            }
            jumpTo()
        }
    }

    nextBtn.addEventListener('click', function() {
        navigateResults(true)
    })

    prevBtn.addEventListener('click', function() {
        navigateResults(false)
    })
})
