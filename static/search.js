function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

// Adapted from mdbook - creates a teaser with highlighted terms
function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 20;

  var stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });
  var termFound = false;
  var index = 0;
  var weighted = []; // contains elements of ["word", weight, index_in_document]

  // split in sentences, then words
  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1;  // ' ' or '.' if last word in sentence
    }

    index += 1;  // because we split at a two-char boundary '. '
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
  // We add a window with all the weights first
  var curSum = 0;
  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  // If we didn't find the term, just pick the first window
  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    // backwards
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];
  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      // missing text from index to start of `word`
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    // add <b/> around search terms
    if (word[1] === TERM_WEIGHT) {
      teaser.push('<mark class="bg-c0d text-c00 px-1 rounded text-xs">');
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</mark>");
    }
  }
  teaser.push("…");
  return teaser.join("");
}

function formatSearchResultItem(index, item, terms) {
  var ref = item.ref;
  item = index.documentStore.getDoc(ref);
  if (item === null || item === undefined) return '';
  console.log(JSON.stringify(ref) + "\n\n" + JSON.stringify(item));
  
  return `<a href="${ref}" class="block p-4 hover:bg-c02 transition-colors duration-200 border-t border-c04 first:border-t-0">`
      + `<div class="font-medium text-c07 mb-1">${item.title}</div>`
      + `<div class="text-sm text-c05 leading-relaxed">${makeTeaser(item.body, terms)}</div>`
      + `</a>`;
}

function initSearch() {
  var $searchInput = document.getElementById("search");
  var $searchResults = document.getElementById("search-results");
  var $searchResultsItems = document.getElementById("search-results__items");
  var MAX_ITEMS = 8;

  var options = {
    bool: "AND",
    fields: {
      title: {boost: 2},
      body: {boost: 1},
    }
  };
  var currentTerm = "";
  var index;
    
  var initIndex = async function () {
    if (index === undefined) {
      index = fetch("/search_index.en.json")
        .then(
          async function(response) {
            return await elasticlunr.Index.load(await response.json());
        }
      );
    }
    index = await index;
    return index;
  }

  $searchInput.addEventListener("keyup", debounce(async function() {
    var term = $searchInput.value.trim();
    if (term === currentTerm) {
      return;
    }
    
    $searchResults.style.display = term === "" ? "none" : "block";
    $searchResultsItems.innerHTML = "";
    currentTerm = term;
    
    if (term === "" || term.length < 2) {
      $searchResults.style.display = "none";
      return;
    }

    var results = (await initIndex()).search(term, options);
    console.log(JSON.stringify(index));
    console.log(JSON.stringify(results));
    if (results.length === 0) {
      $searchResultsItems.innerHTML = `<div class="p-4 text-center text-c05">`
        + `<i class="fa-solid fa-search text-xl mb-2 block"></i>`
        + `No results found for "${term}"`
        + `</div>`;
      return;
    }

    for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
      var item = document.createElement("li");
      var _html = formatSearchResultItem(index, results[i], term.split(" "));
      console.log(_html);
      item.innerHTML = _html;
      $searchResultsItems.appendChild(item);
    }

  }, 100));

  // Hide results when clicking outside
  window.addEventListener('click', function(e) {
    if ($searchResults.style.display == "block" && !$searchResults.contains(e.target) && !$searchInput.contains(e.target)) {
      $searchResults.style.display = "none";
    }
  });

  // Show results when focusing on input if there's content
  $searchInput.addEventListener('focus', function() {
    if ($searchInput.value.trim().length >= 2) {
      $searchResults.style.display = "block";
    }
  });

  // ESC key to clear search
  $searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      $searchInput.value = '';
      $searchResults.style.display = "none";
      $searchInput.blur();
    }
  });
}

if (document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initSearch();
} else {
  document.addEventListener("DOMContentLoaded", initSearch);
}


