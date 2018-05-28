var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
const USER_CACHE_NAME = 'user-cache';

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use. Allows to save assets in cache on demand. 
function onCardSaveButton(event){
  console.log("clicked");
  if ('caches' in window){
    caches.open(USER_CACHE_NAME)
      .then(function(cache){
        cache.add('/src/images/sf-boat.jpg');
        cache.add('https://httpbin.org/get');
      });
  }
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("'+data.image+'")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitleTextElement.style.color="white";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  /* let cardSaveButton = document.createElement("button");
  cardSupportingText.appendChild(cardSaveButton);
  cardSaveButton.textContent = "SAVE";
  cardSaveButton.addEventListener('click', onCardSaveButton); */
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
  clearCards();
  for(var i=0; i < data.length; i++){
    createCard(data[i]);
  }
}

const url = "https://pwadb-24d96.firebaseio.com/posts.json";
let networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    
    let dataArray = [];
    for(let key in data){
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

  if ('caches' in window) {
      caches.match(url)
        .then(function(res){
          if (res){
            console.log('res', res.json);
            return res.json;
          }
        })
        .then(function(data){
          console.log('From cache', data);
          console.log("networkDataReceived: "+networkDataReceived);
            if (!networkDataReceived){
              let dataArray = [];
              for(let key in data){
                dataArray.push(data[key]);
              }
              console.log("dataArray: "+dataArray);
              updateUI(dataArray);
            }
          });
}
