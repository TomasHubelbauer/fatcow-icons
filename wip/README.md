# ZIP

Demonstrates accessing a ZIP archive by fetching its end of central directory
record (at the end of the archive), finding the central directory structure
using it and parsing out the entry names from it, then issuing more requests to
get the raw entry data and using UZIP.js to extract the data.

This is demonstrated on the FatCow icons ZIP archive. It itself is an archive
packing 4 more ZIP archives within it. For simplicity, currently the embedded 4
archives are extracted manually first and only one of them is used for
demonstration purposes.

A fully general solution should be able to extract them first and then
recursively apply the same process on them, however for the intended purpose of
this (to enable downloading the individual icons by only serving the ZIPs using
GitHub Pages), it is better to extract them manually first anyway, because first
extracting the 4 embedded archives would essentially equal to downloading the
whole archive locally first, destroying any gains made by fetching the
individual icons' raw data individually.

## Running

`npx serve .`

## UZIP

UZIP comes from https://github.com/photopea/UZIP.js.
