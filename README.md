# Readlists

Bringing back the spirit of the original Readlists service. [Check out the blog post for more deets](https://blog.jim-nielsen.com/2021/reintroducing-readlists/).

## Local Development

- Local dev `npm start`
- Prod build `npm run build`

## How it Works

[readlists.jim-nielsen.com](https://readlists.jim-nielsen.com) is merely a web front-end, a GUI, for creating and editing readlists.

At its core, a readlist is simply a JSON file. That JSON file’s structure is mostly what you get from [mercury-parser](https://github.com/postlight/mercury-parser).

```js
{
  "title": "The title of the readlist",
  "description": "A description of the readlist",
  "date_created": "2020-12-19T15:04:39.464Z",
  "date_modified": "2020-12-19T15:04:39.464Z",
  // Every article is just a Mercury parser object
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

- [ ] Maybe get to these someday
- [ ] Error boundary that clears localStorage
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
