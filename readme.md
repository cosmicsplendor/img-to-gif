# ✨ Image Sequence to GIF Converter (using `gifencoder`) ✨

This Node.js script automatically converts a sequence of images (PNG, JPG/JPEG) located in a specified directory into an animated GIF file. It uses the [`gifencoder`](https://github.com/eugeneware/gifencoder) library for efficient GIF creation and [`node-canvas`](https://github.com/Automattic/node-canvas) for image processing.

The script reads images from an input folder, sorts them chronologically based on their file creation or modification timestamp, and then encodes them frame by frame into a single GIF output file.
![Sample GIF](https://raw.githubusercontent.com/cosmicsplendor/img-to-gif/master/output_gifencoder.gif)
## 🚀 Features

*   **Image to GIF:** Converts `.png`, `.jpg`, and `.jpeg` files into an animated GIF.
*   **Chronological Sorting:** Automatically sorts input images based on filesystem timestamp (creation or modification time) before encoding.
*   **`gifencoder` Library:** Utilizes the `gifencoder` library for GIF generation.
*   **Configurable Output:** Easily adjust frame delay, GIF quality, looping behavior, and background fill color.
*   **Automatic Dimensioning:** Determines the GIF dimensions based on the first image found in the sequence.
*   **Stream-Based Output:** Pipes the encoded GIF data directly to a file stream for potentially better memory efficiency with large GIFs.
*   **Basic Error Handling:** Skips individual frames if an error occurs during image loading or processing, preventing the entire process from failing.

## ⚙️ Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```
2.  **Install dependencies:**
    *   You'll need a `package.json` file. If you don't have one, run `npm init -y`.
    *   Install the required libraries:
        ```bash
        npm install gifencoder canvas
        # or
        yarn add gifencoder canvas
        ```
    *   **Note:** `node-canvas` has system dependencies (like `cairo`, `pango`, `libjpeg`, `giflib`, etc.). Refer to the [node-canvas installation guide](https://github.com/Automattic/node-canvas#installation) for your specific operating system if you encounter issues during installation.

## ▶️ Usage

1.  **Place Images:** Put the image files (`.png`, `.jpg`, `.jpeg`) you want to include in the GIF inside the `images` directory (or the directory specified by `IMAGES_DIR` in the script).
2.  **Configure (Optional):** Modify the constants within the `// --- Configuration ---` section of the script (`your_script_name.js`) to change parameters like frame delay, quality, or input/output paths.
3.  **Run the script:**
    ```bash
    node your_script_name.js
    ```
    *(Replace `your_script_name.js` with the actual name of your script file.)*
4.  **Output:** The resulting GIF file will be saved as `output_gifencoder.gif` (or the path specified by `OUTPUT_GIF`) in the script's directory.

## 🔧 Configuration

You can adjust the GIF generation process by modifying these constants at the top of the script:

```javascript
// --- Configuration ---
const IMAGES_DIR = path.join(__dirname, 'images'); // Input image directory
const OUTPUT_GIF = path.join(__dirname, 'output_gifencoder.gif'); // Output GIF path
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg']; // Allowed input image types
const FRAME_DELAY_MS = 100; // Delay between frames (milliseconds)
const GIF_QUALITY = 10; // Quality (1=best, 20=worst for gifencoder)
const GIF_REPEAT = 0; // Repeat count (0=forever, -1=no loop)
const FILL_BACKGROUND_COLOR = '#FFFFFF'; // Background color (e.g., '#FFFFFF' or null to disable)
// --- End Configuration ---

