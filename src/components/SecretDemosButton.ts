import {
  Widget,
  interact,
  just,
  eventToObserver,
  RouterBloc,
  timeout
} from "../lit-rx";
import { html } from "lit-html";
import { Subject, BehaviorSubject } from "rxjs";
import { SecretCodeBloc } from "../blocs/SecretCodeBloc";
import {
  mapTo,
  take,
  filter,
  debounce,
  debounceTime,
  combineLatest,
  switchMap,
  flatMap,
  map
} from "rxjs/operators";
import { Button } from "./Button";
const ClosedChest = require("../assets/chestclosed.png");
const OpenChest = require("../assets/chestopen.png");
const Light = require("../assets/light.png");
const ChestAudio = require("../assets/zelda.mp3");

function calculateButtonPosition(
  button: HTMLDivElement,
  dx: number = 0,
  dy: number = 0
) {
  const rect = button.getBoundingClientRect();
  const centerx = window.innerWidth / 2;
  const centery = window.innerHeight / 2;
  const centerCornerx = centerx - rect.width / 2;
  const centerCornery = centery - rect.height / 2;
  const deltax = centerCornerx - rect.left;
  const deltay = centerCornery - rect.top;
  return `translate(${deltax + dx}px, ${deltay + dy}px)`;
}
function startButtonColorAnimation(button: HTMLDivElement) {
  button.animate(
    [
      {
        backgroundColor: "#f00"
      },
      {
        backgroundColor: "#ff0"
      },
      {
        backgroundColor: "#0f0"
      },
      {
        backgroundColor: "#0ff"
      },
      {
        backgroundColor: "#00f"
      },
      {
        backgroundColor: "#f0f"
      },
      {
        backgroundColor: "#f00"
      }
    ] as Keyframe[],
    {
      duration: 2000,
      easing: "linear",
      iterations: Infinity
    }
  );
}

enum SecretAnimationAction {
  START_CHEST,
  OPEN_CHEST,
  MOVE_BUTTON,
  NONE
}
export const SecretDemosButton = Widget(blocs => {
  const secretbloc = blocs.of(SecretCodeBloc);

  let overlay: HTMLDivElement;
  let closedchest: HTMLImageElement;
  let openchest: HTMLImageElement;
  let light: HTMLImageElement;
  let button: HTMLDivElement;
  let zelda = new Audio(ChestAudio);
  let bounceAnimation: Animation;

  const animationSubject = new BehaviorSubject<SecretAnimationAction>(
    SecretAnimationAction.NONE
  );

  //Only emit Start chest if there's success and it's not unlocked already
  secretbloc.successObservable
    .pipe(
      flatMap(success =>
        secretbloc.unlockedSubject.pipe(
          take(1),
          map(unlocked => {
            return success && !unlocked;
          })
        )
      ),
      filter(x => x),
      mapTo(SecretAnimationAction.START_CHEST)
    )
    .subscribe(animationSubject);

  animationSubject.pipe(debounceTime(0)).subscribe({
    async next(action) {
      //code executed when component renders
      if (await secretbloc.unlockedSubject.pipe(take(1)).toPromise()) {
        button.style.visibility = "visible";
        startButtonColorAnimation(button);
      }
      switch (action) {
        case SecretAnimationAction.START_CHEST:
          zelda.play();

          //OVERLAY ANIMATION
          overlay.animate(
            [
              {
                visibility: "visible",
                opacity: "0"
              },
              {
                visibility: "visible",
                opacity: "0.6"
              }
            ] as Keyframe[],
            {
              duration: 1000
            }
          );
          overlay.style.opacity = "0.6";
          overlay.style.visibility = "visible";

          //CLOSED CHEST ANIMATION
          closedchest.animate(
            [
              {
                visibility: "visible",
                transform: "scale(0) translate(-250%, -250%) rotateY(0turn)"
              },
              {
                visibility: "visible",
                transform: "scale(1) translate(-50%, -50%) rotateY(100turn)"
              }
            ] as Keyframe[],
            {
              duration: 7300
            }
          ).onfinish = async () => {
            await timeout(650);
            animationSubject.next(SecretAnimationAction.OPEN_CHEST);
          };
          closedchest.style.visibility = "visible";

          return;
        case SecretAnimationAction.OPEN_CHEST:
          //OPEN CHEST
          openchest.style.visibility = "visible";
          closedchest.style.visibility = "hidden";
          button.style.visibility = "visible";

          startButtonColorAnimation(button);

          //BOUNCE ANIMATION
          bounceAnimation = button.animate(
            [
              {
                transform: calculateButtonPosition(button, 0, -5),
                easing: "cubic-bezier(0.77, 0, 0.175, 1)"
              },
              {
                transform: calculateButtonPosition(button, 0, 5),
                easing: "cubic-bezier(0.77, 0, 0.175, 1)"
              },
              {
                transform: calculateButtonPosition(button, 0, -5),
                easing: "cubic-bezier(0.77, 0, 0.175, 1)"
              }
            ] as Keyframe[],
            {
              duration: 2000,
              iterations: Infinity
            }
          );

          return;
        case SecretAnimationAction.MOVE_BUTTON:
          //HIDE OPEN CHEST
          openchest.style.visibility = "hidden";
          openchest.animate(
            [
              {
                visibility: "visible",
                opacity: "1"
              },
              {
                visibility: "visible",
                opacity: "0"
              }
            ] as Keyframe[],
            { duration: 1000 }
          );

          //HIDE OVERLAY
          overlay.style.visibility = "hidden";
          overlay.animate(
            [
              {
                visibility: "visible",
                opacity: "0.6"
              },
              {
                visibility: "visible",
                opacity: "0"
              }
            ] as Keyframe[],
            { duration: 1000 }
          );

          //MOVE BUTTON
          button.style.transform = "";
          bounceAnimation.cancel();
          button.animate(
            [
              {
                transform: calculateButtonPosition(button),
                animationTimingFunction: "infinite"
              },
              {
                transform: "translate(0,0)",
                animationTimingFunction: "infinite"
              }
            ] as Keyframe[],
            { duration: 1000, easing: "ease-in-out" }
          );
      }
    }
  });
  return html`
    ${
      interact(
        html`
          <div
            style="position:fixed; top:0; bottom:0; right:0; left:0; z-index:100; background-color: #000; visibility: hidden; "
            @click="${
              async () => {
                const action = await animationSubject.pipe(take(1)).toPromise();
                if (action == SecretAnimationAction.OPEN_CHEST) {
                  animationSubject.next(SecretAnimationAction.MOVE_BUTTON);
                  secretbloc.unlockedSubject.next(true);
                }
              }
            }"
          ></div>
        `,
        {
          next({ element }) {
            overlay = element as HTMLDivElement;
          }
        }
      )
    }
    ${
      interact(
        html`
          <img
            src="${ClosedChest}"
            style="position:fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index:101; visibility: hidden;"
          />
        `,
        {
          next({ element }) {
            closedchest = element as HTMLImageElement;
          }
        }
      )
    }
    ${
      interact(
        html`
          <img
            src="${OpenChest}"
            style="position:fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index:102; visibility:hidden"
          />
        `,
        {
          next({ element }) {
            openchest = element as HTMLImageElement;
          }
        }
      )
    }
    ${
      interact(
        html`
          <paper-button
            raised
            style="color: #fff; z-index:103; visibility: hidden"
            @click="${
              async () => {
                const action = await animationSubject.pipe(take(1)).toPromise();
                if (action == SecretAnimationAction.OPEN_CHEST) {
                  animationSubject.next(SecretAnimationAction.MOVE_BUTTON);
                  secretbloc.unlockedSubject.next(true);
                } else {
                  blocs.of(RouterBloc).nextObserver.next("/secret");
                }
              }
            }"
            >Secret</paper-button
          >
        `,
        {
          next({ element }) {
            button = element as HTMLDivElement;
          }
        }
      )
    }
  `;
});
