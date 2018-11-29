import { Widget, interact, eventToObserver } from "valv";
import { html } from "lit-html";
import { Subject } from "rxjs";
import { ConfigBloc } from "../blocs/Config";

export const ValvSpin = Widget(context => {
  const $animation$ = new Subject();
  let animation: Animation;
  return html`
          <div
            @click="${eventToObserver($animation$)}"
            style="margin: 18px 1.5vh; color:#fff; display:inline-block"
            i="${interact(
              {
                next({ element }) {
                  if (context.blocs.of(ConfigBloc).areAnimationsSupported)
                    if (!animation) {
                      animation = element.animate(
                        [
                          {
                            transform: "rotate(0)"
                          },
                          {
                            transform: "rotate(360deg)"
                          }
                        ] as Keyframe[],
                        {
                          duration: 600,
                          iterations: 1,
                          easing: "cubic-bezier(.3,-0.48,.69,1.48)"
                        }
                      );
                      return;
                    }
                  if (animation.playState !== "running") {
                    animation.reverse();
                    animation.play();
                  }
                }
              },
              $animation$
            )}"
            >
            | Valv |
            </span>
  `;
});
