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
    const html = await fetch(url).then((res) => {
      if (res.ok) {
        return res.text();
      }
      throw new Error("Failed to fetch page because response was not ok.");
    });
    console.log("Succesfully fetched url:", url);
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
    console.error("Failed to fetch url:", url);
    return { statusCode: 500, body: err.toString() };
  }
};
