# LambdaTest Screenshot Downloader & PDF Generator

A CLI tool that:

- Fetches session screenshots from LambdaTest
- Downloads the screenshots as a ZIP file
- Extracts the screenshots in order
- Generates a PDF from the extracted images

## Features
- ✅ Fetch screenshots dynamically using a **session ID**
- ✅ Handles network issues and API failures gracefully
- ✅ Ensures correct order of screenshots in the final PDF
- ✅ Cleans up temporary files after execution
- ✅ Supports PNG, JPG, and JPEG images
- ✅ Allows specifying an **output directory**
- ✅ Secure authentication using `AUTH_HEADER`
- ✅ Generates uniquely named files per session (`screenshots_<session_id>.pdf`)

## Installation

To install the CLI globally:
```sh
npm install -g lambdatest-screenshot-pdf
```

To use it locally:
```sh
git clone https://github.com/shubhamsinghrathore/lambdatest-screenshot-pdf.git
cd lambdatest-screenshot-pdf
npm install
```

## Usage

Run the command with a valid **LambdaTest session ID**:
```sh
AUTH_HEADER="Basic your_encoded_auth_string" lambdatest-screenshot-pdf <session_id> --output <output_directory>
```

### Example:
```sh
AUTH_HEADER="Basic cmF0aG9yZXNodWIyMjpPaTYxUDNxRXgybXprNKcXUyMmtZM1dCdFlXTm5LclZPeVRRQ01RRGdyNTZjVg==" lambdatest-screenshot-pdf 1a80510a-289a-46b7-9f60-da01d108de10 --output ~/Desktop/screenshots
```



### What happens when you run the command?
1. Fetches the ZIP download URL for the session ID.
2. Downloads the ZIP file.
3. Extracts the screenshots into `screenshots_<session_id>/`.
4. Generates a uniquely named `screenshots_<session_id>.pdf` with all images in order.
5. Cleans up temporary files.

## Output
After execution, you will get:
- `screenshots_<session_id>.zip` (Downloaded ZIP file)
- `screenshots_<session_id>/` (Extracted images)
- `screenshots_<session_id>.pdf` (Final merged PDF file)

## Error Handling
This tool handles:
- 🚨 **Invalid session ID** → Ensures a valid session is passed.
- 🚨 **Missing `AUTH_HEADER`** → Prevents execution without authentication.
- 🚨 **Network issues** → Handles API timeouts and retries.
- 🚨 **Missing ZIP file** → Gracefully exits if the file is unavailable.
- 🚨 **Corrupt images** → Skips bad images while generating the PDF.
- 🚨 **Invalid output directory** → Ensures the specified directory exists.

## Dependencies
- [`axios`](https://www.npmjs.com/package/axios) - For making HTTP requests.
- [`adm-zip`](https://www.npmjs.com/package/adm-zip) - For extracting ZIP files.
- [`pdfkit`](https://www.npmjs.com/package/pdfkit) - For creating the PDF.
- [`fs-extra`](https://www.npmjs.com/package/fs-extra) - For file system operations.

## Development
If you want to modify or contribute:
```sh
git clone https://github.com/shubhamsinghrathore/lambdatest-screenshot-pdf.git
cd lambdatest-screenshot-pdf
npm install
npm link  # To use it locally as a CLI command
```
Then, run:
```sh
AUTH_HEADER="Basic your_encoded_auth_string" node index.js <session_id> --output <output_directory>
```

## License
This project is licensed under the [MIT License](LICENSE).

## Author
[SHUBHAM SINGH RATHORE](https://github.com/shubhamsinghrathore)

