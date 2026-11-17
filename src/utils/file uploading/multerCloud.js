import multer from "multer";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  files: ["application/pdf"],
};

export const uploadCloud = () => {
  const storage = multer.diskStorage({}); // temp

  return multer({
    storage,
  });
};

 