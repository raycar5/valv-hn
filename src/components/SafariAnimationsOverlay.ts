import { Widget, just, awaito } from "valv";
import { html } from "lit-html";
import { Button } from "./Button";
import { Subject, BehaviorSubject } from "rxjs";
import { mapTo } from "rxjs/operators";
import { ConfigBloc } from "../blocs/Config";

const waios1 = require("../assets/waios1.png");
const waios2 = require("../assets/waios2.png");
const waios3 = require("../assets/waios3.png");
const wamac1 = require("../assets/wamac1.png");
const wamac2 = require("../assets/wamac2.png");

export const SafariAnimationsOverlay = Widget(context => {
  if (context.blocs.of(ConfigBloc).areAnimationsSupported) return html``;
  const ua = window.navigator.userAgent;
  const isMacSafari =
    navigator.platform &&
    navigator.platform.indexOf("Mac") !== -1 &&
    ua &&
    ua.indexOf("Safari") != -1;

  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const bs = new BehaviorSubject(true);
  const s = new Subject();
  s.pipe(mapTo(false)).subscribe(bs);

  return html`
    ${
      awaito(bs, open => {
        if (!open) return "";
        else
          return html`
            <div
              style="
        z-index:999;
        position: fixed;
        height: 100vh;
        width: 100vw;
        background-color: #0004;
        "
            ></div>
            <div
              class="paper-material"
              style="
        z-index:1000;
        position: absolute;
        top: 100px;
        left: 50vw;
        transform: translateX(-50%);

        "
            >
              <p>
                Whoa there, it looks like your browser doesn't support the super
                awesome new
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API"
                  >Web animations API</a
                >
              </p>
              <p>
                This site heavily relies on animations and it might be buggy
                without them
              </p>
              ${
                isMacSafari
                  ? html`
                      <p>
                        Good news is, you can fix it, just enable the Safari
                        developer options and the web animations api under
                        'Experimental Features'
                      </p>
                      <img
                        style="display:block; width:auto; max-width:100%; margin:5px auto"
                        src="${wamac1}"
                      />
                      <img
                        style="display:block; width:auto; max-width:100%; margin:5px auto"
                        src="${wamac2}"
                      />
                    `
                  : iOS
                  ? html`
                      <p>
                        Good news is, you can fix it, just enable the web
                        animations api in the advanced Safari settings under
                        'Experimental Features' and restart Safari
                      </p>
                      <img
                        style="display:block; width:auto; max-width:100%; margin:5px auto"
                        src="${waios1}"
                      />
                      <hr />
                      <img
                        style="display:block; width:auto; max-width:100%; margin:5px auto"
                        src="${waios2}"
                      />
                      <hr />
                      <img
                        style="display:block; width:auto; max-width:100%; margin:5px auto"
                        src="${waios3}"
                      />
                    `
                  : html`
                      <p>
                        You might want to search google to see if you can enable
                        the api using a browser setting or flag, continue at
                        your own risk
                      </p>
                    `
              }
              ${
                Button(context, {
                  text$: just("Close"),
                  $event: s
                })
              }
            </div>
          `;
      })
    }
  `;
});
