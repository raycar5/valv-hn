import { render, html } from "lit-html";
import { async } from "rxjs/internal/scheduler/async";

async function main() {
  const { App } = await import("./App");
  render(App, document.querySelector("body"));
}
main();
