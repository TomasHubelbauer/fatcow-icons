# FatCow Icons

[**LIVE**](https://tomashubelbauer.github.io/fatcow-icons)

This is a set of icons from FatCow (v3.9.2 - latest) made available as a web app.

The original home of these icons is at https://www.fatcow.com/free-icons.

**I am allowed to host these icons here by the FatCow support.**

The reason this exists is because downloading the archive from Fatcow and unpacking
it just to grab a single icon every now and then is a major pain for me.

This web app makes it much more convenient.

## Running

To run locally, use `npx serve .` so that `fetch` works (disallowed in `file://`).

## UZIP

UZIP comes from https://github.com/photopea/UZIP.js.

## To-Do

### Consider allowing to associate custom aliases with the icons which

These would be taken into an account in search. This would be helpful with synonyms etc.
Storing it in the local storage should be sufficient.

### Consider aliasing icons with common synonyms

(how to tell? Google Analytics for when a user adds a custom alias?) by default by
placing another file in the repo with the aliases or adding it to `filenames.txt`.

### Figure out why the multi-column layout doesn't kick in in iOS Safari in landscape

This is despite the CSS media query looking correct.

### Add a screenshot and a script to generate one

Update the form to do the search inline and update the URL using `replaceState` to
not pollute history.

### Extract the `inflareRaw` logic from UZIP and tailor it to this application

### Enable ICO downloads by loading also the ICO ZIP and extracting from it

Consider maybe packaging them together so I only have to download a single
archive. This has the downside of necessary manual processing on new version
release, but seeing as new version of FatCow icons hasn't been released in
around forever, this should be a non-issue.

### Consider adding tabs for the `grey` and `colors` variants of the icons

I don't personally use them, but someone might find that useful. I've removed
their archives from the repository until this is done.
