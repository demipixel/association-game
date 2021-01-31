function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function focusInput() {
  document.getElementById('enter-word').focus();
}

function downloadCountData() {
  download(
    formatDate(new Date()) + '_association-count.csv',
    wordData
      .map(
        (data) => formatTime(data.startedAt) + ',' + data.associations.length,
      )
      .join('\n'),
  );
}

function downloadAssociations() {
  download(
    formatDate(new Date()) + '_associations.txt',
    wordData
      .map(
        ({ word, associations }) =>
          word + '\n' + associations.map((a) => '- ' + a).join('\n'),
      )
      .join('\n\n'),
  );
}

function formatDate(input) {
  var d = new Date(input),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function formatTime(d) {
  const seconds = d.getSeconds();
  const minutes = d.getMinutes();

  return (
    formatDate(d) +
    ' ' +
    d.getHours() +
    ':' +
    (minutes < 10 ? '0' : '') +
    minutes +
    ':' +
    (seconds < 10 ? '0' : '') +
    seconds
  );
}
