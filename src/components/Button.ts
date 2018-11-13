import { html } from "lit-html";
import { PaperButtonElement } from "@polymer/paper-button/paper-button.js";
import { Observable, NextObserver } from "rxjs";
import { awaito, eventToObserver, Widget } from "valv";

export interface ButtonProps {
  eventObserver: NextObserver<MouseEvent>;
  textObservable: Observable<string>;
}

export const Button = Widget(
  (context, { eventObserver, textObservable }: ButtonProps) =>
    html`
      <paper-button raised @click="${eventToObserver(eventObserver)}">
        ${awaito(textObservable)}
      </paper-button>
    `
);
