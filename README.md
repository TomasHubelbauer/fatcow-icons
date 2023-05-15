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

## To-Do

### Consider allowing to associate custom aliases with the icons which

These would be taken into an account in search. This would be helpful with synonyms etc.
Storing it in the local storage should be sufficient.

### Consider aliasing icons with common synonyms

How to tell? Google Analytics for when a user adds a custom alias?

For now probably placing another file in the repo with the aliases.
Or just keeping it in the local storage.

### Add a screenshot and a script to generate one

### Enable ICO downloads by loading also the ICO ZIP and extracting from it

Consider maybe packaging them together so I only have to download a single
archive. This has the downside of necessary manual processing on new version
release, but seeing as new version of FatCow icons hasn't been released in
around forever, this should be a non-issue.

### Consider adding tabs for the `grey` and `colors` variants of the icons

I don't personally use them, but someone might find that useful. I've removed
their archives from the repository until this is done.

### Add custom icons made in this same style for the things I'm missing

Document which come from where.

This is maybe another point for loading multiple archives and not merging them.
Cloud load the PNG, the ICO and the custom archives and just add names and
dimensions as I find them in the archives.

### Check the dimension and type exists before creating a button for it

This is for when downloading ICOs works again. It will never be false with the
stock icons, but maybe I will add my own icons which won't have all four
combinations of type and dimension.

### Consider also adding Silk and Fugue icons or creating spin-off apps for them

- http://www.famfamfam.com/lab/icons/silk
- https://p.yusukekamiyamane.com

Keep these as separate ZIPs and show source by each icon's entry.

### Prepare an empty array buffer of the HEAD response size and a download map

Provide an abstraction for accessing slices of the buffer which either provides
if already downloaded as capture by the map (an array of ranges) or downloads,
marks in the map and then provides. This way icons remain cached once downloaded.

Maybe pull this out to its own library.

### Figure out why scrolling up causes the lines to jump in Firefox (not mobile)

It jumps in Firefox even though the icon div is always 40px, in hidden as well
as visible state. The same thing doesn't happen in mobile Safari, nor does it
happen in desktop Chrome.

### Indicate the image is loading by settings its `src` to loader first

Set `img src` to a loader image file URL and then in the issued fire and forget
promise's resolution handler, reset it to the actual blob URL.

This will avoid flashing empty boxes / img titles in boxes as fallback values.
