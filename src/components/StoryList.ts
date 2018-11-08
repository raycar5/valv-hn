import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { PartialObserver, Observable, Subject } from "rxjs";
import {
  asynco,
  eventToObserver,
  Widget,
  RouterBloc,
  animate
} from "../lit-rx";
import { mapTo, map, timeInterval } from "rxjs/operators";
import { HNStory, HNStoryPage } from "../blocs/HN";
import { StoryListItem } from "./StoryListItem";
import { Button } from "./Button";
import { flatMap, take } from "rxjs/operators";
import { SpinAnimationDemo } from "./SpinAnimationDemo";

interface StoryListProps {
  storyPages: Observable<HNStoryPage>;
}
export const StoryList = Widget((blocs, { storyPages }: StoryListProps) => {
  return html`
    ${
      asynco(storyPages, storyPage =>
        storyPage.stories.length === 0
          ? html`
              <div
                style="display: flex; justify-content: center; margin: 20px; align-items:center"
              >
                ${SpinAnimationDemo(blocs)} looks empty 😕
              </div>
            `
          : html`
              ${
                repeat(
                  storyPage.stories,
                  story => story.id,
                  (story, index) =>
                    html`
                      <div
                        style="display:flex; align-items:center; margin: 10px"
                      >
                        <span style="margin:10px; text-decoration:bold;"
                          >${index + 1 + (storyPage.pageNumber - 1) * 30}</span
                        >
                        ${StoryListItem(blocs, story)}
                      </div>
                      <hr />
                    `
                )
              }
            `
      )
    }
  `;
});
