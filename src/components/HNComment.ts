import { html } from "lit-html";
import { PartialObserver, Observable, BehaviorSubject } from "rxjs";
import { asynco, eventToObserver, Widget } from "../lit-rx";
import { IHNComment } from "../blocs/HN";
import { repeat } from "lit-html/directives/repeat";
import { unsafeHTML } from "lit-html/directives/unsafe-html";

export interface HNCommentProps {
  comment: IHNComment;
}

export const HNComment: Widget<HNCommentProps> = Widget(
  (
    blocs,
    { comment: { id, user, time_ago, content, comments } }: HNCommentProps
  ) => {
    const openSubject = new BehaviorSubject(true);
    return html`
      <div style="font-size: .75rem">
        <div>
          ${
            asynco(openSubject, open =>
              open
                ? html`
                    <span
                      style="cursor: pointer"
                      @click="${() => openSubject.next(false)}"
                      >[-]</span
                    >
                  `
                : html`
                    <span
                      style="cursor: pointer"
                      @click="${() => openSubject.next(true)}"
                      >[+${comments.length}]</span
                    >
                  `
            )
          }
          ${user} ${time_ago}
        </div>
        <div>${unsafeHTML(content)}</div>
      </div>
      <hr />
      ${
        asynco(openSubject, open =>
          open
            ? html`
                <div style="margin-inline-start: 20px">
                  ${
                    repeat(
                      comments,
                      comment => comment.id,
                      comment => HNComment(blocs, { comment })
                    )
                  }
                </div>
              `
            : ""
        )
      }
    `;
  }
);
