import { HNStoryPageMessage } from "../blocs/HN";
import { Observable, fromEvent, Subject, config } from "rxjs";
import { Widget, interact, RouterBloc, sleep } from "valv";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { StoryListItem } from "./StoryListItem";
import { take, delay, map, filter } from "rxjs/operators";
import { Manager, Pan, DIRECTION_HORIZONTAL } from "hammerjs";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";
import { ConfigBloc } from "../blocs/Config";

export enum Side {
  RIGHT,
  LEFT
}
export interface StoryPageProps {
  page: HNStoryPageMessage;
  exit$: Observable<Side>;
  enterSide: Side;
}
interface PanParams {
  dx: number;
  y: number;
}
function right(width: number) {
  const w2 = width / 2;
  return window.innerWidth + w2;
}
function left(width: number) {
  const w2 = width / 2;
  return -window.innerWidth - w2;
}
function calculatePanPosition(
  { dx, y }: PanParams,
  top: number,
  height: number
) {
  return dx * (1 - Math.abs(y - top - height / 2) / window.innerHeight);
}
export const AnimatedStoryPage = Widget(
  (context, { page, exit$, enterSide }: StoryPageProps) => {
    const { areAnimationsSupported } = context.blocs.of(ConfigBloc);
    const panSubject = new Subject<PanParams>();
    const mcs: HammerManager[] = [];
    const panEndSubject = new Subject<PanParams>();
    const paginationSubject = new Subject<Number>();

    paginationSubject
      .pipe(
        map(next => {
          if (page.pageNumber == 1 && next < 0) {
            return 0;
          }
          return next;
        })
      )
      .subscribe(context.blocs.of(RouterBloc).$paginationDelta);
    return html`
      ${
        repeat(
          page.stories,
          story => story.id,
          (story, index) => {
            let inAnimation: Animation;
            return html`
              <div
                style="display:flex; align-items:center; visibility:hidden; transform-origin: top left;"
                class="paper-material"
                ix="${
                  interact<HTMLDivElement, any>({
                    next: ({ element }) => {
                      const {
                        width,
                        height,
                        top
                      } = element.getBoundingClientRect() as DOMRect;
                      const scrolledTop = top + window.scrollY;
                      const enterFn = enterSide === Side.RIGHT ? right : left;
                      if (areAnimationsSupported) {
                        inAnimation = element.animate(
                          [
                            {
                              transform: `translateX(${enterFn(width)}px)`,
                              visibility: "visible"
                            },
                            {
                              transform: `translateX(0)`,
                              visibility: "visible"
                            }
                          ] as Keyframe[],
                          {
                            easing: "ease-in",
                            duration: 500,
                            iterations: 1,
                            delay: index * 100,
                            fill: "forwards"
                          }
                        );
                      } else {
                        element.style.visibility = "visible";
                      }
                      panSubject.subscribe(async panParams => {
                        let transitionEnabled = false;
                        if (areAnimationsSupported) {
                          if (inAnimation.playState === "running") {
                            const style = window.getComputedStyle(element);
                            const matrix = new WebKitCSSMatrix(
                              style.webkitTransform
                            );
                            inAnimation.cancel();
                            element.style.transform = `translateX(${
                              matrix.m41
                            }px)`;
                            await new Promise(resolve =>
                              requestAnimationFrame(resolve)
                            );
                            element.style.transition = "transform .1s ease-out";
                            transitionEnabled = true;
                          }
                          inAnimation.cancel();
                        }
                        element.style.visibility = "visible";
                        element.style.transform = `translateX(${calculatePanPosition(
                          panParams,
                          scrolledTop,
                          height
                        )}px)`;
                        if (transitionEnabled) {
                          await sleep(200);
                          element.style.transition = "";
                        }
                      });

                      panEndSubject.pipe(delay(50)).subscribe(panParams => {
                        element.style.transition = "transform 100ms ease-out";
                        element.style.transform = "";
                        setTimeout(() => {
                          element.style.transition = "";
                        }, 100);
                      });
                      function onFinish() {
                        const mc = new Manager(element, {
                          recognizers: [
                            [
                              Pan,
                              {
                                direction: DIRECTION_HORIZONTAL,
                                threshold: 2
                              }
                            ]
                          ]
                        });
                        mcs.push(mc);
                        fromEvent<HammerInput>(mc, "panmove")
                          .pipe(
                            map(e => ({
                              dx: e.deltaX,
                              y: (e.pointers[0] as PointerEvent).pageY
                            }))
                          )
                          .subscribe(panSubject);
                        fromEvent<HammerInput>(mc, "panend")
                          .pipe(
                            filter(({ deltaX }) => {
                              if (deltaX > window.innerWidth * 0.4) {
                                paginationSubject.next(-1);
                                return false;
                              } else if (-deltaX > window.innerWidth * 0.4) {
                                paginationSubject.next(1);
                                return false;
                              }
                              return true;
                            }),
                            map(e => ({
                              dx: e.deltaX,
                              y: e.center.y
                            }))
                          )
                          .subscribe(panEndSubject);
                      }
                      if (areAnimationsSupported)
                        setTimeout(onFinish, 500 + index * 100);
                    }
                  })
                }"
                i="${
                  interact<HTMLDivElement, any>(
                    {
                      next({ element, value: exitSide }) {
                        const style = window.getComputedStyle(element);
                        const { width } = element.getBoundingClientRect();
                        const matrix = new WebKitCSSMatrix(
                          style.webkitTransform
                        );
                        const wasAnimationPlaying =
                          areAnimationsSupported &&
                          inAnimation.playState === "running";

                        for (const mc of mcs) mc.destroy();

                        if (wasAnimationPlaying) inAnimation.pause();
                        const shouldContinueFluidly =
                          matrix.m41 > 1 || matrix.m41 < -1;

                        if (areAnimationsSupported) {
                          const exitfn = exitSide === Side.RIGHT ? right : left;
                          element.animate(
                            [
                              {
                                transform: `translateX(${Math.round(
                                  matrix.m41
                                )}px)`
                              },
                              {
                                transform: `translateX(${exitfn(width)}px)`
                              }
                            ] as Keyframe[],
                            {
                              easing: !shouldContinueFluidly
                                ? "ease-in"
                                : "linear",
                              duration: 500,
                              iterations: 1,
                              delay: !shouldContinueFluidly ? index * 100 : 0,
                              fill: "forwards"
                            }
                          );
                          if (index === page.stories.length - 1) {
                            // Finish listener wasn't working properly
                            setTimeout(() => {
                              element.parentElement.remove();
                            }, 500 + index * 100);
                          }
                        } else {
                          element.parentElement.remove();
                        }
                      }
                    },
                    exit$.pipe(take(1))
                  )
                }"
              >
                <span style="margin:10px; font-weight: 600; font-size: 1.2em"
                  >${index + 1 + (page.pageNumber - 1) * 30}</span
                >
                ${StoryListItem(context, story)}
              </div>
            `;
          }
        )
      }
    `;
  }
);
