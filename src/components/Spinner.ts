import { Widget } from "valv";
import { html } from "lit-html";

export const Spinner = Widget(() => {
  return html`
    <div class="spin-left">
      <div class="spin-right">|</div>
      <div class="spin-right"><div class="bob">&nbsp;Valv&nbsp;</div></div>
      <div class="spin-right">|</div>
    </div>
  `;
});
