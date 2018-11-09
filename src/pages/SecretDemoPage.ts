import { Widget, asynco, RouterBloc } from "../lit-rx";
import { html } from "lit-html";
import { defer } from "rxjs";
import { SecretCodeBloc } from "../blocs/SecretCodeBloc";
import { take, takeLast } from "rxjs/operators";
import { paperMaterial } from "../styles";
import "wired-elements";

export const SecretDemoPage = Widget(blocs => {
  return html`
    ${
      asynco(
        defer(async () => {
          const unlocked = await blocs
            .of(SecretCodeBloc)
            .unlockedSubject.pipe(take(1))
            .toPromise();
          if (!unlocked) {
            blocs.of(RouterBloc).nextObserver.next("/");
          }
        })
      )
    }
    <link
      href="https://fonts.googleapis.com/css?family=Gloria+Hallelujah"
      rel="stylesheet"
    />
    <style>
      @keyframes bounce {
        0% {
          transform: translate(5px, 0);
        }
        50% {
          transform: translate(-5px, 0);
        }
        100% {
          transform: translate(5px, 0);
        }
      }
      .bouncy {
        animation: bounce 1s infinite;
        animation-play-state: running;
      }
    </style>
    <div
      style="
        margin-top: 10px;
        display: flex;
        justify-content: center;"
    >
      <wired-card elevation="2">
        <div
          style="
        font-family: 'Gloria Hallelujah',sans-serif;
          margin:20px;
          height:400px;
          width:700px"
        >
          <wired-checkbox
            text="Easy UI design and composition"
          ></wired-checkbox>
          <wired-checkbox
            text="Powerful state management thanks to rxjs"
          ></wired-checkbox>
          <wired-checkbox
            text="Fast! (No need to traverse the tree on every update)"
          ></wired-checkbox>
          <wired-checkbox text="SPA router"></wired-checkbox>
          <wired-checkbox text="Web components!"></wired-checkbox>
          <div class="bouncy">
            <wired-checkbox text="Web Animations!"></wired-checkbox>
          </div>
          <wired-checkbox text="Tiny (10KB gzipped)"></wired-checkbox>
        </div>
      </wired-card>
    </div>
  `;
});
