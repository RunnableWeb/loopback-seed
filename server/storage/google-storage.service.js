const { Storage } = require('@google-cloud/storage');


const projectId = 'readysoftware-experts';
const storage = new Storage({
    projectId: projectId,
    keyFilename: 'google-storage-credentials.json'
});

const appBucketName = 'ready-software-storage';
const appBucket = storage.bucket(appBucketName);
/**
 * @param {string} base64Image - base64 image
 * @param {string} fileName - file name/file path
 */
async function AddBase64File(base64Image, fileName) {
    try {

        let mimeType = 'image/jpeg';
        let imageBuffer = new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        var file = appBucket.file(fileName);

        await file.save(imageBuffer, {
            public: true,
            metadata: { contentType: mimeType },
        });

    }
    catch (error) {
        throw error;
    }
}


/**
 * @param {Object[]} base64Files 
 * @param {string} base64Files.base64- base64 image
 * @param {string} base64Files.fileName - file name/file path
 */

async function AddMultiBase64File(base64Files) {
    try {
        return await Promise.all(base64Files.map(async file => { await AddBase64File(file.base64, file.fileName) }));
    }
    catch (error) {
        throw error;
    }
}

/**
 * @param {string} filePath - file path/ file name
 */
async function deleteFile(filePath) {
    try {
        return await appBucket.file(filePath).delete();
    } catch (error) {
        throw error;
    }
}

/**
 * @param {string[]} filesPaths 
 */
async function deleteBulkFiles(filesPaths) {
    try {
        return await Promise.all(filesPaths.map(async (path) => await deleteFile(path)));
    } catch (error) {
        throw error;
    }
}

async function getAllFiles() {
    try {
        let files = await appBucket.getFiles();
        // files[0].forEach(file => file.delete())
        return files;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    AddBase64File: AddBase64File,
    AddMultiBase64File: AddMultiBase64File,
    getAllFiles: getAllFiles,
    deleteFile: deleteFile,
    deleteBulkFiles: deleteBulkFiles
}