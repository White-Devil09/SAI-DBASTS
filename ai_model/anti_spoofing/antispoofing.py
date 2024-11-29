import numpy as np
import librosa
from tensorflow.keras.models import load_model


class AntiSpoofing:
    def __init__(self):
        self.model_weights_path = 'weights/anti-spoof-202411291945.keras'
        self.anti_spoof_model = load_model(self.model_weights_path) 
        self.labels = ['FAKE', 'REAL']

    def extract_mfcc_features(self, audio_file_path):
        audio, sr = librosa.load(audio_file_path, res_type='kaiser_fast')
        mfcc_features = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        mfcc_features_scaled = np.mean(mfcc_features.T, axis=0)
        return np.expand_dims(mfcc_features_scaled, axis=0)
    
    def predict(self, audio_file_path):
        mfcc_features_scaled = self.extract_mfcc_features(audio_file_path)
        prediction = self.anti_spoof_model.predict(mfcc_features_scaled)

        predicted_label = self.labels[np.argmax(prediction[0])]
        prediction_percentage = np.max(prediction[0]) * 100

        return predicted_label, f"{prediction_percentage:.2f}"
    

antispoofing = AntiSpoofing()