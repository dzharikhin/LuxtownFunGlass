if (Promise && MutationObserver && localStorage && DOMParser) {
    var TITLE = 'Luxtown Fun Glass - Drive The Change',
    replacementsReady = new Promise(function(resolve, reject) {
    var fillStorageFromBlogPost = function(pageTitle) {
        var replacementsFromBlog = new Promise(function(resolve, reject) {
            var parseReplacements = function(paragraphs) {
                var result = [], replacement;
                for (var i = 0, end = paragraphs.length; i < end; i++) {
                try {
                    replacement = paragraphs[i].innerText.split('->', 2);
                        result.push([replacement[0], replacement[1]]);
                } catch (e) {}  
                }
                return result;
            },
            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) { 
                    if (xhr.status == 200 && xhr.response && xhr.response.results && xhr.response.results.length > 0) {
                        try {
                            var content = new DOMParser().parseFromString(xhr.response.results[0].body.view.value, 'text/html');
                            resolve(parseReplacements(content.getElementById('replacements').getElementsByTagName('p')));
                        } catch (e){
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
        return replacementsFromBlog;
    },
    getFromLocalStorage = function(pageTitle) {
        var transformKeysToRegexp = function(replacementArray) {
            for (var i = 0, len = replacementArray.length; i < len; i++) {
                replacementArray[i][0] = new RegExp(replacementArray[i][0], 'ig');
            }
            return replacementArray;
        },
        replacements;
        try {
            replacements = JSON.parse(localStorage['luxtown.replacements']);
        } catch(e) {
            delete replacements;
        }
        if (!replacements) {
            fillStorageFromBlogPost(pageTitle).then(function(replacementObject) {
                localStorage['luxtown.replacements'] = JSON.stringify(replacementObject);
                resolve(transformKeysToRegexp(replacementObject));        
            });
        } else {
            setTimeout(function() { 
                fillStorageFromBlogPost(pageTitle).then(function(replacementObject) {
                    localStorage['luxtown.replacements'] = JSON.stringify(replacementObject);
                });
            }, 500);
            resolve(transformKeysToRegexp(replacements));
        }
      };
      getFromLocalStorage(TITLE);
    });
    replacementsReady.then(function(replacementArray) {
        var capitalizeFirstChar = function(value, needToCap) {
            return needToCap ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        },
        applyReplacements = function(originalValue) {
            var startsWithCapital = originalValue[0] === originalValue[0].toUpperCase();
            for (var i = 0, len = replacementArray.length; i < len; i++) {
                originalValue = originalValue.replace(replacementArray[i][0], capitalizeFirstChar(replacementArray[i][1], startsWithCapital));
            }
            return originalValue;
        },
        replaceFunction = function(element) {
            if(element.nodeType === Node.TEXT_NODE) {
                element.nodeValue = applyReplacements(element.nodeValue);
            } else {
                Array.prototype.forEach.call(element.childNodes, function(elem) {
                    replaceFunction(elem);
                });
            }
        },
        target = document.getElementsByTagName('body'),
        sendStats = function() {
            if (window.AJS && window.AJS.params.remoteUser && window.firesteel) {
                window.firesteel.spark('luxtown.extension',{'login.hash': hex_md5(AJS.params.remoteUser)});
            } 
        };
        if(target && target.length > 0) {
            chrome.runtime.sendMessage({greeting: 'hello'}, function(response) {
                sendStats();
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        Array.prototype.forEach.call(mutation.addedNodes, function(addedNode) {
                            replaceFunction(addedNode);
                        });
                    });    
                });
                replaceFunction(target[0]);
                observer.observe(target[0], {subtree: true, childList: true});
            });
        }
    }); 
}