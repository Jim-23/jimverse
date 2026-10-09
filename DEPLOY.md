


1. cd /var/www/jimverse
2. git pull
3. npm run build

If changes were made and they are not visible, you might need to hard reload the browser (CTRL+SHIFT+R)

## Field note images

Store field note images in `src/field-notes/photos/` and commit them with the
note. Do not put originals in `dist/`: it is Git-ignored and recreated by the
build.

In `data/field-notes.json`, `image` can be a single path string or an array of
`{ "src": "photos/example.png", "alt": "Image description" }` objects for a
click-to-expand gallery. Use `""` or omit `image` for notes without images.
Paths such as `photos/example.png` are relative to the `/field-notes/` page.