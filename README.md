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

## Draggable Items

index.html

```
 <script src="https://unpkg.com/get-size@2.0.3/get-size.js"></script>
    <script src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/packery.pkgd.js"></script>
    <script src="/js/draggabilly.js"></script>
```

js file

```
useEffect(() => {
console.log(window.getSize);
    var slidesElem = document.querySelector(".articles");
    var slideSize = getSize(document.querySelector(".article"));
    var pckry = new Packery(slidesElem, {
      rowHeight: slideSize.outerHeight,
    });
    console.log(slideSize, slideSize.outerHeight);
    // get item elements
    var itemElems = pckry.getItemElements();
    // for each item...
    for (var i = 0, len = itemElems.length; i < len; i++) {
      var elem = itemElems[i];
      // make element draggable with Draggabilly
      var draggie = new Draggabilly(elem, {
        axis: "y",
      });
      // bind Draggabilly events to Packery
      pckry.bindDraggabillyEvents(draggie);
    }

    // re-sort DOM after item is positioned
    pckry.on("dragItemPositioned", function (draggedItem) {
      console.log("done dragging", draggedItem);
      const $el = draggedItem.element;
      const currentIndex = Number($el.getAttribute("data-index"));
      const article = readlist.articles[currentIndex];
      const newIndex = Array.prototype.indexOf.call(
        draggedItem.layout.items.map((item) => item.element),
        $el
      );
      console.log(currentIndex, newIndex);
      handleArticleOrdering({
        articleUrl: article.url,
        currentIndex,
        newIndex,
        setReadlist,
      });
      // console.log();
      // var nextItem = pckry.items[index + 1];
      // if (nextItem) {
      //   slidesElem.insertBefore(draggedItem.element, nextItem.element);
      // } else {
      //   slidesElem.appendChild(draggedItem.element);
      // }
    });
  })
```
