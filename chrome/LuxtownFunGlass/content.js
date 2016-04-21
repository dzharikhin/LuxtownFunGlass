"use strict";

if (Promise && MutationObserver && localStorage && DOMParser) {
    const TITLE = 'Luxtown Fun Glass - Drive The Change';

    const replacementsReady = new Promise((resolve, reject) => {
        getFromLocalStorage(TITLE);

        /**
         * @param {string} pageTitle
         * @returns {Promise}
         */
        function fillStorageFromBlogPost(pageTitle) {
            const xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (xhr.status == 200 && xhr.response && xhr.response.results && xhr.response.results.length > 0) {
                            try {
                                let content = new DOMParser().parseFromString(xhr.response.results[0].body.view.value, 'text/html');
                                resolve(parseReplacements(content.getElementById('replacements').getElementsByTagName('p')));
                            } catch (e) {
                                reject(Error('Failed to load replacements'));
                            }
                        } else {
                            reject(Error('Failed to load replacements'));
                        }
                    }
                };
                xhr.open('GET', '/sen/wiki/rest/api/content?type=blogpost&spaceKey=~dzharikhin&title=' + pageTitle + '&expand=body.view', true);
                xhr.responseType = 'json';
                xhr.send();
            });

            /**
             * @param {NodeList} paragraphs
             * @returns {Array.<string[]>}
             */
            function parseReplacements(paragraphs) {
                return Array.prototype.reduce.call(paragraphs, (memo, item) => {
                    memo.push(item.innerText.split('->', 2));

                    return memo;
                }, []);
            }
        }

        function getFromLocalStorage(pageTitle) {
            var replacements;

            try {
                replacements = JSON.parse(localStorage['luxtown.replacements']);
            } catch (e) {
                console.error(e);
            }

            if (!replacements) {
                fillStorageFromBlogPost(pageTitle)
                    .then((replacementObject) => {
                        localStorage['luxtown.replacements'] = JSON.stringify(replacementObject);
                        resolve(replacementObject);
                    });
            } else {
                setTimeout(function () {
                    fillStorageFromBlogPost(pageTitle)
                        .then((replacementObject) => {
                            localStorage['luxtown.replacements'] = JSON.stringify(replacementObject);
                        });
                }, 500);
                resolve(replacements);
            }
        }
    });

    replacementsReady
        .then((replacementArray) => {
            if (replacementArray.length === 0) {
                return;
            }

            const { arrayWords, mapWords } = replacementArray.reduce((memo, item) => {
                memo.arrayWords.push(item[0]);
                memo.mapWords[item[0]] = item[1];

                return memo;
            }, { arrayWords: [], mapWords: {} });

            const regExp = new RegExp('(' + arrayWords.join('|') + ')', 'gim');

            /**
             * @param {string} value
             * @returns {string}
             */
            function capitalizeFirstChar(value) {
                return value[0].toUpperCase() + value.slice(1);
            }

            /**
             * @param {string} originalValue
             * @returns {string}
             */
            function applyReplacements(originalValue) {
                return originalValue.replace(regExp, (str, key) => {
                    return /^[A-Z]/.test(str) ? capitalizeFirstChar(mapWords[key.toLowerCase()]) : mapWords[key.toLowerCase()];
                });
            }

            /**
             * @param {Node} element
             */
            function replaceFunction(element) {
                if (element.nodeType === Node.TEXT_NODE) {
                    if (/^\s+$/.test(element.nodeValue)) {
                        return;
                    }

                    if (!regExp.test(element.nodeValue)) {
                        return;
                    }

                    element.nodeValue = applyReplacements(element.nodeValue);
                } else {
                    Array.prototype.forEach.call(element.childNodes, replaceFunction);
                }
            }

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    Array.prototype.forEach.call(mutation.addedNodes, replaceFunction);
                });
            });

            /**
             *
             */
            function sendStats() {
                if (window.firesteel && window.AJS && window.AJS.params.remoteUser) {
                    window.firesteel.spark('luxtown.extension', {'login.hash': hex_md5(AJS.params.remoteUser)});
                }
            }

            chrome.runtime.sendMessage({greeting: 'hello'}, function(response) {
                replaceFunction(document.body);

                observer.observe(document.body, {subtree: true, childList: true});

                //sendStats();
            });
        });
}
