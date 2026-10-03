(() => {
  const MAX_ARRAY_SIZE = 50;
  const MIN_ARRAY_SIZE = 5;
  const DEFAULT_SIZE = 16;
  const DEFAULT_SPEED = 5;
  const MAX_SPEED = 10;
  const MIN_SPEED = 1;

  const sizeSlider = document.getElementById('size-slider');
  const sizeValue = document.getElementById('size-value');
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  const newArrayBtn = document.getElementById('new-array-btn');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stepBtn = document.getElementById('step-btn');
  const resetBtn = document.getElementById('reset-btn');
  const customInput = document.getElementById('custom-input');
  const applyBtn = document.getElementById('apply-btn');
  const inputError = document.getElementById('input-error');
  const comparisonsCount = document.getElementById('comparisons-count');
  const writesCount = document.getElementById('writes-count');
  const status = document.getElementById('status');
  const barsContainer = document.getElementById('bars');
  const stepLog = document.getElementById('step-log');

  let array = [];
  let originalArray = [];
  let steps = [];
  let currentStepIndex = 0;
  let animationTimer = null;
  let isPaused = false;
  let isSorting = false;
  let speed = DEFAULT_SPEED;

  function init() {
    sizeSlider.value = DEFAULT_SIZE;
    sizeValue.textContent = DEFAULT_SIZE;
    speedSlider.value = DEFAULT_SPEED;
    speedValue.textContent = DEFAULT_SPEED;
    generateRandomArray(DEFAULT_SIZE);
    updateControls();
  }

  function generateRandomArray(size) {
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    originalArray = [...array];
    renderArray();
    resetStats();
  }

  function renderArray() {
    barsContainer.innerHTML = '';
    const maxVal = Math.max(...array);
    array.forEach((val, idx) => {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.dataset.testid = 'bar';
      bar.dataset.value = val;
      bar.style.height = `${(val / maxVal) * 100}%`;
      if (array.length <= 20) {
        const label = document.createElement('div');
        label.className = 'value';
        label.textContent = val;
        bar.appendChild(label);
      }
      barsContainer.appendChild(bar);
    });
  }

  function resetStats() {
    comparisonsCount.textContent = '0';
    writesCount.textContent = '0';
    status.textContent = 'Ready';
    stepLog.textContent = '';
  }

  function updateControls(disabled = false) {
    newArrayBtn.disabled = disabled;
    applyBtn.disabled = disabled;
    sizeSlider.disabled = disabled;
    startBtn.disabled = disabled;
    pauseBtn.disabled = !isSorting;
    stepBtn.disabled = !isSorting;
    resetBtn.disabled = !isSorting;
  }

  function logStep(text) {
    const entry = document.createElement('div');
    entry.textContent = text;
    stepLog.prepend(entry);
    while (stepLog.children.length > 15) stepLog.removeChild(stepLog.lastChild);
  }

  function precomputeSteps(arr) {
    const steps = [];
    const aux = arr.slice();
    function mergeSort(l, r, depth) {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m, depth + 1);
      mergeSort(m + 1, r, depth + 1);
      merge(l, m, r, depth);
    }
    function merge(l, m, r, depth) {
      let i = l, j = m + 1, k = l;
      const temp = [];
      while (i <= m && j <= r) {
        steps.push({ type: 'compare', indices: [i, j], depth });
        if (arr[i] <= arr[j]) {
          temp.push(arr[i]); steps.push({ type: 'write', index: k, value: arr[i], depth }); i++;
        } else {
          temp.push(arr[j]); steps.push({ type: 'write', index: k, value: arr[j], depth }); j++;
        }
        k++;
      }
      while (i <= m) {
        temp.push(arr[i]); steps.push({ type: 'write', index: k, value: arr[i], depth }); i++; k++;
      }
      while (j <= r) {
        temp.push(arr[j]); steps.push({ type: 'write', index: k, value: arr[j], depth }); j++; k++;
      }
      for (let idx = l; idx <= r; idx++) {
        arr[idx] = temp[idx - l];
      }
      steps.push({ type: 'merge', range: [l, r], depth });
    }
    mergeSort(0, arr.length - 1, 0);
    return steps;
  }

  function startSorting() {
    if (isSorting) return;
    steps = precomputeSteps([...array]);
    currentStepIndex = 0;
    isSorting = true;
    isPaused = false;
    updateControls(true);
    pauseBtn.textContent = 'Pause';
    status.textContent = 'Sorting…';
    runNextStep();
  }

  function runNextStep() {
    if (currentStepIndex >= steps.length) {
      finishSorting();
      return;
    }
    const step = steps[currentStepIndex];
    const delay = 1000 / speed;
    animationTimer = setTimeout(() => {
      executeStep(step);
      currentStepIndex++;
      if (!isPaused) runNextStep();
    }, delay);
  }

  function executeStep(step) {
    const bars = Array.from(barsContainer.children);
    if (step.type === 'compare') {
      const [i, j] = step.indices;
      bars[i].dataset.state = 'compare';
      bars[j].dataset.state = 'compare';
      logStep(`Comparing ${array[i]} and ${array[j]} →`);
      comparisonsCount.textContent = parseInt(comparisonsCount.textContent) + 1;
      setTimeout(() => {
        bars[i].dataset.state = '';
        bars[j].dataset.state = '';
      }, 200);
    } else if (step.type === 'write') {
      array[step.index] = step.value;
      bars[step.index].dataset.value = step.value;
      bars[step.index].style.height = `${(step.value / Math.max(...array)) * 100}%`;
      bars[step.index].dataset.state = 'write';
      logStep(`Placing ${step.value} at index ${step.index}`);
      writesCount.textContent = parseInt(writesCount.textContent) + 1;
      setTimeout(() => {
        bars[step.index].dataset.state = '';
      }, 200);
    } else if (step.type === 'merge') {
      const [l, r] = step.range;
      for (let idx = l; idx <= r; idx++) {
        bars[idx].dataset.state = 'merge';
      }
      setTimeout(() => {
        for (let idx = l; idx <= r; idx++) {
          bars[idx].dataset.state = '';
        }
      }, 200);
    }
    renderArray();
  }

  function pauseSorting() {
    if (!isSorting) return;
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
      clearTimeout(animationTimer);
      status.textContent = 'Paused';
    } else {
      status.textContent = 'Sorting…';
      runNextStep();
    }
  }

  function stepOnce() {
    if (!isSorting || !isPaused) return;
    if (currentStepIndex < steps.length) {
      executeStep(steps[currentStepIndex]);
      currentStepIndex++;
      status.textContent = 'Paused';
    }
  }

  function finishSorting() {
    isSorting = false;
    isPaused = false;
    updateControls(false);
    pauseBtn.textContent = 'Pause';
    status.textContent = 'Sorted!';
    const bars = Array.from(barsContainer.children);
    bars.forEach(bar => bar.dataset.state = 'sorted');
  }

  function resetSorting() {
    clearTimeout(animationTimer);
    array = [...originalArray];
    renderArray();
    resetStats();
    isSorting = false;
    isPaused = false;
    updateControls(false);
    status.textContent = 'Ready';
  }

  function applyCustomArray() {
    const text = customInput.value.trim();
    if (!text) {
      inputError.textContent = 'Input cannot be empty';
      return;
    }
    const parts = text.split(',').map(p => p.trim());
    if (parts.length > MAX_ARRAY_SIZE) {
      inputError.textContent = `Maximum ${MAX_ARRAY_SIZE} numbers allowed`;
      return;
    }
    const nums = parts.map(p => Number(p));
    if (nums.some(isNaN)) {
      inputError.textContent = 'All entries must be numbers';
      return;
    }
    inputError.textContent = '';
    array = nums;
    originalArray = [...array];
    renderArray();
    resetStats();
  }

  sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value;
  });

  speedSlider.addEventListener('input', () => {
    speed = Number(speedSlider.value);
    speedValue.textContent = speed;
  });

  newArrayBtn.addEventListener('click', () => generateRandomArray(Number(sizeSlider.value)));
  startBtn.addEventListener('click', startSorting);
  pauseBtn.addEventListener('click', pauseSorting);
  stepBtn.addEventListener('click', stepOnce);
  resetBtn.addEventListener('click', resetSorting);
  applyBtn.addEventListener('click', applyCustomArray);

  document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (isSorting) pauseSorting();
      else startSorting();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      stepOnce();
    } else if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetSorting();
    }
  });

  init();
})();
