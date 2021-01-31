let WORDS;
let NOUNS;
let SECONDS_PER_WORD = 10;

let associations = [];
let nounsOnly = true;
let curWord = null;
let wordNum = 0;
let usedWords = {};
let wordData = [];
let timeRemaining = 0;

// RESET, PLAYING, PAUSED
let gameStatus = 'RESET';

let timeRemainingFillDom;

const TIME_REMAINING_COLORS = {
  FULL: '#03fca9',
  MEDIUM: '#fcbe03',
  LOW: '#fc4503',
};

function onLoad() {
  let readyCount = 0;
  const ready = () => {
    readyCount++;
    if (readyCount === 2) {
      document.getElementById('word').innerHTML = '&nbsp;';
      changeDisplay('start-button', true);
    }
  };

  fetch('/js/random_words.json')
    .then((res) => res.json())
    .then((res) => {
      WORDS = res.data.map((obj) => obj.word.value);
      console.log(WORDS.slice(0, 10));
      ready();
    });
  fetch('/js/random_nouns.json')
    .then((res) => res.json())
    .then((res) => {
      NOUNS = res.data.map((obj) => obj.noun.value);
      console.log(NOUNS.slice(0, 10));
      ready();
    });

  document
    .getElementById('enter-word')
    .addEventListener('keydown', function (event) {
      console.log(event);
      if (event.keyCode === 13) {
        makeAssociation();
      }
    });

  timeRemainingFillDom = document.getElementById('time-remaining-fill');
  timeRemainingFillDom.style.background = TIME_REMAINING_COLORS.FULL;

  let lastTick = Date.now();
  setInterval(function () {
    const delta = (Date.now() - lastTick) / 1000;
    lastTick = Date.now();

    if (gameStatus !== 'PLAYING') {
      return;
    }

    const lastTimeRemaining = timeRemaining;
    timeRemaining -= delta;
    if (timeRemaining < 0) {
      newWord();
    }

    timeRemainingFillDom.style.width =
      (timeRemaining / SECONDS_PER_WORD) * 100 + '%';

    if (
      lastTimeRemaining / SECONDS_PER_WORD >= 0.5 &&
      timeRemaining / SECONDS_PER_WORD < 0.5
    ) {
      timeRemainingFillDom.style.background = TIME_REMAINING_COLORS.MEDIUM;
    } else if (
      lastTimeRemaining / SECONDS_PER_WORD >= 0.25 &&
      timeRemaining / SECONDS_PER_WORD < 0.25
    ) {
      timeRemainingFillDom.style.background = TIME_REMAINING_COLORS.LOW;
    }
  }, 0);
}

function newWord(skip) {
  const wordArr = nounsOnly ? NOUNS : WORDS;

  if (skip) {
    wordData.pop();
    associations = [];
    clearAssociationDisplay();
  } else {
    if (curWord) {
      wordData[wordData.length - 1].associations = associations;
    }
    wordNum++;
  }

  associations = [];
  clearAssociationDisplay();

  timeRemaining = SECONDS_PER_WORD;
  timeRemainingFillDom.style.background = TIME_REMAINING_COLORS.FULL;

  let newWord;
  do {
    newWord = wordArr[Math.floor(Math.random() * wordArr.length)];
  } while (usedWords[newWord]);

  usedWords[newWord] = true;

  curWord = newWord[0].toUpperCase() + newWord.slice(1);
  wordData.push({ word: curWord, startedAt: new Date() });

  document.getElementById('word').innerText = curWord;
  document.getElementById('preword-text').innerText =
    'Word #' + wordNum + ' is...';
  focusInput();
}

function makeAssociation() {
  const input = document.getElementById('enter-word');
  const value = input.value;
  if (value === '') {
    return;
  }

  associations.push(value);
  input.value = '';

  const div = document.createElement('div');
  div.innerText = value;
  document.getElementById('associations').prepend(div);
}

function start() {
  nounsOnly = document.getElementById('nouns-only').checked;
  SECONDS_PER_WORD = parseInt(
    document.getElementById('seconds-per-word').value,
    10,
  );

  if (
    SECONDS_PER_WORD < 1 ||
    SECONDS_PER_WORD > 10000 ||
    isNaN(SECONDS_PER_WORD)
  ) {
    alert('Invalid seconds per word!');
    return;
  }

  gameStatus = 'PLAYING';
  wordData = [];
  wordNum = 0;

  changeDisplay('start-button', false);
  changeDisplay('download-count-data-button', false);
  changeDisplay('download-associations-button', false);
  changeDisplay('options', false);

  changeDisplay('enter-word', true);
  changeDisplay('pause-button', true);
  changeDisplay('skip-button', true);

  newWord();
  toggleProgressVisibility();
}

function pause() {
  gameStatus = 'PAUSED';
  document.getElementById('word').innerText = '...';
  clearAssociationDisplay();

  changeDisplay('enter-word', false);
  changeDisplay('pause-button', false);
  changeDisplay('skip-button', false);

  changeDisplay('resume-button', true);
  changeDisplay('end-button', true);
  changeDisplay('end-info', true);
}

function resume() {
  gameStatus = 'PLAYING';
  document.getElementById('word').innerText = curWord;
  repopulateAssociationDisplay();

  changeDisplay('resume-button', false);
  changeDisplay('end-button', false);
  changeDisplay('end-info', false);

  changeDisplay('enter-word', true);
  changeDisplay('pause-button', true);
  changeDisplay('skip-button', true);

  focusInput();
}

function end() {
  gameStatus = 'RESET';
  curWord = null;
  document.getElementById('word').innerText = '...';
  clearAssociationDisplay();
  toggleProgressVisibility();

  changeDisplay('resume-button', false);
  changeDisplay('end-button', false);
  changeDisplay('enter-word', false);
  changeDisplay('end-info', false);

  changeDisplay('start-button', true);
  changeDisplay('download-count-data-button', true);
  changeDisplay('download-associations-button', true);
  changeDisplay('options', true);

  const startButton = document.getElementById('start-button');
  startButton.classList.remove('mx-auto');
  startButton.classList.add('ml-auto', 'mr-4');
  startButton.innerText = 'New Game';
  // Current word doesn't count
  wordData.pop();
}

function changeDisplay(id, visible) {
  document.getElementById(id).classList[visible ? 'remove' : 'add']('hidden');
}

function clearAssociationDisplay() {
  let child;
  while ((child = document.getElementById('associations').lastChild)) {
    child.remove();
  }
}

function repopulateAssociationDisplay() {
  for (const association of associations) {
    const div = document.createElement('div');
    div.innerText = association;
    document.getElementById('associations').prepend(div);
  }
}

function toggleProgressVisibility() {
  document.getElementById('time-remaining').classList.toggle('invisible');
}
