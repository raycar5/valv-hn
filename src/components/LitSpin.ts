import { Widget, animate, eventToObserver } from "../lit-rx";
import { html } from "lit-html";
import { Subject } from "rxjs";

export const LitSpin = Widget(blocs => {
  const animationSubject = new Subject();
  return html`
    ${
      animate(
        html`
          <div
            @click="${eventToObserver(animationSubject)}"
            style="margin:20px; font-size: 20dp; color:#fff; display:inline-block"
            >lit🔥rx</span
          >
        `,
        {
          keyframes: [
            {
              transform: "rotate(0)"
            },
            {
              transform: "rotate(360deg)"
            }
          ] as Keyframe[],
          options: {
            duration: 600,
            iterations: 1,
            easing: "cubic-bezier(.3,-0.48,.69,1.48)"
          },
          controlCallback(_, animation) {
            if (animation.playState !== "running") {
              animation.play();
              animation.reverse();
            }
          },
          controlObservable: animationSubject
        }
      )
    }
  `;
});
