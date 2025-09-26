(function () {
  const form = document.querySelector('[data-recipe-filters]');
  if (!form) {
    return;
  }

  const recipeCards = Array.from(document.querySelectorAll('[data-recipe-card]'));
  const cards = recipeCards.map((card) => {
    const container = card.closest('[data-recipe-card-container]') || card;
    return {
      element: card,
      container,
      tags: parseTags(card.dataset.tags),
      difficulty: (card.dataset.difficulty || '').toLowerCase(),
      totalTime: parseTotalTime(card.dataset.totaltime)
    };
  });

  const tagsField = form.querySelector('[data-filter-tags]');
  const difficultyField = form.querySelector('[data-filter-difficulty]');
  const maxTimeField = form.querySelector('[data-filter-time]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  const params = new URLSearchParams(window.location.search);
  applyParamsToForm(params);
  const initialValues = readFormValues();
  applyFilters(initialValues);
  updateQueryString(initialValues);

  const handleChange = () => {
    const values = readFormValues();
    applyFilters(values);
    updateQueryString(values);
  };

  form.addEventListener('change', handleChange);
  form.addEventListener('input', handleChange);

  function readFormValues() {
    const selectedTags = tagsField && !tagsField.disabled
      ? Array.from(tagsField.selectedOptions).map((option) => option.value.toLowerCase()).filter(Boolean)
      : [];

    let difficultyValue = 'any';
    if (difficultyField) {
      const optionValues = Array.from(difficultyField.options).map((option) => option.value.toLowerCase());
      const candidate = (difficultyField.value || '').toLowerCase();
      difficultyValue = optionValues.includes(candidate) ? candidate : 'any';
    }

    let maxTimeValue = null;
    if (maxTimeField && maxTimeField.value !== '') {
      const parsed = parseInt(maxTimeField.value, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        maxTimeValue = parsed;
      }
    }

    return {
      tags: selectedTags,
      difficulty: difficultyValue,
      maxTime: maxTimeValue
    };
  }

  function applyFilters(filters) {
    if (!cards.length) {
      return;
    }

    cards.forEach((card) => {
      const matchesTags = !filters.tags.length || filters.tags.every((tag) => card.tags.includes(tag));
      const matchesDifficulty = filters.difficulty === 'any' || card.difficulty === filters.difficulty;
      const matchesTime = typeof filters.maxTime !== 'number' || card.totalTime === null || card.totalTime <= filters.maxTime;
      const matches = matchesTags && matchesDifficulty && matchesTime;
      card.container.hidden = !matches;
    });
  }

  function updateQueryString(filters) {
    const nextParams = new URLSearchParams(window.location.search);

    if (filters.tags.length) {
      nextParams.set('tags', filters.tags.join(','));
    } else {
      nextParams.delete('tags');
    }

    if (filters.difficulty && filters.difficulty !== 'any') {
      nextParams.set('difficulty', filters.difficulty);
    } else {
      nextParams.delete('difficulty');
    }

    if (typeof filters.maxTime === 'number') {
      nextParams.set('max', String(filters.maxTime));
    } else {
      nextParams.delete('max');
    }

    const query = nextParams.toString();
    const newUrl = query ? `${window.location.pathname}?${query}${window.location.hash}` : `${window.location.pathname}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (newUrl !== currentUrl) {
      history.replaceState({}, '', newUrl);
    }
  }

  function applyParamsToForm(searchParams) {
    if (tagsField && !tagsField.disabled) {
      const tagParam = searchParams.get('tags');
      if (tagParam) {
        const values = tagParam.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
        Array.from(tagsField.options).forEach((option) => {
          option.selected = values.includes(option.value.toLowerCase());
        });
      }
    }

    if (difficultyField) {
      const difficultyParam = (searchParams.get('difficulty') || '').toLowerCase();
      const allowedValues = Array.from(difficultyField.options).map((option) => option.value.toLowerCase());
      difficultyField.value = allowedValues.includes(difficultyParam) ? difficultyParam : 'any';
    }

    if (maxTimeField) {
      const maxParam = searchParams.get('max');
      if (maxParam && !Number.isNaN(Number(maxParam))) {
        maxTimeField.value = maxParam;
      } else {
        maxTimeField.value = '';
      }
    }
  }

  function parseTags(value) {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  function parseTotalTime(value) {
    if (value === undefined || value === null) {
      return null;
    }

    const raw = String(value).trim();
    if (!raw) {
      return null;
    }

    if (/^\d+(?:\.\d+)?$/.test(raw)) {
      return Math.round(Number(raw));
    }

    let totalMinutes = 0;
    let matched = false;

    raw.replace(/(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs)/gi, (_, amount) => {
      totalMinutes += Number(amount) * 60;
      matched = true;
      return '';
    });

    raw.replace(/(\d+(?:\.\d+)?)\s*(minute|minutes|min|mins)/gi, (_, amount) => {
      totalMinutes += Number(amount);
      matched = true;
      return '';
    });

    raw.replace(/(\d+(?:\.\d+)?)\s*(second|seconds|sec|secs)/gi, (_, amount) => {
      totalMinutes += Number(amount) / 60;
      matched = true;
      return '';
    });

    if (matched) {
      return Math.round(totalMinutes);
    }

    if (raw.includes(':')) {
      const parts = raw.split(':').map((part) => part.trim());
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (!Number.isNaN(hours)) {
        totalMinutes += hours * 60;
        if (!Number.isNaN(minutes)) {
          totalMinutes += minutes;
        }
        return Math.round(totalMinutes);
      }
    }

    const numberMatch = raw.match(/\d+/);
    if (numberMatch) {
      return Number(numberMatch[0]);
    }

    return null;
  }
})();
