function populateSelectMenus() {
    const imageSelect = document.getElementById('imageSelect');
    const soundSelect = document.getElementById('soundSelect');
    
    //limpar as opções podres
    imageSelect.innerHTML = '';
    soundSelect.innerHTML = '';
    
    //grupo de imagens - melhorar isso com categorias próprias
    const categorizedImages = {};
    images.forEach(image => {
        if (!categorizedImages[image.category]) {
            categorizedImages[image.category] = [];
        }
        categorizedImages[image.category].push(image);
    });
    
    //ordenação por categoria(manjo muito)
    const categoryOrder = [];
    images.forEach(image => {
        if (!categoryOrder.includes(image.category)) {
            categoryOrder.push(image.category);
        }
    });

    categoryOrder.forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        categorizedImages[category].forEach(image => {
            const option = document.createElement('option');
            option.value = image.src;
            option.textContent = image.name;
            optgroup.appendChild(option);
        });
        
        imageSelect.appendChild(optgroup);
    });
    
    //adicionar sons com a imagem
    sounds.forEach(sound => {
        const option = document.createElement('option');
        option.value = sound.src;
        option.textContent = sound.name;
        soundSelect.appendChild(option);
    });
    
    updateCounts();
    setupSearch();
}

function updateCounts() {
    const imageCount = document.getElementById('imageCount');
    const soundCount = document.getElementById('soundCount');

    imageCount.textContent = images.length;
    soundCount.textContent = sounds.length;
}

function setupSearch() {
    const imageSearch = document.getElementById('imageSearch');
    const soundSearch = document.getElementById('soundSearch');
    
    imageSearch.addEventListener('input', function() {
        filterOptions('imageSelect', this.value);
    });
    
    soundSearch.addEventListener('input', function() {
        filterOptions('soundSelect', this.value);
    });
}

function filterOptions(selectId, searchText) {
    const select = document.getElementById(selectId);
    const searchTerms = searchText.toLowerCase().split(' ');
    
    if (selectId === 'imageSelect') {
        const optgroups = select.getElementsByTagName('optgroup');
        for (let optgroup of optgroups) {
            let visibleOptions = 0;
            const options = optgroup.getElementsByTagName('option');
            
            for (let option of options) {
                const text = option.textContent.toLowerCase();
                const matchesAll = searchTerms.every(term => text.includes(term));
                
                if (matchesAll) {
                    option.classList.remove('hidden-option');
                    visibleOptions++;
                } else {
                    option.classList.add('hidden-option');
                }
            }
            
            optgroup.style.display = visibleOptions > 0 ? '' : 'none';
        }
    } else {
        const options = select.getElementsByTagName('option');
        for (let option of options) {
            const text = option.textContent.toLowerCase();
            const matchesAll = searchTerms.every(term => text.includes(term));
            
            if (matchesAll) {
                option.classList.remove('hidden-option');
            } else {
                option.classList.add('hidden-option');
            }
        }
    }
}

function toggleEditMenu() {
    const editMenu = document.getElementById('editMenu');
    if (editMenu.style.display === 'none' || editMenu.style.display === '') {
        editMenu.style.display = 'block';
        populateSelectMenus();
    } else {
        editMenu.style.display = 'none';
    }
}

function handleFileUpload(file, type) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

async function applyCustomPairing() {
    let selectedImageSrc = document.getElementById('imageSelect').value;
    let selectedSoundSrc = document.getElementById('soundSelect').value;
    
    // Handle image upload if present
    const imageFile = document.getElementById('imageUpload').files[0];
    if (imageFile) {
        selectedImageSrc = await handleFileUpload(imageFile, 'image');
    }
    
    const soundFile = document.getElementById('soundUpload').files[0];
    if (soundFile) {
        selectedSoundSrc = await handleFileUpload(soundFile, 'audio');
        // cria um objeto sonoro temporario com o delay customizável
        const customDelay = parseFloat(document.getElementById('delayInput').value) || 10;
        currentSound = {
            src: selectedSoundSrc,
            name: soundFile.name,
            delay: customDelay
        };
    } else {
        currentSound = sounds.find(sound => sound.src === selectedSoundSrc);
    }
    
    hideImage();
    
    if (currentImageTimeout) {
        clearTimeout(currentImageTimeout);
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    document.getElementById('timer').textContent = "0.00";
    
    const imgElement = document.getElementById('randomImage');
    imgElement.src = selectedImageSrc;
    
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = selectedSoundSrc;
    
    audioPlayer.load();
    audioPlayer.play().catch(error => {
        console.log("Audio playback failed:", error);
    });
    
    toggleEditMenu();
}

document.getElementById('soundUpload').addEventListener('change', function(e) {
    const delayContainer = document.getElementById('delayInputContainer');
    if (e.target.files.length > 0) {
        delayContainer.style.display = 'block';
    } else {
        delayContainer.style.display = 'none';
    }
});

function resetImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.value = ''; 
    document.getElementById('imageSelect').selectedIndex = 0; 
}

function resetSoundUpload() {
    const soundUpload = document.getElementById('soundUpload');
    soundUpload.value = ''; 
    document.getElementById('soundSelect').selectedIndex = 0; 
    document.getElementById('delayInputContainer').style.display = 'none'; 
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function showImage() {
    const imgElement = document.getElementById('randomImage');
    imgElement.style.display = "block";
    imgElement.style.opacity = "1";
}

function hideImage() {
    const imgElement = document.getElementById('randomImage');
    imgElement.style.display = "none";
    imgElement.style.opacity = "0";
}

let currentSound;
let timerInterval;
let currentImageTimeout;

function toggleMute() {
    const audioPlayer = document.getElementById('audioPlayer');
    const muteButton = document.getElementById('muteButton');
    
    if (audioPlayer.muted) {
        audioPlayer.muted = false;
        muteButton.textContent = "Mute";
        muteButton.style.background = "#ff4444";
    } else {
        audioPlayer.muted = true;
        muteButton.textContent = "Unmute";
        muteButton.style.background = "#4CAF50";
    }
}

function startTimer(delay) {
    let startTime = Date.now();
    const timerElement = document.getElementById('timer');
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        let elapsedTime = (Date.now() - startTime) / 1000;
        if (elapsedTime >= delay) {
            clearInterval(timerInterval);
            timerElement.textContent = delay.toFixed(2);
        } else {
            timerElement.textContent = elapsedTime.toFixed(2);
        }
    }, 10);
}

function generateRandomPairing() {
    if (currentImageTimeout) {
        clearTimeout(currentImageTimeout);
    }
    
    hideImage();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    document.getElementById('timer').textContent = "0.00";
    
    const randomImage = getRandomElement(images);
    currentSound = getRandomElement(sounds);
    
    const imgElement = document.getElementById('randomImage');
    imgElement.src = randomImage.src;
    
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = currentSound.src;
    
    audioPlayer.load();
    audioPlayer.play().catch(error => {
        console.log("Audio playback failed:", error);
    });
}

window.onload = function() {
    const audioPlayer = document.getElementById('audioPlayer');
    
    audioPlayer.addEventListener('play', function() {
        if (currentSound) {
            startTimer(currentSound.delay);
            currentImageTimeout = setTimeout(showImage, currentSound.delay * 1000);
        }
    });

    generateRandomPairing();
    
    document.addEventListener('click', function() {
        audioPlayer.play().catch(error => {
            console.log("Audio playback failed:", error);
        });
    });
};

document.addEventListener('keydown', function(event) {
    //trigger de espaço caso não esteja digitando um texto
    const activeElement = document.activeElement;
    const isTyping = activeElement.tagName === 'INPUT' && 
                     activeElement.type === 'text';
    
    if (event.code === 'Space' && !isTyping) {
        generateRandomPairing();
        event.preventDefault();
    }
});
