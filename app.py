from flask import Flask, render_template, request, jsonify
from visionutils import detect_objects, resize_image, to_base64
import cv2
import os

app = Flask(__name__, template_folder="templates", static_folder="static")

output_folder = "./predict"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/singleobject', methods=['POST'])
def singleobject():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        if not os.path.exists('temp'):
            os.makedirs('temp')

        filepath = os.path.join('temp', file.filename)
        file.save(filepath)

        image = cv2.imread(filepath)
        image = resize_image(image, 300)
        confidence = float(request.form.get('confidence', 0.25))
        processed_image = detect_objects(image, confidence)
        
        os.remove(filepath)

        return jsonify({
            'left': to_base64(image),
            'center': to_base64(processed_image),
            'leftlabel': 'Original',
            'centerlabel': 'Processed Image',
        })

@app.route('/multipleobject', methods=['POST'])
def multipleobject():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'})

    files = request.files.getlist('files')
    responses = []

    for file in files:
        # Create the full directory path if it does not exist
        directory = os.path.join('temp', os.path.dirname(file.filename))
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        filepath = os.path.join('temp', file.filename)
        file.save(filepath)

        image = cv2.imread(filepath)
        image = resize_image(image, 300)
        confidence = float(request.form.get('confidence', 0.25))
        processed_image = detect_objects(image, confidence) # Placeholder for processing

        # Save the image with bounding boxes
        output_image_path = os.path.join(output_folder, os.path.splitext(os.path.basename(filepath))[0] + "_predict.jpg")
        cv2.imwrite(output_image_path, processed_image)


        responses.append({
            'left': to_base64(image),
            'center': to_base64(processed_image),
            'leftlabel': 'Original',
            'centerlabel': 'Processed Image',
        })

        os.remove(filepath)
        # time.sleep(10)  # Adjust the delay as needed

    return jsonify(responses)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
