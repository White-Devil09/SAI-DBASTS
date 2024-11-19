import tenseal as ts
import librosa

# Global context for TenSEAL (keep it secure in production)
global_context = None

def initialize_context():
    """Initialize TenSEAL encryption context"""
    global global_context
    context = ts.context(
        ts.SCHEME_TYPE.CKKS,  # Ciphertext scheme (CKKS supports floats)
        poly_modulus_degree=8192,  # Polynomial modulus degree
        coeff_mod_bit_sizes=[40, 21, 21, 21],  # Coefficient modulus bit sizes
    )
    context.global_scale = 2**21  # Scale for CKKS encoding
    context.generate_galois_keys()  # Enables operations like rotations
    global_context = context

def get_context():
    """Get encryption context"""
    if global_context is None:
        initialize_context()
    return global_context

def encrypt_voice_data(voice_vector):
    """Encrypt a voice feature vector"""
    context = get_context()
    return ts.ckks_vector(context, voice_vector).serialize()

def decrypt_voice_data(encrypted_voice):
    """Decrypt encrypted voice data"""
    context = get_context()
    return ts.ckks_vector_from(context, encrypted_voice).decrypt()

def extract_mfcc(file_path, n_mfcc=13):
    """Extract MFCC features from an audio file."""
    y, sr = librosa.load(file_path, sr=None)  # Load audio file with original sampling rate
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    return mfcc.flatten().tolist()

def extract_log_mel_spectrogram(file_path):
    """Extract Log-Mel Spectrogram features from an audio file."""
    y, sr = librosa.load(file_path, sr=None)
    mel_spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    log_mel_spectrogram = librosa.power_to_db(mel_spectrogram)
    return log_mel_spectrogram
