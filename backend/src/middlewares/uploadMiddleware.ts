import multer from 'multer';

// Configure Multer
const upload = multer({ dest: 'uploads/' }); // The 'uploads/' folder will store the uploaded files temporarily

export default upload;
