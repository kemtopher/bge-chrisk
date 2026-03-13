document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search)

  function updateURL(key, value) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    history.replaceState(null, '', '?' + params.toString())
  }

  const searchInput = document.querySelector('.events-search-input')

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      updateURL('search', e.target.value)
    })
  }

  const sortSelect = document.querySelector('.events-sort')

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      updateURL('sort', e.target.value)
    })
  }

  const clearBtn = document.querySelector('.clear-filters')

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      window.location.search = ''
    })
  }
})
