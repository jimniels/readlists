# Readlists

Bringing back the spirit of the original Readlists service. [Check out the blog post for more deets](https://blog.jim-nielsen.com/2021/reintroducing-readlists/).

## How it works

[readlists.jim-nielsen.com](https://readlists.jim-nielsen.com) is merely a GUI for creating and editing a “Readlist”.

What’s a Readlist? At its core, a Readlist is simply a [JSON feed](https://www.jsonfeed.org/) whose contents populated with what you get from [mercury-parser](https://github.com/postlight/mercury-parser).

An example Readlist:

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

You can use [the web GUI](https://readlists.jim-nielsen.com) to create a Readlist

### Saving a Readlist

Readlists are saved locally in your browser (using `localStorage`). You can save the data of a Readlist to a JSON file, host it at a URL, and then allow others to import it themselves. It falls to you to save and distribute (the URLs for) your Readlists. Yeah it’s more work for you, but hey, on the flip side the data is all yours. Do whatever you want with it.

### Generate a Readlist From a List of Links

You can programatically generate a Readlist by doing a GET to `/api/create?urls=` along with a comma separated list of links, e.g.

`https://readlists.jim-nielsen.com/api/create?urls=https://example.com/articles/1&url=https://example.com/articles/2`

For example, here’s a Readlist link with three random articles:

https://readlists.jim-nielsen.com/api/create?urls=https://piperhaywood.com/family-recipe-for-classic-white-frosting/,https://rachsmith.com/is-typescript-good/,https://daverupert.com/2023/08/vibe-check-28/

And here’s that same Readlist as a curl (`-L` follows the redirect):

```
curl -L "https://readlists.jim-nielsen.com/api/create?urls=\
https://piperhaywood.com/family-recipe-for-classic-white-frosting/,\
https://rachsmith.com/is-typescript-good/,\
https://daverupert.com/2023/08/vibe-check-28/"
```

Easily create a list of your favorite articles and share it with a friend via a single link!

### Import an exisiting Readlist

When you create and customize your Readlist, you can share it with others by allowing them to import it into the UI.

To do so, host your Readlist file (a JSON feed) somewhere on the web and append `/?import=<url>` to the URL, e.g.

`/?import=https://example.com/path/to/readlist.json`

Or, you can generate a Readlist on the fly and open it in the GUI editor using the instructions above on generating links:

https://readlists.jim-nielsen.com/?import=https://readlists.jim-nielsen.com/api/create?urls=https://piperhaywood.com/family-recipe-for-classic-white-frosting/,https://rachsmith.com/is-typescript-good/,https://daverupert.com/2023/08/vibe-check-28/

## Local Development

- Local dev `npm start` (you'll need `netlify-cli` installed globally)
- Prod build `npm run build`

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
