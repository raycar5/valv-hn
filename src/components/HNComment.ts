import { html } from "lit-html";
import { BehaviorSubject } from "rxjs";
import { awaito, Widget } from "valv";
import { IHNComment } from "../blocs/HN";
import { repeat } from "lit-html/directives/repeat";
import { unsafeHTML } from "lit-html/directives/unsafe-html";

export interface HNCommentProps {
  comment: IHNComment;
}

export const HNComment: Widget<HNCommentProps> = Widget(
  (
    context,
    { comment: { id, user, time_ago, content, comments } }: HNCommentProps
  ) => {
    const $open$ = new BehaviorSubject(true);
    return html`
      <div style="font-size: .75rem">
        <div>
          ${
            awaito($open$, open =>
              open
                ? html`
                    <span
                      style="cursor: pointer"
                      @click="${() => $open$.next(false)}"
                      >[-]</span
                    >
                  `
                : html`
                    <span
                      style="cursor: pointer"
                      @click="${() => $open$.next(true)}"
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
        awaito($open$, open =>
          open
            ? html`
                <div style="margin-inline-start: 20px">
                  ${
                    repeat(
                      comments,
                      comment => comment.id,
                      comment => HNComment(context, { comment })
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
