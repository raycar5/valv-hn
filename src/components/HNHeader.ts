import { html } from "lit-html";
import { Subject } from "rxjs";
import { awaito, eventToObserver, Widget, RouterBloc, just } from "valv";
import { mapTo, map } from "rxjs/operators";
import { ValvSpin } from "./ValvSpin";
import { SecretDemosButton } from "./SecretDemosButton";
import { Button } from "./Button";
import { localStorageKey, SecretCodeBloc } from "../blocs/SecretCodeBloc";

interface HNButtonProps {
  route: string;
  name: string;
}
const HNButton = Widget((context, { route, name }: HNButtonProps) => {
  const s = new Subject<any>();
  const router = context.blocs.of(RouterBloc);
  s.pipe(mapTo(route)).subscribe(router.$next);
  const yellowButton = html`
    <button
      class="ripple"
      style="color: #f5d328"
      @click="${eventToObserver(s)}"
    >
      ${name}
    </button>
  `;
  const whiteButton = html`
    <button class="ripple" style="color: #fff" @click="${eventToObserver(s)}">
      ${name}
    </button>
  `;

  return html`
    <span
      style="${
        awaito(
          router.route$.pipe(
            map(path =>
              path.includes(route)
                ? "--button-color: #f5d328"
                : "--button-color: #fff"
            )
          )
        )
      }"
    >
      ${
        Button(context, {
          $event: s,
          text$: just(name),
          raised: false
        })
      }
    </span>
  `;
});
export const HNHeader = Widget(context => {
  return html`
    <div style="background-color:#283593">
      ${ValvSpin(context)} ${HNButton(context, { route: "/top", name: "Top" })}
      ${HNButton(context, { route: "/new", name: "New" })}
      ${HNButton(context, { route: "/ask", name: "Ask" })}
      ${HNButton(context, { route: "/show", name: "Show" })}
      ${HNButton(context, { route: "/jobs", name: "Jobs" })}
      ${SecretDemosButton(context)}
      ${
        awaito(context.blocs.of(SecretCodeBloc).$unlocked$, unlocked =>
          unlocked
            ? html`
                <div
                  style="display:inline-flex; position:relative; right:0; justify-content: flex-end"
                >
                  ${
                    Button(context, {
                      text$: just("Clear storage"),
                      $event: {
                        next() {
                          localStorage.removeItem(localStorageKey);
                          window.location.reload();
                        }
                      }
                    })
                  }
                </div>
              `
            : ""
        )
      }
    </div>
  `;
});
