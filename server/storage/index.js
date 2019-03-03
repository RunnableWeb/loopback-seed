module.exports = async (server) => {
    await require('./storage-routes')(server);
}