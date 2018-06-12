var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator){
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log (" Service Worker registered !!");
        });
}

window.addEventListener("beforeinstallprompt", function(event){
    console.log("beforeinstallprompt fired !!");
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function askForNotificationPermission(event){
    Notification.requestPermission(function(result){
        console.log('User Choice: ', result);
        if (result !== 'granted'){
            console.log('No permission granted !!');
        }
        else{
            
        }
    });
}

if ('Notification' in window){
    for(let i=0; i < enableNotificationsButtons.length; i++){
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);

    }
}