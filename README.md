# Readlists

- Develop locally `netlify dev`
- Prod build `npm run build`

## ToDos

Enhancements

- [ ] Setup shared proptypes
- [ ] write more tests for stuff in utils
- [ ] abstract shared CSS for different pages
- [ ] edit HTML on client
- [ ] Double check epub export with the old readlist epubs
- [ ] handling multiple error toasts in successions
- [ ] Validation of readlists
- [ ] Responsive
- [ ] Dark mode CSS
- [ ] Transitions
- [ ] Address the @TODO items
- [ ] Refactor handlers to be at bottom of hooks

## Client-Side Epub Gen

http://idpf.org/epub/30/spec/epub30-overview.html#gloss-package-document

`mimetype`

```
application/epub+zip
```

`META-INF/container.xml`

```
<?xml version="1.0" encoding="UTF-8" ?>
<container
  version="1.0"
  xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile
      full-path="OEBPS/content.opf"
      media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
```

`OEBPS/content.opf`

TBD

```

```

Template for each chapter: (esape values). Named `0_slug-of-thing.xhtml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
  <head>
  <meta charset="UTF-8" />
  <title>{{title}}</title>
  <link rel="stylesheet" type="text/css" href="style.css" />
  </head>
<body>
  <h1>{{title}}</h1>
  <p><a href="{{url}}">{{url}}</a></p>
  {{content}}
</body>
</html>
```

For each chapter:

- Turn the html into DOM
- Parse the dom looking for <img>
- Download the image turn into array buffer
- Add the image to zip file
- convert the img's src to `images/GUID.png`

https://github.com/uuidjs/uuid
https://www.npmjs.com/package/jszip
https://github.com/cyrilis/epub-gen/tree/master/lib
https://gist.github.com/cyrilis/8d48eef37fbc108869ac32eb3ef97bca
