import cv2
import numpy as np
import base64

CLASSES = ["bowl"]
CLASS_IDS = [0]
colors = np.random.uniform(0, 255, size=(len(CLASSES), 3))
model = cv2.dnn.readNetFromONNX("best.onnx")

def to_base64(img):
    _, buffer = cv2.imencode('.png', img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64

def resize_image(image, width):
    # Calculate the aspect ratio and resize the image to the specified width
    aspect_ratio = width / float(image.shape[1])
    dim = (width, int(image.shape[0] * aspect_ratio))
    resized = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
    return resized


def draw_bounding_box(img, class_id, confidence, x, y, x_plus_w, y_plus_h):
    label = f"{CLASSES[class_id]} ({confidence:.2f})"
    color = colors[class_id]
    cv2.rectangle(img, (x, y), (x_plus_w, y_plus_h), color, 2)
    cv2.putText(img, label, (x - 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

def detect_objects(image):
    height, width, _ = image.shape
    length = max(height, width)
    square_image = np.zeros((length, length, 3), np.uint8)
    square_image[0:height, 0:width] = image
    
    scale = length / 640
    blob = cv2.dnn.blobFromImage(square_image, scalefactor=1/255, size=(640, 640), swapRB=True)
    model.setInput(blob)
    
    outputs = model.forward()
    outputs = np.array([cv2.transpose(outputs[0])])
    
    boxes = []
    scores = []
    class_ids = []
    
    for i in range(outputs.shape[1]):
        classes_scores = outputs[0][i][4:]
        (minScore, maxScore, minClassLoc, (x, maxClassIndex)) = cv2.minMaxLoc(classes_scores)
        if maxScore >= 0.25 and maxClassIndex in CLASS_IDS:
            local_class_id = CLASS_IDS.index(maxClassIndex)
            box = [
                outputs[0][i][0] - (0.5 * outputs[0][i][2]),
                outputs[0][i][1] - (0.5 * outputs[0][i][3]),
                outputs[0][i][2],
                outputs[0][i][3],
            ]
            boxes.append(box)
            scores.append(maxScore)
            class_ids.append(local_class_id)
    
    result_boxes = cv2.dnn.NMSBoxes(boxes, scores, 0.25, 0.45, 0.5)
    
    detected_image = image.copy()
    for i in range(len(result_boxes)):
        index = result_boxes[i]
        box = boxes[index]
        draw_bounding_box(
            detected_image,
            class_ids[index],
            scores[index],
            round(box[0] * scale),
            round(box[1] * scale),
            round((box[0] + box[2]) * scale),
            round((box[1] + box[3]) * scale),
        )
    
     
    return detected_image
