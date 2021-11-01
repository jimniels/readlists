const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const {
    queryStringParameters: { url },
  } = event;

  if (!url) {
    return {
      statusCode: 400,
      body: "A `url` query parameter is required.",
    };
  }

  if (!isValidUrl(url)) {
    return {
      statusCode: 400,
      body: "The supplied `url` is invalid.",
    };
  }

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
      console.log(err);
      return {
        statusCode: 500,
        body: "Failed to proxy request. " + err,
      };
    });
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
