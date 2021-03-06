import { html, TemplateResult, render, noChange } from "lit-html";
import { Observable, BehaviorSubject, Subject, NextObserver } from "rxjs";
import { awaito, Widget, interact, just } from "valv";
import { HNStoryPageMessage, LoadStatus } from "../blocs/HN";
import {
  filter,
  map,
  debounceTime,
  withLatestFrom,
  delay,
  tap
} from "rxjs/operators";
import { Spinner } from "./Spinner";
import { AnimatedStoryPage, Side } from "./AnimatedStoryPage";
import { ConfigBloc } from "../blocs/Config";

interface StoryListProps {
  storyPage$: Observable<HNStoryPageMessage>;
}

export const StoryList = Widget((context, { storyPage$ }: StoryListProps) => {
  const { areAnimationsSupported } = context.blocs.of(ConfigBloc);
  const $exit$ = new Subject<Side>();
  const $previousPage$ = new BehaviorSubject(1);

  storyPage$
    .pipe(
      filter(m => m.loadStatus === LoadStatus.LOADING),
      tap(() => {
        if (window.scroll) {
          window.scroll({ top: 0, behavior: "smooth" });
        }
      }),
      withLatestFrom($previousPage$),
      map(([m, previousPage]) =>
        m.pageNumber >= previousPage ? Side.LEFT : Side.RIGHT
      )
    )
    .subscribe($exit$);
  storyPage$
    .pipe(
      filter(m => m.loadStatus === LoadStatus.LOADED),
      delay(0),
      map(m => m.pageNumber)
    )
    .subscribe($previousPage$);

  let loaderInAnimation: Animation;
  let loaderOutAnimation: Animation;
  let isSpinnerInView = false;
  return html`
    ${
      awaito(
        just(html`
          <div
            style="width: 100vw; overflow:hidden; display: flex; flex-direction: column; align-items: center;"
            i="${
              interact(
                {
                  async next({ element, value }) {
                    const child = document.createElement("div");
                    child.style.position = "absolute";
                    element.appendChild(child);
                    render(value.page, child);
                  }
                },
                storyPage$.pipe(
                  filter(m => m.loadStatus === LoadStatus.LOADED),
                  withLatestFrom($previousPage$),
                  map(([m, previousPage]) => ({
                    page: AnimatedStoryPage(context, {
                      page: m,
                      exit$: $exit$,
                      enterSide:
                        m.pageNumber >= previousPage ? Side.RIGHT : Side.LEFT
                    })
                  }))
                )
              )
            }"
          ></div>
          <div
            style="position:fixed; top: 50%; left:50%; transform: translate(-50%, -50%); visibility:hidden"
            i="${
              interact<HTMLDivElement, HNStoryPageMessage>(
                {
                  next({ element, value: { loadStatus, stories } }) {
                    const inPlaying =
                      areAnimationsSupported &&
                      loaderInAnimation &&
                      loaderInAnimation.playState === "running";
                    const outPlaying =
                      areAnimationsSupported &&
                      loaderOutAnimation &&
                      loaderOutAnimation.playState === "running";
                    if (
                      loadStatus === LoadStatus.LOADED &&
                      stories.length === 0
                    ) {
                      loadStatus = LoadStatus.ERROR;
                    }
                    switch (loadStatus) {
                      case LoadStatus.ERROR:
                      case LoadStatus.LOADING:
                        {
                          const {
                            height,
                            top
                          } = element.getBoundingClientRect();
                          if (outPlaying) {
                            loaderOutAnimation.pause();
                          }
                          if (!inPlaying && !isSpinnerInView) {
                            if (areAnimationsSupported)
                              loaderInAnimation = element.animate(
                                [
                                  {
                                    transform: `translateY(${
                                      outPlaying ? top : -top - height
                                    }px) translate(-50%, -50%)`,
                                    visibility: "visible"
                                  },
                                  {
                                    transform: "translate(-50%,-50%)",
                                    visibility: "visible"
                                  }
                                ] as Keyframe[],
                                {
                                  duration: 200,
                                  iterations: 1,
                                  easing: outPlaying ? "linear" : "ease-out",

                                  fill: "forwards"
                                }
                              );
                            isSpinnerInView = true;
                          }
                        }
                        return;
                      case LoadStatus.LOADED:
                        {
                          const {
                            height,
                            top
                          } = element.getBoundingClientRect();
                          if (inPlaying) {
                            loaderInAnimation.pause();
                          }
                          if (!outPlaying && isSpinnerInView) {
                            if (areAnimationsSupported)
                              loaderOutAnimation = element.animate(
                                [
                                  {
                                    transform: `translateY(${
                                      inPlaying ? top : 0
                                    }px) translate(-50%, -50%)`,
                                    visibility: "visible"
                                  },
                                  {
                                    transform: `translateY(100vh)`,
                                    visibility: "hidden"
                                  }
                                ] as Keyframe[],
                                {
                                  duration: 300,
                                  iterations: 1,
                                  easing: inPlaying ? "linear" : "ease-in",

                                  fill: "forwards"
                                }
                              );
                            isSpinnerInView = false;
                          }
                        }
                        return;
                    }
                  }
                },
                storyPage$.pipe(debounceTime(400))
              )
            }"
          >
            ${
              awaito(storyPage$, storyPageMessage => {
                switch (storyPageMessage.loadStatus) {
                  case LoadStatus.LOADING:
                    return Spinner(context);
                  case LoadStatus.ERROR:
                    return html`
                      error :(
                    `;
                  case LoadStatus.LOADED:
                    if (storyPageMessage.stories.length === 0) {
                      return html`
                        <div
                          style="display: flex; justify-content: center; margin: 20px; align-items:center"
                        >
                          looks empty 😕
                        </div>
                      `;
                    } else {
                      return noChange;
                    }
                }
              })
            }
          </div>
        `)
      )
    }
  `;
});
