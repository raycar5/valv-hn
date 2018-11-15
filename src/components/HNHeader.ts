import { html } from "lit-html";
import { Subject } from "rxjs";
import { awaito, eventToObserver, Widget, RouterBloc, just } from "valv";
import { mapTo, map, delay, debounceTime } from "rxjs/operators";
import { ValvSpin } from "./ValvSpin";
import { SecretDemosButton } from "./SecretDemosButton";
import { Button } from "./Button";
import { localStorageKey, SecretCodeBloc } from "../blocs/SecretCodeBloc";

interface HNButtonProps {
  route: string;
  name: string;
}
const HNButton = Widget((context, { route, name }: HNButtonProps) => {
  const s = new Subject<string>();
  const router = context.blocs.of(RouterBloc);
  s.pipe(mapTo(route)).subscribe(router.nextObserver);
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
    ${
      awaito(
        router.routeObservable.pipe(
          delay(200),
          map(path => (path.includes(route) ? yellowButton : whiteButton))
        )
      )
    }
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
        awaito(context.blocs.of(SecretCodeBloc).unlockedSubject, unlocked =>
          unlocked
            ? html`
                <div
                  style="display:inline-flex; position:relative; right:0; justify-content: flex-end"
                >
                  ${
                    Button(context, {
                      textObservable: just("Clear storage"),
                      eventObserver: {
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
