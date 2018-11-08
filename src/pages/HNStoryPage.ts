import { Widget, PaginatedRouteProps, asynco } from "../lit-rx";
import { html } from "lit-html";
import { HNHeader } from "../components/HNHeader";
import { StoryListItem } from "../components/StoryListItem";
import { HNBloc, LoadStatus } from "../blocs/HN";
import { HNComment } from "../components/HNComment";
import { repeat } from "lit-html/directives/repeat";
import { defer } from "rxjs";

export const HNStoryPage = Widget((blocs, { page }: PaginatedRouteProps) => {
  const hnbloc = blocs.of(HNBloc);
  return html`
    ${
      asynco(
        defer(() => {
          hnbloc.storySelectorObserver.next(page);
        })
      )
    }
    <custom-style>
      <style is="custom-style" include="paper-material-styles">
        .paper-material {
          padding: 5px;
          margin: 10px 20%;
          @apply --shadow-elevation-4dp;
        }
      </style>
    </custom-style>
    ${HNHeader(blocs)}
    <div class="paper-material">
      ${
        asynco(hnbloc.storyObservable, storyMessage => {
          switch (storyMessage.loadStatus) {
            case LoadStatus.ERROR:
              return `
                Error :(
              `;
            case LoadStatus.LOADING:
              return `
                Loading
              `;
            case LoadStatus.LOADED:
              return html`
                <div style="margin-bottom: 20px">
                  ${StoryListItem(blocs, storyMessage.story)}
                </div>
                <hr />
                ${
                  repeat(
                    storyMessage.story.comments,
                    comment => comment.id,
                    comment => HNComment(blocs, { comment })
                  )
                }
              `;
          }
        })
      }
    </div>
  `;
});
