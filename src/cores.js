const coreSuggest = document.createElement("img");
coreSuggest.id = "coreSuggest";
coreSuggest.setAttribute("src", "./core-suggest.png");
coreSuggest.style.width = "16px";
coreSuggest.style.position = "absolute";
coreSuggest.style.display = "none";

const corePalindrome = document.createElement("img");
corePalindrome.id = "corePalindrome";
corePalindrome.setAttribute("src", "./core-palindrome.png");
corePalindrome.style.width = "16px";
corePalindrome.style.position = "absolute";
corePalindrome.style.display = "none";

export default { coreSuggest, corePalindrome };
