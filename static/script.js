function singleobject() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = function(event) {
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
                success: function(response) {
                    if (response.error) {
                        alert(response.error);
                    } else {
                        $('#left').attr('src', 'data:image/png;base64,' + response.left);
                        $('#center').attr('src', 'data:image/png;base64,' + response.center);
                        $('#leftlabel').text(response.leftlabel);
                        $('#centerlabel').text(response.centerlabel);
                    }
                },
                error: function() {
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

    fileInput.onchange = function(event) {
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
                success: function(response) {
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
                error: function() {
                    alert('Error in Processing');
                }
            });
        }
    };

    fileInput.click();
}
