class EventsFilterSelect {
  constructor(container) {
    this.container = container;
    this.name = container.dataset.filterName;
    this.trigger = container.querySelector('[data-filter-select-trigger]');
    this.dropdown = container.querySelector('[data-filter-select-dropdown]');
    this.label = container.querySelector('[data-filter-select-label]');
    this.checkboxes = Array.from(
      container.querySelectorAll('[data-filter-select-checkbox]')
    );
    this.hiddenInputsContainer = container.querySelector(
      '[data-filter-select-hidden-inputs]'
    );

    // this.defaultLabel = this.label ? this.label.textContent.trim() : 'Filter';

    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);

    this.init();
  }

  init() {
    if (!this.trigger || !this.dropdown || !this.checkboxes.length) return;

    this.trigger.addEventListener('click', this.handleTriggerClick);
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeydown);

    this.checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.handleCheckboxChange);
    });

    // this.updateLabel();
    this.syncHiddenInputs();
    this.hydrateFromURL();
  }

  handleTriggerClick() {
    const isOpen = this.container.classList.contains('is-open');
    if (isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleDocumentClick(event) {
    if (!this.container.contains(event.target)) {
      this.close();
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  handleCheckboxChange() {
    this.syncHiddenInputs();

    const params = new URLSearchParams(window.location.search);

    params.delete(this.name);

    this.getSelectedValues().forEach((value) => {
        params.append(this.name, value);
    });

    history.replaceState(null, '', '?' + params.toString());

    this.container.dispatchEvent(
        new CustomEvent('filterselect:change', {
        bubbles: true,
        detail: {
            name: this.name,
            values: this.getSelectedValues(),
        },
        })
    );
    }

  getSelectedCheckboxes() {
    return this.checkboxes.filter((checkbox) => checkbox.checked);
  }

  getSelectedValues() {
    return this.getSelectedCheckboxes().map((checkbox) => checkbox.value);
  }

//   getSelectedLabels() {
//     return this.getSelectedCheckboxes().map((checkbox) => {
//       const option = checkbox.closest('.filter-select__option');
//       const textNode = option.querySelector('.filter-select__option-text');
//       return textNode ? textNode.textContent.trim() : checkbox.value;
//     });
//   }

//   updateLabel() {
//     if (!this.label) return;

//     const selectedLabels = this.getSelectedLabels();

//     if (!selectedLabels.length) {
//       this.label.textContent = this.defaultLabel;
//       return;
//     }

//     if (selectedLabels.length === 1) {
//       this.label.textContent = selectedLabels[0];
//       return;
//     }

//     this.label.textContent = `${this.defaultLabel} (${selectedLabels.length})`;
//   }

  syncHiddenInputs() {
    if (!this.hiddenInputsContainer || !this.name) return;

    this.hiddenInputsContainer.innerHTML = '';

    this.getSelectedValues().forEach((value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.name;
      input.value = value;
      this.hiddenInputsContainer.appendChild(input);
    });
  }

  hydrateFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (!params.has(this.name)) return;

  const values = params.getAll(this.name);

  this.checkboxes.forEach((checkbox) => {
    if (values.includes(checkbox.value)) {
      checkbox.checked = true;
    }
  });

  this.syncHiddenInputs();
}

  open() {
    this.container.classList.add('is-open');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.dropdown.hidden = false;
  }

  close() {
    this.container.classList.remove('is-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.dropdown.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // Filter select elements
  const filterSelects = document.querySelectorAll('[data-filter-select]');

  filterSelects.forEach((filterSelect) => {
    new EventsFilterSelect(filterSelect);
  });


  // Update URLs to match selections and persist
  const params = new URLSearchParams(window.location.search);

  function updateURLParam(key, value) {
    if (value && value.length) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    history.replaceState(null, '', newUrl);
  }

  const searchInput = document.querySelector('.events-search-input');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      updateURLParam('search', e.target.value.trim());
    });
  }

  const sortSelect = document.querySelector('.events-sort');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      updateURLParam('sort', e.target.value);
    });
  }

  document.addEventListener('filterselect:change', (event) => {
    const { name, values } = event.detail;

    updateURLParam(name, values.join(','));
  });

  const clearBtn = document.querySelector('.clear-filters');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      window.location.search = '';
    });
  }
});