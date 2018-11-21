import { html, TemplateResult, render, noChange } from "lit-html";
import { Observable, BehaviorSubject, Subject, NextObserver } from "rxjs";
import { awaito, Widget, interact } from "valv";
import { HNStoryPageMessage, LoadStatus } from "../blocs/HN";
import {
  filter,
  map,
  withLatestFrom,
  take,
  debounceTime
} from "rxjs/operators";
import { Spinner } from "./Spinner";
import { AnimatedStoryPage } from "./AnimatedStoryPage";

interface StoryListProps {
  storyPages: Observable<HNStoryPageMessage>;
}

export const StoryList = Widget((context, { storyPages }: StoryListProps) => {
  const exitSubject = new Subject();

  storyPages
    .pipe(filter(m => m.loadStatus === LoadStatus.LOADING))
    .subscribe(exitSubject);

  let loaderInAnimation: Animation;
  let loaderOutAnimation: Animation;
  let isSpinnerInView = false;
  return html`
    <div
      style="width: 100vw; overflow:hidden; display: flex; flex-direction: column; align-items: center;"
      i="${
        interact(
          {
            next({ element, value }) {
              const child = document.createElement("div");
              child.style.position = "absolute";
              element.appendChild(child);
              render(value.page, child);
            }
          },
          storyPages.pipe(
            filter(m => m.loadStatus === LoadStatus.LOADED),
            map(m => ({
              page: AnimatedStoryPage(context, {
                page: m.page,
                exitObservable: exitSubject
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
            next({ element, value: { loadStatus, page } }) {
              const inPlaying =
                loaderInAnimation && loaderInAnimation.playState === "running";
              const outPlaying =
                loaderOutAnimation &&
                loaderOutAnimation.playState === "running";
              if (
                loadStatus === LoadStatus.LOADED &&
                page.stories.length === 0
              ) {
                loadStatus = LoadStatus.ERROR;
              }
              switch (loadStatus) {
                case LoadStatus.ERROR:
                case LoadStatus.LOADING:
                  {
                    const { height, top } = element.getBoundingClientRect();
                    if (outPlaying) {
                      loaderOutAnimation.pause();
                    }
                    if (!inPlaying && !isSpinnerInView) {
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
                    const { height, top } = element.getBoundingClientRect();
                    if (inPlaying) {
                      loaderInAnimation.pause();
                    }
                    if (!outPlaying && isSpinnerInView) {
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
          storyPages.pipe(debounceTime(400))
        )
      }"
    >
      ${
        awaito(storyPages, storyPageMessage => {
          switch (storyPageMessage.loadStatus) {
            case LoadStatus.LOADING:
              return Spinner(context);
            case LoadStatus.ERROR:
              return html`
                error :(
              `;
            case LoadStatus.LOADED:
              if (storyPageMessage.page.stories.length === 0) {
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
  `;
});
