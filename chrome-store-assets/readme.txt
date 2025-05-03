The Mouse is Lava (MIL) is an open source Chrome extension that adds keyboard shortcuts to navigate websites with your keyboard. The goal of the extension is to minimize the number of times you have to touch the mouse. Don't touch that mouse; it's lava.

MIL includes both shortcuts that work on every website and shortcuts for specific, popular websites. Like Google.

Quickstart shortcuts:
========================================================================
- [Ctrl+B] to focus the first, or next, <input> and/or <textarea> element on the page.
- [Ctrl+I] to find links in the page. It's like Ctrl-F but only finds links. Then [enter] to click them.
- On Google search results pages, [j]+[k] and [downArrow]+[upArrow] select the next, and previous, Google search results respectively. Then [enter] to click them.
- All keyboard shortcuts are customizable in chrome://extensions/shortcuts.


Universal Shortcuts That Work on Every Site
========================================================================
[Ctrl+B] - Focuses the first, or next, visible, interactable, and not-disabled <input> element in the visible page. I.e. the first interactable <input type="text"> element. <textarea> elements aren't supported yet, but will be.

The first press of Ctrl+B focuses the first input element in the visible page. Subsequent presses of Ctrl+B iteratively focus successive <input> elements in the visible page.

You can change the default Ctrl+B keybind that focuses the first input element in chrome://extensions/shortcuts.

[Ctrl+I] - Opens the link search box to find clickable links in the visible page that contain your search query text. Think of the link search box like Chrome's Ctrl+F Find-in-Page tool except it only finds clickable links. Why? It's much faster to type a few characters of the link you want to click than to move your hand to the mouse, move the mouse to the link, click, and move your hand back.

When the Ctrl+I link search box is open, these additional keybinds become active:

Ctrl+J and Ctrl+K - Jump to the next and previous link, respectively. (VIM style keybinds)
Tab and Shift+Tab - Jump to the next and previous link, respectively.
Enter - Click the currently selected link. E.g. open the selected link in the same tab.
Ctrl+Enter - Control+click the currently selected link. E.g. open the selected link in a new tab.
link-finder.gif

You can change the default Ctrl+I keybind that opens the link search box in chrome://extensions/shortcuts.


Google.com Shortcuts
========================================================================
MIL adds keyboard shortcuts to navigate Google search results. While on google.com search pages, these keyboard shortcuts become active:

[j] and [k] - Jump to the next and previous search result, respectively. (VIM style keybinds)
[downArrow] and [upArrow] - Jump to the next and previous search result, respectively.
[enter] - Navigate to the selected search result.
[Ctrl+Enter] - Load the selected search result in a new tab.
By default, the first Google search result is automatically selected on page load so you can just press [enter], or [Ctrl+Enter], to navigate to the first result.

Google Navbar Shortcuts
MIL adds keyboard shortcuts to navigate between the different category tabs. While on a Google.com search results page, these keyboard shortcuts become available to navigate:

a - Load the All results tab.
n - Load the News results tab.
i - Load the Images results tab.
v - Load the Videos results tab.
s - Load the Shopping results tab.
f - Load the Forums results tab.
w - Load the Web results tab.
m - Load the Maps results tab.
b - Load the Books results tab.
l - Load the Flights results tab.


Improvements
========================================================================
Do you have an idea for a useful keyboard shortcut not yet included in MIL? Please open an issue or a PR on the GitHub repo at https://github.com/gruns/the-mouse-is-lava! 🙌 PRs always welcome.
