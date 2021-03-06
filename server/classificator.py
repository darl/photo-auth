import tensorflow.keras
import numpy as np
from PIL import Image
from enum import Enum

import logging

logger = logging.getLogger("classificator")

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

# Load the model
hand_model = tensorflow.keras.models.load_model('./resources/hand_model_better.h5')
passport_model = tensorflow.keras.models.load_model('./resources/passport_model_better.h5')

# Create the array of the right shape to feed into the keras model
# The 'length' or number of images you can put into the array is
# determined by the first position in the shape tuple, in this case 1.
data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)


class Position(Enum):
    HAND_TOP_LEFT = 0
    HAND_TOP_RIGHT = 1
    HAND_BOTTOM_LEFT = 2
    HAND_BOTTOM_RIGHT = 3
    PASSPORT_RIGHT = 4
    PASSPORT_LEFT = 5
    PASSPORT_CLOSE = 6


def left(width, height):
    if width > height:
        return int((width - height) / 2)
    else:
        return 0


def right(width, height):
    if width > height:
        return int((width + height) / 2)
    else:
        return width - 1


def top(width, height):
    if width > height:
        return 0
    else:
        return int((height - width) / 2)


def bottom(width, height):
    if width > height:
        return height - 1
    else:
        return int((width + height) / 2)


def passport_top(width, height):
    if width > height:
        return int(height / 4)
    else:
        return int(height / 2 - width / 4)


def passport_bottom(width, height):
    if width > height:
        return int(3 * height / 4)
    else:
        return int(height / 2 + width / 4)


def middle(value):
    return int(value / 2)


CLIENT_HAND_SIZE = 114 * 1.3
CLIENT_BOTTOM_BAR = 94


def top_left(width, height, client_ratio):
    hand_size = (CLIENT_HAND_SIZE / client_ratio)

    return (
        int(0.05 * width),
        int(0.10 * height),
        int(0.05 * width + hand_size),
        int(0.10 * height + hand_size)
    )


def top_right(width, height, client_ratio):
    hand_size = (CLIENT_HAND_SIZE / client_ratio)

    return (
        int(width - (0.05 * width + hand_size)),
        int(0.10 * height),
        int(width - 0.05 * width),
        int(0.10 * height + hand_size)
    )


def bottom_left(width, height, client_ratio):
    hand_size = (CLIENT_HAND_SIZE / client_ratio)
    bottom_bar = (CLIENT_BOTTOM_BAR / client_ratio)

    return (
        int(0.05 * width),
        int(height - bottom_bar - 0.10 * height - hand_size),
        int(0.05 * width + hand_size),
        int(height - bottom_bar - 0.10 * height)
    )


def bottom_right(width, height, client_ratio):
    hand_size = (CLIENT_HAND_SIZE / client_ratio)
    bottom_bar = (CLIENT_BOTTOM_BAR / client_ratio)

    return (
        int(width - (0.05 * width + hand_size)),
        int(height - bottom_bar - 0.10 * height - hand_size),
        int(width - 0.05 * width),
        int(height - bottom_bar - 0.10 * height)
    )


def full(width, height, client_ratio):
    return left(width, height), top(width, height), right(width, height), bottom(width, height)


def center_left(width, height, client_ratio):
    return left(width, height), passport_top(width, height), middle(width), passport_bottom(width, height)


def center_right(width, height, client_ratio):
    return middle(width), passport_top(width, height), right(width, height), passport_bottom(width, height)


switcher = {
    Position.HAND_TOP_LEFT: top_left,
    Position.HAND_TOP_RIGHT: top_right,
    Position.HAND_BOTTOM_LEFT: bottom_left,
    Position.HAND_BOTTOM_RIGHT: bottom_right,
    Position.PASSPORT_RIGHT: center_right,
    Position.PASSPORT_LEFT: center_left,
    Position.PASSPORT_CLOSE: full
}


def get_bounds(image, position, client_ratio=2.3):
    width, height = image.size
    bounds_fun = switcher.get(position, lambda: "Invalid state")
    return bounds_fun(width, height, client_ratio), position.value > 3


def predict(image, bounds, model_id):
    image = image.crop(bounds)

    # Make sure to resize all images to 224, 224 otherwise they won't fit in the array
    image = image.resize((224, 224))
    image_array = np.asarray(image)

    # Normalize the image
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

    # Load the image into the array
    data[0] = normalized_image_array

    model = hand_model
    if model_id > 0:
        model = passport_model

    # run the inference
    prediction = model.predict(data)[0].tolist()
    max_prediction = max(prediction)
    idx = prediction.index(max_prediction)

    # print(prediction)
    # image.save("./resources/new_data_set/void1/" + str(prediction[0])[:6] + ".jpg")

    # 0 -> hand 1 -> no_hand
    return idx == 0 and max_prediction > 0.8, prediction[0]


# Прогрев tensorflow. НЕ УБИРАТЬ
img = Image.open('./resources/image.jpg')
bounds, model_id = get_bounds(img, Position.HAND_BOTTOM_LEFT)
predict(img, bounds, model_id)

bounds, model_id = get_bounds(img, Position.PASSPORT_RIGHT)
predict(img, bounds, model_id)
logger.info("CASH WARM UP")
