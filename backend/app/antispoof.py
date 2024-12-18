import numpy as np
import librosa
from tensorflow.keras.models import load_model
from dotenv import load_dotenv
import io
import os

load_dotenv()

class AntiSpoofing:
    def __init__(self):
        self.model_weights_path = os.getenv('ANTISPOOF_MODEL_PATH')
        self.anti_spoof_model = load_model(self.model_weights_path) 
        self.labels = ['FAKE', 'REAL']

    def extract_mfcc_features(self, audio_data):
        audio_file_path = io.BytesIO(audio_data)
        audio, sr = librosa.load(audio_file_path, res_type='kaiser_fast')
        mfcc_features = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        mfcc_features_scaled = np.mean(mfcc_features.T, axis=0)
        return np.expand_dims(mfcc_features_scaled, axis=0)
    
    def predict(self, audio_data):
        mfcc_features_scaled = self.extract_mfcc_features(audio_data)
        prediction = self.anti_spoof_model.predict(mfcc_features_scaled)

        predicted_label = self.labels[np.argmax(prediction[0])]
        prediction_percentage = np.max(prediction[0]) * 100

        print(f"Predicted label: {predicted_label}, Prediction percentage: {prediction_percentage:.2f}")

        return predicted_label, f"{prediction_percentage:.2f}"