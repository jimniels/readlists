import { builder, type Handler } from "@netlify/functions";
import Parser from "@postlight/parser";
import { isValidUrl, getNewReadlist } from "../../src/js/utils.js";
const MAX_URLS = 50;

// TODO Alternative parsing engine

const myHandler: Handler = async (event, context) => {
  const { path, headers } = event;

  console.log(
    "[log] request for `%s` with `x-nf-builder-cache` as `%s`",
    path,
    headers["x-nf-builder-cache"]
  );
  try {
    // URL is redirected to here from netlify's redirect engine
    // Which takes a query like this:
    //   `?urls=https://example.com/foo,https://example.com/bar`
    // And turns it into this:
    //   `/.netlify/builders/create/%3A%2F%2Fexample.com...`
    // And it comes in to this function as `path` with that `urls=` query param
    // as encodedURIcomponent, which we have to decode

    // `/.netlify/builders/create/https%3A%2F%2Fexample.com...`
    const pathSansFunctionLocation = path.replace(
      "/.netlify/builders/create/",
      ""
    );
    // `https://example.com/foo,https://example.com/bar`
    const commaSeparatedUrls = decodeURIComponent(pathSansFunctionLocation);
    // [https://example.com/foo, https://example.com/bar]
    const urls: string[] = commaSeparatedUrls.split(",");

    if (urls.length > MAX_URLS) {
      throw Error("Maximum number of URLs exceeded.");
    }

    const items = await Promise.all(
      urls.filter(isValidUrl).map(async (url, i) => {
        const result = await Parser.parse(url);

        // @ts-expect-error
        let item: ReadlistArticle = {
          id: `${i}`,
          url,
        };

        if (!result.failed) {
          const {
            content,
            title,
            excerpt,
            lead_image_url,
            date_published,
            author,
            ...rest
          } = result;
          if (content) item.content_html = content;
          if (title) item.title = title;
          if (excerpt) item.summary = excerpt;
          if (lead_image_url) item.image = lead_image_url;
          if (date_published) item.date_published = date_published;
          if (author) item.authors = [{ name: author }];
          item._readlist = {
            parser: {
              name: "mercury",
              url: "https://github.com/postlight/parser",
              meta: rest,
            },
          };
        } else {
          item.content_html = `<p>Failed to parse content for url: <a href="${url}">${url}</a></p>`;
          item._readlist = {
            parser: {
              name: "mercury",
              url: "https://github.com/postlight/parser",
              meta: result,
            },
          };
        }
        return item;
      })
    );

    let feed: Readlist = {
      ...getNewReadlist(),
      // TODO support new URL(rawUrl).search that returns title and description
      // ...(queryStringParameters.title && {
      //   title: queryStringParameters.title,
      // }),
      // ...(queryStringParameters.description && {
      //   description: queryStringParameters.description,
      // }),
      // feed_url: `https://readlists.jim-nielsen.com/api/create?${urls
      //   .map((url) => `url=${url}`)
      //   .join("&")}`,
      items,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feed),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: {
          message: `Failed to generate feed. Requested formated is: \`/api/create?urls={url1},{url2},{url3}\`. Maximum of ${MAX_URLS} URLs.`,
          details: e.message,
        },
      }),
    };
  }
};

const handler = builder(myHandler);

export { handler };
