import { html } from "lit-html";
import "@polymer/paper-button/paper-button.js";
import { PartialObserver, Observable } from "rxjs";
import { asynco, eventToObserver, Widget } from "../lit-rx";

export interface ButtonProps {
  eventObserver: PartialObserver<MouseEvent>;
  textObservable: Observable<string>;
}

export const Button = Widget(
  (blocs, { eventObserver, textObservable }: ButtonProps) =>
    html`
      <paper-button raised @click="${eventToObserver(eventObserver)}">
        ${asynco(textObservable)}
      </paper-button>
    `
);
