import torch
from torchvision import transforms
import librosa
import numpy as np

class AntiSpoofingModel(torch.nn.Module):
    def __init__(self, model_path):
        super().__init__()
        self.model = torch.load(model_path)  # Load pre-trained model

    def predict(self, audio_features):
        self.model.eval()
        with torch.no_grad():
            input_tensor = torch.tensor(audio_features).unsqueeze(0)  # Add batch dimension
            output = self.model(input_tensor)
            return torch.sigmoid(output).item()  # Get probability score
