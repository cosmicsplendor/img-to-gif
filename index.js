const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
// --- Use the new library ---
const GIFEncoder = require('gifencoder'); // <= CHANGED
const { createCanvas, loadImage } = require('canvas');

// --- Configuration ---
const IMAGES_DIR = path.join(__dirname, 'images');
const OUTPUT_GIF = path.join(__dirname, 'output_gifencoder.gif'); // Use a new name to avoid confusion
// const DEBUG_FRAMES_DIR = path.join(__dirname, 'debug_frames'); // Keep if needed
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const FRAME_DELAY_MS = 100;
const GIF_QUALITY = 10; // 1 (best) to 20 (worst) in gifencoder
const GIF_REPEAT = 0; // 0 = loop forever, -1 = no loop
const FILL_BACKGROUND_COLOR = '#FFFFFF';
// const SAVE_DEBUG_FRAMES = false; // Keep false unless needed again
// --- End Configuration ---

async function generateGifWithGifEncoder() {
    console.log(`Using 'gifencoder' library.`);
    console.log(`Scanning directory: ${IMAGES_DIR}`);

    // --- Debug directory handling omitted for brevity, add back if needed ---

    let writeStream; // Define stream variable for potential cleanup

    try {
        // 1. Read directory contents (same as before)
        const dirents = await fs.readdir(IMAGES_DIR, { withFileTypes: true });

        // 2. Filter and get stats (same as before)
        console.log("Filtering and getting file stats...");
        const imageFilesPromises = dirents
            .filter(dirent => {
                const ext = path.extname(dirent.name).toLowerCase();
                return dirent.isFile() && ALLOWED_EXTENSIONS.includes(ext);
            })
            .map(async (dirent) => {
                const fullPath = path.join(IMAGES_DIR, dirent.name);
                try {
                    const stats = await fs.stat(fullPath);
                    const timestamp = stats.birthtimeMs || stats.mtimeMs;
                    if (!timestamp) return null;
                    return { path: fullPath, name: dirent.name, timestamp: timestamp };
                } catch { return null; }
            });
        let imageFiles = (await Promise.all(imageFilesPromises)).filter(file => file !== null);
        imageFiles.sort((a, b) => a.timestamp - b.timestamp);

        if (imageFiles.length === 0) {
            console.error(`No valid image files found in ${IMAGES_DIR}`);
            return;
        }
        console.log(`Found ${imageFiles.length} images.`);

        // 3. Determine dimensions (same as before)
        console.log(`Loading first image to determine dimensions: ${imageFiles[0].name}`);
        const firstImage = await loadImage(imageFiles[0].path);
        const width = firstImage.width;
        const height = firstImage.height;
        console.log(`GIF dimensions set to: ${width}x${height}`);

        // 4. Initialize GIFEncoder (using the new library)
        console.log("Initializing GIFEncoder...");
        const encoder = new GIFEncoder(width, height);

        // --- Set up stream piping (different for gifencoder) ---
        console.log("Setting up file stream pipe...");
        writeStream = fssync.createWriteStream(OUTPUT_GIF);
        encoder.createReadStream().pipe(writeStream); // Pipe the readable stream from the encoder
        // --- End stream setup ---

        // Configure encoder (API methods are similar)
        console.log("Configuring GIFEncoder...");
        encoder.start(); // IMPORTANT: Start encoder *before* adding frames
        encoder.setRepeat(GIF_REPEAT);
        encoder.setDelay(FRAME_DELAY_MS);
        encoder.setQuality(GIF_QUALITY); // Quality range is typically 1-20 or more

        // 5. Create Canvas and add frames (logic mostly the same)
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        console.log('Starting GIF frame encoding loop...');
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const frameNumber = i + 1;
            console.log(`  [${frameNumber}/${imageFiles.length}] Processing: ${file.name}`);

            try {
                const image = await loadImage(file.path);

                // Fill background or clear
                if (FILL_BACKGROUND_COLOR) {
                    ctx.fillStyle = FILL_BACKGROUND_COLOR;
                    ctx.fillRect(0, 0, width, height);
                } else {
                    ctx.clearRect(0, 0, width, height);
                }
                // Draw image
                ctx.drawImage(image, 0, 0, width, height);

                // --- Add frame using context (gifencoder often handles context directly) ---
                // You can also use raw pixel data if preferred:
                // const imageData = ctx.getImageData(0, 0, width, height);
                // encoder.addFrame(imageData.data);
                encoder.addFrame(ctx); // Try context first with gifencoder
                console.log(`   Frame ${frameNumber} added to encoder.`);
                // --- End add frame ---

                // No explicit yield needed usually, as piping handles backpressure better sometimes
                // await new Promise(resolve => setImmediate(resolve)); // Keep commented unless needed

            } catch (loadOrDrawErr) {
                 console.error(`>>> Error processing image ${file.name} (Frame ${frameNumber}):`, loadOrDrawErr.message);
                 console.warn(`    Skipping frame ${frameNumber} for ${file.name}.`);
                 continue;
            }
        } // End of for loop

        // 6. Finalize GIF
        console.log("Loop finished. Calling encoder.finish()...");
        encoder.finish(); // IMPORTANT: Finalize the GIF

        // Wait for the write stream to finish
        console.log("Waiting for file stream 'finish' event...");
        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                 console.log("Stream 'finish' event received.");
                 resolve();
            });
            writeStream.on('error', (err) => {
                 console.error(">>> Critical Error writing GIF file stream:", err);
                 reject(err);
            });
        });
        console.log("Finished awaiting stream completion.");

        console.log(`\nSuccessfully generated GIF (script completed): ${OUTPUT_GIF}`);
        console.log(`Final file size: ${(await fs.stat(OUTPUT_GIF)).size} bytes`);

    } catch (error) {
        console.error('>>> AN UNEXPECTED ERROR OCCURRED:', error);
        if (writeStream && !writeStream.writableEnded) {
             console.log("Attempting to close write stream due to error...");
             writeStream.end();
        }
    }
}

// Run the generation function
generateGifWithGifEncoder()
    .then(() => console.log("generateGif function finished."))
    .catch(err => console.error("Error running generateGif:", err));