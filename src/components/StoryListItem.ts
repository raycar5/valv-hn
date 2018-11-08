import { html } from "lit-html";
import { PartialObserver, Observable, Subject } from "rxjs";
import { asynco, eventToObserver, Widget, RouterBloc } from "../lit-rx";
import { mapTo, map, timeInterval } from "rxjs/operators";
import { HNStory } from "../blocs/HN";

export const StoryListItem = Widget(
  (
    blocs,
    { title, comments_count, points, time_ago, url, user, domain, id }: HNStory
  ) => {
    const router = blocs.of(RouterBloc);
    return html`
      <div
        @click="${
          () =>
            domain ? window.open(url) : router.nextObserver.next(`/story/${id}`)
        }"
        style="display:flex; flex-direction:column; cursor: pointer;"
      >
        <div style="font-size:1.3rem">
          <span style="color:#000">${title}</span> ${
            domain
              ? html`
                  <span style="color:#666">(${domain})</span>
                `
              : ""
          }
        </div>
        <div style="font-size:.75rem; color:#666">
          ${points} points by <a>${user}</a> ${time_ago} |
          <span
            @click="${
              eventToObserver(router.nextObserver, (e: Event) => {
                e.stopPropagation();
                return `/story/${id}`;
              })
            }"
            >${comments_count} comments</span
          >
        </div>
      </div>
    `;
  }
);
