import { Widget, animate } from "../lit-rx";
import { html } from "lit-html";
import {
  PlayPauseAnimationAction,
  PlayPauseAnimationBloc
} from "../blocs/PlayPauseAnimationBloc";
import { Button } from "./Button";
import { map } from "rxjs/operators";
import { Subject } from "rxjs";
import { flatMap, take } from "rxjs/operators";

export const SpinAnimationDemo = Widget(blocs => {
  const b = new PlayPauseAnimationBloc();
  const s = new Subject<any>();

  s.pipe(
    flatMap(async _ => {
      return (await b.toggleObservable.pipe(take(1)).toPromise()) ===
        PlayPauseAnimationAction.PLAY
        ? PlayPauseAnimationAction.PAUSE
        : PlayPauseAnimationAction.PLAY;
    })
  ).subscribe(b.toggleObserver);

  return html`
    <div style="display: flex; justify-content: center; margin: 20px">
      ${
        animate(
          html`
            <div style="display:inline-block;">Bye</div>
          `,
          {
            keyframes: [
              {
                transform: "rotate(0)",
                color: "#000"
              },
              { color: "#431236", offset: 0.3 },
              {
                transform: "rotate(360deg)",
                color: "#000"
              }
            ] as Keyframe[],
            options: {
              duration: 3000,
              iterations: Infinity
            },
            autoplay: true,
            controlCallback: (action, animation) => {
              return action == PlayPauseAnimationAction.PAUSE
                ? animation.pause()
                : animation.play();
            },

            controlObservable: b.toggleObservable
          }
        )
      }
      ${
        Button(blocs, {
          eventObserver: s,
          textObservable: b.toggleObservable.pipe(
            map(state =>
              state === PlayPauseAnimationAction.PLAY ? "Pause" : "Play"
            )
          )
        })
      }
    </div>
  `;
});
