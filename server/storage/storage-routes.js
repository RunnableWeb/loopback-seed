'use strict';

module.exports = async (server) => {
    let storage = require('./google-storage.service');

    server.get('/api/storage/getFiles', async (req, res, next) => {
        try {
            let files = await storage.getAllFiles();
            res.json(files.length ? files[0].map(item => item.name) : []);
        } catch (error) {
            next(error);
        }
    })

    server.post('/api/storage/saveFile',
        /**
         * @param {Object} req
         * @param {Object} req.body
         * @param {Object} req.body.file
         * @param {string} req.body.file.path
         * @param {string} req.body.file.base64
         */
        async (req, res, next) => {
            try {
                if (!req.body.file) {
                    throw "file is required";
                }
                let file = req.body.file;
                await storage.AddBase64File(file.base64, file.path);
                res.end();
            } catch (error) {
                next(error);
            }
        })
    server.post('/api/storage/saveBulkFiles',
        /**
         * @param {Object} req         
         * @param {Object[]} req.body
         * @param {string} req.body.path
         * @param {string} req.body.base64
         */
        async (req, res, next) => {
            try {
                if (!req.body || req.body.length == undefined) {
                    throw "array of files required";
                }
                let files = req.body;
                await storage.AddMultiBase64File(files.map(file => {
                    return {
                        base64: file.base64,
                        fileName: file.path
                    }
                }))
                res.end();
            } catch (error) {
                next(error);
            }

        })
    server.delete('/api/storage/deleteFile', async (req, res, next) => {
        try {
            if (!req.query.filePath) {
                throw "filePath is required as query params"
            }
            await storage.deleteFile(req.query.filePath);
            res.end();
        } catch (error) {
            next(error);
        }

    })

    server.post('/api/storage/deleteBulkFiles',
        /**
           * @param {Object} req
           * @param {Object} req.body
           * @param {string[]} req.body.filesPaths
           */
        async (req, res, next) => {
            try {
                if (!req.body.filesPaths || req.body.filesPaths.length == undefined) {
                    throw "filesPaths array of string is required";
                }
                await storage.deleteBulkFiles(req.body.filesPaths);
                res.end();
            } catch (error) {
                next(error);
            }

        })
}