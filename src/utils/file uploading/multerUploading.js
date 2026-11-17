import multer from "multer";
import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  files: ["application/pdf"],
};

export const uploadFileDisk = (filetype, folder) => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const userId = req.user?._id?.toString();
        if (!userId) {
          return cb(new Error("User authentication required"));
        }
        const destination = path.resolve(
   
          process.cwd(),
          "uploads",
          folder,
          userId,
        );
        // 3. Create folder if it doesn't exist
        await fs.mkdir(destination, { recursive: true });

        // 4. Pass destination to Multer
        cb(null, destination);
      } catch (error) {
        cb(error);
      }
    },

    filename: (req, file, cb) => {
      // Extract extension from original filename
      const extension = path.extname(file.originalname);
      // Generate unique filename
      const filename = `${nanoid()}${extension}`;
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!filetype.includes(file.mimetype)) {
      return cb(
        new Error(
          `Invalid file type: ${file.mimetype} and we can accept Format: ${JSON.stringify(filetype)}`,
        ),
        false,
      );
    }

    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  });
};
