import { builder, type Handler } from "@netlify/functions";

const myHandler: Handler = async (event, context) => {
  // console.log(event);
  const { path, headers, rawQuery } = event;
  console.log("x-nf-builder-cache", headers["x-nf-builder-cache"]);
  const p = decodeURIComponent(
    path.replace("/.netlify/functions/builder/", "")
  );
  const urls = p.split(",");
  console.log(urls, event);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  // console.log(decodeURIComponent(rawQuery.slice(5).split(",")));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: urls.join("\n"),
  };
};

const handler = builder(myHandler);

export { handler };
