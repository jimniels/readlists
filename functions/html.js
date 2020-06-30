const fetch = require("node-fetch");

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  console.log(event);
  console.log(event.queryStringParameters);
  const url = event.queryStringParameters.url;

  if (!url) {
    return {
      statusCode: 400,
      body:
        "Invalid request. URL paramter is required, i.e. `?url=http://www...`",
    };
  }

  try {
    const html = await fetch(url).then((res) => res.text());
    return {
      statusCode: 200,
      body: html,
      // // more keys you can return:
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      //   "Content-Type": "application/json",
      // },
      // isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
