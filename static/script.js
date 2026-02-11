$(document).ready(function () {
    $('#drop-zone').css({
        'border-style': 'dashed',
        'cursor': 'pointer',
        'border-color': '#000000',
        'border-width': '2px',
        'border-radius': '10px'
    });

    // Loading overlay positioning
    $('#loading-overlay').css({
        'top': '0',
        'left': '0',
        'background': 'rgba(0,0,0,0.5)',
        'z-index': '9999'
    });

    $('body').css('background-color', '#e8e8e8');

    $('#header1').css('font-family', "'Orbitron', sans-serif");

    $('#dark-mode-container').css({
        'right': '0',
        'top': '50%',
        'transform': 'translateY(-50%)'
    });

    $('#original-image-container, #detected-image-container').css({
        'border': '2px solid #000000',
        'border-radius': '10px'
    });

    $('#confidence-container').css({
        'border': '2px solid #000000',
        'border-radius': '10px'
    });

    $('#history-gallery').css({
        'border': '2px solid #000000',
        'border-radius': '10px'
    });
});

$(document).ajaxStart(function () {
    $('#loading-overlay').removeClass('d-none').addClass('d-flex');
});

$(document).ajaxStop(function () {
    $('#loading-overlay').removeClass('d-flex').addClass('d-none');
});

function singleobject() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            $.ajax({
                type: "POST",
                url: "/singleobject",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.error) {
                        alert(response.error);
                    } else {
                        $('#left').attr('src', 'data:image/png;base64,' + response.left);
                        $('#center').attr('src', 'data:image/png;base64,' + response.center);
                        $('#leftlabel').text(response.leftlabel);
                        $('#centerlabel').text(response.centerlabel);
                    }
                },
                error: function () {
                    alert('Error in Processing');
                }
            });
        }
    };

    fileInput.click();
}

function multipleobject() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true; // Allows directory selection

    fileInput.onchange = function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            $.ajax({
                type: "POST",
                url: "/multipleobject",
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.error) {
                        alert(response.error);
                    } else {
                        let index = 0;
                        function displayNextImage() {
                            if (index < response.length) {
                                $('#left').attr('src', 'data:image/png;base64,' + response[index].left);
                                $('#center').attr('src', 'data:image/png;base64,' + response[index].center);
                                $('#leftlabel').text(response[index].leftlabel);
                                $('#centerlabel').text(response[index].centerlabel);
                                index++;
                                setTimeout(displayNextImage, 500); // Delay for 1000ms (1 second)
                            }
                        }
                        displayNextImage();
                    }
                },
                error: function () {
                    alert('Error in Processing');
                }
            });
        }
    };

    fileInput.click();
}

// Drag and Drop Functionality I spent too long debugging
const dropZone = document.getElementById('drop-zone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
}); //event listeners for hovering over (dragenter, drag over), leaving the drop or dropping the files (dropleave, drop)  

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Click to browse File explorer
dropZone.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;

    fileInput.onchange = function (event) {
        const files = event.target.files;
        if (files.length === 1) {
            singleDrop(files[0]);
        } else if (files.length > 1) {
            multipleDrop(files);
        }
    };

    fileInput.click();
});

// Visual feedback for drag events (darken inside the border)
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('bg-secondary', 'text-white');
        dropZone.classList.remove('bg-white');
        dropZone.style.backgroundColor = '';
    }, false);
});
// Visual feeback too, but revert changes made by dragenter or dragover
['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        const isDarkMode = document.getElementById('dark-mode-toggle').checked;
        dropZone.classList.remove('bg-secondary', 'text-white');
        if (isDarkMode) {
            dropZone.style.backgroundColor = '#2a2a2a';
        } else {
            dropZone.style.backgroundColor = '';
            dropZone.classList.add('bg-white');
        }
    }, false);
});

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    // check if files should go to singleDrop or multipleDrop
    if (files.length === 1) {
        singleDrop(files[0]);
    } else if (files.length > 1) {
        multipleDrop(files);
    }
}

function singleDrop(file) {
    lastUploadedFile = file;
    lastUploadedFiles = null;
    const confidence = document.getElementById('confidence-slider').value;
    $('#loading-text').text('Processing 1 Image, Estimated time: <1s');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence', confidence);
    // Call Single object when only one image is dropped 
    $.ajax({
        type: "POST",
        url: "/singleobject",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                $('#loading-text').text('Done!');
                $('#left').attr('src', 'data:image/png;base64,' + response.left);
                $('#center').attr('src', 'data:image/png;base64,' + response.center);
                $('#leftlabel').text(response.leftlabel);
                $('#centerlabel').text(response.centerlabel);
                $('#current-count').text(response.count);
                $('#total-count').text(response.count);
                addToHistory('data:image/png;base64,' + response.center);
            }
        },
        error: function () {
            alert('Error in Processing');
        }
    });
}

function multipleDrop(files) {
    lastUploadedFile = null;
    lastUploadedFiles = files;
    const confidence = document.getElementById('confidence-slider').value;
    const totalFiles = files.length;
    const estSeconds = Math.round(totalFiles * 0.2);
    const timeStr = estSeconds >= 60 ? Math.round(estSeconds / 60) + 'm' : estSeconds + 's';
    $('#loading-text').text('Processing ' + totalFiles + ' Images, Estimated time: ~' + timeStr);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('confidence', confidence);
    // Call multpleobject for multiple images dropped
    $.ajax({
        type: "POST",
        url: "/multipleobject",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                let index = 0;
                let runningTotal = 0;
                const total = response.length;
                $('#loading-text').text('Done!');
                function displayNextImage() {
                    if (index < response.length) {
                        $('#left').attr('src', 'data:image/png;base64,' + response[index].left);
                        $('#center').attr('src', 'data:image/png;base64,' + response[index].center);
                        $('#leftlabel').text(response[index].leftlabel);
                        $('#centerlabel').text(response[index].centerlabel);
                        $('#current-count').text(response[index].count);
                        runningTotal += response[index].count;
                        $('#total-count').text(runningTotal);
                        addToHistory('data:image/png;base64,' + response[index].center);
                        index++;
                        setTimeout(displayNextImage, 500);
                    }
                }
                displayNextImage();
            }
        },
        error: function () {
            alert('Error in Processing');
        }
    });
}

// Confidence slider code 
let lastUploadedFile = null;
let lastUploadedFiles = null;

const confidenceSlider = document.getElementById('confidence-slider');
const confidenceValue = document.getElementById('confidence-value');

// Update display value while sliding
confidenceSlider.addEventListener('input', function () {
    confidenceValue.textContent = this.value;
});

// Rerun inference when slider is released
confidenceSlider.addEventListener('change', function () {
    if (lastUploadedFile) {
        singleConf(lastUploadedFile, this.value);
    } else if (lastUploadedFiles) {
        multiConf(lastUploadedFiles, this.value);
    }
});

function singleConf(file, confidence) {
    $('#loading-text').text('Processing 1 Image (Confidence: ' + confidence + '), Estimated time: <1s');
    const formData = new FormData();

    formData.append('file', file);
    formData.append('confidence', confidence);
    $.ajax({
        type: "POST",
        url: "/singleobject",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                $('#loading-text').text('Done!');
                $('#left').attr('src', 'data:image/png;base64,' + response.left);
                $('#center').attr('src', 'data:image/png;base64,' + response.center);
                $('#leftlabel').text(response.leftlabel);
                $('#centerlabel').text(response.centerlabel);
                $('#current-count').text(response.count);
                $('#total-count').text(response.count);
                addToHistory('data:image/png;base64,' + response.center);
            }
        },
        error: function () {
            alert('Error in Processing');
        }
    });
}
function multiConf(files, confidence) {
    const totalFiles = files.length;
    const estSeconds = Math.round(files.length * 0.2);
    const timeStr = estSeconds >= 60 ? Math.round(estSeconds / 60) + 'm' : estSeconds + 's';
    $('#loading-text').text('Processing ' + totalFiles + ' Images (Confidence: ' + confidence + '), Estimated time: ~' + timeStr);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('confidence', confidence);
    $.ajax({
        type: "POST",
        url: "/multipleobject",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                let index = 0;
                let runningTotal = 0;
                const total = response.length;
                $('#loading-text').text('Done!');
                function displayNextImage() {
                    if (index < response.length) {
                        $('#left').attr('src', 'data:image/png;base64,' + response[index].left);
                        $('#center').attr('src', 'data:image/png;base64,' + response[index].center);
                        $('#leftlabel').text(response[index].leftlabel);
                        $('#centerlabel').text(response[index].centerlabel);
                        $('#current-count').text(response[index].count);
                        runningTotal += response[index].count;
                        $('#total-count').text(runningTotal);
                        addToHistory('data:image/png;base64,' + response[index].center);
                        index++;
                        setTimeout(displayNextImage, 500);
                    }
                }
                displayNextImage();
            }
        },
        error: function () {
            alert('Error in Processing');
        }
    });
}

// Download Button
document.getElementById('download-btn').addEventListener('click', function () {
    const img = document.getElementById('center');
    if (img.src.includes('empty.png')) {
        alert('No processed image to download');
        return;
    }
    const link = document.createElement('a');
    link.download = 'detected_image.png';
    link.href = img.src;
    link.click();
});

// Reset Button
document.getElementById('reset-btn').addEventListener('click', function () {
    document.getElementById('left').src = '../static/empty.png';
    document.getElementById('center').src = '../static/empty.png';
    document.getElementById('leftlabel').textContent = 'Original Image';
    document.getElementById('centerlabel').textContent = 'Detected Image';
    document.getElementById('current-count').textContent = '0';
    document.getElementById('total-count').textContent = '0';
    document.getElementById('confidence-slider').value = 0.25;
    document.getElementById('confidence-value').textContent = '0.25';
    lastUploadedFile = null;
    lastUploadedFiles = null;
});

// Dark Mode Toggle (i know this is inefficient, shush)
document.getElementById('dark-mode-toggle').addEventListener('change', function () {
    const dropZone = document.getElementById('drop-zone');
    const leftlabel = document.getElementById('leftlabel');
    const centerlabel = document.getElementById('centerlabel');
    const originalContainer = document.getElementById('original-image-container');
    const detectedContainer = document.getElementById('detected-image-container');
    const confidenceContainer = document.getElementById('confidence-container');
    const historyGallery = document.getElementById('history-gallery');

    if (this.checked) {
        document.body.classList.remove('bg-light');
        document.body.style.backgroundColor = '#121212';
        document.body.classList.add('text-white');
        document.getElementById('p1').classList.remove('text-dark');
        document.getElementById('p1').classList.add('text-light');
        dropZone.style.borderColor = '#ffffff';
        dropZone.style.backgroundColor = '#2a2a2a';
        dropZone.classList.remove('bg-white');
        originalContainer.style.borderColor = '#ffffff';
        originalContainer.style.backgroundColor = '#2a2a2a';
        originalContainer.classList.remove('bg-white');
        detectedContainer.style.borderColor = '#ffffff';
        detectedContainer.style.backgroundColor = '#2a2a2a';
        detectedContainer.classList.remove('bg-white');
        confidenceContainer.style.borderColor = '#ffffff';
        confidenceContainer.style.backgroundColor = '#2a2a2a';
        confidenceContainer.classList.remove('bg-white');
        confidenceContainer.classList.add('text-white');
        historyGallery.style.borderColor = '#ffffff';
        historyGallery.style.backgroundColor = '#2a2a2a';
        historyGallery.classList.remove('bg-light');
        leftlabel.classList.remove('text-dark');
        leftlabel.classList.add('text-white');
        centerlabel.classList.remove('text-dark');
        centerlabel.classList.add('text-white');
    } else {
        document.body.classList.add('bg-light');
        document.body.style.backgroundColor = '#e8e8e8';
        document.body.classList.remove('text-white');
        document.getElementById('p1').classList.add('text-dark');
        document.getElementById('p1').classList.remove('text-light');
        dropZone.style.borderColor = '#000000';
        dropZone.style.backgroundColor = '';
        dropZone.classList.add('bg-white');
        originalContainer.style.borderColor = '#000000';
        originalContainer.style.backgroundColor = '';
        originalContainer.classList.add('bg-white');
        detectedContainer.style.borderColor = '#000000';
        detectedContainer.style.backgroundColor = '';
        detectedContainer.classList.add('bg-white');
        confidenceContainer.style.borderColor = '#000000';
        confidenceContainer.style.backgroundColor = '';
        confidenceContainer.classList.add('bg-white');
        confidenceContainer.classList.remove('text-white');
        historyGallery.style.borderColor = '#000000';
        historyGallery.style.backgroundColor = '';
        historyGallery.classList.add('bg-light');
        leftlabel.classList.remove('text-white');
        leftlabel.classList.add('text-dark');
        centerlabel.classList.remove('text-white');
        centerlabel.classList.add('text-dark');
    }
});
function addToHistory(imgSrc) {
    const gallery = document.getElementById('history-gallery');
    const thumb = document.createElement('img');
    thumb.src = imgSrc;
    thumb.className = 'mr-2 mb-2 border rounded';
    thumb.style.width = '60px';
    thumb.style.height = '60px';
    thumb.style.objectFit = 'cover';
    thumb.style.cursor = 'pointer';
    thumb.onclick = function () {
        document.getElementById('center').src = this.src;
    };
    gallery.appendChild(thumb);
}
