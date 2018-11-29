import { html } from "lit-html";
import { eventToObserver, Widget, RouterBloc } from "valv";
import { HNStory } from "../blocs/HN";

export const StoryListItem = Widget(
  (
    context,
    { title, comments_count, points, time_ago, url, user, domain, id }: HNStory
  ) => {
    const router = context.blocs.of(RouterBloc);
    return html`
      <a
        href="${domain ? url : `/story/${id}`}"
        target="${domain ? "_blank" : ""}"
        style="text-decoration:none"
      >
        ${
          html`
            <div style="display:flex; flex-direction:column; cursor: pointer;">
              <div style="font-size:1.3rem">
                <span style="color:#000">${title}</span> ${
                  domain
                    ? html`
                        <span style="color:#666">(${domain})</span>
                      `
                    : ""
                }
              </div>
              <div style="font-size:.75rem; color:#666 ;">
                ${points} points by
                <a
                  @click="${
                    (e: MouseEvent) => {
                      e.preventDefault();
                      router.$next.next(`/user/${user}`);
                    }
                  }"
                  href="/user/${user}"
                  >${user}</a
                >
                ${time_ago} |
                <a
                  @click="${
                    (e: MouseEvent) => {
                      e.preventDefault();
                      router.$next.next(`/story/${id}`);
                    }
                  }"
                  href="/story/${id}"
                  >${comments_count} comments</a
                >
              </div>
            </div>
          `
        }</a
      >
    `;
  }
);
