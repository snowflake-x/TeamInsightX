export class Tooltip {
  #manager;
  #root;
  #container;
  #tooltip;
  #caption;
  #content;
  #match;
  #matchList;

  #loss;
  #win;
  #kdaList;

  constructor(manager) {
    this.#manager = manager;

    const root = (this.#root = document.createElement("div"));
    root.setAttribute(
      "style",
      "position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: visible; z-index: 19002;"
    );

    const container = (this.#container = document.createElement("div"));
    container.setAttribute(
      "style",
      "position: absolute; display: block;opacity:0;"
    );
    root.appendChild(container);

    const tooltip = (this.#tooltip =
      document.createElement("lol-uikit-tooltip"));
    tooltip.setAttribute("data-tooltip-position", "right");
    container.appendChild(tooltip);

    const view = document.createElement("div");
    view.setAttribute(
      "style",
      "background: #1a1c21; direction: ltr;  font-family: var(--font-body); -webkit-font-smoothing: subpixel-antialiased; color: #a09b8c; font-size: 12px; font-weight: 400; letter-spacing: .025em; line-height: 16px;"
    );
    tooltip.appendChild(view);

    const body = document.createElement("div");
    body.setAttribute("style", "min-width: 230px; padding: 13px;");
    view.appendChild(body);

    const caption = (this.#caption = document.createElement("div"));
    caption.setAttribute(
      "style",
      "margin-bottom: 8px; color: #f0e6d2; font-size: 14px; font-weight: 700; letter-spacing: .075em; line-height: 18px; text-transform: uppercase;"
    );
    body.appendChild(caption);

    const content = (this.#content = document.createElement("div"));
    content.setAttribute("style", "white-space: pre;");
    body.appendChild(content);

    const match = (this.#match = document.createElement("div"));
    match.setAttribute(
      "style",
      "position: relative;top:5px;color: #f0e6d2; font-weight: 700; font-size:14px; letter-spacing: .1em;"
    );
    body.appendChild(match);


    const win_rate = document.createElement("div");
    win_rate.setAttribute("style", "display: flex;position: relative;top:5px;")
    const win = (this.#win = document.createElement("span"));
    win.classList.add("win");
    win.textContent = "win:";
    win_rate.appendChild(win);
    const loss = (this.#loss = document.createElement("span"));
    loss.classList.add("loss");
    loss.textContent = "loss:";
    win_rate.appendChild(loss);
    body.appendChild(win_rate);

    const matchList = (this.#matchList = document.createElement("div"));
    matchList.setAttribute("style", "position: relative;top:5px");
    matchList.setAttribute("id", "matchList");
    body.appendChild(matchList);
  }

  mount(parent, position, caption, content,match_t) {
    this.#caption.textContent = caption;
    this.#content.textContent = content;
    this.#tooltip.setAttribute("data-tooltip-position", position);
    this.#match.innerText = match_t;
    this.#manager.appendChild(this.#root);
    this.repositionElement(parent, position);
  }

  umount() {
    this.#root.remove();
  //  this.#kdaList.remove();
  }
  repositionElement(parent, position) {
    let left, top, itop;
    const root = this.#tooltip;
    const rect = parent.getBoundingClientRect();
    const icon = root.shadowRoot.querySelector(".lol-uikit-tooltip-caret");
    const iconStyle = window.getComputedStyle(icon, "::before");
    const iconHeight = parseInt(iconStyle.getPropertyValue("height"));
    if (position === "right") {
      left = rect.right + 5;
      top = rect.bottom - (rect.height + this.#container.offsetHeight) / 2;
      if (top <= 0) {
        itop = this.#container.offsetHeight / 2 + top - 0;
        top = 0;
      } else if (top + this.#container.offsetHeight > window.innerHeight) {
        itop =
          top +
          this.#container.offsetHeight -
          (top + this.#container.offsetHeight - window.innerHeight);
        top = window.innerHeight - this.#container.offsetHeight;
      } else {
        itop = this.#container.offsetHeight / 2;
      }
    } else {
      top = rect.bottom + 40;
      left = rect.right - (rect.width + this.#container.offsetWidth) / 2;
    }
    icon.style.top = `${itop}px`;
    this.#container.style.left = `${left}px`;
    this.#container.style.top = `${top}px`;
  }

  show() {
    this.#container.style.opacity = 1;
    this.#container.style.display = "block";
  }

  hide() {
    this.#container.style.display = "none";
  }

  setKdaColor(el, kda) {
    console.log("kda -     " + kda);
    let color;
    const name = el.querySelector(".name-text");
    const sum = el.querySelector(".summoner-name");
    const span = el.querySelectorAll(".kda");
    if (kda > 4) {
      color = "#16cae5";
    } else if (kda > 3) {
      color = "#00a741";
    } else if (kda > 1.8) {
      color = "#fabe0a";
    } else {
      color = "#be1e37";
    }
    name.style.color = color;
    sum.style.maxHeight = "unset";
    span.forEach((element) => {
      element.remove();
    });
    sum.innerHTML += `<span class ="kda" style="display: block;">KDA: ${kda.toFixed(
      2
    )}</span>`;
    this.#kdaList = sum.querySelector(".kda");
  }

  appendMatchRecord(
    heroIcon_path,
    spell1Id_path,
    spell2Id_path,
    win,
    mode,
    kills,
    death,
    assist,
    items_path,
    minions,
    gold,
    win_t
  ) {
    const matchList = this.#matchList;
    const newHtml = `<div class="head-main">
        <div id="icon">
            <div class="icon-head" style="background-image: url(${heroIcon_path});"></div>
            <div style="display: flex">
                <div style="
                            height: 16px;
                            width: 16px;
                            background-image: url(${spell1Id_path});
                            background-size: cover;
                        "></div>
                <div style="
                            height: 16px;
                            width: 16px;
                            background-image: url(${spell2Id_path});
                            background-size: cover;
                        "></div>
            </div>
        </div>

        <div class="user-history-result">
            <div class="user-history-result-text ${
              win ? "victory" : "defeat"
            }">${win_t}</div>
            <div class="user-history-result-mode">${mode}</div>
        </div>
        <div >
        <div class="user-history-items">
            <div style="background-image: url(${items_path[0]});"></div>
            <div style="background-image: url(${items_path[1]});"></div>
            <div style="background-image: url(${items_path[2]});"></div>
            <div style="background-image: url(${items_path[3]});"></div>
            <div style="background-image: url(${items_path[4]});"></div>
            <div style="background-image: url(${items_path[5]});"></div>
        </div>
        <div class="match-data"">
        <span style="min-width:80px;display: inline-block;">
            <span id="kills">${kills}</span>
            /<span id="Deaths">${death}</span>
            /<span id="Assists">${assist}</span>
          </span>
          <span class="user-minions" >${minions}</span>
          <span class="user-gold" >${gold}</span>
        </div>
        </div>
    </div>`;

    const range = document.createRange();
    const fragment = range.createContextualFragment(newHtml);

    matchList.appendChild(fragment);
  }

  setwinrate(win,loss){
    this.#win.textContent = "win:"+win;
    this.#loss.textContent = "loss:"+loss;
  }
  
}
