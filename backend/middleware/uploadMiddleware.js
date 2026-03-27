import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   ENSURE UPLOAD DIRECTORIES EXIST
========================================================= */
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDir("uploads");
ensureDir("uploads/audio");
ensureDir("uploads/resumes");

/* =========================================================
   AUDIO STORAGE
   - keeps your existing audio upload flow safe
========================================================= */
const audioStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/audio/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const sessionId = req.params.id || "unknown";
    cb(null, `${sessionId}-${Date.now()}${ext}`);
  },
});

const audioFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Not an audio file"), false);
  }
};

const audioUpload = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
});

const uploadSingleAudio = audioUpload.single("audioFile");

/* =========================================================
   RESUME STORAGE
   - new PDF-only upload for resume-based mock interviews
========================================================= */
const resumeStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/resumes/");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || "guest";
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    cb(null, `${userId}-${Date.now()}-${safeBaseName}${ext}`);
  },
});

const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    file.mimetype === "application/pdf" ||
    ext === ".pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF resume files are allowed"), false);
  }
};

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

const uploadSingleResume = resumeUpload.single("resumeFile");

/* =========================================================
   EXPORTS
========================================================= */
export { uploadSingleAudio, uploadSingleResume };