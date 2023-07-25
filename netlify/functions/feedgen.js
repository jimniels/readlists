// const fetch = require("node-fetch");
const Parser = require("@postlight/parser");

exports.handler = async function (event, context) {
  console.log(event);
  // Support title=..., description=...
  // Or even a POST with data
  const {
    path,
    multiValueQueryStringParameters: { url: urls },
  } = event;

  console.log("[netlify-log] function fired");

  try {
    const items = await Promise.all(
      urls.filter(isValidUrl).map(async (url, i) => {
        const result = await Parser.parse(url);

        return {
          id: i,
          url,
          ...(result
            ? { content_html: result.content }
            : { content_text: `Failed to parse content for url: ${url}` }),
        };
      })
    );

    let feed = {
      version: "https://jsonfeed.org/version/1",
      title: "Untitled feed",
      home_page_url: "https://readlists.jim-nielsen.com",
      // URL that was called
      feed_url: `https://readlists.jim-nielsen.com/feedgen?${urls
        .map((url) => `url=${url}`)
        .join("&")}`,
      items,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(feed),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error:
          "Failed to generate feed. Requested formated is: `/feedgen?url={url1}&url={url2}&url={url3}`",
      }),
    };
  }

  /*
  if (!url) {
    console.log("[netlify-log] missing URL param");
    return {
      statusCode: 400,
      body: "A `url` query parameter is required.",
    };
  }

  if (!isValidUrl(url)) {
    console.log("[netlify-log] invalid URL param: " + url);
    return {
      statusCode: 400,
      body: "The supplied `url` is invalid.",
    };
  }

  console.log("[netlify-log] URL request: " + url);

  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        return {
          statusCode: 500,
          body: `Failed to fetch the given URL. The server responded with: "${res.status} - ${res.statusText}"`,
        };
      }

      const contentType = res.headers.get("content-type");

      if (contentType.startsWith("image")) {
        return res.buffer().then((img) => ({
          statusCode: 200,
          body: img.toString("base64"),
          isBase64Encoded: true,
          headers: {
            "Content-type": contentType,
          },
        }));
      }

      return res.text().then((html) => ({
        statusCode: 200,
        body: html,
      }));
    })
    .catch((err) => {
      console.log("netlify-log (error): " + err);
      return {
        statusCode: 500,
        body: "Failed to proxy request. " + err,
      };
    });
    */
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
