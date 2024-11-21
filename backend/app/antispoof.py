import torch
from torchvision import transforms
import librosa
import numpy as np
from tensorflow.keras.models import load_model


class AntiSpoofingModel(torch.nn.Module):
    def __init__(self, model_path):
        super().__init__()
        self.model = load_model(model_path) # Load pre-trained model

    def predict(self, audio_file_path):
        self.model.eval()
        audio, sr = librosa.load(audio_file_path, res_type='kaiser_fast')
        mfcc_features = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        mfcc_features_scaled = np.mean(mfcc_features.T, axis=0)
        mfcc_features_scaled = np.expand_dims(mfcc_features_scaled, axis=0)
        prediction = self.model.predict(mfcc_features_scaled)

        return prediction