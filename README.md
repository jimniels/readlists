# Readlists

Bringing back the spirit of the original Readlists service. [Check out the blog post for more deets](https://blog.jim-nielsen.com/2021/reintroducing-readlists/).

## Local Development

- Local dev `npm start`
- Prod build `npm run build`

## How it Works

[readlists.jim-nielsen.com](https://readlists.jim-nielsen.com) is merely a web front-end, a GUI, for creating and editing a Readlist.

At its core, a readlist is simply a [JSON feed](https://www.jsonfeed.org/) whose contents are largely populated with what you get from [mercury-parser](https://github.com/postlight/mercury-parser).

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "My Readlist",
  "description": "A custom description of the Readlist",
  "items": [
    {
      "id": "https://en.wikipedia.org/wiki/Thunder_(mascot)",
      "url": "https://en.wikipedia.org/wiki/Thunder_(mascot)",
      "title": "Thunder (mascot)",
      "content_html": "... <p><b>Thunder</b> is the <a href=\"https://en.wikipedia.org/wiki/Stage_name\">stage name</a> for the..."
    }
  ]
}
```

## Import or Generate

`/?import=<url>` import a Readlist (JSON feed) into the UI that’s hosted at a URL somewhere on the web.

example: `/?import=https://example.com/path/to/readlist.json`

`/generate?url=<url1>&url=<url2>`

example: ...

Readlists are saved locally in your browser (using `localStorage`). You can save the data of a Readlist to a JSON file, host it at a URL, and then allow others to import it themselves. It falls to you to save and distribute (the URLs for) your Readlists. Yeah it’s more work for you, but hey, on the flip side the data is all yours. Do whatever you want with it.

Import a file by using the `url` query parameter (make sure you don’t have an open Readlist), e.g. `https://readlists.jim-nielsen.com/?url=https://example.com/path/to readlist.json`

## ToDos

- [ ] Maybe get to these someday
- [ ] Use Zod for types
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
