import { render, html } from "lit-html";

import("./App").then(({ App }) => {
  render(App, document.querySelector("body"));
});

/*
render(
  html`
    hello
  `,
  document.querySelector("body")
);

*/
