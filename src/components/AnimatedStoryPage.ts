import { HNStoryPage } from "../blocs/HN";
import { Observable, fromEvent, Subject } from "rxjs";
import { Widget, interact, RouterBloc, sleep } from "valv";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { StoryListItem } from "./StoryListItem";
import { take, delay, map, auditTime, filter } from "rxjs/operators";
import { Manager, Pan, DIRECTION_HORIZONTAL } from "hammerjs";
import { animationFrame } from "rxjs/internal/scheduler/animationFrame";

export interface StoryPageProps {
  page: HNStoryPage;
  exitObservable: Observable<any>;
}
interface PanParams {
  dx: number;
  y: number;
}
function calculatePanPosition({ dx, y }: PanParams, top: number) {
  return dx * (1 - Math.abs(y - top + window.scrollY) / window.innerHeight);
}
export const AnimatedStoryPage = Widget(
  (context, { page, exitObservable }: StoryPageProps) => {
    let mc: HammerManager;
    const panSubject = new Subject<PanParams>();
    const panEndSubject = new Subject<PanParams>();
    const paginationSubject = new Subject<Number>();
    let finished = false;
    paginationSubject
      .pipe(
        map(next => {
          if (page.pageNumber == 1 && next < 0) {
            return 0;
          }
          return next;
        })
      )
      .subscribe(context.blocs.of(RouterBloc).paginationDeltaObserver);
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
                        top
                      } = element.getBoundingClientRect() as DOMRect;
                      inAnimation = element.animate(
                        [
                          {
                            transform: `translateX(100vw) translateX(${width /
                              2}px)`,
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
                      panSubject.subscribe(async panParams => {
                        let transitionEnabled = false;
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
                        element.style.visibility = "visible";
                        element.style.transform = `translateX(${calculatePanPosition(
                          panParams,
                          top
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
                        inAnimation.removeEventListener("finish", onFinish);
                        finished = true;
                        mc = new Manager(element, {
                          recognizers: [
                            [
                              Pan,
                              {
                                direction: DIRECTION_HORIZONTAL,
                                threshold: 5
                              }
                            ]
                          ]
                        });
                        fromEvent<HammerInput>(mc, "panmove")
                          .pipe(
                            auditTime(0, animationFrame),
                            map(e => ({
                              dx: e.deltaX,
                              y: e.center.y
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
                      inAnimation.addEventListener("finish", onFinish);
                    }
                  })
                }"
                i="${
                  interact<HTMLDivElement, any>(
                    {
                      next({ element }) {
                        const style = window.getComputedStyle(element);
                        const { width } = element.getBoundingClientRect();
                        const matrix = new WebKitCSSMatrix(
                          style.webkitTransform
                        );
                        const wasAnimationPlaying =
                          inAnimation.playState === "running";

                        if (mc) mc.destroy();

                        if (wasAnimationPlaying) inAnimation.pause();
                        const shouldContinueFluidly = matrix.m41 != 0;

                        const animation = element.animate(
                          [
                            {
                              transform: `translateX(${Math.round(
                                matrix.m41
                              )}px)`
                            },
                            {
                              transform: `translateX(${-Math.max(
                                0,
                                matrix.m41
                              ) -
                                width * 2}px)`
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
                            element.parentElement.parentElement.removeChild(
                              element.parentElement
                            );
                          }, 500 + index * 100);
                        }
                      }
                    },
                    exitObservable.pipe(take(1))
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
