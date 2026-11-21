[Open the live typing studio](https://asp123-cyber.github.io/Typing-web/)

# Terminal Velocity

Terminal Velocity is a browser-based typing trainer for practicing with one hand or both. Choose a hand layout and a challenge length, then type the passage while the keyboard guide shows which key comes next. The timer starts with your first character, so you can read the passage and position your hands before a session.

## Practice modes

| Challenge | Available lengths | When the session ends |
| --- | --- | --- |
| Words | 25, 50, or 100 words | When your input reaches the end of the passage, including any mistakes still present |
| Time | 30, 60, or 120 seconds | When the countdown reaches zero; the trainer adds words as you approach the end of the passage |

The studio opens with **Both hands** and **50 words** selected. Click or tap the passage to focus it. Type the spaces between words and use Backspace to correct a mistake. **Restart** generates a fresh passage and clears the current scores. Changing a practice setting also starts a fresh session.

## Hand layouts and dictionary

| Hand mode | Allowed letters | Available words | Example words |
| --- | --- | ---: | --- |
| Left hand | `qwertysdfgzxcvb` | 321 | `breeze`, `street`, `sweet` |
| Right hand | `ahijklmnopu` | 233 | `piano`, `minimum`, `pumpkin` |
| Both hands | All 26 letters | 831 | `terminal`, `velocity`, `rhythm` |

This trainer uses a custom split that places **Y on the left** and **A on the right**. Every letter in a single-hand word must belong to the selected set. Both-hands mode draws from the full dictionary, including the single-hand words. The trainer shuffles each pool and draws without replacement until the pool runs out.

## Reading your results

- **Typing speed** uses five correct characters as one standard word. For example, 150 matching characters in 30 seconds gives **60 WPM**. A correctly typed space counts as a character. The line beside the WPM readout shows recent speed samples.
- **Accuracy** tracks correct character attempts throughout the session. If the target is `bee` and you type `bex`, delete the `x`, then type the final `e`, you finish with three matching characters and **75% accuracy** across four attempts.
- **Characters correct** compares the text left in the input with the passage when the session ends. In the same example, the result is **3/3**. In a timed session, the denominator is the number of characters you reached.

## Keyboard and display

The on-screen keyboard uses separate colors for each hand, dims keys outside the selected hand, and outlines the next expected key. Mistakes appear underlined in the passage. Sound starts muted and can be toggled in the header. The wireframe banner respects the device’s reduced-motion setting, and the practice console and metrics stack vertically on smaller screens.

## Run locally

Open `index.html` directly in a modern browser. The project uses plain HTML, CSS, and JavaScript, with no package installation or build step. To preview it over HTTP, run this command from the repository directory using Python 3.

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `localhost:8000` in your browser. Press Ctrl+C in the terminal to stop the server.

## Project files

| File | What it controls |
| --- | --- |
| `index.html` | Page structure, practice controls, metrics, and script loading order |
| `style.css` | Typography, responsive layout, keyboard colors, and typing feedback |
| `words.js` | Source vocabulary, letter assignments, and filtered word pools |
| `script.js` | Passage generation, input handling, timing, scoring, sound, and canvas graphics |

### Add practice words

Add lowercase, whitespace-separated words to `vocabulary` in `words.js`. The dictionary removes duplicates and derives both single-hand pools automatically. For example, adding `type` makes it available in both-hands mode only, because `t`, `y`, and `e` belong to the left set while `p` belongs to the right. To change the hand layout itself, edit `LEFT_KEYS`. The right-hand set is computed from the remaining letters.

When publishing an asset change to GitHub Pages, update that file’s `?v=` value in `index.html` alongside the changed file so returning visitors receive the new version.
