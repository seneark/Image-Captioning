from flask import Flask, jsonify, request
from flask_restful import Resource, Api
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from keras.applications.xception import Xception
from keras.models import load_model
from pickle import load
import numpy as np
from PIL import Image

app = Flask(__name__)
api = Api(app)


class Caption:
    def __init__(self):
        self.__tokenizer = load(open("tokenizer.p", "rb"))
        self.__model = load_model('models/model_9.h5')
        self.__xception_model = Xception(include_top=False, pooling="avg")
        self.__max_length = 32

    def startChain(self, image_path):
        self.__filename = image_path
        self.__photo = self.extract_features()
        self.__desc = self.generate_desc()

    def extract_features(self):
        try:
            image = Image.open(self.__filename)

        except:
            print(
                "ERROR: Couldn't open image! Make sure the image path and extension is correct")
        image = image.resize((299, 299))
        image = np.array(image)
        # for images that has 4 channels, we convert them into 3 channels
        if image.shape[2] == 4:
            image = image[..., :3]
        image = np.expand_dims(image, axis=0)
        image = image/127.5
        image = image - 1.0
        feature = self.__xception_model.predict(image)
        return feature

    def word_for_id(self, integer, tokenizer):
        for word, index in tokenizer.word_index.items():
            if index == integer:
                return word
        return None

    def generate_desc(self):
        in_text = 'start'
        for i in range(self.__max_length):
            sequence = self.__tokenizer.texts_to_sequences([in_text])[0]
            sequence = pad_sequences([sequence], maxlen=self.__max_length)
            pred = self.__model.predict([self.__photo, sequence], verbose=0)
            pred = np.argmax(pred)
            word = self.word_for_id(pred, self.__tokenizer)
            if word is None:
                break
            in_text += ' ' + word
            if word == 'end':
                break
        return in_text

    def ret_desc(self):
        return self.__desc


caption_img = Caption()


class HelloWorld(Resource):
    def post(self):
        obj = request.get_json(silent=True)
        # print("\n\n\n" + obj + "\n\n\n")
        if obj["image"]:
            caption_img.startChain(obj["image"])
            json = {"description": caption_img.ret_desc()}
            return jsonify(json)
        else:
            json = {'status': "failed"}
            return jsonify(json)

    def get(self):
        global caption_img
        caption_img.startChain(
            "/home/senear/github/Electron/ImgCaption/backend/foo.jpg")

        json = {"description": caption_img.ret_desc()}
        return jsonify(json)


api.add_resource(HelloWorld, '/api')

if __name__ == '__main__':
    app.run(debug=True)
