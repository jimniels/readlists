const Parser = require("@postlight/parser");

exports.handler = async function (event, context) {
  console.log(event);
  // Support title=..., description=...
  // Or even a POST with data
  // Or alternative parsers
  const {
    path,
    queryStringParameters,
    multiValueQueryStringParameters: { url: urls },
  } = event;

  console.log("[netlify-log] function fired");

  try {
    const items = await Promise.all(
      urls.filter(isValidUrl).map(async (url, i) => {
        const result = await Parser.parse(url);

        let item = {
          id: `${i}`,
          url,
        };

        if (result) {
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
          if (author) item.authors = { name: author };
          item._readlist = {
            parser: {
              name: "mercury",
              url: "https://github.com/postlight/parser",
              meta: rest,
            },
          };
        } else {
          item.content_text = `Failed to parse content for url: ${url}`;
        }
        return item;
      })
    );

    let feed = {
      version: "https://jsonfeed.org/version/1",
      title: queryStringParameters.title || "Untitled Readlist feed",
      description:
        queryStringParameters.description ||
        "A JSON feed generated as a custom Readlist.",
      expired: true,
      home_page_url: "https://readlists.jim-nielsen.com",
      // feed_url: `https://readlists.jim-nielsen.com/api/new?${urls
      //   .map((url) => `url=${url}`)
      //   .join("&")}`,
      items,
    };

    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 200,
      body: JSON.stringify(feed),
    };
  } catch (e) {
    console.error(e);
    return {
      headers: {
        "Content-Type": "application/json",
      },
      statusCode: 400,
      body: JSON.stringify({
        error:
          "Failed to generate feed. Requested formated is: `/new?url={url1}&url={url2}&url={url3}`",
      }),
    };
  }
};

function isValidUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
