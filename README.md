<h1 align="center">
  <img src="logo.png" width="320px" height="320px" alt="The Mouse is Lava">
</h1>


## The Mouse is Lava

The Mouse is Lava is a Chrome extension that adds general keyboard
shortcuts to navigate every website and specific keyboard shortcuts to
navigate specific, popular websites. Like Google

More sites and keyboard shortcuts are forthcoming. PRs always welcome to
add support for more sites! 🙌

Quickstart guide:

  - `Ctrl+i` to find links in the page and then `[enter]` to click or
    `[Ctrl+enter]` to control click them.
  - `Ctrl+b` focuses input boxes.
  - `j`+`k` and `[up-arrow]`+`[down-arrow]` navigate Google search
    results.


### Universal Shortcuts That Work on Every Site

- `Ctrl+b` - Focus the next (or first) visible, interactable, and
  not-`disabled` text input element. Eg the first interactable `<input
  type="text">` or `<textarea>` element in the viewport. Subsequent
  presses of `Ctrl+b` iterate through and focus the next text input
  element in the viewport.


### Google Search Results

For navigation of Google search results, VIM-style keybinds are
supported with `j` for next and `k` for previous. Arrow keys are also
supported.

Keyboard shortcuts:

- `j` and `<downArrow>` - Select next search result.
- `k` and `<upArrow>` - Select previous search result.
- `<enter>` - Navigate to the selected search result.
- `a` - Load the `All` results tab.
- `n` - Load the `News` results tab.
- `i` - Load the `Images` results tab.
- `v` - Load the `Videos` results tab.
- `s` - Load the `Shopping` results tab.
- `f` - Load the `Forums` results tab.
- `w` - Load the `Web` results tab.
- `m` - Load the `Maps` results tab.
- `b` - Load the `Books` results tab.
- `l` - Load the `Flights` results tab.


### Install

This extension will be published to the Chrome Extension store soon.

Until then, to install, download the contents of this repository to a
new directory, like with:

```
git clone https://github.com/gruns/the-mouse-is-lava
```

Then head to [chrome://extensions/](chrome://extensions/) and load this
extension, unpacked, by clicking `Load unpacked` in the upper left and
selecting the directory with this repository's contents.


### Known Improvements. PRs welcome! 🙌

- Add support for `Ctrl+B` to focus `<textarea>` elements, too. Not just
  `<input>` elements.

- Automatically click Google AI snippets `Show more` once the AI result
  is ready. Add this as an optional feature