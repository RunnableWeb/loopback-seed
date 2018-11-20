'use strict';

module.exports = function (Appuser) {
    /**
       *
       * @param {Object} appUserCreateOrUpdateRequest
       * @param {Object} appUserCreateOrUpdateRequest.appUser
       * @param {string[]} appUserCreateOrUpdateRequest.rolesAddedIds
       * @param {string[]} appUserCreateOrUpdateRequest.rolesRemovedIds
       */
    Appuser.CreateOrUpdate = async appUserCreateOrUpdateRequest => {
        try {
            const {
                appUser,
                rolesAddedIds,
                rolesRemovedIds
            } = appUserCreateOrUpdateRequest;
            const {
                app: {
                    models: { RoleMapping }
                }
            } = Appuser;

            const isEdit = !!appUser.id;

            // insert or update entity
            const user = await Appuser.upsert(appUserCreateOrUpdateRequest.appUser);
            const userId = user.id;
            if (!isEdit) {
                // new
                for (const roleId of rolesAddedIds) {
                    await RoleMapping.create({
                        principalType: RoleMapping.USER,
                        principalId: user.id,
                        roleId: roleId
                    });
                }
            } else {
                // EDIT

                // remove roles
                for (const roleId of rolesRemovedIds) {
                    await RoleMapping.destroyAll({ principalId: userId, roleId });
                }

                // add new roles
                for (const roleId of rolesAddedIds) {
                    await RoleMapping.create({
                        principalType: RoleMapping.USER,
                        principalId: user.id,
                        roleId: roleId
                    });
                }
            }

            const response = await Appuser.findById(userId, {
                include: ["roles", "business"]
            });

            return response;
        } catch (err) {
            return Promise.reject(err);
        }
    };

    Appuser.DeleteUser = async id => {
        try {
            const {
                app: {
                    models: { RoleMapping }
                }
            } = Appuser;

            await Appuser.destroyById(id);

            await RoleMapping.destroyAll({ principalId: id });
        } catch (err) {
            return Promise.reject(err);
        }
    };
};
