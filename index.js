#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const PDFDocument = require("pdfkit");

const API_URL = "https://mobile-api.lambdatest.com/mobile-automation/api/v1/sessions/";

function parseArguments() {
  const args = process.argv.slice(2);
  const sessionId = args[0]?.trim();

  const outputIndex = args.indexOf("--output");
  const outputDir = outputIndex !== -1 && args[outputIndex + 1] 
    ? path.resolve(args[outputIndex + 1])  
    : process.cwd();  

  const authHeader = process.env.AUTH_HEADER || "";
  
  if (!sessionId || sessionId.length !== 36) {
    console.error("\n❌ Invalid or missing session ID.");
    console.error("👉 Usage: node index.js <session_id> [--output <output_directory>]");
    process.exit(1);
  }

  if (!authHeader) {
    console.error("\n❌ AUTH_HEADER is missing.");
    console.error("👉 Run the command like this:");
    console.error('   AUTH_HEADER="Basic your_encoded_auth_string" node index.js <session_id> [--output <output_directory>]\n');
    process.exit(1);
  }

  return { sessionId, outputDir, authHeader };
}

async function fetchScreenshotZip(sessionId, authHeader) {
  try {
    console.log(`📡 Fetching screenshot ZIP for session: ${sessionId}...`);

    const response = await axios.get(`${API_URL}${sessionId}/screenshots`, {
      headers: { Accept: "application/json", Authorization: authHeader },
      timeout: 10000,
    });

    if (!response.data?.url) throw new Error("Screenshot ZIP URL not found.");

    const zipPath = path.join(process.cwd(), `screenshots_${sessionId}.zip`);
    const writer = fs.createWriteStream(zipPath);

    console.log(`⬇️  Downloading ZIP file...`);

    const zipResponse = await axios({
      url: response.data.url,
      method: "GET",
      responseType: "stream",
      timeout: 20000,
    });

    return new Promise((resolve, reject) => {
      zipResponse.data.pipe(writer);
      writer.on("finish", () => resolve(zipPath));
      writer.on("error", (err) => {
        fs.removeSync(zipPath);
        reject(new Error(`Failed to write ZIP file: ${err.message}`));
      });
    });
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

async function extractScreenshots(zipPath, sessionId) {
  try {
    if (!fs.existsSync(zipPath)) throw new Error("ZIP file not found.");

    const extractPath = path.join(process.cwd(), `screenshots_${sessionId}`);
    fs.ensureDirSync(extractPath);

    console.log("📂 Extracting screenshots...");
    new AdmZip(zipPath).extractAllTo(extractPath, true);

    return extractPath;
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    fs.removeSync(zipPath);
    process.exit(1);
  }
}

async function createPdfFromScreenshots(folderPath, outputDir, sessionId) {
  try {
    fs.ensureDirSync(outputDir);
    const pdfPath = path.join(outputDir, `screenshots_${sessionId}.pdf`);  // ✅ Now correctly naming PDF

    console.log(`📄 Generating PDF at: ${pdfPath}`);

    const images = fs.readdirSync(folderPath).filter(file => file.match(/\.(png|jpg|jpeg)$/)).sort();
    if (images.length === 0) throw new Error("No valid screenshots found.");

    const doc = new PDFDocument({ autoFirstPage: false });
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    images.forEach((image, index) => {
      try {
        const img = doc.openImage(path.join(folderPath, image));
        doc.addPage({ size: [img.width, img.height] }).image(img, 0, 0);
        console.log(`🖼️  Added image ${index + 1}/${images.length} to PDF.`);
      } catch {
        console.warn(`⚠️  Skipping ${image}: Invalid image file.`);
      }
    });

    doc.end();
    return new Promise((resolve, reject) => {
      pdfStream.on("finish", () => {
        console.log(`\n✅ PDF successfully generated at: ${pdfPath}`);
        resolve(pdfPath);
      });

      pdfStream.on("error", reject);
    });
  } catch (error) {
    console.error(`\n❌ Error creating PDF: ${error.message}`);
    process.exit(1);
  }
}

async function cleanup(zipPath) {
  try {
    fs.removeSync(zipPath);
    console.log("🗑️  Cleanup complete: Removed temporary ZIP file.");
  } catch (error) {
    console.warn("⚠️  Cleanup warning: Could not remove ZIP file.");
  }
}

async function main() {
  const { sessionId, outputDir, authHeader } = parseArguments();

  try {
    const zipPath = await fetchScreenshotZip(sessionId, authHeader);
    const extractedFolder = await extractScreenshots(zipPath, sessionId);
    
    // ✅ Corrected function call to include `sessionId`
    await createPdfFromScreenshots(extractedFolder, outputDir, sessionId);  
    
    await cleanup(zipPath);

    console.log("\n🎉 All tasks completed successfully! Your PDF is ready. 🚀\n");
  } catch (error) {
    console.error(`\n❌ Unexpected Error: ${error.message}`);
    process.exit(1);
  }
}

main();
