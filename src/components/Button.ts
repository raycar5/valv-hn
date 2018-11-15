import { html } from "lit-html";
import { Observable, NextObserver } from "rxjs";
import { awaito, eventToObserver, Widget } from "valv";
import { styleMap } from "lit-html/directives/styleMap";
import { classMap } from "lit-html/directives/classMap";

export interface ButtonProps {
  eventObserver: NextObserver<MouseEvent>;
  textObservable: Observable<string>;
  color?: string;
  backgroundColor?: string;
  raised?: boolean;
}

export const Button = Widget(
  (
    context,
    {
      eventObserver,
      textObservable,
      color = "black",
      backgroundColor = "white",
      raised = true
    }: ButtonProps
  ) =>
    html`
      <button
        class="ripple ${classMap({ raised })}"
        style="${styleMap({ color, backgroundColor })}"
        @click="${eventToObserver(eventObserver)}"
      >
        ${awaito(textObservable)}
      </button>
    `
);
