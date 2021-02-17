# Readlists

- Local dev `npm start`
- Prod build `npm run build`

## How it Works

[readlists.jim-nielsen.com](https://readlists.jim-nielsen.com) is merely a web front-end, a GUI, for creating and editing readlists.

At its core, a readlist is simply a JSON file. That JSON file’s structure is mostly what you get from [mercury-parser](https://github.com/postlight/mercury-parser).

```json
{
  "title": "The title of the readlist",
  "description": "A description of the readlist",
  "date_created": "2020-12-19T15:04:39.464Z", // ISO8601 date
  "date_modified": "2020-12-19T15:04:39.464Z", // ISO8601 date
  "articles": [
    {
      "title": "Thunder (mascot)",
      "content": "... <p><b>Thunder</b> is the <a href=\"https://en.wikipedia.org/wiki/Stage_name\">stage name</a> for the...",
      "author": "Wikipedia Contributors",
      "date_published": "2016-09-16T20:56:00.000Z",
      "lead_image_url": null,
      "dek": null,
      "next_page_url": null,
      "url": "https://en.wikipedia.org/wiki/Thunder_(mascot)",
      "domain": "en.wikipedia.org",
      "excerpt": "Thunder Thunder is the stage name for the horse who is the official live animal mascot for the Denver Broncos",
      "word_count": 4677,
      "direction": "ltr",
      "total_pages": 1,
      "rendered_pages": 1
    }
  ]
}
```

## ToDos

- [ ] Error boundary that clears localStorage
- [ ] Responsive
- [ ] Setup shared proptypes
- [ ] write more tests for stuff in utils
- [ ] abstract shared CSS for different pages
- [ ] edit HTML on client
- [ ] Double check epub export with the old readlist epubs
- [ ] handling multiple error toasts in successions
- [ ] Validation of readlists
- [ ] Transitions
- [ ] Address the @TODO items in code
- [ ] Refactor handlers to be at bottom of hooks?
- [ ] Draggable sorting?
- [ ] support proxing requests, so CORS wouldn't have to be supported to pull in a remote readlist

## Notes to Self on Draggable Sorting

`index.html`

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
