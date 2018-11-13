import { Widget, PaginatedRouteProps, awaito } from "valv";
import { html } from "lit-html";
import { HNHeader } from "../components/HNHeader";
import { StoryListItem } from "../components/StoryListItem";
import { HNBloc, LoadStatus } from "../blocs/HN";
import { HNComment } from "../components/HNComment";
import { repeat } from "lit-html/directives/repeat";
import { defer } from "rxjs";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import { paperMaterial } from "../styles";

export const HNStoryPage = Widget(
  (context, { page }: PaginatedRouteProps<any>) => {
    const hnbloc = context.blocs.of(HNBloc);
    return html`
      ${
        awaito(
          defer(() => {
            hnbloc.storySelectorObserver.next(page);
          })
        )
      }
      <custom-style>
        <style is="custom-style" include="paper-material-styles">
          ${paperMaterial}
        </style>
      </custom-style>
      <div class="paper-material">
        ${
          awaito(hnbloc.storyObservable, storyMessage => {
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
                    ${StoryListItem(context, storyMessage.story)}
                    ${
                      storyMessage.story.content
                        ? unsafeHTML(storyMessage.story.content)
                        : ""
                    }
                  </div>
                  <hr />

                  ${
                    repeat(
                      storyMessage.story.comments,
                      comment => comment.id,
                      comment => HNComment(context, { comment })
                    )
                  }
                `;
            }
          })
        }
      </div>
    `;
  }
);
