import { html } from "lit-html";
import { PartialObserver, Observable, Subject } from "rxjs";
import "@polymer/paper-button/paper-button.js";
import { asynco, eventToObserver, Widget, RouterBloc } from "../lit-rx";
import { mapTo, map } from "rxjs/operators";
import { LitSpin } from "./LitSpin";

interface HNButtonProps {
  route: string;
  name: string;
}
const HNButton = Widget((blocs, { route, name }: HNButtonProps) => {
  const s = new Subject<string>();
  const router = blocs.of(RouterBloc);
  s.pipe(mapTo(route)).subscribe(router.nextObserver);
  const yellowButton = html`
    <paper-button style="color: #f5d328" @click="${eventToObserver(s)}"
      >${name}</paper-button
    >
  `;
  const whiteButton = html`
    <paper-button style="color: #fff" @click="${eventToObserver(s)}"
      >${name}</paper-button
    >
  `;

  return html`
    ${
      asynco(
        router.routeObservable.pipe(
          map(path => (path.includes(route) ? yellowButton : whiteButton))
        )
      )
    }
  `;
});
export const HNHeader = Widget(blocs => {
  return html`
    <div style="background-color:#283593">
      ${LitSpin(blocs)} ${HNButton(blocs, { route: "/top", name: "Top" })}
      ${HNButton(blocs, { route: "/new", name: "New" })}
      ${HNButton(blocs, { route: "/ask", name: "Ask" })}
      ${HNButton(blocs, { route: "/show", name: "Show" })}
      ${HNButton(blocs, { route: "/jobs", name: "Jobs" })}
    </div>
  `;
});
