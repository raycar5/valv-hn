import { Widget, interact, eventToObserver } from "valv";
import { html } from "lit-html";
import { Subject } from "rxjs";

export const ValvSpin = Widget(context => {
  const animationSubject = new Subject();
  let animation: Animation;
  return html`
          <div
            @click="${eventToObserver(animationSubject)}"
            style="margin:20px; font-size: 20dp; color:#fff; display:inline-block"
            i="${interact(
              {
                next({ element }) {
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
              animationSubject
            )}"
            >
            | Valv |
            </span>
  `;
});
