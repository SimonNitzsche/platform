import BulkEditBaseHandler from './bulk-edit-base.handler';

const types = Shopware.Utils.types;

/**
 * @class
 * @extends BulkEditBaseHandler
 */
class BulkEditCustomerHandler extends BulkEditBaseHandler {
    constructor() {
        super();
        this.name = 'bulkEditCustomerHandler';
        this.entityName = 'customer';
        this.entityIds = [];
        this.customerGroupRegistrationService = Shopware.Service('customerGroupRegistrationService');
        this.customerRepository = Shopware.Service('repositoryFactory').create('customer');
    }

    async bulkEdit(entityIds, payload) {
        this.entityIds = entityIds;

        const syncPayload = await this.buildBulkSyncPayload(payload);

        if (types.isEmpty(syncPayload)) {
            return Promise.resolve({ success: true });
        }

        return this.syncService.sync(syncPayload, {}, {
            'single-operation': 1,
            'sw-language-id': Shopware.Context.api.languageId,
        });
    }

    async bulkEditRequestedGroup(entityIds, payload) {
        const promises = [];

        try {
            payload.forEach((change) => {
                if (!change.value) {
                    return;
                }

                switch (change.value) {
                    case 'decline':
                        promises.push(this.customerGroupRegistrationService.decline(
                            entityIds, {}, {}, { silentError: true },
                        ));
                        break;
                    case 'accept':
                        promises.push(this.customerGroupRegistrationService.accept(
                            entityIds, {}, {}, { silentError: true },
                        ));
                        break;
                    default:
                        throw new Error();
                }
            });
        } catch (e) {
            throw e;
        }

        return Promise.all(promises);
    }
}

export default BulkEditCustomerHandler;
