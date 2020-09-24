import DomAccess from 'src/helper/dom-access.helper';
import Iterator from 'src/helper/iterator.helper';
import FilterBasePlugin from 'src/plugin/listing/filter-base.plugin';
import deepmerge from 'deepmerge';

export default class FilterMultiSelectPlugin extends FilterBasePlugin {

    static options = deepmerge(FilterBasePlugin.options, {
        checkboxSelector: '.filter-multi-select-checkbox',
        countSelector: '.filter-multi-select-count',
        listItemSelector: '.filter-multi-select-list-item',
        snippets: {
            disabledFilterText: 'Filter not active'
        },
        mainFilterButtonSelector: '.filter-panel-item-toggle'
    });

    init() {
        this.selection = [];
        this.counter = DomAccess.querySelector(this.el, this.options.countSelector);

        this._registerEvents();
    }

    /**
     * @private
     */
    _registerEvents() {
        const checkboxes = DomAccess.querySelectorAll(this.el, this.options.checkboxSelector);

        Iterator.iterate(checkboxes, (checkbox) => {
            checkbox.addEventListener('change', this._onChangeFilter.bind(this));
        });
    }

    /**
     * @return {Array}
     * @public
     */
    getValues() {
        const checkedCheckboxes =
            DomAccess.querySelectorAll(this.el, `${this.options.checkboxSelector}:checked`, false);

        let selection = [];

        if (checkedCheckboxes) {
            Iterator.iterate(checkedCheckboxes, (checkbox) => {
                selection.push(checkbox.id);
            });
        } else {
            selection = [];
        }

        this.selection = selection;
        this._updateCount();

        const values = {};
        values[this.options.name] = selection;

        return values;
    }

    /**
     * @return {Array}
     * @public
     */
    getLabels() {
        const activeCheckboxes =
            DomAccess.querySelectorAll(this.el, `${this.options.checkboxSelector}:checked`, false);

        let labels = [];

        if (activeCheckboxes) {
            Iterator.iterate(activeCheckboxes, (checkbox) => {
                labels.push({
                    label: checkbox.dataset.label,
                    id: checkbox.id
                });
            });
        } else {
            labels = [];
        }

        return labels;
    }

    setValuesFromUrl(params) {
        let stateChanged = false;
        Object.keys(params).forEach(key => {
            if (key === this.options.name) {
                stateChanged = true;
                const ids = params[key].split('|');

                ids.forEach(id => {
                    const checkboxEl = DomAccess.querySelector(this.el, `[id="${id}"]`, false);

                    if (checkboxEl) {
                        checkboxEl.checked = true;
                        this.selection.push(checkboxEl.id);
                    }
                });
            }
        });

        this._updateCount();

        return stateChanged;
    }

    /**
     * @private
     */
    _onChangeFilter() {
        this.listing.changeListing(this);
    }

    /**
     * @param id
     * @public
     */
    reset(id) {
        const checkboxEl = DomAccess.querySelector(this.el, `[id="${id}"]`, false);

        if (checkboxEl) {
            checkboxEl.checked = false;
        }
    }

    /**
     * @public
     */
    resetAll() {
        this.selection.filter = [];

        const checkedCheckboxes =
            DomAccess.querySelectorAll(this.el, `${this.options.checkboxSelector}:checked`, false);

        if (checkedCheckboxes) {
            Iterator.iterate(checkedCheckboxes, (checkbox) => {
                checkbox.checked = false;
            });
        }
    }

    /**
     * @public
     */
    refreshDisabledState(filter) {
        const activeItems = [];

        const disabledFilter = filter[this.options.name];

        if (disabledFilter.entities) {
            activeItems.push(...disabledFilter.entities);
        }

        if (activeItems.length < 1) {
            this.disableFilter();
            return;
        } else {
            this.enableFilter();
        }

        this._disableInactiveFilterOptions(activeItems.map(entity => entity.id));
    }

    /**
     * @private
     */
    _disableInactiveFilterOptions(activeItemIds) {
        const checkboxes = DomAccess.querySelectorAll(this.el, this.options.checkboxSelector);
        Iterator.iterate(checkboxes, (checkbox) => {
            if (checkbox.checked === true) {
                return;
            }

            if (activeItemIds.includes(checkbox.id)) {
                this.enableOption(checkbox);
            } else {
                this.disableOption(checkbox);
            }
        });
    }

    /**
     * @public
     */
    disableOption(input){
        const listItem = input.closest(this.options.listItemSelector);
        listItem.classList.add('disabled');
        listItem.setAttribute('title', this.options.snippets.disabledFilterText);
        input.disabled = true;
    }

    /**
     * @public
     */
    enableOption(input) {
        const listItem = input.closest(this.options.listItemSelector);
        listItem.removeAttribute('title');
        listItem.classList.remove('disabled');
        input.disabled = false;
    }

    /**
     * @public
     */
    enableAllOptions() {
        const checkboxes = DomAccess.querySelectorAll(this.el, this.options.checkboxSelector);
        Iterator.iterate(checkboxes, (checkbox) => {
            this.enableOption(checkbox);
        });
    }

    /**
     * @public
     */
    disableFilter() {
        const mainFilterButton = DomAccess.querySelector(this.el, this.options.mainFilterButtonSelector);
        mainFilterButton.classList.add('disabled');
        mainFilterButton.setAttribute('title', this.options.snippets.disabledFilterText);
    }

    /**
     * @public
     */
    enableFilter() {
        const mainFilterButton = DomAccess.querySelector(this.el, this.options.mainFilterButtonSelector);
        mainFilterButton.classList.remove('disabled');
        mainFilterButton.removeAttribute('title');
    }

    /**
     * @private
     */
    _updateCount() {
        this.counter.innerText = this.selection.length ? `(${this.selection.length})` : '';
    }
}
