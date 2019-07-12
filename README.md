# FatCow Icons

[**LIVE**](https://tomashubelbauer.github.io/fatcow-icons)

This is a set of icons from FatCow (v3.9.2 - latest) made available as a web app.

The original home of these icons is at https://www.fatcow.com/free-icons.

**I am allowed to host these icons here by the FatCow support.**

The reason this exists is because downloading the archive from Fatcow and unpacking
it just to grab a single icon every now and then is a major pain for me.

This web app makes it much more convenient.

To run locally, use `npx serve .` so that `fetch` works (disallowed in `file://`).

**Note:** `google_adsense` is renamed to `google_sense` and `avertising` is to
`vertising` to avoid having the images blocked by uBlock Origin!

## To-Do

Consider detecting scroll direction (up ro down) and rendering the virtual list
window in that direction as well to make scrolling up appear a bit nicer.

Consider allowing to associate custom aliases with the icons which would be taken
into an account in search. This would be helpful with synonyms etc. Storing it
in the local storage should be sufficient.

Consider aliasing icons with common synonyms (how to tell? Google Analytics for
when a user adds a custom alias?) by default by placing another file in the repo
with the aliases or adding it to `filenames.txt`.

Figure out why the multi-column layout doesn't kick in in iOS Safari in landscape
despite the CSS media query looking correct.
