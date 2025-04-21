# Resume Manager

A cross-platform (macOS target) Electron + React application to streamline resume management and job applications.

## Features

- **Resume Versions**: Maintain multiple versions of each resume (PDF or LaTeX).
- **PDF Preview**: In-app multi-page preview of PDF resumes and cover letters via `pdfjs-dist`.
- **Notes**: Attach freeform notes to each resume.
- **Applications Tracking**: Log companies you applied to per resume, with application date.
- **Cover Letters**: Upload PDF or compose text cover letters per application and preview them.
- **Download Latest**: Quickly download the latest version of a resume to your Downloads folder.
- **Settings**: Configure storage folder path and default filename prefix.
- **Delete Actions**: Remove individual versions, notes, cover letters, or entire resumes with cascade cleanup.
- **Search & Filter**: Live search resumes by tag/job function.

## Architecture

- **Electron**: Shell for desktop distribution, IPC communication for file and database operations.
- **React**: Renderer UI with a two‑pane layout (sidebar + detail view).
- **SQLite**: Metadata stored in `better-sqlite3` via a local `metadata.db` under `data/`.
- **fs-extra**: File system utilities for copying and removing files.
- **electron-store**: Persist user settings (data path, prefix).

## Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/resume-manager.git
   cd resume-manager
   ```

Install dependencies

```bash
npm install
```

Run in development mode

```bash
npm start
```

Package for macOS

```bash
npm run package
```

## Usage

1. Create a new resume by clicking + New Resume and entering a tag (e.g., "Data Science").

2. Select a resume from the sidebar to view details.

3. Add Versions: Click + Add Version to upload a PDF or LaTeX (.tex) file.

4. Preview: Click any version to preview its PDF inline.

5. Download Latest: Download the newest version to your Downloads folder.

6. Notes: Add and view timestamped notes for each resume.

7. Applications: Log company applications and view dates.

8. Cover Letters: Select an application to upload or compose a cover letter, then preview.

9. Settings: Click ⚙️ to configure your data storage path and filename prefix.

10. Delete: Use Delete buttons next to versions, cover letters, or the entire resume to remove entries.

## Project Structure

```plaintext
resume-manager/
├─ main.js            # Electron main process & IPC handlers
├─ preload.js         # IPC bridge for renderer
├─ package.json
├─ .webpack/          # Packaged renderer assets
├─ data/              # Configurable storage for files and metadata.db
└─ src/
   ├─ renderer.jsx    # Electron Forge Webpack entry point
   ├─ App.js
   ├─ db.js           # SQLite helper functions & schema
   ├─ components/
   │  ├─ Sidebar.jsx
   │  ├─ ResumeDetail.jsx
   │  └─ PdfPreview.jsx
   └─ styles/
      └─ global.css
```

## License

MIT @ Arya Buddha

## Contributing

1. Fork the repository.

2. Create a feature branch `(git checkout -b feature/YourFeature)`.

3. Commit your changes `(git commit -m "Add your feature")`.

4. Push to the branch `(git push origin feature/YourFeature)`.

5. Open a Pull Request and describe your changes.
