// markdownPreviewer.js
import marked from 'marked';

const input = document.getElementById('input');
const output = document.getElementById('output');

input.value = '# Hello';

output.innerHTML = marked.parse(input.value);

function debounce(fn, delay = 500) {
  let timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, arguments), delay);
  };
}

input.oninput = debounce(function (e) {
  input.value = e.target.value;
  output.innerHTML = marked.parse(input.value);
}, 500);