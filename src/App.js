import './App.css';
import { useState } from 'react';



function App() {
  const [author, setAuthor] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [categories, setCategories] = useState({
    0: "1", 1: "2", 2: "3", 3: "4"
  });
  const [title, setTitle] = useState("");
  const [boxes, setBoxes] = useState(Array(16).fill(null).map((_, i) => ({text: "placeholder", category: categories[i % 4]})));
  const [copied, setCopied] = useState(false);
  const [publishDate, setPublishDate] = useState()

  function toBase64(str) 
{
    const uint8Array = new TextEncoder().encode(str);
    return btoa(String.fromCharCode(...uint8Array));
}
  function generateHTTML() {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title> ${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body {
      margin: 0;
      padding: 16px;
      background: #f3f4f6;
      display: flex;
      justify-content: center;
    }
    .byline {
      font-size: 0.8rem;
      color: #6b7280;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }
    .copyright-line {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 12px;
      font-style: italic;
    }
    .game-container {
      max-width: 480px;
      width: 100%;
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      box-sizing: border-box;
    }
    h1 {
      font-size: 1.4rem;
      margin: 0 0 4px;
    }
    .subtitle {
      font-size: 0.9rem;
      color: #6b7280;
      margin-bottom: 12px;
    }
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
    .strikes {
      color: #b91c1c;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr)); /* 4 equal columns */
      gap: 8px;
      margin-bottom: 12px;
    }
    .tile {
       border-radius: 8px;

        /* RECTANGLES: remove aspect-ratio and just give a fixed-ish height */
        height: 56px;              /* adjust up/down to taste */

        /* center the text */
        display: flex;
        align-items: center;
        justify-content: center;

        padding: 4px 6px;
        text-align: center;
        font-size: 0.85rem;

        cursor: pointer;
        user-select: none;
        border: 1px solid #d1d5db;
        background: #e5e7eb;
        transition: transform 0.05s ease, box-shadow 0.05s ease,
                background 0.1s ease, border-color 0.1s ease;
        word-wrap: break-word;
    }
    .tile:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .tile.selected {
      background: #bfdbfe;
      border-color: #2563eb;
    }
    .tile.disabled {
      opacity: 0.6;
      cursor: default;
      box-shadow: none;
      transform: none;
    }
    .group-row {
      margin-bottom: 6px;
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 0.9rem;
      color: white;
    }
    .group-row span.words {
      font-weight: 600;
    }
    .group-row span.category {
      display: block;
      font-size: 0.8rem;
      opacity: 0.9;
    }
    .group-color-0 { background: #98c021; } /* green */
    .group-color-1 { background: #f7d83b; } /* yellow */
    .group-color-2 { background: #07bbc9; } /* blue */
    .group-color-3 { background: #a269c6; } /* purple */

    .button-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 8px;
    }
    .btn {
      flex: 1;
      border-radius: 999px;
      border: none;
      padding: 8px 10px;
      font-size: 0.9rem;
      cursor: pointer;
      background: #111827;
      color: white;
      font-weight: 500;
      transition: opacity 0.1s ease, transform 0.05s ease;
    }
    .btn.secondary {
      background: #e5e7eb;
      color: #111827;
    }
    .btn:active {
      transform: translateY(1px);
      opacity: 0.8;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: default;
      transform: none;
    }
    .message {
      min-height: 1.4em;
      font-size: 0.9rem;
      margin-top: 6px;
    }
    .message.error {
      color: #b91c1c;
    }
    .message.success {
      color: #15803d;
    }
    .message.info {
      color: #4b5563;
    }
    .footer-note {
      margin-top: 8px;
      font-size: 0.7rem;     
      font-style: italic;    
      color: #9ca3af;      
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <h1>‘CAL’-nections</h1>
    <div class="subtitle">Create groups of four!</div>
    <div class="byline">By ${author} • Staff • ${authorEmail}</div>
    <div class="copyright-line">© 2026 The Daily Californian</div>
    <div class="status-bar">
      <div>Groups solved: <span id="groups-solved">0</span>/4</div>
      <div class="strikes">Strikes: <span id="strikes">0</span>/4</div>
    </div>
    <div id="solved-groups"></div>
    <div class="grid" id="grid"></div>
    <div class="button-row">
      <button id="submit-btn" class="btn" disabled>Submit</button>
      <button id="clear-btn" class="btn secondary">Clear</button>
    </div>
    <div id="message" class="message info"></div>
    <div class="footer-note">
      Inspired by The New York Times’ Connections &copy;
    </div>
  </div>

  <script>
    // ===== CONFIGURE YOUR PUZZLE HERE =====
    // Four groups, each with a category and 4 words.
    const PUZZLE = [
      ${Object.values(categories).map((category, i) => (
        `
        {
          category: "${category}",
          words: ${JSON.stringify(boxes.filter((c, j) => j%4 === i).map(b => b.text))}
        },
        `
      ))}
    ];

    // ===== GAME LOGIC =====
    const ALL_WORDS = PUZZLE.flatMap((group, groupIndex) =>
      group.words.map(word => ({ word, groupIndex }))
    );

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const state = {
      tiles: shuffle([...ALL_WORDS]),
      selectedIndices: [],
      solvedGroupIndices: new Set(),
      strikes: 0,
      gameOver: false
    };

    const gridEl = document.getElementById("grid");
    const messageEl = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");
    const clearBtn = document.getElementById("clear-btn");
    const solvedGroupsEl = document.getElementById("solved-groups");
    const strikesEl = document.getElementById("strikes");
    const groupsSolvedEl = document.getElementById("groups-solved");

    function renderGrid() {
      gridEl.innerHTML = "";
      state.tiles.forEach((tile, index) => {
        const isSolved = state.solvedGroupIndices.has(tile.groupIndex);
        const isSelected = state.selectedIndices.includes(index);
        const isDisabled = isSolved || state.gameOver;

        const btn = document.createElement("button");
        btn.className =
          "tile" +
          (isSelected ? " selected" : "") +
          (isDisabled ? " disabled" : "");
        btn.textContent = tile.word;
        btn.disabled = isDisabled;

        if (!isDisabled) {
          btn.addEventListener("click", () => onTileClick(index));
        }

    gridEl.appendChild(btn);
  });

  submitBtn.disabled = state.selectedIndices.length !== 4 || state.gameOver;
  clearBtn.disabled = state.selectedIndices.length === 0 || state.gameOver;
  strikesEl.textContent = state.strikes.toString();
  groupsSolvedEl.textContent = state.solvedGroupIndices.size.toString();
}

    function onTileClick(index) {
      if (state.selectedIndices.includes(index)) {
        state.selectedIndices = state.selectedIndices.filter(i => i !== index);
      } else {
        if (state.selectedIndices.length < 4) {
          state.selectedIndices.push(index);
        }
      }
      setMessage("", "info");
      renderGrid();
    }

    function setMessage(text, type) {
      messageEl.textContent = text;
      messageEl.className = "message " + (type || "info");
    }

    function checkSelection() {
      if (state.selectedIndices.length !== 4) return;
      const groups = state.selectedIndices.map(i => state.tiles[i].groupIndex);
      const uniqueGroups = new Set(groups);
      if (uniqueGroups.size === 1) {
        const groupIndex = groups[0];
        if (state.solvedGroupIndices.has(groupIndex)) {
          setMessage("You already solved that group.", "info");
          return;
        }
        state.solvedGroupIndices.add(groupIndex);
        revealSolvedGroup(groupIndex);
        setMessage("Nice! You found a group.", "success");

        if (state.solvedGroupIndices.size === 4) {
          setMessage("Perfect! You solved all four groups!", "success");
        }

        state.selectedIndices = [];
        renderGrid();
      } else {
          state.strikes++;
          setMessage("Nope, those four don't form a group.", "error");

          if (state.strikes >= 4) {
            state.gameOver = true;
            revealAllGroupsOnFail();
            setMessage(
              "Game over. You've reached 4 strikes. Here are the solutions:",
              "error"
          );
        }

  state.selectedIndices = [];
  renderGrid();
}
    }

   function revealSolvedGroup(groupIndex) {
     const group = PUZZLE[groupIndex];
      const groupRow = document.createElement("div");
      groupRow.className = "group-row group-color-" + groupIndex;
      const wordsSpan = document.createElement("span");
      wordsSpan.className = "words";
      wordsSpan.textContent = group.words.join(" · ");
      const catSpan = document.createElement("span");
      catSpan.className = "category";
      catSpan.textContent = group.category;
      groupRow.appendChild(wordsSpan);
      groupRow.appendChild(catSpan);
      solvedGroupsEl.appendChild(groupRow);
    }

    // NEW: reveal all remaining groups when the player fails
    function revealAllGroupsOnFail() {
      for (let i = 0; i < PUZZLE.length; i++) {
        if (!state.solvedGroupIndices.has(i)) {
          state.solvedGroupIndices.add(i);
          revealSolvedGroup(i);
        }
      }
      groupsSolvedEl.textContent = state.solvedGroupIndices.size.toString();
    }

    submitBtn.addEventListener("click", checkSelection);
    clearBtn.addEventListener("click", () => {
      state.selectedIndices = [];
      setMessage("", "info");
      renderGrid();
    });

    renderGrid();
    setMessage("Select four words you think belong together", "info");
  </script>
</body>
</html>
    `
  }
  return (
    <div className="App">
         <div className="container">
            <div className="hero">
                <h1> Cal-Nections Builder </h1>
                Author: <input type = "text" value = {author} onChange={e => {
                  setAuthor(e.target.value);
                  setCopied(false);
                }}/>
                <br />
                <br />
                Email: <input type = "text" value = {authorEmail} onChange={e => {
                  setAuthorEmail(e.target.value)
                  setCopied(false);
                }}/>
                <br />
                <br />
                Title: <input type = "text" value = {title} onChange={e => {
                  setTitle(e.target.value)
                  setCopied(false);
                }}/>
                <br />
                <br />
                Set categories and words for each category below (grid will be shuffled when displayed to user)
                <br />
                <br />
            </div>
            <main>
             
              <div className='fields'>
                <div className='categories'>
                  <h2> Categories: </h2>
                  <ol>
                    {Object.values(categories).map((category, i) => (
                     <li>
                         <textarea value = {category} onChange={e => {
                          setCategories(prev => ({...prev, [i]: e.target.value}))
                          setCopied(false);
                        }} />
                        
                     </li>
                    ))}
                  </ol>
                </div>
                <div className='grid'>
                  {Object.values(categories).map((category, i) => (
                    <div className='row'>
                      <div className='category-name' style = {{maxWidth: "100%", overflowX: "scroll", textWrap: "nowrap"}}>Category: {category} </div>
                      {boxes.map((box, j) =>  (j % 4 === i)&& (
                        <div className='box'>
                          Text: 
                        <input value={boxes[j].text} onChange={e => {
                          setCopied(false);
                          setBoxes(prev => {
                            let newBoxes = [...prev];
                            newBoxes[j].text = e.target.value;
                            return newBoxes
                          })}}  />
                          </div>
                      ))}
                    </div>
                    // <div className='box'>
                    //   Text: 
                    //   <input value={boxes[i].text} onChange={e => {
                    //     setBoxes(prev => {
                    //       let newBoxes = [...prev];
                    //       newBoxes[i].text = e.target.value;
                    //       return newBoxes
                    //     })}}  />
                    //     {/* Category:
                    //     <select style = {{maxWidth: "90%"}} value= {boxes[i].category} onChange={e => {
                    //           setBoxes(prev => {
                    //             let newBoxes = [...prev];
                    //             newBoxes[i].category = e.target.value;
                    //             return newBoxes
                    //           })}}>
                    //       {Object.values(categories).map((category) => (
                    //         <option value ={category}  > {category} </option>
                    //       ))}
                    //     </select> */}
                    //   </div>
                      
                   
                  ))}
                </div>
                <div className='generate'>
                  <button className={copied && "copied"} onClick = {() => {
                   // try {
                   let html = generateHTTML();
                  // setHTML(html);
                      navigator.clipboard.writeText(generateHTTML());
                      setCopied(true)
                    // }
                    // catch (err) {

                    // }
                  }}> {copied? "Copied" : "Copy"} HTML text to Clipboard </button>
                  <br />
                  <br />
                  <br />
                  {/* <div className='html'>
                    {html}
                  </div> */}
                  <a href = {`data:text/html;base64,${toBase64(generateHTTML())}`} download={true} title={`${author}-calnections.html`}> Download HTML  </a>
                </div>
              </div>
            </main>
        </div>
    </div>
  );
}

export default App;
