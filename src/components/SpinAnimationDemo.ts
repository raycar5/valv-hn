import { Widget, interact } from "../lit-rx";
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
  let animation: Animation;

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
        interact(
          html`
            <div style="display:inline-block;">Bye</div>
          `,
          {
            next({ element, value }) {
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
                    iterations: Infinity
                  }
                );
                return;
              }
              if (value == PlayPauseAnimationAction.PAUSE) {
                animation.pause();
              } else {
                animation.play();
              }
            }
          },
          b.toggleObservable
          /*
            autoplay: true,
            controlCallback: (action, animation) => {
              return action == PlayPauseAnimationAction.PAUSE
                ? animation.pause()
                : animation.play();
            },

            controlObservable: b.toggleObservable
          }
          */
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
