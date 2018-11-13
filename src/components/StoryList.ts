import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { Observable } from "rxjs";
import { awaito, Widget } from "valv";
import { HNStoryPage } from "../blocs/HN";
import { StoryListItem } from "./StoryListItem";

interface StoryListProps {
  storyPages: Observable<HNStoryPage>;
}
export const StoryList = Widget((context, { storyPages }: StoryListProps) => {
  return html`
    ${
      awaito(storyPages, storyPage =>
        storyPage.stories.length === 0
          ? html`
              <div
                style="display: flex; justify-content: center; margin: 20px; align-items:center"
              >
                looks empty 😕
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
                        ${StoryListItem(context, story)}
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
