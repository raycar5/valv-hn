import { html } from "lit-html";
import { Observable, NextObserver } from "rxjs";
import { awaito, eventToObserver, Widget } from "valv";
import { classMap } from "lit-html/directives/classMap";

export interface ButtonProps {
  eventObserver: NextObserver<MouseEvent>;
  textObservable: Observable<string>;
  raised?: boolean;
}

export const Button = Widget(
  (context, { eventObserver, textObservable, raised = true }: ButtonProps) =>
    html`
      <style>
        button {
          border: none;
          border-radius: 2px;
          background-color: var(--button-bg-color, transparent);
          padding: 12px 18px;
          font-size: 16px;
          text-transform: uppercase;
          cursor: pointer;
          color: var(--button-color, black);
          outline: none;
        }
        button.raised {
          background-color: var(--button-bg-color, white);
          box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
            0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
        }
      </style>
      <button
        class="ripple ${classMap({ raised })}"
        @click="${eventToObserver(eventObserver)}"
      >
        ${awaito(textObservable)}
      </button>
    `
);
