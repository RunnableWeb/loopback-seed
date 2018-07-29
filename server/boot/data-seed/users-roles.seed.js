// const logger = require('./../../logging/logger');
// const logLvl = require('./../../logging/log-levels.constants');


module.exports = app => {
    const Role = app.models.Role;
    const RoleMapping = app.models.RoleMapping;
    const AppUser = app.models.AppUser;

    // set acls for admin user to manage users
    app.models.AppUser.settings.acls = require('./../acls/app-user-acls.json');

    _setupAppUserRolesRelations();
    // critical hack to get the roles for user, when using mongodb, ObjectId should be the type of principleId
    RoleMapping.settings.strictObjectIDCoercion = true;

    var usersPromise = new Promise((resolve, reject) => {
        const users = {
            'admin': {
                username: "admin",
                email: "samih.abuawad@gmail.com",
                password: "admin1q2w3e!"
            }
        };

        AppUser.findOrCreate(
            { where: { email: users.admin.email } },
            users.admin,
            (err, user) => {
                if (err) {
                    const errMesssage = `Failed to create admin user - error: ${err}`;
                    // logger.log(logLvl.LVL_ERROR, errMesssage);
                    reject(errMesssage);
                    return;
                }

                users.admin = user;

                resolve(users);
            });
    });


    // init rols after all user has been setup
    usersPromise
        .then(users => _initRoles(users))
        .catch(err => {
            console.error(err);
            // logger.log(logLvl.LVL_ERROR, `faild to init users - error: ${err}`);
        });

    function _setupAppUserRolesRelations() {
        // critical code to get user role
        RoleMapping.belongsTo(AppUser);
        AppUser.hasMany(RoleMapping, { foreignKey: "principalId" });
        Role.hasMany(AppUser, { through: RoleMapping, foreignKey: "roleId" });
    }


    function _initRoles(users) {
        Role.create(
            [
                {
                    name: "admin"
                },
                {
                    name: "businessOwner"
                },
                {
                    name: "businessWorker"
                }
            ],
            function (err, roles) {
                if (err) {
                    console.error(err);
                    
                    // logger.log(logLvl.LVL_ERROR, `error creating user roles - error ${err}`)
                    return;
                }
                if (!roles.length)
                    roles.forEach(role => {
                        role.principals.create({
                            principalType: RoleMapping.USER,
                            principalId: users[role.name] ? users[role.name].getId() : ''
                        });
                    });
            });
    }
}